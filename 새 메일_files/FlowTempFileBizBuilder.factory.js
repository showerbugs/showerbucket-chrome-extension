(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('FlowTempFileBizBuilder', FlowTempFileBizBuilder);
    //.factory('FlowTempFileBizFactory', FlowTempFileBizFactory);

    /* @ngInject */
    function FlowTempFileBizBuilder($q, flowFactory, MessageModalFactory, gettextCatalog) {
        var Constructor = angular.element.inherit({
            withResource: function (resource) {
                this.resource = resource;
                return this;

            },
            withFlowOptions: function (flowOptions) {
                this.flowOptions = flowOptions;
                return this;
            },

            createFlow: function (options) {
                return flowFactory.create(angular.extend(this.flowOptions, options));
            },

            removeTmpFileWithOutConfirm: function (flowFile) {
                if (!flowFile.flowObj) {
                    return $q.reject();
                }

                if (!flowFile.response) { //only ui add
                    flowFile.flowObj.removeFile(flowFile);
                    return $q.reject();
                }

                return this.resource.remove({fileId: flowFile.response.id}).$promise.then(function () {
                    flowFile.flowObj.removeFile(flowFile);
                });
            },

            removeTmpFile: function (flowFile) {
                var self = this;
                return MessageModalFactory.confirm(gettextCatalog.getString('첨부파일을 삭제하시겠습니까?')).result.then(function () {
                    return self.removeTmpFileWithOutConfirm(flowFile);
                }, function () {
                    return $q.reject();
                });
            },

            build: function () {
                return this;
            }
        });

        return Constructor;
    }

})();
