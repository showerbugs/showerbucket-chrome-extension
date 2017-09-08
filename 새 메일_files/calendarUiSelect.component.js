(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('calendarUiSelect', {
            templateUrl: 'modules/calendar/components/calendarUiSelect/calendarUiSelect.html',
            controller: CalendarUiSelect,
            bindings: {
                model: '=',
                disabled: '<',
                select: '&'
            }
        });

    /* @ngInject */
    function CalendarUiSelect(MailDistributionListBiz, EmailAddressClassifyBiz, TagInputTaskHelper, TagInputMailHelper, HelperAddressUtil, _) {
        var $ctrl = this;

        //PreDefined Callback;

        this.$onInit = function () {
            $ctrl.searchUsers = [];
            $ctrl.select = $ctrl.select || angular.noop;
        };

        this.$onChanges = function () {
        };

        this.$onDestroy = function () {
        };

        $ctrl.allowTag = TagInputMailHelper.allowEmailUser;
        $ctrl.searchMember = searchMember;
        $ctrl.onSelect = onSelect;
        $ctrl.filterUser = filterUser;
        $ctrl.extractGroupToItems = extractGroupToItems;


        function searchMember(query) {
            TagInputTaskHelper.queryMemberOrGroup(query, {field: 'all', typeList: ['member', 'group', 'distributionList']}).then(function (result) {
                $ctrl.searchUsers = result;
            });
        }

        function onSelect($item) {
            if ($item.type === 'group') {
                $item.group.members = [];
                TagInputTaskHelper.queryProjectMember($item.group).then(function (result) {
                    $item.group.members = result;
                    $ctrl.select();
                });
            } else if ($item.type === 'distributionList') {
                $item.distributionList.members = [];
                MailDistributionListBiz.fetch($item.distributionList.id).then(function (result) {
                    $item.distributionList.distributionItemList = result.contents().distributionItemList;
                    $item.distributionList.allMemberTooltip = _(result.contents().distributionItemList).map(function (memberWrapper) {
                        var member = memberWrapper[memberWrapper.type];
                        return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
                    }).value().join(', ');
                    $ctrl.select();
                });
            } else {
                $ctrl.select();
            }
        }

        function filterUser(item, listItem) {
            if (!item || !listItem) {
                return false;
            } else if (item.type === 'emailUser') {
                return _.get(item, 'emailUser.emailAddress') === _.get(listItem, 'emailUser.emailAddress');
            }
            return _.get(item[item.type], 'id') === _.get(listItem[listItem.type], 'id');
        }

        function extractGroupToItems(list, removeTarget, replaceModels, onFinish) {
            var replaceEmails = _(replaceModels).map(function (memberWrapper) {
                return memberWrapper[memberWrapper.type].emailAddress;
            }).value();

            EmailAddressClassifyBiz.query(replaceEmails).then(function (result) {
                var userMap = result.result(),
                    replaceTargets = [];

                _.forEach(replaceEmails, function (email) {
                    var existEmail = _.find(list, function (member) {
                        return member[member.type].emailAddress === email;
                    });
                    if (existEmail) {
                        return;
                    }
                    replaceTargets.push(userMap[email]);
                    if (userMap[email].type === 'distributionList') {
                        MailDistributionListBiz.fetch(userMap[email].distributionList.id).then(function (result) {
                            userMap[email].distributionList.distributionItemList = result.contents().distributionItemList;
                            userMap[email].distributionList.allMemberTooltip = _(result.contents().distributionItemList).map(function (memberWrapper) {
                                var member = memberWrapper[memberWrapper.type];
                                return HelperAddressUtil.makeDisplayInMail(member.name, member.emailAddress);
                            }).value().join(', ');
                        });
                    }
                });
                replaceTargets.unshift(_.findIndex(list, removeTarget), 1);
                list.splice.apply(list, replaceTargets);

                onFinish();
            });
        }

    }

})();
