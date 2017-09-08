(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .directive('drCompileHtml', DrCompileHtml)
        .directive('drCompileInnerHtml', DrCompileInnerHtml);

    /* @ngInject */
    function DrCompileHtml($compile) {
        return {
            restrict: 'A',
            scope: {
                onLoad: '&'
            },
            link: function (scope, element, attr) {
                scope.$parent.$watch(attr.drCompileHtml, function (newVal) {
                    element.html(newVal);
                    $compile(element.contents())(scope.$parent);
                    scope.onLoad({target: {element: element}});
                });
            }
        };
    }

    /* @ngInject */
    function DrCompileInnerHtml($compile) {
        // #dooray-메일/273
        // 메일 본문에 tag invalid한 값이 들어오는 경우, 특정 태그가 누락현상 발생되어 innerHTML로 처리 후 추후 상황 관찰
        // 메일 본문에 XSS 공격을 위한 혹은 내부 컴파일 요소를 막기 위해 enableCompile 옵션 추가

        return {
            restrict: 'A',
            scope: {
                enableCompile: '<',
                onLoad: '&'
            },
            link: function (scope, element, attr) {
                scope.$parent.$watch(attr.drCompileInnerHtml, function (newVal) {
                    element[0].innerHTML = newVal;
                    if (scope.enableCompile) {
                        $compile(element.contents())(scope.$parent);
                    }
                    scope.onLoad({target: {element: element}});
                });
            }
        };
    }

})();
