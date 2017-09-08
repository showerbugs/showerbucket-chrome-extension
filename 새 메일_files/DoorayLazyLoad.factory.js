(function () {

    'use strict';

    angular
        .module('doorayWebApp.lazyload')
        .constant('DOORAY_LAZYLOAD_EVENTS', {
            'CODEMIRROR': 'codemirror',
            'TUI_EDITOR': 'tui-editor',
            'PRETTY_JSON': 'pretty-json',
            'DOORAY_CALENDAR': 'dooray-calendar'
        })
        .factory('DoorayLazyLoad', DoorayLazyLoad);

    /* @ngInject */
    function DoorayLazyLoad($rootScope, $q, $window, $ocLazyLoad, DOORAY_LAZYLOAD_EVENTS) {

        return {
            loadTuiEditor: loadTuiEditor,
            loadTinyMceEditor: loadTinyMceEditor,
            loadDoorayRenderer: loadDoorayRenderer,
            loadDoorayCalendar: loadDoorayCalendar,
            loadCodeMirror: loadCodeMirror,
            loadPrettyJSON: loadPrettyJSON,

            loadNgUiGrid: loadNgUiGrid
        };

        function loadTuiEditor() {
            //console.trace('loadTuiEditor');
            //return $ocLazyLoad.load([/*'tui-code-snippet', */ 'codemirror', 'highlightjs', 'squire-rte', 'markdown-it', 'toMark']).then(function () {
            return $q.all([
                loadCodeMirror(),   //$ocLazyLoad.load('codemirror'),
                $ocLazyLoad.load('tui-code-snippet'),
                $ocLazyLoad.load('highlightjs'),
                $ocLazyLoad.load('squire-rte'),
                $ocLazyLoad.load('markdown-it'),
                $ocLazyLoad.load('toMark')
            ]).then(function () {
                return $ocLazyLoad.load('tui-editor');
            }).then(function () {
                $rootScope.$broadcast(DOORAY_LAZYLOAD_EVENTS.TUI_EDITOR, $window.tui.Editor);
                return $q.when($window.tui.Editor);
            });
        }

        function loadDoorayRenderer() {
            //console.trace('loadDoorayRenderer');
            return loadTuiEditor().then(function () {
                //return $ocLazyLoad.load([/*'tui-code-snippet', */'highlightjs', 'KaTeX', 'pretty-json']);
                return $q.all([
                    loadPrettyJSON(),
                    //$ocLazyLoad.load('tui-code-snippet'),
                    //$ocLazyLoad.load('highlightjs'),
                    $ocLazyLoad.load('KaTeX')
                ]);
            }).then(function () {
                return $ocLazyLoad.load('markdown-renderer');
            }).then(function () {
                return $q.when($window.tui.Editor.markdownItRenderer);
            });
        }

        function loadDoorayCalendar() {
            //console.trace('loadDoorayCalendar');
            return $ocLazyLoad.load('tui-code-snippet').then(function () {
                return $ocLazyLoad.load('dooray-calendar').then(function () {
                    $rootScope.$broadcast(DOORAY_LAZYLOAD_EVENTS.DOORAY_CALENDAR, $window.ne.dooray.calendar);
                    return $q.when($window.ne.dooray.calendar);
                });
            });
        }

        function loadTinyMceEditor() {
            //console.trace('loadTinyMceEditor');
            return $ocLazyLoad.load('tinymce').then(function () {
                return $ocLazyLoad.load('ui.tinymce').then(function () {
                    return $q.when($window.tinymce);
                });
            });
        }

        function loadCodeMirror() {
            return $ocLazyLoad.load('codemirror').then(function () {
                $rootScope.$broadcast(DOORAY_LAZYLOAD_EVENTS.CODEMIRROR, $window.CodeMirror);
                return $q.when($window.CodeMirror);
            });
        }

        function loadPrettyJSON() {
            return $ocLazyLoad.load('pretty-json').then(function () {
                $rootScope.$broadcast(DOORAY_LAZYLOAD_EVENTS.PRETTY_JSON, $window.PrettyJSON);
                return $q.when($window.PrettyJSON);
            });
        }

        function loadNgUiGrid() {
            return $ocLazyLoad.load('ui-grid');
        }
    }

})();
