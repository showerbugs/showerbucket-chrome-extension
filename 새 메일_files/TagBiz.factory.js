(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .constant('TASK_TAG_OPTIONS', {
            'maxLength': 10
        })
        .factory('TagBiz', TagBiz);

    /* @ngInject */
    function TagBiz($cacheFactory, API_PAGE_SIZE, TASK_TAG_OPTIONS, MessageModalFactory, ModifyTagPrefixResource, ModifyTagResource, RootScopeEventBindHelper, TagColorUtil, TagResource, gettextCatalog, _) {
        var EVENTS = {
            'RESETCACHE': 'TagBiz: resetCache'
        }, EVENT_REASON = {
            ADD: 'addTag',
            UPDATE: 'updateTag',
            REMOVE: 'removeTag',
            UPDATE_TAG_PREFIX: 'updateTagPrefix'
        };
        var icons = {
            check: '<div class="glyphicon glyphicon-ok"></div>',
            minus: '<div class="glyphicon glyphicon-minus"></div>',
            empty: '<div class="glyphicon"></div>'
        };

        return {
            EVENTS: EVENTS,
            EVENT_REASON: EVENT_REASON,
            resetCache: resetCache,
            getTags: getTags,
            applyIcon: applyIcon,
            applyColorToTags: applyColorToTags,
            applyColorToTag: applyColorToTag,
            resetTagsIcon: resetTagsIcon,
            validate: validate,
            getSelectTagsInGroup: getSelectTagsInGroup,
            getTagWithPrefixesForSetting: getTagWithPrefixesForSetting,
            getTagsForMultiSelect: getTagsForMultiSelect,
            applyTagGroup: applyTagGroup,
            addTag: addTag,
            updateTag: updateTag,
            assignTags: assignTags,
            removeTag: removeTag,
            updateTagPrefix: updateTagPrefix,
            filterSelectOneTagList: filterSelectOneTagList
        };

        ////////// public functions

        function resetCache(reason, id) {
            $cacheFactory.get('TagResource').removeAll();
            RootScopeEventBindHelper.emit(EVENTS.RESETCACHE, reason, id);
        }

        function getTags(projectCode, extFields) {
            var resourceTarget = !_.includes(extFields, 'counts') ? TagResource.get : TagResource.getWithoutCache;
            return resourceTarget({
                projectCode: projectCode,
                extFields: extFields,
                size: API_PAGE_SIZE.ALL
            }).$promise.then(function (result) {
                    applyColorToTags(result.contents());
                    return result;
                });
        }

        function applyIcon(tag, allTags) {
            var iconName = tag._ticked ? 'check' : 'empty';
            _.find(allTags, {'id': tag.id})._checkIcon = icons[iconName];
        }

        function applyColorToTags(tags) {
            _.forEach(tags, applyColorToTag);
        }

        function applyColorToTag(tag) {
            tag._bgColor = _appendColorPrefix(tag.color);
            tag._textColor = _makeTextColor(tag.color);
        }

        function resetTagsIcon(tagIdList, allTags) {
            _.forEach(allTags, function (tag) {
                delete tag._ticked;
                delete tag._checkIcon;
            });

            return _setTagsIcon(tagIdList, _.filter(allTags, function (tag) {
                return !!(tag.name && tag.color);
            }));
        }

        function validate(maxTagIdList, selectTag, isAfterAssign) {
            if (!selectTag._ticked) {
                return true;
            }
            var tagsLength = maxTagIdList.length + (isAfterAssign ? 0 : 1);
            if (tagsLength > TASK_TAG_OPTIONS.maxLength) {
                MessageModalFactory.alert(gettextCatalog.getString('태그는 1개의 업무에 최대 {{::maxlength}}까지 할당할 수 있습니다.', {maxlength: TASK_TAG_OPTIONS.maxLength}));
                return false;
            }
            return true;
        }


        function getSelectTagsInGroup(groupName, groupProperty, allTags) {
            var i, length = allTags.length,
                selectTags = [];

            for (i = _.findIndex(allTags, {'name': groupName}) + 1; i < length; i++) {
                if (allTags[i][groupProperty] === false) {
                    return selectTags;
                }
                selectTags.push(allTags[i]);
            }
        }

        function getTagWithPrefixesForSetting(projectCode, extFields) {
            return getTags(projectCode, extFields).then(function (result) {
                //위의 tags 목록을 중심으로 UI 목록을 위해 prefix를 중심으로 그룹핑하여 private property에 할당해둠
                result._tagGroups = _(result.contents()).groupBy(function (tag) {
                    return tag.tagPrefixId || 'none';
                }).map(function (values, key) {
                    return {
                        tagPrefix: key !== 'none' ? _.assign({id: key}, result.refMap.tagPrefixMap(key)) : null,
                        tags: values
                    };
                }).value();
                return result;
            });
        }

        // option: { defaultTickCount: 3, minusTickTagMap: { 123: true }
        function applyTagGroup(tagIdList, result, option) {
            option = option || {};
            var tagWithTagIcon = _setTagsIcon(tagIdList, result.contents(), option.minusTickTagMap);
            _setDefaultTickCount(tagWithTagIcon, option.defaultTickCount);

            //위의 tags 목록을 중심으로 UI 목록을 위해 prefix를 중심으로 그룹핑하여 private property에 할당해둠
            var tagWithPrefixes = _(tagWithTagIcon).groupBy(function (tag) {
                return tag.tagPrefixId || 'none';
            }).map(function (values, key) {
                values.unshift({
                    _tagGroup: true,
                    _displayName: key !== 'none' ? _makeTagGroupDisplayName(result.refMap.tagPrefixMap(key)) : gettextCatalog.getString('그룹: 없음')
                });
                values.push({_tagGroup: false});
                return values;
            }).value();
            return Array.prototype.concat.apply([], tagWithPrefixes);
        }

        function getTagsForMultiSelect(projectCode, tagIdList, option) {
            return getTags(projectCode).then(function (result) {
                return applyTagGroup(tagIdList, result, option);
            });
        }

        function addTag(projectCode, params) {
            return TagResource.save({projectCode: projectCode}, [params]).$promise.then(function () {
                resetCache(EVENT_REASON.ADD);
            });
        }

        function updateTag(projectCode, tagId, params) {
            return TagResource.update({
                projectCode: projectCode,
                tagId: tagId
            }, params).$promise.then(function () {
                    resetCache(EVENT_REASON.UPDATE, tagId);
                });
        }

        function assignTags(projectCode, postIds, selectedTags) {
            return ModifyTagResource.save({projectCode: projectCode}, _makeAssignTagParams(postIds, selectedTags)).$promise;
        }

        function removeTag(projectCode, tagId, options) {
            var params = {
                projectCode: projectCode,
                tagId: tagId
            };
            if (options) {
                _.assign(params, options);
            }
            return TagResource.remove(params).$promise.then(function () {
                resetCache(EVENT_REASON.REMOVE, tagId);
            });
        }

        function updateTagPrefix(projectCode, tagPrefixId, params) {
            return ModifyTagPrefixResource.update({
                projectCode: projectCode,
                tagPrefixId: tagPrefixId
            }, params).$promise.then(function () {
                    resetCache(EVENT_REASON.UPDATE_TAG_PREFIX);
                });
        }

        function filterSelectOneTagList(tag, tagList, isSelectOne) {
            if (!tag._ticked || !isSelectOne) {
                return [];
            }
            return _(tagList).filter(function (_tag) {
                return _tag._ticked && _tag.tagPrefixId === tag.tagPrefixId && _tag.id !== tag.id;
            }).map(function (_tag) {
                _tag._ticked = false;
                applyIcon(_tag, tagList);
                return _tag.id;
            }).value();
        }


        ////////// private functions
        function _makeTextColor(color) {
            var red, green, blue;
            color = _.parseInt(color, 16);
            blue = color % 256;
            color /= 256;
            green = color % 256;
            red = color / 256;

            return (red + green + blue) / 3 < 130 ? 'white' : '#333';
        }

        function _makeColoredTag(color, name) {
            return ['<span class="tag-badge" style="',
            'background-color: ', TagColorUtil.getBgColor('#' + color), '; ',
            'color: ', TagColorUtil.getTextColor('#' + color), '; ',
            'border-color: ', TagColorUtil.getBorderColor('#' + color), ';">', name, '</span>'].join('');
        }

        function _appendColorPrefix(color) {
            return '#' + color;
        }

        function _makeAssignTagParams(targetPostIds, selectedTags) {
            var addTags = [],
                removeTags = [];

            _.forEach(selectedTags, function (tag) {
                var target = tag._ticked ? addTags : removeTags;
                target.push(tag.id);
            });

            return {
                postIdList: targetPostIds,
                addTagIdList: addTags,
                removeTagIdList: removeTags
            };
        }

        function _setTagsIcon(tagIdList, allTags, minusTickTagMap) {
            var tagMap = _.countBy(tagIdList);
            minusTickTagMap = minusTickTagMap || {};

            _.forEach(allTags, function (tag) {
                tag._ticked = !!tagMap[tag.id];
                var iconName = tagMap[tag.id] ? (minusTickTagMap[tag.id] ? 'minus' : 'check') : 'empty';
                tag._checkIcon = icons[iconName];
                tag._displayName = _makeColoredTag(tag.color, tag.name);
            });

            return allTags;
        }

        function _setDefaultTickCount(allTags, defaultTickCount) {
            var tickedCount = _.filter(allTags, '_ticked').length;
            if (!defaultTickCount || tickedCount > defaultTickCount) {
                return;
            }

            var remainTickCount = defaultTickCount - tickedCount;

            _.forEach(allTags, function (tag) {
                if (remainTickCount > 0 && !tag._ticked) {
                    remainTickCount -= 1;
                    tag._ticked = true;
                    tag._checkIcon = icons.check;
                }
            });
        }

        function _makeTagGroupDisplayName(tagPrefixObj) {
            var appendNames = [
                tagPrefixObj.mandatory ? gettextCatalog.getString('필수') : '',
                tagPrefixObj.selectOne ? gettextCatalog.getString('1개만 선택') : ''
            ];

            var appendName = _(appendNames).filter().join(' / ');
            return tagPrefixObj.name + (appendName ? ['<span style="margin-left: 5px;color:#ff5757;">(', appendName, ')</span>'].join('') : '');
        }

    }

})();
