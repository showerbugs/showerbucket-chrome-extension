(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .factory('GfmTaskList', GfmTaskList);

    /* @ngInject */
    function GfmTaskList() {

        var taskListMarkdownRegex = /([*+-]|(?:\d+[.)]))\s+?\[(x| )\]([^\n]+)/gi;
        return {
            replaceMarkdown: function (index, checked, content) {
                var contentIndex = 0;
                content = content.replace(taskListMarkdownRegex, function (match, listStyle, text, remainText) {
                    if (contentIndex === index) {
                        text = checked ? 'x' : ' ';
                    }
                    contentIndex++;
                    return [listStyle, ' [', text, ']', remainText].join('');
                });
                return content;
            }
        };

    }

})();
