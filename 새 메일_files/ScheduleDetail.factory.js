(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('ScheduleDetail', ScheduleDetail);

    /* @ngInject */
    function ScheduleDetail($q, API_PAGE_SIZE, CalendarFileResource, CalendarScheduleResource, HelperPromiseUtil, LoadEventService, ScheduleDisplayHelperFactory) {
        return ScheduleDetail;

        function ScheduleDetail() {
            this.name = '';
            this.status = {
                loading: false,
                fileLoading: false
            };
            this.data = {};
            this.files = [];
            this.comments = [];
            this.param = {scheduleId: null};
            this.option = {
                showCommentWithWorkLog: true
            };
            var self = this;

            this.setParam = function (scheduleId, option) {
                option = option || {};
                this.comments = [];
                self.param.scheduleId = scheduleId;
                this.option = {
                    showCommentWithWorkLog: _.isUndefined(option.showCommentWithWorkLog) ? true : option.showCommentWithWorkLog
                };
                return this.refreshItem();
            };
            this.assignScheduleDisplayProperties = function (schedule) {
                return ScheduleDisplayHelperFactory.assignDisplayPropertiesInView(schedule);
            };

            var prevRefreshScheduleResource;
            this.refreshItem = function () {
                _cancelResource(prevRefreshScheduleResource);
                self.status.loading = true;
                this.files = [];

                prevRefreshScheduleResource = CalendarScheduleResource.get(this.param);
                var afterPromise = this.refreshComments();
                return prevRefreshScheduleResource.$promise.then(function (result) {
                    self.data = result.contents();
                    self.assignScheduleDisplayProperties(self.data);
                    self.files = _setFilesFromIdFileIdList(self.data);
                    return self.data;
                }, function (errorResponse) {
                    self.data = {};
                    return $q.reject(errorResponse);
                }).then(function (item) {
                    return afterPromise.then(function () {
                        return item;
                    });
                }).finally(function () {
                    self.status.loading = false;
                });
            };

            var prevRefreshFilesResource;
            this.refreshFiles = function () {
                _cancelResource(prevRefreshFilesResource);

                var self = this;
                this.status.fileLoading = true;

                prevRefreshFilesResource = CalendarFileResource.query(this.param);

                return prevRefreshFilesResource.$promise.then(function (result) {
                    self.files = result.contents();
                    return result.contents();
                }, function (errorResponse) {
                    self.files = [];
                    return $q.reject(errorResponse);
                }).finally(function () {
                    self.status.fileLoading = false;
                });
            };

            this.applyCommentWrapper = function (comment) {
                return new ScheduleDisplayHelperFactory.AssignDisplayPropertiesBuilder(comment).build();
            };

            this.afterLoadComments = function (data) {
                _.assign(self, data);
            };

            this.setOption = function (option) {
                _.assign(this.option, option);
            };

            this.refreshComments = function () {
                if (!this.param.scheduleId) {
                    return $q.reject();
                }

                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.fetchComments(this.param, _getRefreshCommentOption(this.comments, this.option.showCommentWithWorkLog))
                    .then(this.afterLoadComments, this.afterLoadComments);
            };

            this.loadBeforeComments = function (size) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadBeforeComments(this.param, this.comments || [], size, option)
                    .then(this.afterLoadComments);
            };
            this.loadAfterComments = function (size) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadAfterComments(this.param, this.comments || [], size, option)
                    .then(this.afterLoadComments);
            };

            this.loadBetweenComments = function (commentHasBtn) {
                var option = this.option.showCommentWithWorkLog ? {} : {eventType: 'comment'};
                LoadEventService.setApplyCommentWrapper(this.applyCommentWrapper);
                return LoadEventService.loadBetweenComments(this.param, this.comments || [], commentHasBtn, option)
                    .then(this.afterLoadComments);
            };

            this.reset = function() {
                this.data = {};
                this.param = {scheduleId: null};
                this.status.loading = false;
                this.comments = [];
                this.commentsTotalCnt = 0;
            };
        }

        function _getRefreshCommentOption(comments, showCommentWithWorkLog) {
            var option = showCommentWithWorkLog ? {} : {eventType: 'comment'};
            comments = comments || [];
            if (comments.length > API_PAGE_SIZE.COMMENT) {
                _.assign(option, {
                    size: comments.length + 2,
                    baseEventId: _.findLast(comments, function (comment) {
                        return !comment._isDraft;
                    }).id
                });
                return option;
            }

            return option;
        }

        function _setFilesFromIdFileIdList(item) {
            return _.map(item.fileIdList, function(fileId){
                return item._wrap.refMap.fileMap(fileId);
            });
        }

        function _cancelResource(resource) {
            HelperPromiseUtil.cancelResource(resource);
        }
    }

})();
