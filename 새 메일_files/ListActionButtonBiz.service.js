(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('ListActionButtonBiz', ListActionButtonBiz);

    /* @ngInject */
    function ListActionButtonBiz($q, $state, API_ERROR_CODE, ITEM_TYPE, PROJECT_STATE_NAMES, CommonItemList, DetailInstanceFactory, ItemSyncService, ListBizWrapperByType, ListCheckBoxBiz, MailsBiz, MessageModalFactory, MilestoneBiz, StateParamsUtil, TagBiz, TaskListBiz, gettextCatalog, _) {
        var ready = true,
            currentActionsForType;

        var actionForType = {
            post: {
                getRemoveParams: function () {
                    return ListCheckBoxBiz.makeLodashCheckedItems()
                        .map(function (post) {
                            return {
                                projectCode: post.projectCode,
                                postNumber: post.number
                            };
                        }).value();
                },
                getRemoveDraftParams: function () {
                    return { draftIdList: ListCheckBoxBiz.getCheckedItemIds() };
                },
                listParamKey: 'postIdList',
                removeMessage: ['<p class="text-center">', gettextCatalog.getString('업무를 삭제하면 다시 복구할 수 없습니다.'), '</p>'].join(''),
                removeErrorMessage: ['<p class="text-center">', gettextCatalog.getString('업무가 정상적으로 삭제되지 않았습니다.'), '</p>'].join('')
            },
            mail: {
                getRemoveParams: function () {
                    return { mailIdList: ListCheckBoxBiz.getCheckedItemIds() };
                },
                getRemoveDraftParams: function () {
                    return { mailIdList: ListCheckBoxBiz.getCheckedItemIds() };
                },
                listParamKey: 'mailIdList',
                removeMessage: ['<p class="text-center">', gettextCatalog.getString('영구 삭제하면 복구할 수 없습니다.'), '</p>'].join(''),
                removeErrorMessage: ['<p class="text-center">', gettextCatalog.getString('메일이 정상적으로 삭제되지 않았습니다.'), '</p>'].join('')
            }
        };

        var getCurrentActionsForType = function () {
            return currentActionsForType || {};
        };

        var setCurrentActionsForType = function (type) {
            currentActionsForType = actionForType[type];
        };

        var getBizWrapper = function (type) {
            return ListBizWrapperByType.getBizWrapper(type);
        };

        var requestForRead = function (param, resourceMethod, isReadRequest) {
            if (!containsReadableItem()) {
                return MessageModalFactory.alert(gettextCatalog.getString('준비 중입니다.'));
            }
            if (!_.isEmpty(param)) {
                ready = false;
                return resourceMethod(param).$promise.then(function () {
                    ListCheckBoxBiz.setCheckedItemsReadBy(isReadRequest);
                }).finally(function () {
                    ready = true;
                });
            }
        };

        var requestWithParams = function (params, resourceMethod) {
            ready = false;
            return resourceMethod(params).$promise.then(angular.noop, function () {
                CommonItemList.onErrorWhileRemoving(getCurrentActionsForType().removeErrorMessage, function () {
                    requestWithParams(params, resourceMethod);
                });
            }).finally(function () {
                ready = true;
            });
        };

        var remove = function (params, resourceMethod) {
            var removeItemIds = ListCheckBoxBiz.getCheckedItemIds();
            CommonItemList.removeItems(removeItemIds);

            return requestWithParams(params, resourceMethod).then(function () {
                if ($state.includes('**.view')) {
                    $state.go('^');
                }
            });
        };

        var containsReadableItem = function () {
            return !$state.includes(PROJECT_STATE_NAMES.SENT_BOX);
        };

        var getRemoveConfirmMessage = function (message) {
            return message || getCurrentActionsForType().removeMessage;
        };

        return {
            read: function (type) {
                if (!ready) {
                    return;
                }
                setCurrentActionsForType(type);
                var param = {};
                param[getCurrentActionsForType().listParamKey] = ListCheckBoxBiz.getCheckedItemIds();
                requestForRead(param, getBizWrapper(type).markReadBiz.setRead, true);
            },
            unread: function (type) {
                if (!ready) {
                    return;
                }
                setCurrentActionsForType(type);
                var param = {};
                param[getCurrentActionsForType().listParamKey] = ListCheckBoxBiz.getCheckedItemIds();
                requestForRead(param, getBizWrapper(type).markReadBiz.setUnread, false);
            },
            // option: {targetFolderId: '123123213', targetFolderName: 'inbox'} 2개중에 1개가 필요합니다.
            moveMails: function (option) {
                if (!ready) {
                    return;
                }

                return MailsBiz.moveMails(ListCheckBoxBiz.getCheckedItemIds(), option).then(function () {
                    if ($state.includes('**.view')) {
                        $state.go('^');
                    } else {
                        CommonItemList.fetchList();
                    }
                });
            },
            removeItemsWithConfirm: function (type, message) {
                if (!ready || !ListCheckBoxBiz.getItemsSize()) {
                    return $q.reject();
                }
                setCurrentActionsForType(type);
                message = getRemoveConfirmMessage(message);
                var paramsForRemove = getCurrentActionsForType().getRemoveParams();

                return MessageModalFactory.confirm(message + ['<p class="text-center">', gettextCatalog.getString('삭제하시겠습니까?'), '</p>'].join(''),
                    gettextCatalog.getString('업무 삭제'), {focusToCancel: true, confirmBtnLabel: gettextCatalog.getString('삭제')}).result.then(_.bind(function () {
                    return remove(paramsForRemove, getBizWrapper(type).itemResource.removeArray);
                }, this));
            },
            removeDrafts: function (type) {
                if (!ListCheckBoxBiz.getItemsSize() || !ready) {
                    return;
                }
                setCurrentActionsForType(type);
                remove(getCurrentActionsForType().getRemoveDraftParams(), getBizWrapper(type).draftResource.removeArray);
            },
            assignMilestone: function (item) {
                item.id = item.id === 'none' ? null : item.id;
                var params = {
                    milestoneId: _.get(item, 'id', null),
                    postIdList: ListCheckBoxBiz.getCheckedItemIds()
                }, checkedItems = ListCheckBoxBiz.getCheckedItems(),
                    self = this;

                return MilestoneBiz.assignMilestone(StateParamsUtil.getProjectCodeFilter(), params).then(function () {
                    _.forEach(checkedItems, function(post) {
                        ItemSyncService.syncItemUsingCallback(post.id, ITEM_TYPE.POST, function (_post) {
                            _post.milestoneId = item.id;
                            _post._wrap.editReferences('milestoneMap', function (milestoneMap) {
                                if (item.id) {
                                    milestoneMap[item.id] = item;
                                }
                            });
                        });
                    });
                }, function () {
                    var msg = _makeCenterMultiLineMsg([gettextCatalog.getString('마일스톤이 정상적으로 변경되지 않았습니다.'),
                        gettextCatalog.getString('다시 변경하시겠습니까?')]);
                    MessageModalFactory.confirm(msg, gettextCatalog.getString('마일스톤 편집'), {
                        confirmBtnLabel: gettextCatalog.getString('편집')
                    }).result.then(function () {
                            self.assignMilestone(item);
                        });
                });
            },
            assignTag: function (selectedTagItem, tagList, isSelectOne) {
                var self = this;
                return TagBiz.assignTags(StateParamsUtil.getProjectCodeFilter(), ListCheckBoxBiz.getCheckedItemIds(), [selectedTagItem]).then(function () {
                    var checkedPosts = ListCheckBoxBiz.getCheckedItems(),
                        removeTagIds = TagBiz.filterSelectOneTagList(selectedTagItem, tagList, isSelectOne);
                    TagBiz.applyIcon(selectedTagItem, tagList);

                    _.forEach(checkedPosts, function(post) {
                        ItemSyncService.syncItemUsingCallback(post.id, ITEM_TYPE.POST, function (post) {
                            var tagIdList = post.tagIdList;
                            _.forEach(removeTagIds, function (tagId) {
                                var index = tagIdList.indexOf(tagId);
                                if (index > -1) {
                                    tagIdList.splice(index, 1);
                                }
                            });

                            if (!selectedTagItem._ticked) {
                                tagIdList.splice(tagIdList.indexOf(selectedTagItem.id), 1);
                                return;
                            }

                            tagIdList.push(selectedTagItem.id);
                            post._wrap.editReferences('tagMap', function (tagMap) {
                                tagMap[selectedTagItem.id] = selectedTagItem;
                            });
                        });

                    });
                }, function (error) {
                    if (_.get(error, 'data.header.resultCode') === API_ERROR_CODE.USER_INVALID_TAG_MANDATORY_PREFIX) {
                        return;
                    }
                    var msg = _makeCenterMultiLineMsg([gettextCatalog.getString('태그가 정상적으로 변경되지 않았습니다.'),
                        gettextCatalog.getString('다시 변경하시겠습니까?')]);
                    MessageModalFactory.confirm(msg, gettextCatalog.getString('태그 편집'), {
                        confirmBtnLabel: gettextCatalog.getString('편집')
                    }).result.then(function () {
                            self.assignTag(selectedTagItem, tagList, isSelectOne);
                        });
                });
            },
            completeList: function () {
                var checkedItems = ListCheckBoxBiz.getCheckedItems(),
                    param = _.map(checkedItems, function (post) {
                        var project = post._wrap.refMap.projectMap(post.projectId),
                            closedWorkflowId = _.get(project, '_props.closedWorkflowId');
                        if (!closedWorkflowId) {
                            closedWorkflowId = _(project.workflowIdList)
                                .map(function (workflowId) {
                                    return post._wrap.refMap.workflowMap(workflowId);
                                })
                                .sortBy('order')
                                .last()
                                .id;
                            _.set(project, '_props.closedWorkflowId', closedWorkflowId);
                        }

                        return {
                            projectCode: post.projectCode,
                            postNumber: post.number,
                            workflowId: closedWorkflowId
                        };
                    });

                return _completeListAction(param, checkedItems);
            }
        };

        function _completeListAction(param, checkedItems) {
            return TaskListBiz.completeList(param).then(function () {
                var selectedItem = DetailInstanceFactory.getOrMakeSelectedItem(ITEM_TYPE.POST);
                if (_.find(checkedItems, {'id': _.get(selectedItem, 'data.id', null)})) {
                    selectedItem.refreshItem();
                }
            }, function () {
                var msg = _makeCenterMultiLineMsg([gettextCatalog.getString('업무가 정상적으로 완료되지 않았습니다.'),
                    gettextCatalog.getString('다시 완료하시겠습니까?')]);
                MessageModalFactory.confirm(msg, gettextCatalog.getString('업무 완료'), {
                    confirmBtnLabel: gettextCatalog.getString('완료.1')
                }).result.then(function () {
                        _completeListAction(param, checkedItems);
                    });
            });
        }

        function _makeCenterMultiLineMsg(msgList) {
            return _(msgList).map(function (msg) {
                return ['<p class="text-center">', msg, '</p>'].join('');
            }).join('');
        }
    }

})();
