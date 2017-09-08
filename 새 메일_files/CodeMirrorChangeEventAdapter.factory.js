(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .factory('CodeMirrorChangeEventAdapter', CodeMirrorChangeEventAdapter);

    /* @ngInject */
    function CodeMirrorChangeEventAdapter(CodeMirrorInputConverterFactory, _) {
        var handleDoc = function (cm, changeObj) {
            var doc = cm.getDoc();

            for (var i = 0; i < changeObj.text.length; i++) {
                var text = doc.getLine(changeObj.from.line + i);
                var line = changeObj.from.line + i;
                CodeMirrorInputConverterFactory(doc, text, line, 0);
            }
        };

        var changeHandler = function (cm, changeObj) {
            if (_.includes(['complete', '+addImage', '+input', 'paste', 'setValue'], changeObj.origin)) {
                handleDoc(cm, changeObj);
            }
        };

        return {
            attachEventsFromElement: attachEventsFromElement
        };

        function attachEventsFromElement(element) {
            var cm = element.tuiEditor('getCodeMirror');
            cm.on('change', changeHandler);
        }
    }

})();
