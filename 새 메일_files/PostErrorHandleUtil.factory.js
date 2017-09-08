(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('PostErrorHandleUtil', PostErrorHandleUtil);

    /* @ngInject */
    function PostErrorHandleUtil($q, API_ERROR_CODE, MessageModalFactory, ResponseWrapAppendHelper, gettextCatalog, _) {
        var errorHandlers = {};
        errorHandlers[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = onMovedPostError;
        errorHandlers[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED] = onRemovedPostError;
        errorHandlers[API_ERROR_CODE.USER_INVALID_TASK_OVERWRITE] = onPostVersionError;

        var ErrorHandleBuilder = angular.element.inherit({
            __constructor: function (selectedPost, isReturnFalse) {
                this.actions = _.clone(selectedPost.onErrorActions);
                this.isReturnFalse = isReturnFalse;
            },
            withPromiseCallbackAtMovedError: function (promiseCallback) {
                var self = this,
                    prevFunc = self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED];
                self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber) {
                    var result = prevFunc(projectCode, postNumber, promiseCallback);
                    return self.isReturnFalse ? false : result;
                };
                return this;
            },
            withErrorMessageAtMovedError: function () {
                var self = this,
                    prevFunc = self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED];
                self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_MOVED] = function (projectCode, postNumber) {
                    MessageModalFactory.alert(gettextCatalog.getString('해당 업무가 다른 프로젝트로 이동되었습니다.'));
                    var result = prevFunc(projectCode, postNumber);
                    return self.isReturnFalse ? false : result;
                };
                return this;
            },
            withErrorMessageAtRemovedError: function () {
                var self = this,
                    prevFunc = self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED];
                self.actions[API_ERROR_CODE.SERVICE_RESOURCE_POST_DELETED] = function (data) {
                    MessageModalFactory.alert(gettextCatalog.getString('해당 업무가 삭제되었습니다.'));
                    var result = prevFunc(data);
                    return self.isReturnFalse ? false : result;
                };
                return this;
            },
            build: function () {
                return this.actions;
            }
        });

        return {
            onPostError: onPostError,
            onMovedPostError: onMovedPostError,
            onRemovedPostError: onRemovedPostError,
            onPostVersionError: onPostVersionError,
            makeDefaultErrorActions: makeDefaultErrorActions,
            makeErrorMessageActions: makeErrorMessageActions/*,
            applyViewToErrorInfo: applyViewToErrorInfo*/
        };

        function onPostError(errorResponse, actions, option) {
            var errorCode = _.get(errorResponse, 'data.header.resultCode');
            option = option || {};
            actions = actions || {};
            if (errorHandlers[errorCode]) {
                return errorHandlers[errorCode](errorResponse, actions[errorCode]);
            }

            if (option.showMessage) {
                MessageModalFactory.alert(_.get(errorResponse, 'data.header.resultMessage'), '');
            }
            return $q.reject(errorResponse);
        }

        function onMovedPostError(errorResponse, action) {
            var errorContents = _.get(errorResponse, 'data.result.content', {}),
                movedProjectCode = _.get(errorContents, 'movedProjectCode'),
                movedPostNumber = _.get(errorContents, 'movedPostNumber');
            return action(movedProjectCode, movedPostNumber);
        }

        function onRemovedPostError(errorResponse, action) {
            var data = _.result(ResponseWrapAppendHelper.create(errorResponse.data.result), 'contents');
            _.set(data, 'errorCode', _.get(errorResponse, 'data.header.resultCode'));
            return action(data);
        }

        function onPostVersionError(errorResponse, action) {
            return action();
        }

        function makeDefaultErrorActions(selectedPost, promiseCallback, isReturnFalse) {
            return new ErrorHandleBuilder(selectedPost, isReturnFalse)
                .withPromiseCallbackAtMovedError(promiseCallback)
                .withErrorMessageAtRemovedError()
                .build();
        }

        function makeErrorMessageActions(selectedPost, isReturnFalse) {
            return new ErrorHandleBuilder(selectedPost, isReturnFalse)
                .withErrorMessageAtMovedError()
                .withErrorMessageAtRemovedError()
                .build();
        }

        //function applyViewToErrorInfo(errorResponse, item, type, callback) {
        //    var dummyInstance = DetailInstanceFactory.createDummyItem(ITEM_TYPE.POST);
        //    dummyInstance.param = {
        //        projectCode: item.projectCode,
        //        postNumber: item.number
        //    };
        //    PostErrorHandleUtil.onPostError(errorResponse, PostErrorHandleUtil.makeDefaultErrorActions(dummyInstance, function (projectCode, postNumber) {
        //        item.projectCode = projectCode;
        //        item.number = postNumber;
        //        return callback();
        //    }));
        //    ItemSyncService.syncViewUsingCallback(item.id, type, function (detailInstance) {
        //        if (_.startsWith(detailInstance.name, 'selected')) {
        //            StateParamsUtil.changeParamWithoutReload({projectCode: item.projectCode, postNumber: item.number});
        //        }
        //        detailInstance.errorInfo = dummyInstance.errorInfo;
        //    });
        //}
    }

})();
