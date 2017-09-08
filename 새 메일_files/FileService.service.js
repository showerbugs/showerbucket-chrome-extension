(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('FileService', FileService);

    /* @ngInject */
    function FileService($timeout, ITEM_TYPE, CalendarFileApiBiz, MessageModalFactory, TaskFileApiBiz, DefaultFileBiz, gettextCatalog, _) {
        var MAX_UPLOAD_ONCE = 100,
            fileBiz = {};

        fileBiz[ITEM_TYPE.POST] = TaskFileApiBiz;
        fileBiz[ITEM_TYPE.SCHEDULE] = CalendarFileApiBiz;

        var mimeTypeMappingTable = {
            image: 'image-icon',
            video: 'video-icon',
            compressed: 'compressed-icon',
            zip: 'compressed-icon',
            word: 'text-icon',
            pdf: 'pdf-icon'
        };

        var FileWrapperConstructor = angular.element.inherit({
            __constructor: function (flowObject, itemType) {
                this.flowObject = flowObject;
                this.tmpFileIds = [];
                this.targetFileBiz = fileBiz[itemType];
                flowObject.on('fileSuccess', _.bind(this.onFileSuccess, this));
                flowObject.on('filesAdded', _.bind(this.onFilesAdded, this));
            },
            hasNoFiles: function () {
                return this.tmpFileIds.length === 0;
            },
            isUploading: function () {
                return this.flowObject.isUploading();
            },
            //writeformAttachedFileList.html 내부에서 참조하며 스팩에 맞게 재 구현함
            //선택한 업로드중인 파일을 취소시킴
            cancelUploadFile: function (file) {
                $timeout(function () {    //avoid to $digest scope.$$pahse
                    file.cancel();
                }, 0, false);
            },
            removeTmpFile: function (file) {
                //if has task.id update otherwise new and files update ===> Delete File
                _.remove(this.tmpFileIds, function (fileId) {
                    return fileId === file.response.id;
                });
                return DefaultFileBiz.removeTmpFile(file);
            },
            //업로드중이거나 대기중인 파일 취소시킴
            resetFlowFiles: function () {
                var self = this;
                this.tmpFileIds.length = 0;
                this.cancelUploadFile(self.flowObject);
            },
            withTmpFileIds: function (tmpFileIds) {
                this.tmpFileIds.push.apply(this.tmpFileIds, tmpFileIds);
            },
            getTmpFileIds: function () {
                return this.tmpFileIds;
            },
            updateMultiFileDependency: function (params) {
                this.targetFileBiz.event.updateMultiFileDependency(this.tmpFileIds, params);
            },
            onFileSuccess: function (file, responseText) {
                var response = angular.fromJson(responseText);

                if (!response.header.isSuccessful) {
                    DefaultFileBiz.removeTmpFileWithOutConfirm(file);
                    MessageModalFactory.alert(gettextCatalog.getString('파일 업로드에 실패했습니다.'));
                    return;
                }

                //Cache For Server Delete File
                file.response = response.result[0];
                this.tmpFileIds.push(file.response.id);
            },
            onFilesAdded: function (fileAry) {
                var uploadFileCount = this.flowObject.files.length;
                if (uploadFileCount + fileAry.length > MAX_UPLOAD_ONCE) {
                    MessageModalFactory.alert(gettextCatalog.getString('파일 첨부는 1회, 최대 {{::maxuploadonce}}개까지 가능합니다.', { maxuploadonce : MAX_UPLOAD_ONCE}));
                    if (uploadFileCount >= MAX_UPLOAD_ONCE) {
                        return false;
                    }
                    fileAry.length = MAX_UPLOAD_ONCE - uploadFileCount;
                }
            }
        });

        return {
            createNewInstance: createNewInstance,
            getFileType: getFileType
        };

        function createNewInstance(itemType) {
            return new FileWrapperConstructor(DefaultFileBiz.createFlow(), itemType || ITEM_TYPE.POST);
        }

        function getFileType(mimeType) {
            var result = 'etc-icon';
            if (!mimeType) {
                return result;
            }

            _.forEach(mimeTypeMappingTable, function (value, key) {
                if (mimeType.indexOf(key) > -1) {
                    result = value;
                    return false;
                }
            });
            return result;
        }
    }

})();
