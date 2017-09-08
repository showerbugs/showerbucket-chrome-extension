(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('BodyContentsConvertUtil', BodyContentsConvertUtil);

    /* @ngInject */
    function BodyContentsConvertUtil($filter, MIME_TYPE, SYNTAX_REGEX, _) {

        return {
            convertBodyToContent: convertBodyToContent,
            convertMarkdownBodyToContent: convertMarkdownBodyToContent,
            convertToShortHtmlInTask: convertToShortHtmlInTask,
            convertToShortHtmlInMail: convertToShortHtmlInMail
        };

        function convertBodyToContent(body) {
            body.content = body.content.replace(SYNTAX_REGEX.styleTag, '') || '';
            var filterNameList = (body.mimeType === MIME_TYPE.MARKDOWN.type) ?
                ['markdownToHtml', 'textToEmoji', 'mentionMarkdown:markedHtml', 'sanitize'] : [];
            return applyFilters(body.content, filterNameList);
        }

        function convertMarkdownBodyToContent(markdown) {
            var filterNameList =  ['textToEmoji', 'mentionMarkdown:markedHtml', 'sanitize'];
            return applyFilters(markdown, filterNameList);
        }

        function convertToShortHtmlInTask(body, maxLength) {
            // 본문에 NULL이 들어올 때의 예외처리
            body.content = (body.content && body.content.trim()) || '';
            var result;
            if (body.mimeType !== MIME_TYPE.MARKDOWN.type) {
                return makeShortHtmlInHtmlEditor(body, maxLength);
            }

            var filterNameList = ['markdownToHtml', 'textToEmoji', 'mentionMarkdown:markedHtml'];
            result = applyFilters(body.content, filterNameList);
            var resultObj = makeShortHtmlInMarkdownEditor(result, maxLength);
            body._hasMoreContent = resultObj.textLength >= maxLength;
            return applyFilter(resultObj.shortContent, 'sanitize');
        }

        function getRawRegex(regex) {
            return regex.toString().replace(SYNTAX_REGEX.regex, function (match, content) { return content; });
        }

        function convertToShortHtmlInMail(body, maxLength) {
            // 본문에 NULL이 들어올 때의 예외처리
            body.content = body.content || '';

            var contentHtml = body.content.replace(SYNTAX_REGEX.styleTag, '');
            var result = _.trim(contentHtml.replace(SYNTAX_REGEX.htmlElementStream, ' ')).substring(0, maxLength);
            body._hasMoreContent = result.length >= maxLength;
            return result;
        }

        function applyFilter(source, filter) {
            var filterParam,
                filterName;

            filterParam = filter.split(':');
            filterName = filterParam[0];

            if (filterParam.length > 1) {
                filterParam.splice(0, 1);
            } else {
                filterParam = [];
            }

            filterParam.unshift(source);
            return $filter(filterName).apply($filter(filterName), filterParam);
        }

        function applyFilters(source, filterList) {
            var result = source;

            _.forEach(filterList, function (filter) {
                result = applyFilter(result, filter);
            });
            return result;
        }

        function makeShortHtmlInHtmlEditor(body, maxLength) {
            var hasBeforeSpace = false,
                result = body.content.replace(SYNTAX_REGEX.styleTag, '');
            result = _.trim(result.replace( SYNTAX_REGEX.htmlTag, function (match) {
                if (/strong/.test(match)) {
                    hasBeforeSpace = false;
                    return match;
                }

                if (hasBeforeSpace) {
                    return '';
                }
                hasBeforeSpace = true;
                return ' ';
            })).substring(0, maxLength);
            body._hasMoreContent = result.length >= maxLength;
            return result;
        }

        function makeShortHtmlInMarkdownEditor(contentHtml, maxLength) {
            // 본문에 NULL이 들어올 때의 예외처리
            contentHtml = contentHtml || '';

            var regex = new RegExp([
                    getRawRegex(SYNTAX_REGEX.doorayLinkFromMarkdown),
                    getRawRegex(SYNTAX_REGEX.htmlTag),
                    getRawRegex(SYNTAX_REGEX.stringWithoutHtmlTag)].join('|'), 'g'),
                hasBeforeSpace = false,
                accTextLength = 0,
                MENTION_ARG_IDX = 7,
                TEXT_ARG_IDX = 8;
            var shortContent = _.trim(contentHtml.replace(regex, function (match) {
                if (accTextLength > maxLength) {
                    return '';
                }

                // 멘션, 업무참조의 경우
                if (arguments[MENTION_ARG_IDX]) {
                    accTextLength += arguments[MENTION_ARG_IDX].length;
                    hasBeforeSpace = false;
                    return match;
                }

                // 일반 텍스트인 경우
                if (arguments[TEXT_ARG_IDX]) {
                    if (match.length > maxLength - accTextLength) {
                        match = match.substring(0, maxLength - accTextLength);
                    }
                    accTextLength += match.length;
                    hasBeforeSpace = false;
                    return match;
                }

                if (/alt="dooray-icon-/.test(match) || /<\/?strong/.test(match)) {
                    accTextLength += 1;
                    hasBeforeSpace = false;
                    return match;
                }

                // 앞에 스페이스가 있었던 경우
                if (hasBeforeSpace) {
                    return '';
                }

                hasBeforeSpace = true;
                return ' ';
            }));

            return {
                result: contentHtml.length > maxLength ? shortContent : contentHtml,
                shortContent: shortContent,
                textLength: accTextLength
            };
        }


        //function convertMailBodyToHtmlContent(body) {
        //    body.content = body.content || '';
        //
        //    return  $filter('styleTagProcess')(body.content.replace(SYNTAX_REGEX.styleTag, ''));
        //}

    }

})();
