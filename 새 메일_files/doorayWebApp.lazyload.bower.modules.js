(function(){
	'use strict';
	angular.module('doorayWebApp.lazyload.bower', [])
	.constant('BOWER_DEPENDENCIES', { depsArray: [
    {
        "name": "jquery",
        "files": [
            "/assets/lazyload/_bower_components/jquery/dist/jquery-107fbe9555.js"
        ],
        "serie": true
    },
    {
        "name": "angular",
        "files": [
            "/assets/lazyload/_bower_components/angular/angular-csp-5d7bf1728c.css",
            "/assets/lazyload/_bower_components/angular/angular-32c1fc614a.js"
        ],
        "serie": true
    },
    {
        "name": "json3",
        "files": [
            "/assets/lazyload/_bower_components/json3/lib/json3-f81d39fe68.js"
        ],
        "serie": true
    },
    {
        "name": "es5-shim",
        "files": [
            "/assets/lazyload/_bower_components/es5-shim/es5-shim-b4dd13f3fe.js"
        ],
        "serie": true
    },
    {
        "name": "bootstrap-sass",
        "files": [
            "/assets/lazyload/_bower_components/bootstrap-sass/assets/javascripts/bootstrap-fb81549ee2.js"
        ],
        "serie": true
    },
    {
        "name": "angular-cookies",
        "files": [
            "/assets/lazyload/_bower_components/angular-cookies/angular-cookies-96586c1afa.js"
        ],
        "serie": true
    },
    {
        "name": "angular-resource",
        "files": [
            "/assets/lazyload/_bower_components/angular-resource/angular-resource-94057d75de.js"
        ],
        "serie": true
    },
    {
        "name": "angular-sanitize",
        "files": [
            "/assets/lazyload/_bower_components/angular-sanitize/angular-sanitize-427accd5ec.js"
        ],
        "serie": true
    },
    {
        "name": "angular-animate",
        "files": [
            "/assets/lazyload/_bower_components/angular-animate/angular-animate-e51a5ce7b2.js"
        ],
        "serie": true
    },
    {
        "name": "angular-ui-router",
        "files": [
            "/assets/lazyload/_bower_components/angular-ui-router/release/angular-ui-router-4e2a8f871e.js"
        ],
        "serie": true
    },
    {
        "name": "angular-i18n",
        "files": [],
        "serie": true
    },
    {
        "name": "angular-messages",
        "files": [
            "/assets/lazyload/_bower_components/angular-messages/angular-messages-5d8dbdea51.js"
        ],
        "serie": true
    },
    {
        "name": "angular-bootstrap",
        "files": [
            "/assets/lazyload/_bower_components/angular-bootstrap/ui-bootstrap-tpls-2f2c3d0ede.js"
        ],
        "serie": true
    },
    {
        "name": "bootstrap-select",
        "files": [
            "/assets/lazyload/_bower_components/bootstrap-select/dist/css/bootstrap-select-c2013bc9f9.css",
            "/assets/lazyload/_bower_components/bootstrap-select/dist/js/bootstrap-select-f6c16bdd5e.js"
        ],
        "serie": true
    },
    {
        "name": "lodash",
        "files": [
            "/assets/lazyload/_bower_components/lodash/lodash-9381cb5127.js"
        ],
        "serie": true
    },
    {
        "name": "moment",
        "files": [
            "/assets/lazyload/_bower_components/moment/moment-a04210d73e.js",
            "/assets/lazyload/_bower_components/moment/min/locales-4a25ac5359.js"
        ],
        "serie": true
    },
    {
        "name": "moment-timezone",
        "files": [
            "/assets/lazyload/_bower_components/moment-timezone/builds/moment-timezone-with-data-ea72171e9f.js"
        ],
        "serie": true
    },
    {
        "name": "angular-moment",
        "files": [
            "/assets/lazyload/_bower_components/angular-moment/angular-moment-356b470561.js"
        ],
        "serie": true
    },
    {
        "name": "angular-bootstrap-lightbox",
        "files": [
            "/assets/lazyload/_bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox-faf92d013f.css",
            "/assets/lazyload/_bower_components/angular-bootstrap-lightbox/dist/angular-bootstrap-lightbox-65a751e132.js"
        ],
        "serie": true
    },
    {
        "name": "angular-gravatar",
        "files": [
            "/assets/lazyload/_bower_components/angular-gravatar/build/angular-gravatar-9acbb46d75.js"
        ],
        "serie": true
    },
    {
        "name": "flow.js",
        "files": [
            "/assets/lazyload/_bower_components/flow.js/dist/flow-01ff3bdad8.js"
        ],
        "serie": true
    },
    {
        "name": "ng-flow",
        "files": [
            "/assets/lazyload/_bower_components/ng-flow/dist/ng-flow-f51ef28c7c.js"
        ],
        "serie": true
    },
    {
        "name": "fusty-flow.js",
        "files": [
            "/assets/lazyload/_bower_components/fusty-flow.js/src/fusty-flow-b12386a06a.js",
            "/assets/lazyload/_bower_components/fusty-flow.js/src/fusty-flow-factory-3eb0530cea.js"
        ],
        "serie": true
    },
    {
        "name": "ngstorage",
        "files": [
            "/assets/lazyload/_bower_components/ngstorage/ngStorage-587579c86a.js"
        ],
        "serie": true
    },
    {
        "name": "angular-loading-bar",
        "files": [
            "/assets/lazyload/_bower_components/angular-loading-bar/build/loading-bar-32e3ec7e39.css",
            "/assets/lazyload/_bower_components/angular-loading-bar/build/loading-bar-45fc378ab8.js"
        ],
        "serie": true
    },
    {
        "name": "angular-ui-utils",
        "files": [
            "/assets/lazyload/_bower_components/angular-ui-utils/ui-utils-602891394a.js",
            "/assets/lazyload/_bower_components/angular-ui-utils/ui-utils-ieshiv-eac534bc00.js"
        ],
        "serie": true
    },
    {
        "name": "re-tree",
        "files": [
            "/assets/lazyload/_bower_components/re-tree/re-tree-b81c22bbb0.js"
        ],
        "serie": true
    },
    {
        "name": "ng-device-detector",
        "files": [
            "/assets/lazyload/_bower_components/ng-device-detector/ng-device-detector-9ba70d3ce8.js"
        ],
        "serie": true
    },
    {
        "name": "nanoscroller",
        "files": [
            "/assets/lazyload/_bower_components/nanoscroller/bin/css/nanoscroller-14069f7df0.css",
            "/assets/lazyload/_bower_components/nanoscroller/bin/javascripts/jquery-968bd5600d.nanoscroller.js"
        ],
        "serie": true
    },
    {
        "name": "angular-nanoscroller",
        "files": [
            "/assets/lazyload/_bower_components/angular-nanoscroller/scrollable-5855c99373.js"
        ],
        "serie": true
    },
    {
        "name": "font-awesome",
        "files": [],
        "serie": true
    },
    {
        "name": "tui-code-snippet",
        "files": [
            "/assets/lazyload/_bower_components/tui-code-snippet/code-snippet-2685fcfd20.js"
        ],
        "serie": true
    },
    {
        "name": "codemirror",
        "files": [
            "/assets/lazyload/_bower_components/codemirror/lib/codemirror-95410923b4.css",
            "/assets/lazyload/_bower_components/codemirror/lib/codemirror-a80ab51333.js",
            "/assets/lazyload/_bower_components/codemirror/mode/css/css-0d83a4a91a.js",
            "/assets/lazyload/_bower_components/codemirror/mode/htmlmixed/htmlmixed-7eb31a31f5.js",
            "/assets/lazyload/_bower_components/codemirror/mode/javascript/javascript-38ff87ba0c.js",
            "/assets/lazyload/_bower_components/codemirror/mode/python/python-afa03064bc.js",
            "/assets/lazyload/_bower_components/codemirror/mode/sass/sass-bd31ac70e9.js",
            "/assets/lazyload/_bower_components/codemirror/mode/shell/shell-cef30158aa.js",
            "/assets/lazyload/_bower_components/codemirror/mode/sql/sql-8eca0b7915.js",
            "/assets/lazyload/_bower_components/codemirror/mode/xml/xml-80f64aaafa.js"
        ],
        "serie": true
    },
    {
        "name": "highlightjs",
        "files": [
            "/assets/lazyload/_bower_components/highlightjs/styles/tomorrow-8662c2c36b.css",
            "/assets/lazyload/_bower_components/highlightjs/highlight-170761edab.pack.js"
        ],
        "serie": true
    },
    {
        "name": "markdown-it",
        "files": [
            "/assets/lazyload/_bower_components/markdown-it/dist/markdown-it-c843b95b48.js"
        ],
        "serie": true
    },
    {
        "name": "toMark",
        "files": [
            "/assets/lazyload/_bower_components/toMark/dist/toMark-dc941fb0dd.js"
        ],
        "serie": true
    },
    {
        "name": "squire-rte",
        "files": [
            "/assets/lazyload/_bower_components/squire-rte/build/squire-5bebd68bfc.js"
        ],
        "serie": true
    },
    {
        "name": "tui-editor",
        "files": [
            "/assets/lazyload/_bower_components/tuiEditor/dist/tui-editor-62456e43b6.css",
            "/assets/lazyload/_bower_components/tuiEditor/dist/tui-editor-362e84e13b.js"
        ],
        "serie": true
    },
    {
        "name": "cryptojslib",
        "files": [
            "/assets/lazyload/_bower_components/cryptojslib/rollups/aes-4ff108e458.js"
        ],
        "serie": true
    },
    {
        "name": "mousetrap",
        "files": [
            "/assets/lazyload/_bower_components/mousetrap/mousetrap-3b73d4fb73.js",
            "/assets/lazyload/_bower_components/mousetrap/plugins/global-bind/mousetrap-global-bind-e78297716b.js"
        ],
        "serie": true
    },
    {
        "name": "angular-websocket",
        "files": [
            "/assets/lazyload/_bower_components/angular-websocket/angular-websocket-020aa5bc75.min.js"
        ],
        "serie": true
    },
    {
        "name": "angular-filter",
        "files": [
            "/assets/lazyload/_bower_components/angular-filter/dist/angular-filter-7234b2c3ee.js"
        ],
        "serie": true
    },
    {
        "name": "addressparser",
        "files": [
            "/assets/lazyload/_bower_components/addressparser/src/addressparser-51765d293f.js"
        ],
        "serie": true
    },
    {
        "name": "http-status-codes",
        "files": [
            "/assets/lazyload/_bower_components/http-status-codes/http-status-codes-a937a63b83.js"
        ],
        "serie": true
    },
    {
        "name": "octicons",
        "files": [],
        "serie": true
    },
    {
        "name": "ng-multi-transclude",
        "files": [
            "/assets/lazyload/_bower_components/ng-multi-transclude/src/multi-transclude-1c750d4369.js"
        ],
        "serie": true
    },
    {
        "name": "dooray-calendar",
        "files": [
            "/assets/lazyload/_bower_components/dooray-calendar/dist/index-52312c74c9.css",
            "/assets/lazyload/_bower_components/dooray-calendar/dist/index-3cd49ba1ea.js"
        ],
        "serie": true
    },
    {
        "name": "d3",
        "files": [
            "/assets/lazyload/_bower_components/d3/d3-4a654f23f7.js"
        ],
        "serie": true
    },
    {
        "name": "_nvd3",
        "files": [
            "/assets/lazyload/_bower_components/nvd3/build/nv-43a2fb58fd.d3.css",
            "/assets/lazyload/_bower_components/nvd3/build/nv-010c53629f.d3.js"
        ],
        "serie": true
    },
    {
        "name": "nvd3",
        "files": [
            "/assets/lazyload/_bower_components/angular-nvd3/dist/angular-nvd3-212059ff92.js"
        ],
        "serie": true
    },
    {
        "name": "clipboard",
        "files": [
            "/assets/lazyload/_bower_components/clipboard/dist/clipboard-35087b4c97.js"
        ],
        "serie": true
    },
    {
        "name": "angular-trello",
        "files": [
            "/assets/lazyload/_bower_components/angular-trello/src/angular-trello-9864797865.js"
        ],
        "serie": true
    },
    {
        "name": "angular-gettext",
        "files": [
            "/assets/lazyload/_bower_components/angular-gettext/dist/angular-gettext-e0b9e54eef.js"
        ],
        "serie": true
    },
    {
        "name": "angular-dynamic-locale",
        "files": [
            "/assets/lazyload/_bower_components/angular-dynamic-locale/src/tmhDynamicLocale-e5ee372e91.js"
        ],
        "serie": true
    },
    {
        "name": "angular-ui-select",
        "files": [
            "/assets/lazyload/_bower_components/ui-select/dist/select-4585f39388.css",
            "/assets/lazyload/_bower_components/ui-select/dist/select-51478131fe.js"
        ],
        "serie": true
    },
    {
        "name": "angular-growl-v2",
        "files": [
            "/assets/lazyload/_bower_components/angular-growl-v2/build/angular-growl-740bd65b0a.css",
            "/assets/lazyload/_bower_components/angular-growl-v2/build/angular-growl-0161c90ede.js"
        ],
        "serie": true
    },
    {
        "name": "angular-drag-and-drop-lists",
        "files": [
            "/assets/lazyload/_bower_components/angular-drag-and-drop-lists/angular-drag-and-drop-lists-0081aa1e05.js"
        ],
        "serie": true
    },
    {
        "name": "angular-native-dragdrop",
        "files": [
            "/assets/lazyload/_bower_components/angular-native-dragdrop/draganddrop-cf7d402677.js"
        ],
        "serie": true
    },
    {
        "name": "bootstrap",
        "files": [
            "/assets/lazyload/_bower_components/bootstrap/dist/js/bootstrap-fb81549ee2.js"
        ],
        "serie": true
    },
    {
        "name": "angular-bootstrap-checkbox",
        "files": [
            "/assets/lazyload/_bower_components/angular-bootstrap-checkbox/angular-bootstrap-checkbox-4fb136ce08.js"
        ],
        "serie": true
    },
    {
        "name": "tinymce",
        "files": [
            "/assets/lazyload/_bower_components/tinymce/tinymce-93fa97ecd7.js"
        ],
        "serie": true
    },
    {
        "name": "ui.tinymce",
        "files": [
            "/assets/lazyload/_bower_components/angular-ui-tinymce/src/tinymce-c9be290a5a.js"
        ],
        "serie": true
    },
    {
        "name": "pretty-json",
        "files": [
            "/assets/lazyload/_bower_components/pretty-json/dist/pretty-json-1b07fa3ede.css",
            "/assets/lazyload/_bower_components/pretty-json/dist/pretty-json-1ef7c38239.min.js"
        ],
        "serie": true
    },
    {
        "name": "KaTeX",
        "files": [
            "/assets/lazyload/_bower_components/katex/dist/katex-35dac00c58.min.css",
            "/assets/lazyload/_bower_components/katex/dist/katex-c32130d329.min.js"
        ],
        "serie": true
    },
    {
        "name": "markdown-renderer",
        "files": [
            "/assets/lazyload/_bower_components/markdown-renderer/dist/dooray-renderer-680fb2b73a.css",
            "/assets/lazyload/_bower_components/markdown-renderer/dist/dooray-renderer-9cef8eb2e8.js"
        ],
        "serie": true
    },
    {
        "name": "Autolinker.js",
        "files": [
            "/assets/lazyload/_bower_components/Autolinker.js/dist/Autolinker-4a6a6aa362.js"
        ],
        "serie": true
    },
    {
        "name": "angular-aria",
        "files": [
            "/assets/lazyload/_bower_components/angular-aria/angular-aria-4b79e4d18f.js"
        ],
        "serie": true
    },
    {
        "name": "angular-material",
        "files": [
            "/assets/lazyload/_bower_components/angular-material/angular-material-38af40b125.css",
            "/assets/lazyload/_bower_components/angular-material/angular-material-84de57c207.js"
        ],
        "serie": true
    },
    {
        "name": "angular-google-analytics",
        "files": [
            "/assets/lazyload/_bower_components/angular-google-analytics/dist/angular-google-analytics-c6864fe293.min.js"
        ],
        "serie": true
    },
    {
        "name": "oclazyload",
        "files": [
            "/assets/lazyload/_bower_components/oclazyload/dist/ocLazyLoad-e66a6ba331.js"
        ],
        "serie": true
    },
    {
        "name": "webfontloader",
        "files": [
            "/assets/lazyload/_bower_components/webfontloader/webfontloader-13af46d04a.js"
        ],
        "serie": true
    },
    {
        "name": "froala-wysiwyg-editor",
        "files": [
            "/assets/lazyload/_bower_components/froala-wysiwyg-editor/css/froala_editor-6c72a96862.pkgd.min.css",
            "/assets/lazyload/_bower_components/froala-wysiwyg-editor/css/froala_style-d765f3f2de.min.css",
            "/assets/lazyload/_bower_components/froala-wysiwyg-editor/js/froala_editor-1865f63bfc.pkgd.min.js"
        ],
        "serie": true
    },
    {
        "name": "angular-froala",
        "files": [
            "/assets/lazyload/_bower_components/angular-froala/src/angular-froala-e9151e612d.js"
        ],
        "serie": true
    }
] });
})();