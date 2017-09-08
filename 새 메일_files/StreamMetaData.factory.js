(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream')
        .factory('StreamMetaData', StreamMetaData);

    /* @ngInject */
    function StreamMetaData(PROJECT_API_PARAM_NAMES, ArrayUtil, HelperConfigUtil, gettextCatalog, _) {
        return (function () {
            var self = {
                project: {
                    info: function (streamItem) {
                        // TODO actionDetail은 임시코드 추후 B/E actionDetail 제거 시에 같이 제거해야합니다.
                        return this._actionInfoMap[_.get(streamItem.project, 'actionDetail.type', _.get(streamItem.project, 'action.type'))];
                    },
                    content: function (streamItem) {
                        return gettextCatalog.getString(this.postfixContent(streamItem));
                    },
                    prefixContent: function (streamItem) {
                        var actionType = _.get(streamItem.project, 'actionDetail.type', _.get(streamItem.project, 'action.type'));
                        return this._prefixContentMap[actionType] ? [streamItem._wrap.refMap.projectMap(streamItem.project.id).code, ' | '].join('') : '';
                    },
                    postfixContent: function (streamItem) {
                        // TODO actionDetail은 임시코드 추후 B/E actionDetail 제거 시에 같이 제거해야합니다.
                        var actionType = _.get(streamItem.project, 'actionDetail.type', _.get(streamItem.project, 'action.type'));
                        return gettextCatalog.getString(this._postfixContentFuncMap[actionType] ? this._postfixContentFuncMap[actionType].call(this, streamItem) :
                            this._postfixContentMap[actionType], { projectCode: streamItem._wrap.refMap.projectMap(streamItem.project.id).code});
                    },
                    actionAt: function (streamItem) {
                        return streamItem.project.at;
                    },
                    _actionInfoMap: {
                        invited: gettextCatalog.getString('프로젝트 초대'),
                        leaved: gettextCatalog.getString('프로젝트 탈퇴'),
                        archived: gettextCatalog.getString('프로젝트 편집'),
                        activated: gettextCatalog.getString('프로젝트 편집'),
                        code_changed: gettextCatalog.getString('프로젝트 편집'),
                        open_permission_changed: gettextCatalog.getString('프로젝트 편집')
                    },
                    _postfixContentFuncMap: {
                        code_changed: function (streamItem) {
                            // TODO actionDetail은 임시코드 추후 B/E actionDetail 제거 시에 같이 제거해야합니다.
                            var actionProperty = streamItem.project.actionDetail ? 'actionDetail' : 'action';
                            var scope = {
                                before: streamItem.project[actionProperty].beforeCode,
                                after: streamItem.project[actionProperty].afterCode
                            };
                            return gettextCatalog.getString(this._postfixContentMap.code_changed, scope);
                        },
                        open_permission_changed: function (streamItem) {
                            // TODO actionDetail은 임시코드 추후 B/E actionDetail 제거 시에 같이 제거해야합니다.
                            var actionProperty = streamItem.project.actionDetail ? 'actionDetail' : 'action';
                            var beforePermissions = streamItem.project[actionProperty].beforeOpenPermissions,
                                afterPermissionts = streamItem.project[actionProperty].afterOpenPermissions,
                                resultList = [];

                            var changedOpenOrgNames = makeOrganizationChangedContent(beforePermissions, afterPermissionts, streamItem._wrap.refMap.organizationMap);
                            if (changedOpenOrgNames) {
                                resultList.push(gettextCatalog.getString('공개 대상 \'{{::content}}\'', { content: changedOpenOrgNames}));
                            }

                            var changedPermission = makePermissionChangedContent(beforePermissions, afterPermissionts);
                            if (changedPermission) {
                                resultList.push(gettextCatalog.getString('공개 범위 \'{{::content}}\'', { content: changedPermission}));
                            }

                            return gettextCatalog.getString(this._postfixContentMap.open_permission_changed, { content: resultList.join(', ') });
                        }
                    },
                    _prefixContentMap: {
                        archived: true,
                        activated: true,
                        open_permission_changed: true
                    },
                    _postfixContentMap: {
                        invited: '님이 ({{::projectCode}})프로젝트로 초대하였습니다.',
                        leaved: '님에 의해 ({{::projectCode}})프로젝트에서 탈퇴되었습니다.',
                        archived: '님이 프로젝트를 종료하였습니다.',
                        activated: '님이 프로젝트를 진행 상태로 변경하였습니다.',
                        code_changed: '님이 ({{::before}})프로젝트 코드명을 \'{{::after}}\'으로 변경하였습니다.',
                        open_permission_changed: '님이 프로젝트 {{::content}}으로 변경하였습니다.'
                    }
                },
                post: {
                    actionAt: function (streamItem) {
                        return _.get(streamItem._wrap.refMap.postMap(streamItem.post.id), 'createdAt');
                    }
                },
                mail: {
                    actionAt: function (streamItem) {
                        return _.get(streamItem._wrap.refMap.mailMap(streamItem.mail.id), 'createdAt');
                    }
                },
                schedule: {
                    info: function (/*streamItem*/) {

                    }
                }
            };
            return self;
        })();

        function makeOrganizationNames(permission, orgMap) {
            return _(permission)
                .map(function (permission) {
                    return orgMap(permission.organizationId).name;
                })
                .join(', ') || gettextCatalog.getString('프로젝트 멤버만 공개');
        }

        function _makeBeforeAfterString(before, after) {
            return ['<span class="gray-content">', before, '</span> -> ', after].join('');
        }

        function makeOrganizationChangedContent(beforePermissions, afterPermissions, orgMap) {
            if ((_.isEmpty(beforePermissions) && _.isEmpty(afterPermissions)) || !_.isFunction(orgMap) ||
                _(beforePermissions).xorBy(afterPermissions, 'organizationId').isEmpty()) {
                return '';
            }
            var before = makeOrganizationNames(beforePermissions, orgMap),
                after = makeOrganizationNames(afterPermissions, orgMap);

            return _makeBeforeAfterString(before, after);
        }

        function makePermissionChangedContent(beforePermissions, afterPermissions) {
            if (_.isEmpty(beforePermissions) || _.isEmpty(afterPermissions) ||
                ArrayUtil.isEqualEntity(_.get(beforePermissions, '[0].permission'), _.get(afterPermissions, '[0].permission'))) {
                return '';
            }
            if (ArrayUtil.isEqualEntity(_.get(beforePermissions, '[0].permission'), PROJECT_API_PARAM_NAMES.PUBLIC_SCOPE_PERMISSIONS.ALL)) {
                return _makeBeforeAfterString(gettextCatalog.getString('전체'), gettextCatalog.getString('쓰기만'));
            }
            return _makeBeforeAfterString(gettextCatalog.getString('쓰기만'), gettextCatalog.getString('전체'));
        }
    }

})();
