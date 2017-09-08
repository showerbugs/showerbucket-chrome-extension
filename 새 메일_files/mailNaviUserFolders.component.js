(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .component('mailNaviUserFolders', {
            templateUrl: 'modules/mail/navi/mailNaviUserFolders/mailNaviUserFolders.html',
            controller: MailNaviUserFolders,
            bindings: {
                folders: '<'
            }
        });

    /* @ngInject */
    function MailNaviUserFolders($scope, $state, $q,
                                 EMIT_EVENTS, MAIL_STATE_NAMES,
                                 MailFolderRepository, MailFolderInputRepository,
                                 MessageModalFactory, SettingModalFactory,
                                 MailItemsAction,
                                 MailUserFolderValidator, MailFolderUtil, MailListItemDragDropUtil, MailNaviUtil, StateHelperUtil,
                                 gettextCatalog, _) {
        var $ctrl = this;

        $ctrl.MAIL_STATE_NAMES = MAIL_STATE_NAMES;

        $ctrl.MailNaviUtil = MailNaviUtil;
        $ctrl.MailListItemDragDropUtil = MailListItemDragDropUtil;

        $ctrl.MailFolderInputRepository = MailFolderInputRepository;
        $ctrl.SettingModalFactory = SettingModalFactory;

        $ctrl.vm = {};
        $ctrl.vm.visibleParentFolders = true;

        $ctrl.openCreateUserFolderBox = openCreateUserFolderBox;
        $ctrl.openUpdateUserFolderBox = openUpdateUserFolderBox;

        $ctrl.newInputShortcutActionMap = {'esc': MailFolderInputRepository.cleanNewInputModel};
        $ctrl.updateInputShortcutActionMap = {'esc': MailFolderInputRepository.cleanUpdateInputModel};

        $ctrl.createUserFolderAction = createUserFolderAction;
        $ctrl.updateUserFolderAction = updateUserFolderAction;
        $ctrl.removeUserFolderAction = removeUserFolderAction;

        $ctrl.onDropFolderOrMail = onDropFolderOrMail;
        $ctrl.onMouseEnterShowActionLayer = onMouseEnterShowActionLayer;
        $ctrl.onMouseLeaveHideActionLayer = onMouseLeaveHideActionLayer;
        $ctrl.dropFolderOnlyValidateHandler = dropFolderOnlyValidateHandler;
        $ctrl.dropFolderOrMailValidateHandler = dropFolderOrMailValidateHandler;

        $ctrl.updateParentLayerScrollerByEmit=  updateParentLayerScrollerByEmit;

        $scope.$watch(function () {
            return MailFolderInputRepository.newInputValue();
        }, updateParentLayerScrollerByEmit);
        $scope.$watch(function () {
            return MailFolderInputRepository.updateInputFolder();
        }, updateParentLayerScrollerByEmit);

        //ng component lifecycle callback functions
        this.$onChanges = function (changes) {
            if (changes.folders.currentValue) {
                $ctrl.items = MailFolderUtil.createDisplayUserFoldersTree(changes.folders.currentValue);
            }
        };

        function openCreateUserFolderBox() {
            $ctrl.vm.visibleParentFolders = true;
            MailFolderInputRepository.newInputVisible(true);
            updateParentLayerScrollerByEmit();
        }

        function openUpdateUserFolderBox(item) {
            MailFolderInputRepository.updateInputValue(item.displayName);
            MailFolderInputRepository.updateInputFolder(item.folder);
        }

        function createUserFolderAction() {
            var trimedFolderName = _.trim(MailFolderInputRepository.newInputValue());
            if (!trimedFolderName) {
                MailFolderInputRepository.cleanNewInputModel();
                return;
            }

            var allFolderNames = MailFolderUtil.getAllUsedFolderNames($ctrl.folders);
            return MailUserFolderValidator.validateIsAvailableCreate(trimedFolderName, allFolderNames).then(function () {
                return MailFolderRepository.addUserFolder({
                    name: trimedFolderName,
                    order: 1
                }).then(MailFolderRepository.fetchAndCacheUserFolders).then(MailFolderInputRepository.cleanNewInputModel);
            }).catch(function (validationErrorMessages) {
                MessageModalFactory.alert(validationErrorMessages[0]);
            });
        }

        function updateUserFolderAction(item) {
            var trimedFolderName = _.trim(MailFolderInputRepository.updateInputValue());
            if (!trimedFolderName || trimedFolderName === item.displayName) {
                MailFolderInputRepository.cleanUpdateInputModel();
                return;
            }

            // [1,2,3,4,5] replace last value 'a' -> [1,2,3,4,'a'];
            var replaceFolderName = item.folder.name.split('/').slice(0, -1).concat([trimedFolderName]).join('/');
            var relatedParams = _collectFolderParamsRelatedAllItem(item, replaceFolderName);

            return _promiseDisplayValidationErrorsRelatedAllUserFolders(relatedParams).then(function () {
                return _updateRelatedAllUserFolders(relatedParams).then(MailFolderInputRepository.cleanUpdateInputModel);
            });
        }

        function onDropFolderOrMail($data, dropItem) {
            if ($data.type === 'folder') {
                //TODO 폴더를 특정 폴더의 하위 혹은 최상 위치로 이동시킴
                var replaceFolderName = dropItem ? [dropItem.folder.name, $data.item.displayName].join('/') : $data.item.displayName;
                var relatedParams = _collectFolderParamsRelatedAllItem($data.item, replaceFolderName);
                return _promiseDisplayValidationErrorsRelatedAllUserFolders(relatedParams).then(function () {
                    return _updateRelatedAllUserFolders(relatedParams);
                }).finally(MailFolderInputRepository.cleanUpdateInputModel);
            } else if ($data.type === 'mail') {
                return _moveMailToItemFolder($data, dropItem);
            }
        }

        function onMouseEnterShowActionLayer($event) {
            angular.element($event.currentTarget).addClass('hover');
        }

        function onMouseLeaveHideActionLayer($event) {
            angular.element($event.currentTarget).removeClass('hover');
        }

        function dropFolderOnlyValidateHandler($data/*, $drop, $event*/) {
            return $data.type === 'folder';
        }

        function dropFolderOrMailValidateHandler($data, $drop, $event) {
            //드롭되는 대상이 드래그 대상과 동일하거나 바로 상위 부모이거나 대상의 자식일때 드롭 허용 안함
            var currentTarget$ = angular.element($event.currentTarget);
            if ($event.type === 'dragstart' && (
                $drop.element.is(currentTarget$) ||
                $drop.element.closest('li').is(currentTarget$.closest('li').parents('li:first')) ||
                currentTarget$.closest('li').has($drop.element.closest('li')).length > 0)) {
                return false;
            }
            return $data.type === 'folder' || !_isForbiddenMailMove($data, $drop);
        }


        function _moveMailToItemFolder(data, dropItem) {
            if (_isForbiddenMailMove(data, dropItem) || _.isEmpty(data.items)) {
                return;
            }

            return MailItemsAction.moveTargetFolder(_.map(data.items, 'id'), {targetFolderId: dropItem.folder.id}).then(MailFolderRepository.fetchAndCacheUserFolders);
        }

        function _isForbiddenMailMove($data, $dropItem) {
            return $data.type !== 'mail' || $dropItem.forbiddenMailMove;
        }

        function removeUserFolderAction(item) {
            var alertMsg = (item.children.length > 0) ?
                gettextCatalog.getString('<p>하위 메일함까지 모두 삭제됩니다.</p>') :
                gettextCatalog.getString('<p>메일함을 삭제하시겠습니까?</p>');

            MessageModalFactory.confirm(alertMsg, gettextCatalog.getString('메일함 삭제'), {
                focusToCancel: true,
                confirmBtnLabel: gettextCatalog.getString('삭제')
            }).result.then(function () {
                    return _removeTargetRelatedAllUserFolders(item);
                });
        }

        // TODO: 메일 폴더 추가 / 수정 / 삭제,  전체폴더 / 선택한 폴더 하위 토글 시 레이어 스크롤 갱신
        function updateParentLayerScrollerByEmit() {
            $scope.$emit(EMIT_EVENTS.CUSTOM_DOM_RENDERED);
        }

        function _promiseDisplayValidationErrorsRelatedAllUserFolders(relatedParams) {
            var allFolderNames = MailFolderUtil.getAllUsedFolderNames($ctrl.folders);
            return MailUserFolderValidator.validateIsAvailableUpdate(relatedParams, allFolderNames).catch(function (validationErrorMessages) {
                MessageModalFactory.alert(validationErrorMessages[0]);
                return $q.reject(validationErrorMessages);
            });
        }

        function _updateRelatedAllUserFolders(relatedParams) {
            //TODO: ids API필요, order 없애기
            var resultPromises = _.map(relatedParams, function (param) {
                return MailFolderRepository.updateUserFolder(param.id, {
                    name: param.name,
                    order: param.order
                });
            });
            return $q.all(resultPromises).then(MailFolderRepository.fetchAndCacheUserFolders);
        }

        function _removeTargetRelatedAllUserFolders(targetItem) {
            //TODO 폴더를 삭제하기전에 폴더API를 통해 targetItem과 children Item에 메일이 포함되어 있으면 삭제 요청을 하지 않음
            var relatedItems = _collectFolderParamsRelatedAllItem(targetItem);
            return MailUserFolderValidator.validateIsAvailableRemove(relatedItems).then(function () {
                var resultPromises = _.map(relatedItems, function (item) {
                    return MailFolderRepository.removeUserFolder(item.id);
                });

                //TODO: ids API로 요청하거나 상위 폴더 삭제 요청 시 서버에서 일괄로 처리해야함. 부분 API 요청 싪패시 FE에서는 해결 방법 없음
                return $q.all(resultPromises).then(MailFolderRepository.fetchAndCacheUserFolders).then(function (result) {
                    //삭제될 사용자 메일함이 선택된 상태에서 폴더 삭제 후 바로 상위로 이동 없으면 받은 편지함 이동
                    if (targetItem.folder.id === StateHelperUtil.getCurrentStateParams().folderId) {
                        var userFolders = result.contents();
                        var parentFolderId = targetItem.parentPath ? _.get(_.find(userFolders, {name: targetItem.parentPath}), 'id', null) : null;
                        parentFolderId ?
                            $state.go(StateHelperUtil.computeCurrentListStateName(), {folderId: parentFolderId}, {inherit: false}) :
                            $state.go(MAIL_STATE_NAMES.INBOX, {}, {inherit: false});
                    }
                });
            }).catch(function () {
                return MessageModalFactory.alert(gettextCatalog.getString('<p>메일함에 메일이 있으면 삭제할 수 없습니다.</p>'));
            }).finally(updateParentLayerScrollerByEmit);
        }

        // 선택한 item과 함께  관련된 children 정보를 탐색하여 서버에 전송할 파라미터를 1차 배열에 정리함
        function _collectFolderParamsRelatedAllItem(item, targetName) {
            var list = [];
            (function recursive(item, folderName) {
                _.forEach(item.children, function (childItem) {
                    recursive(childItem, folderName ? [folderName, childItem.displayName].join('/') : childItem.folder.name);
                });
                list.push({
                    id: item.folder.id,
                    folder: item.folder,        //TODO 리펙토링 MailUserFolderValidator.isMoveToChildFolder() 에서 사용함
                    order: item.folder.order,
                    name: folderName || item.folder.name
                });
            })(item, targetName);
            return list;
        }
    }

})();
