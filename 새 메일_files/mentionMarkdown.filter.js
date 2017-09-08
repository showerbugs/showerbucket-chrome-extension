
(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .filter('mentionMarkdown', mentionMarkdown);

    /* @ngInject */
    function mentionMarkdown(SyntaxToElement, SYNTAX_REGEX) {

        function changeToLinkElement(text, fullUrl, linkType, id, etcField, addMentionText) {
            var cor = [], mentionPrefixText = addMentionText ? SyntaxToElement.mentionPrefix(addMentionText).outerHTML : '';
            if (linkType === 'members') {
                cor = /@(.*)/.exec(text);
                return cor ? mentionPrefixText + SyntaxToElement.mention(cor[1], fullUrl, id, etcField).outerHTML : text;
            } else if (linkType === 'member-groups') {
                cor = /@(.*)/.exec(text);
                return cor ? mentionPrefixText + SyntaxToElement.mentionGroup(cor[1], fullUrl, id).outerHTML : text;
            } else if (linkType === 'tasks') {
                cor = SYNTAX_REGEX.task.exec(text);
                return cor ? SyntaxToElement.taskLink(cor[1], cor[2], cor[3], fullUrl, id, etcField).outerHTML : text;
            } else {
                return text;
            }
        }

        return function (input, direction) {
            // 본문에 NULL이 들어올 때의 예외처리
            input = input || '';
            if (direction === 'markedHtml') {
                return input.replace(SYNTAX_REGEX.doorayLinkFromMarkdown, function (match, addMentionText, fullUrl, linkType, id, etcField, etcField2, text) {
                    return changeToLinkElement(text, fullUrl, linkType, id, etcField || etcField2, addMentionText);
                });
            }
            else if (direction === 'markdown') {
                return input.replace(SYNTAX_REGEX.doorayLink, function (match, addMentionText, addMentionTextHTML, text, fullUrl, linkType, id, etcField) {
                    return changeToLinkElement(text, fullUrl, linkType, id, etcField, addMentionText || addMentionTextHTML);
                });
            }
        };
    }
})();
