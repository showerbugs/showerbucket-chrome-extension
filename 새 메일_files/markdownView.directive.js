(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .directive('markdownView', markdownView);

    /* @ngInject */
    function markdownView(BodyContentsConvertUtil, $compile, $window, GfmTaskList, DoorayLazyLoad) {
        var CHECKBOX_DEBOUNCE_TIME = 1000,
            CONTENT_COMPILE_ELEMENT = ['.mention-markdown', '.task-reference'].join(', ');

        return {
            templateUrl: 'modules/render/contentView/markdownView/markdownView.html',
            require: ['^ngModel'],
            restrict: 'E',
            replace: true,
            scope: {
                height: '=',
                blur: '&onBlur',
                onChecked: '&',
                onLoad: '&',
                disableEdit: '<'
            },
            link: function postLink(scope, element, attrs, ctrls) {
                var ngModel = ctrls[0], changeGfmCheckBox = {cancel: angular.noop};

                //마크다운 본문 렌더링에도 영향을 미치므로 tuiEditor 모듈 로딩을 포함한 doorayRenderer를 로딩한다.
                DoorayLazyLoad.loadDoorayRenderer().then(function () {
                    element.html('');
                    element.tuiEditor({
                        viewOnly: 'true',
                        initialValue: ngModel.$viewValue || '',
                        exts: ['colorSyntax', 'mark'],
                        events: {
                            'load': function (editor) {
                                scope.editor = editor;
                                var content = '';

                                if (ngModel) {
                                    ngModel.$render = function () {
                                        editor.setValue(ngModel.$viewValue || '');
                                        content = ngModel.$viewValue;

                                        if (scope.disableEdit) {
                                            editor.preview.$el.off('mousedown');
                                            element.find('.task-list-item').addClass('disable');
                                        }
                                        $compile(element.find(CONTENT_COMPILE_ELEMENT))(scope);
                                    };
                                }

                                changeGfmCheckBox = _.debounce(function (event, allCheckbox$, content) {
                                    if (!scope.editor) {
                                        return;
                                    }
                                    allCheckbox$.addClass('disable');
                                    var $checked = scope.onChecked({event: event, content: content});

                                    if (!$checked) {
                                        return;
                                    }

                                    $checked.then(function () {
                                        if (!scope.editor) {
                                            return;
                                        }
                                        //comment의 경우 데이터가 변하지 않으면 refresh 되지 않을 수 있으므로 재등록.
                                        allCheckbox$.removeClass('disable');
                                    });
                                }, CHECKBOX_DEBOUNCE_TIME);

                                function changeEditor(e) {
                                    changeGfmCheckBox.cancel();
                                    var allCheckbox$ = element.find('.task-list-item'),
                                        index = allCheckbox$.index(e.data.target);
                                    content = GfmTaskList.replaceMarkdown(index, $(e.data.target).hasClass('checked'), content);
                                    changeGfmCheckBox(e, allCheckbox$, content);
                                }

                                // 500ms동안 checkbox의 클릭이 없으면 갱신.
                                scope.editor.on('change', changeEditor);
                                scope.onLoad({editor: editor, target: {element: element}});
                            },
                            // rendering
                            'convertorAfterMarkdownToHtmlConverted': function (markdown) {
                                return BodyContentsConvertUtil.convertMarkdownBodyToContent(markdown);
                            }
                        }
                    });

                });


                element.on('click', 'img', function (e) {
                    $window.open(e.target.src);
                });

                scope.$on('$destroy', function () {
                    //TODO 에디터에서 remove시 자체적으로 메모리 해제를 시켜줘야함
                    element.off('click');
                    element.removeData();

                    if (scope.editor) {
                        scope.editor.off('change');
                        scope.editor.preview.$el.off();
                        scope.editor.remove();
                        scope.editor = null;
                    }

                    changeGfmCheckBox.cancel();
                });
            }
        };
    }

})();

