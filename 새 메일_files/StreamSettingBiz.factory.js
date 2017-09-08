(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .factory('StreamSettingBiz', StreamSettingBiz)
        .service('StreamSettingMultiSelectBiz', StreamSettingMultiSelectBiz);

    /* @ngInject */
    function StreamSettingBiz(DefaultSettingResource, HelperConfigUtil, SettingResource, _) {
        var ALL_SETTING = {
                alarm: 'all',
                projectAlarm: true,
                mention: true,
                disabledProjectList: [],
                post: {
                    from: {
                        registered: true,
                        commented: true,
                        changed: true
                    },
                    to: {
                        registered: true,
                        commented: true,
                        changed: true

                    },
                    cc: {
                        registered: true,
                        commented: true,
                        changed: true
                    }
                },
                mail: {
                    sentMail: {
                        sent: true,
                        receipt: true
                    },
                    receivedMail: 'all'
                },
                calendar: {
                    received: true,
                    sent: false,
                    changed: true
                }
            },
            STREAM_FILTER_CATEGORY = 'stream.filter',
            STREAM_PUSH_CATEGORY = 'stream.push',
            STREAM_FILTER_PARAM = {memberId: HelperConfigUtil.orgMemberId(), category: STREAM_FILTER_CATEGORY},
            STREAM_PUSH_PARAM = {memberId: HelperConfigUtil.orgMemberId(), category: STREAM_PUSH_CATEGORY};

        return {
            getAllSetting: getAllSetting,
            fetchDefaultStreamFilterSetting: fetchDefaultStreamFilterSetting,
            fetchStreamFilter: fetchStreamFilter,
            fetchStreamPush: fetchStreamPush,
            editStreamFilter: editStreamFilter,
            editStreamPush: editStreamPush
        };

        function getAllSetting() {
            return _.cloneDeep(ALL_SETTING);
        }

        function fetchDefaultStreamFilterSetting() {
            return DefaultSettingResource.get(STREAM_FILTER_PARAM).$promise.then(function (result) {
                return _convertStreamFilterFromApi(_.get(result.contents(), 'value', {}));
            });
        }

        function fetchStreamFilter() {
            return SettingResource.get(STREAM_FILTER_PARAM).$promise.then(function (result) {
                return _convertStreamFilterFromApi(_.get(result.contents(), 'value', {}));
            });
        }

        function fetchStreamPush() {
            return SettingResource.get(STREAM_PUSH_PARAM).$promise.then(function (result) {
                return _.get(result.contents(), 'value');
            });
        }

        function editStreamFilter(form) {
            var param = _convertStreamFilterToApi(form);
            return SettingResource.update(STREAM_FILTER_PARAM, param).$promise;
        }

        function editStreamPush(form) {
            return SettingResource.update(STREAM_PUSH_PARAM, form).$promise;
        }

        function _convertStreamFilterFromApi(data) {
            return {
                alarm: data.alarm,
                mention: data.mention,
                projectAlarm: data.project.project.changed,
                disabledProjectList: data.project.disabledProjectList,
                post: data.project.post,
                mail: data.mail,
                calendar: data.calendar
            };
        }

        function _convertStreamFilterToApi(form) {
            return {
                alarm: form.alarm,
                mention: form.mention,
                project: {
                    disabledProjectList: form.disabledProjectList,
                    project: {
                        changed: form.projectAlarm
                    },
                    post: form.post
                },
                mail: form.mail,
                calendar: form.calendar
            };
        }
    }

    /* @ngInject */
    function StreamSettingMultiSelectBiz(_) {
        var icons = {
            check: '<div class="glyphicon glyphicon-ok"></div>',
            empty: '<div class="glyphicon"></div>'
        };

        var multiSelectMetaData = {
            labelProp: '_name',
            valueProp: 'id',
            groupProp: '_groupProject',
            tickIconProp: '_icon',
            tickProp: '_ticked',
            groupStart: function (project, defaultLabel) {
                var result = {};
                result[this.groupProp] = true;
                result[this.labelProp] = project ? project._wrap.refMap.organizationMap(project.organizationId).name : defaultLabel;
                return result;
            },
            groupEnd: function () {
                var result = {};
                result[this.groupProp] = false;
                return result;
            },
            dummyItem: function (label, id, checked) {
                var result = {};
                result[this.labelProp] = label;
                result[this.valueProp] = id;
                result[this.tickProp] = checked;
                result[this.tickIconProp] = icons[checked ? 'check' : 'empty'];
                return result;
            }
        };

        return {
            multiSelectMetaData: multiSelectMetaData,
            groupProjectForMultiSelect: groupProjectForMultiSelect,
            selectItem: selectItem,
            isAllChecked: isAllChecked,
            setAllCheck: setAllCheck,
            makeDisabledProjectList: makeDisabledProjectList
        };

        function groupProjectForMultiSelect(projects, checkedFilter) {
            var resultList = [],
                currentOrgId = null;
            _(projects).sortBy('organizationId')
                .map(function (project) {
                    project[multiSelectMetaData.tickProp] = checkedFilter(project);
                    project[multiSelectMetaData.tickIconProp] = icons[project[multiSelectMetaData.tickProp] ? 'check' : 'empty'];
                    project[multiSelectMetaData.labelProp] = project.code;
                    return project;
                })
                .forEach(function (project) {
                    if (currentOrgId === project.organizationId) {
                        resultList.push(project);
                        return;
                    }

                    if (currentOrgId) {
                        resultList.push(multiSelectMetaData.groupEnd());
                    }
                    resultList.push(multiSelectMetaData.groupStart(project));
                    resultList.push(project);
                    currentOrgId = project.organizationId;
                });
            resultList.push(multiSelectMetaData.groupEnd());
            return resultList;
        }

        function selectItem(item, allProjects) {
            var iconName = item[multiSelectMetaData.tickProp] ? 'check' : 'empty';
            _.find(allProjects, {'id': item.id})[multiSelectMetaData.tickIconProp] = icons[iconName];
        }

        function isAllChecked(groupedProjects) {
            return _(groupedProjects).filter(function (obj) {
                return !_.isBoolean(obj[multiSelectMetaData.groupProp]) && obj.id !== 'all';
            }).every('_ticked');
        }

        function setAllCheck(groupedProjects, check) {
            return _(groupedProjects).filter(function (obj) {
                return !_.isBoolean(obj[multiSelectMetaData.groupProp]);
            }).forEach(function (project) {
                project[multiSelectMetaData.tickProp] = check;
                project[multiSelectMetaData.tickIconProp] = icons[check ? 'check' : 'empty'];
            });
        }

        function makeDisabledProjectList(selectedProjects, allGroupedProjects) {
            return _(allGroupedProjects).filter(function (project) {
                return !_.isBoolean(project[multiSelectMetaData.groupProp]) && project.id !== 'all';
            }).map('id')
                .difference(_.map(selectedProjects, 'id'));
        }
    }

})();
