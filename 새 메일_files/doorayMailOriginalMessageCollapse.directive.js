(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayMailOriginalMessageCollapse', DoorayMailOriginalMessageCollapse)
        .factory('DoorayMailOriginalMessageParser', DoorayMailOriginalMessageParser);

    /* @ngInject */
    function DoorayMailOriginalMessageCollapse($parse, DoorayMailOriginalMessageParser) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                //ngBindHtml이나 ngBind와 같은 디렉티브가 동일한 element에 설정되어 있어야 이후 처리를 진행함
                var bindHtmlWatch = attrs[attrs.doorayMailOriginalMessageCollapse || 'ngBindHtml'];
                if (!bindHtmlWatch) {
                    return;
                }
                scope.$watch(bindHtmlWatch, function () {
                    DoorayMailOriginalMessageParser.replaceCollapseLayerIfHasOrignalMessage(element, scope);
                    $parse(attrs.onCollapsedOriginalMessage)(scope);
                });
            }
        };
    }

    /* @ngInject */
    function DoorayMailOriginalMessageParser($compile) {
        var naverPatternStrategy = {
            matchElements: function (element) {
                var matchEl$ = element.find('p:contains("-----Original Message-----")');
                var nextAllEl$ = matchEl$.nextAll();
                return matchEl$.toArray().concat(nextAllEl$.toArray());
            }
        };

        var daumPatternStrategy = {
            matchElements: function (element) {
                var matchEl$ = element.find('span:contains("--------- 원본 메일 ---------")');
                var nextAllEl$ = matchEl$.nextAll();
                return matchEl$.toArray().concat(nextAllEl$.toArray());
            }
        };

        var googlePatternStrategy = {
            matchElements: function (element) {
                var matchEl$ = element.find('.gmail_extra');
                return matchEl$.toArray();
            }
        };

        return {
            replaceCollapseLayerIfHasOrignalMessage: function (element, scope) {
                var originalMessageParts = this.findOriginalMessageParts(element);
                if (!originalMessageParts.length) {
                    return;
                }
                var messageCollapseBtn$ = angular.element($compile('<button class="btn btn-default dooray-show-content-btn"><span translate>이전 메일</span>&nbsp;<span class="caret"></span></button>')(scope));
                var messageContentLayer$ = angular.element('<div class="dooray-hide-content">');
                var originalMessageSeperator$ = angular.element(originalMessageParts[0]);
                originalMessageSeperator$.before(messageCollapseBtn$);
                originalMessageSeperator$.before(messageContentLayer$);
                angular.element(originalMessageParts).find('blockquote').removeAttr("style");   //blockquote element의 inline style을 제거하여 레이어 깨짐 방지

                messageContentLayer$.hide();
                messageContentLayer$.append(originalMessageParts);
                element.on('click', toggleLayer);

                scope.$on('$destroy', function () {
                    element.off('click', toggleLayer);
                });

                // 번역 적용후에 깨지지 않기 위하여 상위에 event listener를 두고, 클로저를 사용하지 않음
                function toggleLayer(event) {
                    if (!_.isEmpty(angular.element(event.target).parents('.dooray-show-content-btn')) ||
                        angular.element(event.target).is('.dooray-show-content-btn')) {
                        element.find('.dooray-hide-content').toggle();
                    }
                }
            },

            findOriginalMessageParts: function (element) {
                var matchEl$ = naverPatternStrategy.matchElements(element);
                matchEl$ = matchEl$[0] ? matchEl$ : daumPatternStrategy.matchElements(element);
                matchEl$ = matchEl$[0] ? matchEl$ : googlePatternStrategy.matchElements(element);
                return matchEl$;
            }
        };
    }

})();
