(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('FileApiInterfaceUtil', FileApiInterfaceUtil);

    /* @ngInject */
    function FileApiInterfaceUtil($q, _) {
        return {
            //validParamsCallback params = { [projectCode : "*", postNumber : "", [ eventId : "" ]], fileId : "" }
            createFileService: function (selectedFileResource, validParamsCallback) {
                return {
                    _checkValidParamsCallback: function (callback, fileId, params) {
                        if (!callback(fileId, params)) {
                            throw Error('Expect params validations fileId=' + fileId + ", params" + angular.toJson(params));
                        }
                    },

                    //removeFile need request path fileId
                    removeFile: function (fileId, params) {
                        this._checkValidParamsCallback(validParamsCallback.remove, fileId, params);
                        params = params || {};
                        params.fileId = fileId;
                        return selectedFileResource.remove(params).$promise;
                    },

                    //updateFileDependency need request body id
                    updateFileDependency: function (fileId, params) {
                        this._checkValidParamsCallback(validParamsCallback.update, fileId, params);
                        params = params || {};
                        return selectedFileResource.save(params, [{id: fileId}]).$promise.then(function (result) {
                            return result[0];
                        });
                    },

                    updateMultiFileDependency: function (fileIds, params) {
                        var self = this;
                        if (_.isEmpty(fileIds)) {
                            return $q.when();
                        }
                        fileIds = _.map(fileIds, function (fileId) {
                            self._checkValidParamsCallback(validParamsCallback.update, fileId, params);
                            return {id: fileId};
                        });
                        params = params || {};
                        return selectedFileResource.save(params, fileIds).$promise;
                    }
                };
            }
        };
    }

})();
