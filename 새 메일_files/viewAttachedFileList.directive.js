//TODO: 뷰 전용 템플릿
(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .directive('viewAttachedFileList', viewAttachedFileList)
        .factory('viewAttachedFileRemoveService', viewAttachedFileRemoveService);

    /* @ngInject */
    function viewAttachedFileList(FileService, MessageModalFactory, Lightbox, viewAttachedFileRemoveService, ITEM_TYPE, gettextCatalog, _) {

        return {
            templateUrl: 'modules/layouts/view/viewAttachedFileList/viewAttachedFileList.html',
            restrict: 'EA',
            replace: true,
            scope: {
                'viewAttachedFileList': '=',
                'uniqViewName': '@',
                'isSimpleView': '=',
                'item': '=',
                'itemType': '@',
                'isHideRemove': '=?',
                'isHideEdit': '=?'
            },
            link: function (scope/*, element, attrs*/) {
                scope.visible = {
                    general: true,
                    inline: false
                };

                scope.itemType =  scope.itemType || ITEM_TYPE.POST;

                scope.getFileType = function (mimeType) {
                    return FileService.getFileType(mimeType);
                };

                scope.getMemberName = function (file) {
                    var createOrgMemberId = _.get(file, 'createOrganizationMemberId');
                    if (!createOrgMemberId) {
                        return '';
                    }

                    var member = scope.item.data._wrap.refMap.organizationMemberMap(createOrgMemberId);
                    return member ? member.name : '';
                };

                scope.removeFile = function (file) {
                    viewAttachedFileRemoveService[scope.itemType].removeFileById(file, scope.item);
                };

                scope.showUnderConstruction = function () {
                    MessageModalFactory.alert(gettextCatalog.getString('준비 중입니다.'));
                };

                scope.$watch('viewAttachedFileList.length', function (val) {
                    if (val) {
                        scope.attachedGeneralFileList = _.reject(scope.viewAttachedFileList, {type: 'inline_image'});
                        scope.attachedInlineImageList = _.filter(scope.viewAttachedFileList, {type: 'inline_image'});
                        scope.previewGeneralImageFileList = [];
                        scope.previewInlineImageFileList = [];

                        scope.previewGeneralImageFileList = _(scope.attachedGeneralFileList).filter(function (file) {
                            return file && file.downloadUrl && file.mimeType.indexOf('image') >= 0;
                        }).map(function (file) {
                            return {
                                caption: file.name,
                                url: _.includes(['image/jpeg', 'image/pjpeg', 'image/gif', 'image/png'], file.mimeType) ? //jpeg, gif, png만 허용하고 그 외에는 no_image_available.png
                                    file.downloadUrl : '/assets/images/no_image_available.png'
                            };
                        }).value();

                        scope.previewInlineImageFileList = _(scope.attachedInlineImageList).map(function (file) {
                            return {
                                caption: file.name,
                                url: file.downloadUrl
                            };
                        }).value();
                        _setPreviewImageList();
                    }
                });

                scope.$watch('visible.inline', function () {
                    _setPreviewImageList();
                });

                scope.openLightboxModal = function (index) {
                    Lightbox.openModal(scope.previewImageFileList, index);
                };

                function _setPreviewImageList() {
                    scope.previewImageFileList = scope.visible.inline ? _.concat(scope.previewGeneralImageFileList, scope.previewInlineImageFileList) : scope.previewGeneralImageFileList;
                }
            }
        };
    }


    //TODO: 파일서비스 하나로 합치기
    /* @ngInject */
    function viewAttachedFileRemoveService($q, TaskFileApiBiz, CalendarFileApiBiz, ItemSyncService, MessageModalFactory, PostErrorHandleUtil, gettextCatalog, _) {
        var pendingRemovingFileIdMap = {};
        return {
            'post': {
                removeFileById: function (file, item) {
                    if (file.eventId) {
                        this.removeCommentFileById(file.id, item);
                        return;
                    }

                    if (item.isDraft()) {
                        this.removeDraftFileById(file.id, item);
                        return;
                    }
                    this.removeTaskFileById(file.id, item);
                },
                confirmRemoveFile: function () {
                    return MessageModalFactory.confirm(gettextCatalog.getString('해당 파일을 삭제하시겠습니까?'), '', {confirmBtnLabel: gettextCatalog.getString('삭제')}).result;
                },
                removeDraftFileById: function (fileId, item) {
                    if (pendingRemovingFileIdMap[fileId] || !item.data.id) {
                        return $q.reject();
                    }
                    return this.confirmRemoveFile().then(function () {
                        pendingRemovingFileIdMap[fileId] = fileId;
                        var params = {
                            draftId: item.draftParam.draftId
                        };
                        return TaskFileApiBiz.draft.removeFile(fileId, params).then(function () {
                            return item.refreshDraft();
                        }).finally(function (result) {
                            delete pendingRemovingFileIdMap[fileId];
                            return result;
                        });
                    });
                },
                removeTaskFileById: function (fileId, item, withoutConfirm) {
                    if (pendingRemovingFileIdMap[fileId] || !item.data.id) {
                        return $q.reject();
                    }
                    var self = this,
                        promise = withoutConfirm ? $q.when() : this.confirmRemoveFile();

                    return promise.then(function () {
                        pendingRemovingFileIdMap[fileId] = fileId;
                        var params = {
                            projectCode: item.data.projectCode,
                            postNumber: item.data.number
                        };
                        return TaskFileApiBiz.task.removeFile(fileId, params).then(function () {
                            item.refreshComments();
                            return item.refreshFiles();
                        }).then(function (files) {
                            ItemSyncService.syncItemUsingCallback(item.data.id, 'post', function (item) {
                                item.fileIdList = _.map(files, 'id');
                            });
                        }, function (errorResponse) {
                            PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeDefaultErrorActions(item, function () {
                                delete pendingRemovingFileIdMap[fileId];
                                return self.removeTaskFileById(fileId, item, true);
                            }));
                        }).finally(function (result) {
                            delete pendingRemovingFileIdMap[fileId];
                            return result;
                        });
                    });
                },
                removeCommentFileById: function (fileId, item) {
                    return this.removeTaskFileById(fileId, item).then(function () {
                        return item.refreshComments();
                    });
                }
            },
            'schedule': {
                removeFileById: function (file, item) {
                    if (file.eventId) {
                        this.removeCommentFileById(file.id, item);
                        return;
                    }

                    this.removeScheduleFileById(file.id, item);
                },
                confirmRemoveFile: function () {
                    return MessageModalFactory.confirm(gettextCatalog.getString('해당 파일을 삭제하시겠습니까?'), '', {confirmBtnLabel: gettextCatalog.getString('삭제')}).result;
                },
                removeScheduleFileById: function (fileId, item) {
                    if (pendingRemovingFileIdMap[fileId] || !item.data.id) {
                        return $q.reject();
                    }

                    return this.confirmRemoveFile().then(function () {
                        pendingRemovingFileIdMap[fileId] = fileId;
                        var params = {
                            scheduleId: item.data.id
                        };
                        return CalendarFileApiBiz.schedule.removeFile(fileId, params).then(function () {
                            item.refreshComments();
                            return item.refreshFiles();
                        }).then(function (files) {
                            ItemSyncService.syncItemUsingCallback(item.data.id, 'schedule', function (item) {
                                item.fileIdList = _.map(files, 'id');
                            });
                        }).finally(function (result) {
                            delete pendingRemovingFileIdMap[fileId];
                            return result;
                        });
                    });
                },
                removeCommentFileById: function (fileId, item) {
                    return this.removeScheduleFileById(fileId, item).then(function () {
                        return item.refreshComments();
                    });
                }
            }
        };


    }

})();
