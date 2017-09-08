(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailAttachedFileUtil', MailAttachedFileUtil);

    /* @ngInject */
    function MailAttachedFileUtil(_) {
        return {
            filterAttachedMimeFileList: filterAttachedMimeFileList,
            filterAttachedBigFileList: filterAttachedBigFileList
        };

        function filterAttachedMimeFileList(mailFileList) {
            return _.filter(mailFileList, {bigfile: false});
        }

        function filterAttachedBigFileList(mailFileList) {
            return _.filter(mailFileList, {bigfile: true});
        }
    }

})();
