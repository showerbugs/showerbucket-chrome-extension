(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('bodyInView', {
            templateUrl: 'modules/components/view/bodyInView/bodyInView.html',
            controller: BodyInView,
            bindings: {
                item: '<',
                itemType: '@',
                translation: '<',
                body: '<',
                showEditBtn: '<',
                editForm: '<',
                onClickEdit: '&'
            }
        });

    /* @ngInject */
    function BodyInView($element, $q, $timeout, API_ERROR_CODE, ITEM_TYPE, KEYMAP, MIME_TYPE_REVERSE,
                        CalendarFileApiBiz, CalendarScheduleApiBiz, FileService, InlineEditFormBuilder, MessageModalFactory, NanoStickyFactory, PaletteBiz, PopupUtil, PostInlineTempSaveAction, TaskFileApiBiz, TaskViewBiz, gettextCatalog, _) {
        var $ctrl = this,
            itemId = null,
            stickies = null,
            _body = null,
            _tmpFileIdList = [],
            actionMap = {},
            shouldSyncItem = false,
            EDITOR_LOAD_TIME = 500; //임시적. 마크다운 -> HTML 변환 시 dom load time

        actionMap[ITEM_TYPE.POST] = {
            update: function (params) {
                return TaskViewBiz.update($ctrl.item.projectCode, $ctrl.item.number, params).then(function () {
                    PostInlineTempSaveAction.removeTemp($ctrl.item.id);
                });
            },
            updateMultiFileDependency: function (tmpFileIdList) {
                return TaskFileApiBiz.task.updateMultiFileDependency(tmpFileIdList, {
                    projectCode: $ctrl.item.projectCode,
                    postNumber: $ctrl.item.number
                });
            },
            setBody: function () {
                PostInlineTempSaveAction.getOrLoadTempSaveBodyPromise($ctrl.item).then(function (data) {
                    $ctrl.item.body = data.body;
                    _tmpFileIdList.push.apply(_tmpFileIdList, data.tmpFileIdList);
                });
            },
            hasChanged: function () {
                if (_hasChanged()) {
                    PostInlineTempSaveAction.saveBody($ctrl.item, $ctrl.body, _createTmpFileIdList());
                }
                // 임시저장하고 항상 닫음
                return false;
            }
        };

        actionMap[ITEM_TYPE.SCHEDULE] = {
            update: function (params) {
                return CalendarScheduleApiBiz.update($ctrl.item.id, params);
            },
            updateMultiFileDependency: function (tmpFileIdList) {
                return CalendarFileApiBiz.schedule.updateMultiFileDependency(tmpFileIdList, {
                    scheduleId: $ctrl.item.id
                });
            },
            setBody: angular.noop,
            hasChanged: _hasChanged
        };

        $ctrl.uiVersion = 1;
        $ctrl.contentVersion = 0;
        $ctrl.editMode = false;
        $ctrl.shortcut = {};
        $ctrl.shortcut[KEYMAP.SUBMIT] = function () {
            $ctrl.editForm.submit();
        };
        $ctrl.MIME_TYPE_REVERSE = MIME_TYPE_REVERSE;

        $ctrl.options = {};

        $ctrl.show = show;
        $ctrl.onCheckGfmCheckBox = onCheckGfmCheckBox;
        $ctrl.onFocus = onFocus;
        $ctrl.onLoad = onLoad;
        $ctrl.changeSticky = changeSticky;
        $ctrl.completeContentLoad = completeContentLoad;

        this.$onChanges = function () {
            if ($ctrl.item && itemId !== $ctrl.item.id) {
                itemId = $ctrl.item.id;
                recompile();
            }
        };

        this.$onDestroy = function () {
            _.forEach(stickies, function (sticky) {
                sticky.destroy();
            });
            $ctrl.editForm = null;
        };

        function recompile() {
            $ctrl.uiVersion += 1;
        }

        function show() {
            $ctrl.editForm.show(_makeEditFormInstance()).then(function () {
                _body = {
                    content: $ctrl.body.content,
                    mimeType: $ctrl.body.mimeType
                };
                _tmpFileIdList = [];
                actionMap[$ctrl.itemType].setBody();
                stickies = null;
                $ctrl.disabled = false;
                $ctrl.flow = FileService.createNewInstance($ctrl.itemType).flowObject;
                $ctrl.editMode = true;
                recompile();
            });
        }

        function onCheckGfmCheckBox(content) {
            if (!$ctrl.body) {
                return;
            }
            $ctrl.body.content = content;

            return actionMap[$ctrl.itemType].update(_createSubmitData()).then(function () {
                $ctrl.editForm.refreshWithSync();
            }, function (error) {
                if (_.get(error, 'data.header.resultCode') !== API_ERROR_CODE.USER_INVALID_TASK_OVERWRITE) {
                    MessageModalFactory.alert(_.get(error, 'data.header.resultMessage'), '');
                    return error;
                }
                var errorMsg = ['<p>', gettextCatalog.getString('최신 버전이 아니기 때문에 저장할 수 없습니다.'), '</p>'].join('');
                MessageModalFactory.alert(errorMsg);
                return $ctrl.refreshItem();
            });
        }

        function onFocus() {
            PaletteBiz.setSearchBoost({
                projectCode: $ctrl.item.projectCode,
                postNumber: $ctrl.item.number
            });
        }

        function onLoad() {
            _makeStickGroup(MIME_TYPE_REVERSE[$ctrl.body.mimeType]);
        }

        function changeSticky() {
            _.forEach(stickies, function (sticky) {
                sticky.destroy();
            });
            stickies = null;
            _makeStickGroup(MIME_TYPE_REVERSE[$ctrl.body.mimeType]);
        }

        function completeContentLoad() {
            $ctrl.contentVersion += 1;
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('body', gettextCatalog.getString('본문'))
                .withHasChanged(actionMap[$ctrl.itemType].hasChanged)
                .withCreateSubmitData(_createSubmitData)
                .withCancel(_cancel)
                .withSubmit(_submit)
                .build();
        }

        function _hasChanged() {
            return _body.mimeType !== $ctrl.body.mimeType ||
                _body.content !== $ctrl.body.content;
        }

        function _cancel() {
            _.assign($ctrl.body, _body);
            _body = null;
            if ($ctrl.disabled || shouldSyncItem) {
                $ctrl.editForm.refreshWithSync();
            }

            $ctrl.flow = null;
            _.forEach(stickies, function (sticky) {
                sticky.destroy();
            });
            $ctrl.editMode = false;
            _tmpFileIdList = [];
            recompile();
        }

        function _createSubmitData() {
            return {
                body: _.cloneDeep($ctrl.body), // 값이 나중에 변경되는 문제가 있어서 clone
                version: $ctrl.item.version
            };
        }

        function _createTmpFileIdList() {
            _tmpFileIdList.push.apply(_tmpFileIdList, _.map($ctrl.flow.files, 'response.id'));
            return _tmpFileIdList;
        }

        function _submit(data, isContinue) {
            var params = data,
                tmpFileIdList = _createTmpFileIdList(),
                promise = actionMap[$ctrl.itemType].update(params);

            promise = tmpFileIdList.length > 0 ?
                $q.all([promise, actionMap[$ctrl.itemType].updateMultiFileDependency(tmpFileIdList)]) :
                promise;

            promise.then(function () {
                if (!isContinue) {
                    $ctrl.editForm.cancel();
                } else {
                    shouldSyncItem = true;
                }
                $ctrl.editForm.refreshWithSync();
            }, _onErrorWhenSubmit);
        }

        function _makeStickGroup(mode) {
            $timeout(function () {
                var hideEl$ = $element.find('.editor-area'),
                    group = [$element.find('.edit-mode-btn-wrapper')];

                if (mode === 'HTML') {
                    group.push($element.find('.mce-menubar'));
                    group.push($element.find('.mce-toolbar-grp'));
                }

                if (mode === 'MARKDOWN') {
                    group.push($element.find('.te-toolbar-section'));
                    group.push($element.find('.te-markdown-tab-section'));
                }
                stickies = NanoStickyFactory.createStickyGroup(group, {hideEl$: hideEl$, wrapMargin: 36});
            }, EDITOR_LOAD_TIME, false);
        }

        function _onErrorWhenSubmit(error) {
            if (_.get(error, 'data.header.resultCode') !== API_ERROR_CODE.USER_INVALID_TASK_OVERWRITE) {
                MessageModalFactory.alert(_.get(error, 'data.header.resultMessage'), '');
                return error;
            }
            MessageModalFactory.alert(gettextCatalog.getString('최신 버전이 아니기 때문에 저장할 수 없습니다. '), '', {
                confirmBtnLabel: gettextCatalog.getString('최신 버전 보기'),
                confirmBtnClick: function () {
                    PopupUtil.openTaskWritePopup('update', {
                        projectCode: $ctrl.item.projectCode,
                        postNumber: $ctrl.item.number,
                        forceLoadContent: 'original'
                    });
                    $ctrl.disabled = true;
                }
            });
        }
    }

})();
