(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('MovePostsModal', MovePostsModal)
        .component('movePostsModal', {
            templateUrl: 'modules/project/modals/MovePostsModal/movePostsModal.html',
            controller: MovePostsModalCtrl,
            bindings: {
                $uibModalInstance: '<',
                postList: '<',
                options: '<'
            }
        });

    /* @ngInject */
    function MovePostsModal($uibModal, MessageModalFactory, gettextCatalog, _) {
        return {
            open: function (postList) {
                if (!_.find(postList, 'subPostCount')) {
                    return openPostsModal(postList).result;
                }
                var title = gettextCatalog.getString('프로젝트 이동'),
                    msg = gettextCatalog.getString('<p>선택하신 업무에 하위업무가 있습니다.</p><p>하위업무를 포함하여 함께 이동하시겠습니까?</p>');
                return MessageModalFactory.confirm(msg, title, {
                    confirmBtnLabel: gettextCatalog.getString('하위 업무를 포함하여 이동'),
                    optionBtnLabel: gettextCatalog.getString('선택한 업무만 이동')
                }).result.then(function (reason) {
                        return openPostsModal(postList, {withSubPost: reason === 'confirm'}).result;
                    });
            }
        };

        function openPostsModal(postList, options) {
            return $uibModal.open({
                'template': '<move-posts-modal class="move-posts-modal" $uib-modal-instance="$ctrl.$uibModalInstance" post-list="$ctrl.postList" options="$ctrl.options"></move-posts-modal>',
                'backdrop': 'static', /*  this prevent user interaction with the background  */
                'windowClass': 'setting-modal dooray-setting-content move-posts-modal',
                'controllerAs': '$ctrl',
                'controller': ['$uibModalInstance', function ($uibModalInstance) {
                    this.$uibModalInstance = $uibModalInstance;
                    this.postList = postList;
                    this.options = options;
                }]
            });
        }
    }

    /* @ngInject */
    function MovePostsModalCtrl(ITEM_TYPE, HelperConfigUtil, HelperPromiseUtil, ItemSyncService, MessageModalFactory, MovingPost, MovePostsModalStorage, gettextCatalog, _) {
        var $ctrl = this,
            promise = null,
            myMemberId = HelperConfigUtil.orgMemberId();

        this.projectCode = '';
        this.fromTagDetail = {};
        this.fromMilestoneDetail = {};
        this.showExtendOption = false;

        this.extendModal = extendModal;
        this.onChangeProject = onChangeProject;
        this.submit = submit;
        this.close = close;

        _init();

        function extendModal() {
            $ctrl.showExtendOption = !$ctrl.showExtendOption;
        }

        function onChangeProject() {
            _.forEach($ctrl.tagMapList, function (tagDetail) {
                tagDetail.to = [];
            });
            _.forEach($ctrl.milestoneMapList, function (milestoneDetail) {
                milestoneDetail.to = null;
            });
        }

        function submit() {
            if (HelperPromiseUtil.isResourcePending(promise)) {
                return;
            }
            var option = {
                includeSubPosts: _.get($ctrl.options, 'withSubPost'),
                tagMap: $ctrl.tagMapList,
                milestoneMap: _.map($ctrl.milestoneMapList, function (milestoneDetail) {
                    milestoneDetail.to = milestoneDetail.to === 'none' ? null : milestoneDetail.to;
                    return milestoneDetail;
                })
            };
            promise = $ctrl.postList.length > 1 ? _submitMultiPosts(_.map($ctrl.postList, 'id'), option) :
                _submitSinglePost($ctrl.postList[0], option);
            promise.then(function () {
                MovePostsModalStorage.save($ctrl.projectCode, $ctrl.showExtendOption, $ctrl.tagMapList, $ctrl.milestoneMapList);
                $ctrl.$uibModalInstance.close($ctrl.projectCode);
            }, function () {
                var msg = _([
                    gettextCatalog.getString('업무가 정상적으로 이동되지 않았습니다.'),
                    gettextCatalog.getString('다시 한번 시도해 주세요.')
                ]).map(function (msg) {
                    return ['<p>', msg, '</p>'].join('');
                }).join('');
                MessageModalFactory.alert(msg);
            });
        }

        function _submitSinglePost(post, option) {
            return MovingPost.movePostToProject(post, $ctrl.projectCode, option).$promise.then(function (result) {
                var resultValue = result.result();
                post.projectCode = resultValue.projectCode;
                post.number = resultValue.number;
                ItemSyncService.syncItemUsingRefresh(post, ITEM_TYPE.POST, true);
            });
        }

        function _submitMultiPosts(postIdList, option) {
            return MovingPost.moveMultiPostToProject(postIdList, $ctrl.projectCode, option).$promise;
        }

        function close() {
            $ctrl.$uibModalInstance.dismiss();
        }

        function _initTagMapList(cachedTagMap) {
            $ctrl.fromTagDetail[null] = {
                name: gettextCatalog.getString('태그 없음')
            };
            var unionedTagIdList = _($ctrl.postList)
                .map(function (post) {
                    _.forEach(post.tagIdList, function (tagId) {
                        $ctrl.fromTagDetail[tagId] = $ctrl.fromTagDetail[tagId] || post._wrap.refMap.tagMap(tagId);
                    });
                    return post.tagIdList;
                })
                .reduce(function (val, other) {
                    return _.union(val, other);
                });
            $ctrl.tagMapList = _.map(unionedTagIdList, function (tagId) {
                return {
                    from: tagId,
                    to: cachedTagMap[tagId] || []
                };
            }).concat([{
                from: null,
                to: cachedTagMap[null] || []
            }]);
        }

        function _initMilestoneMapList(cachedMilestoneMap) {
            $ctrl.fromMilestoneDetail[null] = {
                name: gettextCatalog.getString('마일스톤 없음')
            };
            $ctrl.milestoneMapList = _($ctrl.postList)
                .map(function (post) {
                    $ctrl.fromMilestoneDetail[post.milestoneId] = $ctrl.fromMilestoneDetail[post.milestoneId] ||
                        post._wrap.refMap.milestoneMap(post.milestoneId);
                    return post.milestoneId;
                })
                .union()
                .filter()
                .map(function (milestoneId) {
                    return {
                        from: milestoneId,
                        to: cachedMilestoneMap[milestoneId] || null
                    };
                }).concat([{
                    from: null,
                    to: cachedMilestoneMap[null] || null
                }]).value();
        }

        function _init() {
            $ctrl.isFromMePosts = _.every($ctrl.postList, function (post) {
                return _.get(post.users, 'from.member.id') === myMemberId;
            });

            var cachedInfo = MovePostsModalStorage.get() || {};
            cachedInfo = $ctrl.postList[0].projectCode === cachedInfo.projectCode ? {} : cachedInfo;
            $ctrl.initialProjectCode = cachedInfo.projectCode || '';
            $ctrl.showExtendOption = cachedInfo.showExtendOption || false;
            _initTagMapList(cachedInfo.tagMap || {});
            _initMilestoneMapList(cachedInfo.milestoneMap || {});
        }
    }

})();
