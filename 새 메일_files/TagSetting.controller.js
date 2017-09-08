(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .controller('TagSettingCtrl', TagSettingCtrl);

    /* @ngInject */
    function TagSettingCtrl($element, $q, $scope, EMIT_EVENTS, REPLACE_REGEX, CheckDuplicatedUtil, HelperFormUtil, HelperPromiseUtil, MessageModalFactory, RootScopeEventBindHelper, TagBiz, API_ERROR_CODE, KEYS, PATTERN_REGEX, gettextCatalog, _) {
        var formElement$ = null,
            FORM_NAME = 'tagCreateModifyForm',
            editTarget = null,
            allTags = [],
            promise;
        $scope.REPLACE_REGEX = REPLACE_REGEX;
        $scope.PATTERN_REGEX = PATTERN_REGEX;
        $scope.ui = {
            tags: [],
            usedColors: [],
            mode: null,
            preventDefaultKeyInput: {},
            MODE_NAMES: {
                CREATE: 'create',
                EDIT: 'edit',
                DEFAULT: null
            }
        };
        $scope.tagForm = {};

        $scope.checkDuplicatedName = function (name) {
            if ($scope.ui.mode === $scope.ui.MODE_NAMES.EDIT &&
                _.get(editTarget, 'name') === name) {
                return $q.when(true);
            }
            return $q.when(!CheckDuplicatedUtil.byRawString(allTags, 'name', name));
        };

        $scope.removeTag = function (tag) {
            TagBiz.removeTag($scope.shared.projectCode, tag.id).catch(function (error) {
                if (_.get(error, 'data.header.resultCode') !== API_ERROR_CODE.SERVER_PROJECT_TAG_IN_USE) {
                    return;
                }

                MessageModalFactory.confirm(
                    gettextCatalog.getString('사용 중인 태그입니다. 삭제하시겠습니까?'),
                    gettextCatalog.getString('태그 삭제'),
                    {confirmBtnLabel: gettextCatalog.getString('삭제')}
                ).result.then(function () {
                    TagBiz.removeTag($scope.shared.projectCode, tag.id, {force: true});
                });
            });
        };

        var showForm = function ($event) {
            if (!formElement$) {
                formElement$ = $element.find('.tag-form');
            }
            angular.element($event.target).parents('.tags,.add-tag-wrapper').after(formElement$);
        };

        $scope.changeFormMode = function ($event, mode, tag) {
            _.set(editTarget, '_editMode', false);
            showForm($event);
            $scope.tagForm = {
                id: _.get(tag, 'id'),
                name: _.get(tag, 'name'),
                _bgColor: _.get(tag, '_bgColor')
            };
            $scope.ui.mode = mode;
            HelperFormUtil.reset(FORM_NAME);
            editTarget = tag;
            _.set(tag, '_editMode', true);
        };

        $scope.cancelFormMode = function () {
            _.set(editTarget, '_editMode', false);
            HelperFormUtil.reset(FORM_NAME);
            $scope.tagForm = {};
            $scope.ui.mode = $scope.ui.MODE_NAMES.DEFAULT;
        };

        var createTag = function (params) {
            return TagBiz.addTag($scope.shared.projectCode, params).then(function () {
                reset();
            });
        };

        var updateTag = function (params) {
            return TagBiz.updateTag($scope.shared.projectCode, $scope.tagForm.id, params).then(function () {
                reset();
            });
        };

        var convertColorToSubmitForm = function (cssColor) {
            var hexColor = cssColor.substr(1);
            if (hexColor.length === 3) {
                var hexValues = hexColor.split('');
                return [
                    hexValues[0], hexValues[0],
                    hexValues[1], hexValues[1],
                    hexValues[2], hexValues[2]
                ].join('');
            }

            return hexColor;
        };

        $scope.updateTagPrefix = function (tagPrefix) {
            TagBiz.updateTagPrefix($scope.shared.projectCode, tagPrefix.id, {mandatory: tagPrefix.mandatory, selectOne: tagPrefix.selectOne}).then(function () {
                reset();
            }, function () {
                tagPrefix.mandatory = !tagPrefix.mandatory;
            });
        };

        $scope.submit = function () {
            if (HelperPromiseUtil.isResourcePending(promise) || HelperFormUtil.checkInvaild($scope[FORM_NAME])) {
                return;
            }
            var targetAction = $scope.ui.mode === $scope.ui.MODE_NAMES.CREATE ? createTag : updateTag;
            var params = {
                name: $scope.tagForm.name,
                // '#' 제거해서 저장
                color: convertColorToSubmitForm(_.get($scope.tagForm, '_bgColor', '#'))
            };

            promise = targetAction(params);
            $scope.cancelFormMode();
        };

        var reset = function () {
            $scope.tagForm = {};
            $scope.ui.mode = $scope.ui.MODE_NAMES.DEFAULT;
            HelperFormUtil.bindService($scope, FORM_NAME);
        };

        var fetchTags = function () {
            TagBiz.getTagWithPrefixesForSetting($scope.shared.projectCode).then(function (result) {
                allTags = result.contents();
                $scope.ui.tagGroups = result._tagGroups;
                $scope.ui.usedColors = _.map(result.contents(), '_bgColor');
            });
        };

        $scope.ui.preventDefaultKeyInput[KEYS.ENTER] = $scope.submit;
        RootScopeEventBindHelper.withScope($scope)
            .on(TagBiz.EVENTS.RESETCACHE, fetchTags)
            .on(EMIT_EVENTS.CHANGE_PROJECT_MANAGEMENT_TAB_INDEX, $scope.cancelFormMode);

        reset();
        fetchTags();
    }
})();
