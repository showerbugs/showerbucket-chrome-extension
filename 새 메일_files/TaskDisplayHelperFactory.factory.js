(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('TaskDisplayHelperFactory', TaskDisplayHelperFactory);

    /* @ngInject */
    function TaskDisplayHelperFactory(STREAM_SHORT_CONTENT_LENGTH, BodyContentsConvertUtil, DateConvertUtil, displayUserFilter, simpleFormatDateFilter, TagBiz, ViewModeBiz, _) {
        var today = moment();
        var AssignDisplayPropertiesBuilder = angular.element.inherit({
            __constructor: function (data) {
                this.data = data;
                this._wrap = _.get(data, '_wrap');
                // 본문에 NULL이 들어올 때의 예외처리
                if (_.get(data, 'body.content')) {
                    _.set(data, 'body.content', _.get(data, 'body.content', ''));
                }
            },
            withMemberGroupFilter: function (/*option*/) {
                var users = _.get(this.data, 'users'), refMap = this._wrap.refMap;
                var allUsers = _([]).concat(users.to, users.cc, users.from);

                _.forEach(allUsers.value(), function (user) {
                    if(user) {
                        displayUserFilter(user, refMap);
                    }
                });

                if(users.me) {
                    displayUserFilter(users.me, refMap);
                }

                return this;
            },
            withApplyColorToTags: function () {
                var tagMap = _.get(this.data, '_wrap.refMap.tagMap');
                _.forEach(this.data.tagIdList, function (tagId) {
                    TagBiz.applyColorToTag(tagMap(tagId));
                }.bind(this));
                return this;
            },
            withMyInfo: function () {
                this.data._getOrSetProp('myInfo', _.get(this.data, 'users.me'));
                return this;
            },
            withCreatedAtSimpleFormat: function (isViewDateForm) {
                var createdAt = _.get(this.data, 'createdAt');
                this.data._getOrSetProp('createdAtSimpleFormat', isViewDateForm ?
                    DateConvertUtil.convertDateTimeInView(createdAt) :
                    simpleFormatDateFilter(createdAt));
                return this;
            },
            withUpdatedAtSimpleFormat: function () {
                this.data._getOrSetProp('updatedAtSimpleFormat', simpleFormatDateFilter(_.get(this.data, 'updatedAt')));
                return this;
            },
            withDueDateString: function () {
                if (ViewModeBiz.get() === ViewModeBiz.VIEW_MODE.FULL_VIEW && this.data.dueDateFlag) {
                    var dueDate = moment(this.data.dueDate);
                    this.data._getOrSetProp('dueDateString', dueDate.format(today.isSame(dueDate, 'year') ? 'MM.DD HH:mm' : 'YYYY.MM.DD HH:mm'));
                }
                return this;
            },
            withFetchedAt: function () {
                this.data._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                return this;
            },
            // option = {length: 350, propertyName: 'body'}
            withShortContent: function (option) {
                var length = _.get(option, 'length', STREAM_SHORT_CONTENT_LENGTH),
                    propertyName = _.get(option, 'propertyName', 'body'),
                    body = _.get(this.data, propertyName);

                if (!body) {
                    return this;
                }
                var content = BodyContentsConvertUtil.convertToShortHtmlInTask(body, length);
                this.data._getOrSetProp('shortContents', body._hasMoreContent ? content + '...' : content);
                return this;
            },
            withProjectCode: function () {
                this.data.projectCode = this._wrap.refMap.projectMap(_.get(this.data, 'projectId')).code;
                return this;
            },
            withCopyProps: function () {
                this.data._copyProps = function (src, propKeys) {
                    var self = this;
                    _.forEach(propKeys.split(','), function (key) {
                        self._getOrSetProp(key, src._getOrSetProp(key));
                    });
                };
                return this;
            },
            withResetFetchedAt: function () {
                this.data._resetFetchedAt = function () {
                    this._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                };
                return this;
            },
            build: function () {
                return this.data;
            }
        });

        return {
            AssignDisplayPropertiesBuilder: AssignDisplayPropertiesBuilder,
            assignDisplayPropertiesInList: function (task) {
                return new AssignDisplayPropertiesBuilder(task)
                    .withMemberGroupFilter()
                    .withApplyColorToTags()
                    .withMyInfo()
                    .withCreatedAtSimpleFormat()
                    .withDueDateString()
                    .withFetchedAt()
                    .withProjectCode()
                    .withCopyProps()
                    .withResetFetchedAt()
                    .build();
            },
            assignDisplayPropertiesInView: function (data) {
                return new AssignDisplayPropertiesBuilder(data)
                    .withMemberGroupFilter()
                    .withApplyColorToTags()
                    .withProjectCode()
                    .withFetchedAt()
                    .build();
            },
            assignDisplayPropertiesInStream: function (task, hasShortString) {
                var assignDisplayPropertiesBuilder = new AssignDisplayPropertiesBuilder(task)
                    .withProjectCode();

                return hasShortString ? assignDisplayPropertiesBuilder.withShortContent().build() :
                    assignDisplayPropertiesBuilder.build();
            }
        };
    }

})();
