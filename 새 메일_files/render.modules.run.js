/**
 * @ngdoc overview
 * @name doorayWebApp.render
 * @description
 * # doorayWebApp.render
 *
 * Shared Config module of the application.
 */

(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .config(['$sanitizeProvider', function ($sanitizeProvider) {
            $sanitizeProvider.enableSvg(true);
            $sanitizeProvider.setAllowStyle(['color']);
            $sanitizeProvider.setAllowElementAndClassName({
                'iframe': ['video-embed-item'],
                'video': ['video-embed-item']
            });
        }])
        .config(['$$sanitizeUriProvider', function ($$sanitizeUriProvider) {
            $$sanitizeUriProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|dooray):/);
        }])
        .constant('SYNTAX_REGEX', {
            doorayLink: /(?:(->>|->|-\\>\\>|-\\>)|<span class="mention-prefix">(->>|->|-\\>\\>|-\\>)<\/span>)?\[([a-zA-Z0-9@\(\)\-\\\(\\\)\\\-\.~\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+\/[0-9]+\s.*?|@.*?)\]\((dooray:\/\/\d+?\/([\w-]+)\/(\d+))?(?:\s(?:quot;|")(\w+)?(?:quot;|"))?\)/g,
            doorayLinkFromMarkdown: /(?:<span[^>]*>)?((?:-&gt;&gt;)|(?:-&gt;))?(?:<\/span>)?<a[^>]*href="(dooray:\/\/\d+?\/([\w-]+)\/(\d+))?(?:\s(?:quot;|")(\w+)?(?:quot;|"))?"(?:\stitle="([a-z]+)")?[^>]*>(.*?)<\/a>/g,
            doorayEmojiFromTag: /\!\[dooray-icon-(:[a-z0-9\-_+]+:)\]\(.*?\)/g,
            mention: /\[@(.*?)\]\(dooray:\/\/(\d+?)\/(members|member-groups)\/(\d+?)( "[a-z]+?")?\)/,
            mentionAddon: /(\s|\))(->>|->)$|^(->>|->)$/, //멘션 바로뒤에도 트리거 될 수 있게 ')' 문자열 예외처리
            mentionWithAddon: /((\s|\))(->>|->)|^(->>|->))?\[@(.*?)\]\(dooray:\/\/(\d+?)\/(members|member-groups)\/(\d+?)( "[a-z]+?")?\)/,
            taskWithCode: /(^[a-zA-Z0-9@\(\)\-\.~\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+)\/([0-9]+)/,
            taskWithCodeAndSubject: /(^[a-zA-Z0-9@\(\)\-\.~\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+)\/(.*)/, //Dooray-서비스/256. Dooray-서비스/공통 APi개발
            task: /([a-zA-Z0-9@\(\)\-\.~\u3131-\u314E\u314F-\u3163\uAC00-\uD7A3\u3040-\u309F\u30A0-\u30FF\u3400-\u4DB5\u4E00-\u9FCC]+)\/([0-9]+)(?:\s(.*))?/, //bug/256 제목제목
            originalTaskLink: /([^\[]|^)\#([a-z0-9\-_]+)\/(\d+)/gi, //#bug/254
            taskHyperlinkUrl: /<a href="http:\/\/[a-z0-9\-_.]+dooray.com(?::[0-9]+)?(?:\/[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣-_.]+)*\/([a-z0-9\-_.@]+)\/(\d+)\W?[a-z0-9\-_=&;@">\s:\/\/.,?]+<\/a>/gi,
            styleTag: /<style>.*<\/style>/,
            htmlTag: /<[^>]*>/g,
            htmlElementStream: /(<style>[^<]*<\/style>|<[^>]*>|&nbsp;|(\s)+)+/g,
            stringWithoutHtmlTag: /([^<]+)/g,
            icon: /([^-])?:([a-z0-9\-_+]+):/g,
            image: /!\[(.*?)\]\((data:.*?)\)/g,
            regex: /^\/(.*)\/[gi]*?$/g
        })
        .constant('ICON_LIST', [
            {
                text: '+1',
                url: 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44d.png'
            },
            {
                text: '-1',
                url: 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f44e.png'
            },
            {
                text: '100',
                url: 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f4af.png'
            },
            {
                text: '1234',
                url: 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f552.png'
            },
            {
                text: '8ball',
                url: 'https://assets-cdn.github.com/images/icons/emoji/unicode/1f3b1.png'
            }
        ])
        .constant('MIME_TYPE', {
            'TEXT': {name: 'text', type: 'text/plain', mode: {text: 'text'}},
            'HTML': {name: 'html', type: 'text/html', mode: {html: 'html'}},
            'MARKDOWN': {name: 'markdown', type: 'text/x-markdown', mode: {markdown: 'markdown', 'wysiwyg': 'wysiwyg'}}
        })
        .constant('MIME_TYPE_REVERSE', {
            'text/plain': 'TEXT',
            'text/html': 'HTML',
            'text/x-markdown': 'MARKDOWN'
        });
})();
