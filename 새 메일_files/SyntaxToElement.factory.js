(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .factory('SyntaxToElement', SyntaxToElement);


    /* @ngInject */
    function SyntaxToElement(ICON_LIST, HelperConfigUtil, _) {

        function getIconUrl(text) {
            return _.result(_.find(ICON_LIST, {'text': text}), 'url');
        }

        return {
            mention: function (name, fullUrl, id, role) {
                var mentionClass = role ? ['role', role].join('-') : '';
                mentionClass +=  HelperConfigUtil.orgMemberId() === id ? ' my' : '';
                var wrapper$ = angular.element(['<a class="mention-markdown ',  mentionClass, '" data-id="', id,
                    '" href="', fullUrl, '" title="', role, '">', '@', name, '</a>'].join(''));

                return wrapper$[0];
            },
            mentionGroup: function (name, fullUrl, id) {
                var wrapper$ = angular.element(['<a class="mention-group-markdown" data-id="', id,
                    '" href="', fullUrl, '">', '@', name, '</a>'].join(''));
                return wrapper$[0];
            },
            mentionPrefix: function (addMentionText) {
                return angular.element(['<span class="mention-prefix">', addMentionText, '</span>'].join(''))[0];
            },
            taskLink: function (projectCode, postNumber, subject, fullUrl, id, workflow) {
                var code = projectCode + '/' + postNumber,
                    subjectHtml = '';

                if (subject) {
                    subjectHtml = ['&nbsp;l&nbsp;', subject].join('');
                }
                var wrapper$ = angular.element(['<a class="task-reference ', (workflow || ''), '" data-id="', id,
                    '" href="', fullUrl, '" title="', workflow, '">', code, subjectHtml, '</a>'].join(''));

                return wrapper$[0];
            },
            icon: function (text, prefix) {
                var iconUrl = getIconUrl(text);
                return !_.isUndefined(iconUrl) ? [prefix, '<img class="icon-img" src="', iconUrl, '" alt="dooray-icon-:', text, ':"/>'].join('') : [prefix, ':', text, ':'].join('');
            },
            image: function (dataUrl, alt) {
                alt = alt ? alt : 'Image';
                var mark = angular.element('' +
                    '<span class="image-markdown">' +
                    '<span class="bg"></span>' +
                    '<span class="text">' + alt + '</span>' +
                    '</span>');

                mark.on('mouseenter', function () {
                    //TODO: 현재 이미지 팝오버는 에디터 영역을 벗어나지 못함. 스팩나오는거에 따라서 bootstrap popover로 대체해야 할듯.
                    var this$ = angular.element(this);
                    var code$ = this$.closest('.CodeMirror-code');
                    var line$ = this$.closest('pre');
                    var scroll$ = this$.closest('.CodeMirror-scroll');

                    function isOverRight() {
                        return popoverRight > code$.width();
                    }

                    function isTop() {
                        var scrollHeight = scroll$.height();
                        var scrollTop = scroll$.scrollTop();
                        var upHeight = popoverTop - scrollTop;
                        var downHeight = scrollTop + scrollHeight - popoverTop;

                        return upHeight > downHeight;
                    }

                    // 에디팅하는 동안 코드미러가 화면을 다시 그리며
                    // 매우 긴 dataurl을 가진 이미지가 매번 브라우저 로딩되며 속도가 저하되는 문제가 있기 때문에
                    // 마우스 오버 시마다 만들어 붙인다.
                    var popover$ = angular.element('' +
                        '<span class="popover bottom" role="tooltip">' +
                        '<span class="arrow"></span>' +
                        '<span class="popover-content">' +
                        '<img src="' + dataUrl + '">' +
                        '</span>' +
                        '</span>').appendTo(code$);

                    this$.data('popover', popover$);

                    var arrow$ = popover$.children('.arrow');
                    var markLeft = this$.position().left;
                    var popoverTop = line$.position().top + line$.outerHeight();
                    var popoverRight = markLeft + popover$.width();

                    arrow$.css({'left': '20px', 'right': 'initial'});
                    popover$.css({'top': popoverTop, 'left': markLeft, 'right': 'initial'});

                    if (isOverRight()) {
                        arrow$.css({'left': 'initial', 'right': '10px'});
                        popover$.css({'left': 'initial', 'right': 0});
                    }

                    if (isTop()) {
                        popover$
                            .css({'top': 'initial', 'bottom': code$.height() - line$.position().top + 10})
                            .removeClass('bottom')
                            .addClass('top');
                    }
                    popover$.show();
                }).on('mouseleave', function () {
                    angular.element(this).data('popover').remove();
                });
                return mark[0];
            }
        };
    }

})();
