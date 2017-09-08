(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .directive('dooraySelectTag', DooraySelectTag);

    /* @ngInject */
    function DooraySelectTag($parse, gettextCatalog) {
        return {
            templateUrl: function (element, attrs) {
                return attrs.tagBtnTitle ?
                    'modules/project/components/dooraySelectTag/selectTagWithStaticBtn.html' :
                    (attrs.outputProperties ?
                        'modules/project/components/dooraySelectTag/selectTagWithOutputProperties.html' :
                        'modules/project/components/dooraySelectTag/selectTag.html');
            },
            restrict: 'A',
            transclude: true,
            scope: {
                tagBtnTitle: '@',
                outputProperties: '@',

                isShowTagPane: '=?',
                ngDisabled: '=',
                inputModel: '=',
                outputModel: '=?',

                onOpen: '&',
                onItemClick: '&'
            },
            link: {
                pre: function (scope, element, attrs) {
                    // Object로 값이 들어오는 경우 처리
                    scope.translation = $parse(attrs.translation)(scope.$parent) || { search: gettextCatalog.getString('태그 검색') };  // translation 변수가 먼저 생성되는 문제 해결
                    scope.option = $parse(attrs.option)(scope.$parent);                                                               // {btnCss: '', multiSelectCss: ''}
                },
                post: function (scope) {
                    // ----- Declare Variables --------
                    scope.isShowTagPane = false;


                    // ----- Declare Method --------

                    scope.openTagPane = openTagPane;
                    scope.onCloseTagPane = onCloseTagPane;

                    // ----- Define Method -------

                    function openTagPane() {
                        scope.isShowTagPane = true;
                        scope.onOpen();
                    }

                    function onCloseTagPane() {
                        scope.isShowTagPane = false;
                    }

                    function init() {
                    }

                    init();
                }
            }
        };
    }

})();
