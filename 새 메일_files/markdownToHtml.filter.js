(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .filter('markdownToHtml', markdownToHtml);

    // TODO deprecated

    /* @ngInject */
    function markdownToHtml(DoorayLazyLoad) {
        var filterMarkdownToHtml = angular.noop;

        return function (input) {
            if (filterMarkdownToHtml !== angular.noop) {
                return filterMarkdownToHtml(input);
            }

            // FE쪽에 커스텀 랜더러 뚦어달라고 요청해야함 tuiEditor.markdownItRenderer
            DoorayLazyLoad.loadDoorayRenderer().then(function (markdownItRenderer) {
                filterMarkdownToHtml = function (input) {
                    // 본문에 NULL이 들어올 때의 예외처리
                    input = input || '';
                    //marked 내부의 패턴 매칭 시 불 필요한 파싱 영역(ex data uri)을 줄여 FE 속도를 개선함 (TODO 스크립트 오류 발생 가능성 줄이도록 marked 처리 선/후 원래 값을 임시 캐시 및 복원)
                    //http://goobbe.com/questions/5646026/how-to-remove-a-data-uri-from-text-using-a-regular-expression
                    //"ABCD![](data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGol…Svp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7)EFGH\n==="
                    //console.time('marked');
                    var dataURIPatternMap = {}, uniqKey, repeatCnt = 0; //Date.now()의 동일값이 나올수 있으므로 repeatCnt를 보조 키로 적용
                    input = input.replace(/(data:[^;]+;[A-Za-z0-9]+,[^")\'\s]+)/gi, function (raw, dataURI) {
                        uniqKey = '$' + Date.now() + '_' + (++repeatCnt) + '$';
                        dataURIPatternMap[uniqKey] = dataURI;
                        return uniqKey;
                    });

                    var result = markdownItRenderer.render(input);
                    for (uniqKey in dataURIPatternMap) {
                        result = result.replace(uniqKey, dataURIPatternMap[uniqKey]);
                    }
                    return result;
                };
                return filterMarkdownToHtml(input);
            });


        };
    }
})();


