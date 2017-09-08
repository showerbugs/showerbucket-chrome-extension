(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .directive('sharedLinkSetting', SharedLinkSetting)
        .factory('SHARED_LINK_PARTS', SHARED_LINK_PARTS);

    /* @ngInject */
    function SharedLinkSetting($state, $timeout, API_PAGE_SIZE, ITEM_TYPE, ORG_STATE_NAME, SHARED_LINK_PARTS, DetailInstanceFactory, DigestService, HelperConfigUtil, HelperDomainUtil, ItemSyncService, PermissionFactory, SharedLinkBiz, SharedLinkSettingModalFactory, TaskViewModalFactory, gettextCatalog, moment, _) {
        return {
            templateUrl: 'modules/project/setting/sharedLinkSetting/sharedLinkSetting.html',
            restrict: 'EA',
            scope: {
                fromMemberId: '=?',
                projectCode: '=?',
                postNumber: '=?',
                postCreatedAt: '=?',
                organizationId: '=?',
                onFetchList: '&'
            },
            link: function (scope) {
                scope.PARTS = SHARED_LINK_PARTS;
                scope.SHARED_LINK_ORDERS = {
                    CREATED_AT: 'createdAt',
                    EXPIRED_AT: 'expiredAt',
                    PROJECT_POST_NUMBER: 'projectPostNumber',
                    FROM: 'from'
                };
                scope.ui = {
                    showCreateLink: false,
                    totalCount: 20,
                    itemSizePerPage: 20,
                    page: 1,
                    valid: 'valid',
                    sort: scope.SHARED_LINK_ORDERS.FROM,
                    reverseSort: false,
                    headingTemplate: {
                        valid: '사용 ({{::count}})',
                        invalid: '만료 ({{::count}})'
                    },
                    headingLabel: {
                        valid: gettextCatalog.getString('사용.1'),
                        invalid: gettextCatalog.getString('만료')
                    }
                };

                var params = {
                    projectCode: null,
                    postNumber: null,
                    organizationId: null,
                    page: 0,
                    size: API_PAGE_SIZE.SHARED_LINK
                }, inInOrgSetting = $state.includes(ORG_STATE_NAME),
                    today = moment();

                init();

                // --------- declare method ---------
                scope.createSharedLink = createSharedLink;
                scope.canModifySharedLink = canModifySharedLink;
                scope.editSharedLink = editSharedLink;
                scope.deleteSharedLink = deleteSharedLink;
                scope.onSelectTab = onSelectTab;
                scope.changePage = changePage;
                scope.openPostModal = openPostModal;
                scope.sortList = sortList;

                // --------- define method ---------

                function setCanCreateSharedLink() {
                    if (inInOrgSetting || !scope.postNumber) {
                        return;
                    }

                    scope.ui.showCreateLink = scope.fromMemberId === HelperConfigUtil.orgMemberId();
                    PermissionFactory.canCreateSharedLink(scope.projectCode).then(function() {
                        scope.ui.showCreateLink = true;
                    });
                }

                function createSharedLink() {
                    SharedLinkSettingModalFactory.create(scope.projectCode, scope.postNumber, scope.postCreatedAt).then(successUpdated);
                }

                function canModifySharedLink(link) {
                    if (inInOrgSetting) {
                        link._getOrSetProp('canModify', false);
                        return;
                    }
                    PermissionFactory.canRemoveSharedLink(link).then(function () {
                        link._getOrSetProp('canModify', true);
                    });
                }

                function editSharedLink(link) {
                    SharedLinkSettingModalFactory.edit(link).then(successUpdated);
                }

                function deleteSharedLink(link) {
                    SharedLinkBiz.remove({
                        projectCode: link.project.code,
                        postNumber: link.post.number,
                        sharedLinkId: link.id
                    }).then(function () {
                        fetchList(true);
                    });
                }

                function onSelectTab(tabName) {
                    scope.ui.valid = tabName === 'valid';
                    fetchList();
                }

                function changePage(page) {
                    params.page = page - 1;
                    fetchList();
                }

                function openPostModal(link) {
                    if (scope.projectCode && !scope.postNumber) {
                        TaskViewModalFactory.openModal(link.project.code, link.post.number);
                    }
                }

                function sortList(order) {
                    if (scope.ui.sort === order) {
                        scope.ui.reverseSort = !scope.ui.reverseSort;
                    } else {
                        scope.ui.sort = order;
                        scope.ui.reverseSort = false;
                    }

                    fetchList();
                }

                // --------- local functions ---------

                function init() {
                    scope.envUrl = HelperDomainUtil.getEnvUrl();
                    scope.ui.itemSizePerPage = inInOrgSetting ? API_PAGE_SIZE.IN_ORG_SETTING : API_PAGE_SIZE.SHARED_LINK;
                    params.projectCode = scope.projectCode;
                    params.postNumber = scope.postNumber;
                    params.organizationId = scope.organizationId;
                    params.size = scope.ui.itemSizePerPage;
                    params.page = 0;
                    scope.ui.valid = true;
                    setCanCreateSharedLink();
                    // 처음에도 onSelectTab이 호출됨
                }

                function fetchList(needSync) {
                    var selectedPost = DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST),
                        targetMethod = scope.ui.valid ? 'isSameOrBefore' : 'isAfter';
                    params.order = (scope.ui.reverseSort ? '-' : '') + scope.ui.sort;
                    return SharedLinkBiz.fetchList(params).then(function (result) {
                        var allTotalCount = result.contents().length;
                        scope.sharedLinks = _.filter(result.contents(), function (item) {
                            return today[targetMethod](item.expiredAt);
                        });
                        scope.ui.totalCount = scope.sharedLinks.length;
                        if (!inInOrgSetting) {
                            var validCount = scope.ui.valid ? scope.ui.totalCount : (allTotalCount - scope.ui.totalCount);
                            scope.ui.headingLabel.valid = gettextCatalog.getString(scope.ui.headingTemplate.valid, {count: validCount});
                            scope.ui.headingLabel.invalid = gettextCatalog.getString(scope.ui.headingTemplate.invalid, {count: allTotalCount - validCount});
                        }

                        DigestService.safeGlobalDigest();
                        if (needSync && !inInOrgSetting && selectedPost.param.projectCode && selectedPost.param.postNumber) {
                            selectedPost.refreshItem().then(function (post) {
                                ItemSyncService.syncItemUsingViewItem(post, ITEM_TYPE.POST);
                            });
                        }
                        scope.onFetchList();
                        return scope.sharedLinks;
                    });
                }

                function alertUpdate(targetLink) {
                    if (!targetLink) {
                        return;
                    }
                    targetLink.isUpdated = true;
                    $timeout(function() {
                        targetLink.isUpdated = false;
                        DigestService.safeLocalDigest(scope);
                    }, 800, false);
                }

                function successUpdated (modal) {
                    var updatedLinkId = null;
                    modal.result.then(function (id) {
                        updatedLinkId = id;
                        return fetchList(true);
                    }).then(function() {
                        alertUpdate(_.find(scope.sharedLinks, {id: updatedLinkId}));
                    });
                }
            }
        };
    }

    /* @ngInject */
    function SHARED_LINK_PARTS(gettextCatalog) {
        return {
            comments: gettextCatalog.getString('댓글'),
            post: gettextCatalog.getString('본문'),
            files: gettextCatalog.getString('첨부파일')
        };
    }

})();
