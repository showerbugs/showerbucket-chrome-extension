(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('SearchModalActionFactory', SearchModalActionFactory);

    /* @ngInject */
    function SearchModalActionFactory($q, ITEM_TYPE, DetailInstanceFactory, MailsBiz, MessageModalFactory, MovingPost, ItemSyncService, SearchModalFragmentFactory, gettextCatalog, _) {
        var currentItem = {};

        var SearchModalActionTemplateInTask = angular.element.inherit({
            title: '',
            templateUrl: 'modules/components/SearchModalFactory/searchModalTpl.html',
            modalFragments: [],
            makeModalFragments: angular.noop,
            init: function (selectedTask) {
                currentItem = selectedTask;
                this.makeModalFragments();
                return $q.all(_.map(this.modalFragments, function (fragment) {
                    return fragment.init(selectedTask);
                }));
            },
            search: function (keyword) {
                return $q.all(_.map(this.modalFragments, function (fragment) {
                    return fragment.search(keyword);
                }));
            },
            select: angular.noop
        });

        var searchList = {
            SubPostAction: angular.element.inherit(SearchModalActionTemplateInTask, {
                _subPostIds: [],
                init: function (selectedTask) {
                    this._subPostIds = _.map(selectedTask.subPosts, function (subPost) {
                        return subPost.id;
                    });
                    return this.__base(selectedTask);
                }
            })
        };

        searchList.Append = angular.element.inherit(searchList.SubPostAction, {
            title: gettextCatalog.getString('기존 업무를 하위로 옮기기'),
            makeModalFragments: function () {
                var self = this;
                var validate = function (task) {
                    return task.id !== _.get(currentItem, 'data.id') && !_.includes(self._subPostIds, task.id);
                };

                this.modalFragments = [
                    SearchModalFragmentFactory.searchOnRecentTaskForMovingSubPost
                        .withValidateFunc(validate),
                    SearchModalFragmentFactory.searchBySubjectForMovingSubPost
                        .withParams(_.assign({}, SearchModalFragmentFactory.searchBySubjectForMovingSubPost.params, {
                            projectCode: _.get(currentItem, 'param.projectCode'),
                            hasChild: false
                        }))
                        .withValidateFunc(validate)];
            },
            select: function (task) {
                return MovingPost.changeParent(currentItem.data, task).$promise.then(function () {
                    currentItem.refreshItem();
                    ItemSyncService.syncItemUsingCallback(task.id, ITEM_TYPE.POST, function (item) {
                        // 리스트에 임시로 하위 표시만 나오게 수정
                        item.parent = true;
                    });
                }, function () {
                    MessageModalFactory.alert(gettextCatalog.getString('상위 업무는 하위 업무로 이동할 수 없습니다.'));
                });
            }
        });

        searchList.ChangeToSubPost = angular.element.inherit(searchList.SubPostAction, {
            title: gettextCatalog.getString('현재 업무를 다른 업무의 하위로 옮기기'),
            makeModalFragments: function () {
                var self = this;
                var validate = function (task) {
                    return !task.parent &&
                        _.get(currentItem, 'data.parent.id') !== task.id &&
                        task.id !== _.get(currentItem, 'data.id') && !_.includes(self._subPostIds, task.id);
                };

                this.modalFragments = [
                    SearchModalFragmentFactory.searchOnRecentTaskForMovingSubPost
                        .withValidateFunc(validate),
                    SearchModalFragmentFactory.searchBySubjectForMovingSubPost
                        .withParams(_.assign({}, SearchModalFragmentFactory.searchBySubjectForMovingSubPost.params, {
                            projectCode: _.get(currentItem, 'param.projectCode'),
                            hasParent: false
                        })).withValidateFunc(validate)];
            },
            select: function (task) {
                return MovingPost.changeParent(task, currentItem.data).$promise.then(function () {
                    ItemSyncService.syncItemUsingRefresh(currentItem.data, ITEM_TYPE.POST);
                }, function () {
                    MessageModalFactory.alert(gettextCatalog.getString('하위 업무의 하위 업무로 이동할 수 없습니다.'));
                });
            }
        });

        searchList.QuickSearch = angular.element.inherit(SearchModalActionTemplateInTask, {
            title: gettextCatalog.getString('빠른 검색'),
            init: function () {
                var selectedTask = DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
                return this.__base(selectedTask);
            },
            makeModalFragments: function () {
                this.modalFragments = [
                    SearchModalFragmentFactory.searchOnProject,
                    SearchModalFragmentFactory.searchByQuery,
                    SearchModalFragmentFactory.searchOnRecentTask
                ];
            }
        });

        return {
            append: new searchList.Append(),
            changeToSubPost: new searchList.ChangeToSubPost(),
            quickSearch: new searchList.QuickSearch()
        };
    }

})();
