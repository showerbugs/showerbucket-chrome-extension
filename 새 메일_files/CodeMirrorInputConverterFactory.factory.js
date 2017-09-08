(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .factory('CodeMirrorInputConverterFactory', CodeMirrorInputConverterFactory);

    /* @ngInject */
    function CodeMirrorInputConverterFactory(SYNTAX_REGEX, SyntaxToElement) {
        return function (doc, text, line, ch) {
            var from = function (offset) {
                return {line: line, ch: ch + offset};
            };
            var to = function (offset, changeLength) {
                return {line: line, ch: ch + offset + changeLength};
            };
            text.replace(SYNTAX_REGEX.doorayLink, function (match, addMentionText, addMentionTextHTML, text, fullUrl, linkType, id, etcFiled, offset) {
                var cor = [], mathchedLength = match.length, addMentionText = addMentionText || addMentionTextHTML;
                if (addMentionText) {
                    doc.markText(from(offset), to(offset, addMentionText.length), {replacedWith: SyntaxToElement.mentionPrefix(addMentionText)});
                    offset = offset + addMentionText.length;
                    mathchedLength = mathchedLength - addMentionText.length;
                }

                if (linkType === 'members') {
                    cor = /@(.*)/.exec(text);
                    doc.markText(from(offset), to(offset, mathchedLength), {replacedWith: SyntaxToElement.mention(cor[1], fullUrl, id, etcFiled)});
                } else if (linkType === 'member-groups') {
                    cor = /@(.*)/.exec(text);
                    doc.markText(from(offset), to(offset, mathchedLength), {replacedWith: SyntaxToElement.mentionGroup(cor[1], fullUrl, id)});
                } else if (linkType === 'tasks') {
                    cor = SYNTAX_REGEX.task.exec(text);
                    doc.markText(from(offset), to(offset, mathchedLength), {replacedWith: SyntaxToElement.taskLink(cor[1], cor[2], cor[3], fullUrl, id, etcFiled)});
                }
                return match;
            });
            text.replace(SYNTAX_REGEX.image, function (match, alt, dataUrl, offset) {
                doc.markText(from(offset), to(offset, match.length), {replacedWith: SyntaxToElement.image(dataUrl, alt)});
                return match;
            });
        };
    }

})();
