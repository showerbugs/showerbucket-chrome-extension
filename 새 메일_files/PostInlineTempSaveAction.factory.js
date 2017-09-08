(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostInlineTempSaveAction', PostInlineTempSaveAction);

    /* @ngInject */
    function PostInlineTempSaveAction($q, MessageModalFactory, PostTempSaveStorage, PopupUtil, TaskSubmitFormFactory, gettextCatalog, _) {
        return {
            getOrLoadTempSaveBodyPromise: getOrLoadTempSaveBodyPromise,
            saveBody: saveBody,
            removeTemp: removeTemp
        };

        function getOrLoadTempSaveBodyPromise(post) {
            var storageItem = PostTempSaveStorage.getItemUpdate(post.id);
            if (!storageItem || _.isEqual(_.get(storageItem, 'value.body'), _.get(post, 'body'))) {
                return _makePostBodyPromise(post);
            }

            //임시 저장된 데이터가 수정할 데이터보다 버전이 낮은 경우
            if (_.get(storageItem, 'value.version', 0) < _.get(post, 'version', 0)) {
                return _confirmNewVersion(storageItem, post).then(function () {
                    return _makePostBodyPromise(post);
                }, function () {
                    return _makePostBodyPromise(post);
                });
            }

            return _confirmContinueEditTemp(storageItem).then(function () {
                return _makePostBodyPromise(storageItem.value, storageItem.tmpFileIdList);
            }, function () {
                return _makePostBodyPromise(post);
            });
        }

        function saveBody(post, body, tmpFileIdList) {
            var form = TaskSubmitFormFactory.createFromContent(post).form();
            form.body = body;
            PostTempSaveStorage.saveItemUpdate(form, tmpFileIdList);
        }

        function removeTemp(postId) {
            PostTempSaveStorage.removeItemUpdate(postId);
        }

        function _makePostBodyPromise(post, tmpFileIdList) {
            return $q.when({
                body: {
                    content: post.body.content,
                    mimeType: post.body.mimeType
                },
                tmpFileIdList: tmpFileIdList || []
            });
        }

        function _confirmNewVersion(storageItem, post) {
            return MessageModalFactory.confirm(gettextCatalog.getString('{{datetime}}에 임시 저장된 내용이 최신 버전이 아닙니다.', {datetime: moment(storageItem.updatedTimestamp).format('YYYY-MM-DD HH:mm')}), '', {
                confirmBtnLabel: gettextCatalog.getString('저장 내용 보기'),
                confirmBtnClick: function () {
                    PopupUtil.openTaskWritePopup('update', {
                        projectCode: post.projectCode,
                        postNumber: post.number,
                        forceLoadContent: 'tempsave'
                    });
                },
                cancelBtnLabel: gettextCatalog.getString('저장 내용 삭제'),
                cancelBtnClick: function () {
                    PostTempSaveStorage.removeItemUpdate(storageItem.value.id);
                }
            }).result;
        }

        function _confirmContinueEditTemp(storageItem) {
            return  MessageModalFactory.confirm(gettextCatalog.getString('{{datetime}}에 임시 저장된 내용이 있습니다.', {datetime: moment(storageItem.updatedTimestamp).format('YYYY-MM-DD HH:mm')}), '', {
                confirmBtnLabel: gettextCatalog.getString('이어쓰기')
            }).result;
        }
    }

})();
