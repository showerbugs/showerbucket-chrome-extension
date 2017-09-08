(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .directive('contentTranslation', ContentTranslationDirective);

    /* @ngInject */
    function ContentTranslationDirective($compile, $timeout, HelperPromiseUtil, TranslateBodyAction, _) {
        return {
            restrict: 'A',
            link: postLink,
            scope: {
                contentTranslation: '<',
                contentVersion: '<',
                fromLocale: '@',
                selector: '@?',
                outerHtml: '@?'
            }
        };

        function postLink(scope, element) {
            var _originalHtmlCache = null,
                destroyed = false,
                translatePending;

            scope.$watch('contentTranslation', function (newVal) {
                if (newVal) {
                    if (scope.contentVersion) {
                        _translateContent();
                    }
                }
            });

            scope.$watch('contentVersion', function (newVal) {
                if (newVal && scope.contentTranslation) {
                    _translateContent();
                }
            });

            scope.$on('$destroy', function () {
                destroyed = true;
            });

            function _translateContent() {
                var option = _.cloneDeep(scope.contentTranslation);
                if (HelperPromiseUtil.isResourcePending(translatePending)) {
                    return;
                }

                translatePending = $timeout(function () {
                    var el$ = _getTargetElement();
                    if (_.isEmpty(el$)) {
                        return;
                    }
                    if (!_originalHtmlCache) {
                        _originalHtmlCache = scope.outerHtml ? el$[0].outerHTML : el$[0].innerHTML;
                    }
                    TranslateBodyAction.translateMarkdownBody(_originalHtmlCache, _getSrcLang(option), option.targetLang).then(function (convertHtml) {
                        if (!destroyed) {
                            _applyHtmlContent(el$, convertHtml);
                        }
                    });
                }, 0, false);
            }

            function _getTargetElement() {
                return scope.selector ? element.find(scope.selector) : element;
            }

            function _getSrcLang(option) {
                return (option.sourceLang !== 'auto' ? option.sourceLang : scope.fromLocale) || 'ko_KR';
            }

            function _applyHtmlContent(target$, html) {
                if (scope.outerHtml) {
                    target$[0].outerHTML = html;
                    return;
                }
                target$.html($compile(html)(scope.$parent));
            }
        }
    }

})();
