(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailTempFileResource', MailTempFileResource)
        .factory('MailFlowTempFileBiz', MailFlowTempFileBiz);

    /* @ngInject */
    function MailTempFileResource($resource, ApiConfigUtil) {
        // 일반파일은 partNumber로 삭제
        // 대용량 첨부파일은 fileId로 삭제
        return $resource(ApiConfigUtil.wasContext() + '/mail-drafts/:mailId/parts/:partNumber', {
            'mailId': '@mailId',
            'partNumber': '@partNumber',
            'fileId': '@fileId'
        }, {
            'removeFile': {method: 'DELETE'},
            'removeBigFile': {method: 'DELETE', url: ApiConfigUtil.wasContext() + '/mail-drafts/:mailId/files/:fileId'}
        });
    }

    /* @ngInject */
    function MailFlowTempFileBiz(ApiConfigUtil, FlowTempFileBizBuilder) {
        return {
            makeFlowFileBiz: makeFlowFileBiz,
            makeApiUrl: makeApiUrl
        };

        function makeFlowFileBiz() {
            return new FlowTempFileBizBuilder().withFlowOptions({
                urlPostfix: ''
            }).build();
        }

        function makeApiUrl(mailDraftId, urlPostfix) {
            return [ApiConfigUtil.wasContext(), '/mail-drafts/', mailDraftId, '/files', urlPostfix].join('');
        }
    }

})();
