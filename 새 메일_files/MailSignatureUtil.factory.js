(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('MailSignatureUtil', MailSignatureUtil);

    /* @ngInject */
    function MailSignatureUtil() {
        var BEGIN_COMMENT = '<!-- begin signature -->',
            END_COMMENT = '<!-- end signature -->',
            MATCH_REGEX = new RegExp([BEGIN_COMMENT, '(\\n|\\r\\n|(?!', END_COMMENT, ').)*', END_COMMENT].join(''), 'i');

        return {
            BEGIN_COMMENT: BEGIN_COMMENT,
            END_COMMENT: END_COMMENT,
            MATCH_REGEX: MATCH_REGEX,
            getModeSignature: getModeSignature,
            wrapPositionComments: wrapPositionComments
        };

        function getModeSignature(signatureInfo, mode) {
            if (!signatureInfo.enabled || !signatureInfo.options[mode]) {
                return '';
            }

            return signatureInfo.signatures[signatureInfo.useIndex].content;
        }

        function wrapPositionComments(signatureContent) {
            return [signatureContent ? (BEGIN_COMMENT + signatureContent) : BEGIN_COMMENT, END_COMMENT].join('');
        }
    }

})();
