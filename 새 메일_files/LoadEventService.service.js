(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('LoadEventService', LoadEventService);

    /* @ngInject */
    function LoadEventService($q, API_PAGE_SIZE, CalendarEventResource, HelperPromiseUtil, TaskEventResource, CommentService, _) {
        var COMMENT_RELOAD_SIZE =  10,
            ELEMENT_LOCATION_CENTER = 'center',
            ELEMENT_LOCATION_TOP = 'top',
            ELEMENT_LOCATION_BOTTOM = 'bottom';

        var promiseResource = null;
        var callback = {
            applyCommentWrapper: angular.noop
        };

        /*
         기본적으로 이벤트를 가져올때 direction을 : 옵션으로 주게 된다면, 타겟아이디를 기준으로 위아래 반반씩가져온다.
         예를들어 1,2,3,4,5,6,7 이벤트가 있을때, id를 4, size를 5를 주게 되면 23 4 56 처럼 4를 기준으로 가져오게된다.
         그런데 2를 기준으로 5개 요청해도 결과 값에 사이즈는 5인데, 1,2,3,4,5 가 된다.
         따라서 내가 요청한 id를 기준으로 어디쪽 데이터가 없고, 어디쪽 데이터가 더 많은지 판단 해야한다.
         이를통해 추가적으로 더미를 위쪽 아래쪽 하나씩 주어, 양쪽에 더보기 버튼을 만들지 판단 할 수 있다.
         */
        function confirmHasMoreComments(comments, apiCallParam) {
            if (comments.length !== apiCallParam.size) { //다가지고 오지 못했으면 개수가 comment 개수보다 적음
                return;
            }

            var commentIndex = _.findIndex(comments, {'id': apiCallParam.baseEventId}),
                originSize = apiCallParam.size - 2;
            switch (getElementLocationUsingIndex(apiCallParam.size, commentIndex)) {
                case ELEMENT_LOCATION_CENTER:
                    comments.splice(0, 1);
                    comments.length = originSize;
                    return {
                        hasAfterHistory: true,
                        hasBeforeHistory: true
                    };
                case ELEMENT_LOCATION_TOP : //이전댓글이 없음 .
                    comments.length = originSize;
                    return {
                        hasAfterHistory: true,
                        hasBeforeHistory: false
                    };
                case ELEMENT_LOCATION_BOTTOM ://다음댓글이 없음 .
                    comments.splice(0, 2);
                    return {
                        hasAfterHistory: false,
                        hasBeforeHistory: true
                    };
            }
        }

        function getElementLocationUsingIndex(totalSize, elemetIndex) { // 인덱스가 어디에 위치해 있는지 판단.
            if (Math.floor(totalSize / 2) === elemetIndex) {
                return ELEMENT_LOCATION_CENTER;
            }
            else if (totalSize / 2 > elemetIndex && elemetIndex > 0) {
                return ELEMENT_LOCATION_TOP;
            }
            else {
                return ELEMENT_LOCATION_BOTTOM;
            }
        }

        function applyCommentWrapperOnlyComment(history) {
            _(history)
                .filter('type', 'comment')
                .map(callback.applyCommentWrapper)
                .value();
        }

        function cancelResource() {
            HelperPromiseUtil.cancelResource(promiseResource);
        }

        function callEventsApi(param) {
            cancelResource();
            if (param.projectCode) {
                promiseResource = TaskEventResource.get(param);
            } else if (param.scheduleId) {
                promiseResource = CalendarEventResource.get(param);
            }

            return _.get(promiseResource, '$promise', $q.reject());
        }

        function fetchComment(defaultParam, eventId, option) {
            var param = {
                eventId: eventId,
                eventType: 'comment'
            }, data = {
                commentTotalCnt: 1,
                comments: [],
                hasBeforeHistory: false,
                hasAfterHistory: false
            };
            param = _.assign({}, defaultParam, param, option);

            return callEventsApi(param).then(function (result) {
                data.comments = [result.contents()];
                callback.applyCommentWrapper(result.contents());

                return $q.when(data);
            }, function () {
                return $q.reject(data);
            });
        }

        function fetchComments(defaultParam, option) {
            var param = {
                size: API_PAGE_SIZE.COMMENT + 2,    //원하는 요청갯수보다 위아래로 한개씩 더요청함. 이전댓글 다음댓글이 있나 확인용
                direction: ':'
            }, data = {
                commentTotalCnt: 0,
                comments: [],
                hasBeforeHistory: false,
                hasAfterHistory: false
            };
            param = _.assign({}, defaultParam, param, option);

            return callEventsApi(param).then(function (result) {
                _.assign(data, confirmHasMoreComments(result.contents(), param));
                data.commentTotalCnt = result.totalCount();
                data.comments = result.contents();
                applyCommentWrapperOnlyComment(result.contents());

                // 'hasAfterHistory', 'hasBeforeHistory' property 수정
                return $q.when(data);
            }, function () {
                return $q.reject(data);
            });
        }

        function loadBeforeComments(defaultParam, existComments, requestSize, option) {
            requestSize = requestSize || API_PAGE_SIZE.COMMENT;
            var param = {
                baseEventId: existComments[0].id,     // 맨처음을 기준으로 호출
                direction: '<',
                size: requestSize + 1
            }, data = {
                comments: [],
                hasBeforeHistory: false
            };
            param = _.assign({}, defaultParam, param, option);

            return callEventsApi(param).then(function (result) {
                if (result.contents().length === param.size) { // 요청한 것과 동일하게 오면 앞에 댓글이 더 있음
                    data.hasBeforeHistory = true;
                }
                var comments = _.take(result.contents(), requestSize);
                applyCommentWrapperOnlyComment(comments);
                data.comments = comments.concat(existComments);

                return $q.when(data);
            });
        }

        function loadAfterComments(defaultParam, existComments, requestSize, option) {
            requestSize = requestSize || API_PAGE_SIZE.COMMENT;
            var param = {
                baseEventId: _.last(existComments).id,     // 맨뒤를 기준으로 호출
                direction: '>',
                size: requestSize + 1
            }, data = {
                comments: [],
                hasAfterHistory: false
            };
            param = _.assign({}, defaultParam, param, option);

            return callEventsApi(param).then(function (result) {
                if (result.contents().length === param.size) { //요청한 만큼왔으면
                    data.hasAfterHistory = true;
                }
                var comments = _.takeRight(result.contents(), requestSize);
                applyCommentWrapperOnlyComment(comments);
                data.comments = existComments.concat(comments);

                return $q.when(data);
            });
        }

        // 웹소켓을 통해 발생하는 댓글 중간의 더보기 버튼 클릭시 호출
        function loadBetweenComments(defaultParam, existComments, commentHasBtn, option) {
            //afterCommentId에서 시작해서 위로 COMMENT_RELOAD_SIZE 만큼 불러오기
            var beforeCommentId = _.get(commentHasBtn, '_props.metaData.beforeCommentId'),
                beforeCommentIndex = _.findIndex(existComments, {'id': beforeCommentId}),
                afterCommentId = commentHasBtn.id; // 버튼 정보를 가지고 있는 comment가 로딩할 데이터 뒤의 comment

            var param = {
                baseEventId: afterCommentId,     // 맨뒤를 기준으로 호출
                direction: '<',
                size: COMMENT_RELOAD_SIZE
            }, data = {
                comments: []
            };
            param = _.assign({}, defaultParam, param, option);
            CommentService.removeBetweenBtnProperty(commentHasBtn);

            return callEventsApi(param).then(function (result) {
                if (_.isEmpty(result.contents())) {
                    return $q.reject();
                }

                var comments = _.takeRightWhile(result.contents(), function (comment) {
                    return comment.id !== beforeCommentId;
                }), existCommentsObj = {
                    before: _.take(existComments, beforeCommentIndex),
                    after: _.takeRight(existComments, existComments.length - beforeCommentIndex)
                };

                applyCommentWrapperOnlyComment(comments);
                if (comments.length === param.size) {
                    CommentService.assignBetweenBtnProperty(comments[0], beforeCommentId);
                }

                data.comments = existCommentsObj.before.concat(comments.concat(existCommentsObj.after));
                return $q.when(data);
            });
        }

        function setApplyCommentWrapper(_callback) {
            callback.applyCommentWrapper = _callback;
        }

        return {
            fetchComment: fetchComment,
            fetchComments: fetchComments,
            loadBeforeComments: loadBeforeComments,
            loadAfterComments: loadAfterComments,
            loadBetweenComments: loadBetweenComments,
            setApplyCommentWrapper: setApplyCommentWrapper
        };
    }

})();
