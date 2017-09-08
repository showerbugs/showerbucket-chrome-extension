(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('FlowFileAction', FlowFileAction);

    /* @ngInject */
    function FlowFileAction($timeout) {
        return {
            cancelUpload: cancelUpload
        };

        //avoid to $digest scope.$$pahse
        function cancelUpload($file) {
            $timeout(function () {
                $file.cancel();
            }, 0, false);
        }
    }

})();
