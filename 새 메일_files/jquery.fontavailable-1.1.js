/* fontAvailable jQuery Plugin, v1.1
 *
 * Copyright (c) 2009, Howard Rauscher
 * Licensed under the MIT License
 */
'use strict';
(function ($) {
    var element;

    $.fontAvailable = function (fontName) {
        // prepare element, and append to DOM
        if (!element) {
            element = $(document.createElement('span'))
                .css('visibility', 'hidden')
                .css('position', 'absolute')
                .css('top', '-10000px')
                .css('left', '-10000px')
                .html('abcdefghijklmnopqrstuvwxyz가나다라')
                .appendTo(document.body);
        }

        // get the width/height of element after applying a fake font
        element.css('font-family', '__FAKEFONT__');
        var _width = element.width();
        var _height = element.height();

        // set test font
        element.css('font-family', fontName);
        var width = element.width();
        var height = element.height();

        // IE11에서 checkspell 구현에서 돔을 로딩중 지우면 메모리 누수가 발생해서 컴퓨터가 멈추는 현상이 있어서 주석처리
        // element.remove();
        // element = null;

        return _width !== width || _height !== height;
    };
})(jQuery);
