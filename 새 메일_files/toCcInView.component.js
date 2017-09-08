(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('toCcInView', {
            /* @ngInject */
            templateUrl: function ($attrs) {
                return $attrs.viewMode === 'calendar'?
                'modules/components/view/toCcInView/toCcInView.calendar.html':
                'modules/components/view/toCcInView/toCcInView.html';
            },
            controller: ToCcInView,
            bindings: {
                item: '<',
                fetchedAt: '<',
                showEditBtn: '<',
                editForm: '<',
                isPopup: '@',
                showToMeBtn: '@',
                displayUserTemplateUrl: '@',
                toLabel: '@',
                ccLabel: '@'
            }
        });

    /* @ngInject */
    function ToCcInView($scope, $state,
                        HelperConfigUtil, HelperPromiseUtil, InlineEditFormBuilder, PermissionFactory, TagInputTaskHelper,
                        TagInputMailHelper, gettextCatalog, _) {
        var self = this,
            myMemberId = HelperConfigUtil.orgMemberId(),
            promise = null;

        $scope._ = _;
        this.editMode = false;
        this.uiVersion = 1;
		this._to = [];
		this._cc = [];

        this.show = show;
        this.assignPostToMe = assignPostToMe;
        this.allowTag = TagInputMailHelper.allowEmailUser;
        this.filterUser = filterUser;
        this.onSelect = onSelect;
        this.searchMember = searchMember;

        this.$onInit = function () {
            self.toLabel = self.toLabel || gettextCatalog.getString('담당자');
            self.ccLabel = self.ccLabel || gettextCatalog.getString('참조자');
        };

		this.$onChanges = function (changes) {
            if (_.isEmpty(self.item)) {
                return;
            }
            _setValue();

            if (!_.result(changes, 'item.isFirstChange')) {
                recompile();
            }
        };

        this.$onDestroy = function () {
            self.editForm = null;
        };

        function _setValue() {
            self.to = _.get(self.item, 'users.to', []);
            self.cc = _.get(self.item, 'users.cc', []);
        }

        function recompile() {
            self.uiVersion += 1;
        }

        function show() {
            this.editForm.show(_makeEditFormInstance()).then(function(){
                self.editMode = true;
                self._to = TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(self.to || [], self.item._wrap.refMap);
                self._cc = TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(self.cc || [], self.item._wrap.refMap);
                recompile();
            });
        }

        function assignPostToMe() {
            if (HelperPromiseUtil.isResourcePending(promise) || _hasOnlyMe(self.to)) {
                return;
            }
            promise = self.editForm.updateItem({
                users: {
                    to: TagInputTaskHelper.toMemberFromMemberIds(myMemberId),
                    cc: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(self.to.concat(self.cc))
                }
            });
        }

        function filterUser(item, listItem) {
			if (!item || !listItem) {
				return false;
			} else if (item.type === 'emailUser') {
				return _.get(item, 'emailUser.emailAddress') === _.get(listItem, 'emailUser.emailAddress');
			}
			return _.get(item[item.type], 'id') === _.get(listItem[listItem.type], 'id');
        }

        function onSelect($item) {
			if ($item.type === 'group') {
				$item.group.members = [];
				TagInputTaskHelper.queryProjectMember($item.group).then(function (result) {
					$item.group.members = result;
				});
			}
        }

        function searchMember(query) {
            TagInputTaskHelper.queryMemberOrGroup(query, {
                boost: {
                    projectCode: self.item.projectCode
                }
            }).then(function (result) {
                self.searchUsers = result;
            });
        }

        function _makeEditFormInstance() {
            return new InlineEditFormBuilder('toCc', self.toLabel + ', ' + self.ccLabel)
                .withHasChanged(_hasChanged)
                .withCreateSubmitData(_createSubmitData)
                .withCancel(_cancel)
                .withSubmit(_submit)
                .withFocus(recompile)
                .build();
        }

        function _hasChanged() {
            var to = TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(self.to, []),
                cc = TagInputTaskHelper.toDetailMemberOrGroupFromDetailInfo(self.cc, []);
            return !_.isEqual(self._to, to, self.item._wrap.refMap) || !_.isEqual(self._cc, cc, self.item._wrap.refMap);
        }

        function _cancel() {
			self._to = [];
			self._cc = [];
            _setValue();
            self.editMode = false;
            recompile();
        }

        function _submit(data) {
            var params = data;

            return PermissionFactory.confirmAccessTaskPromise(self.item.projectCode, _.get(self.item, 'users.from.member.organizationMemberId'), self._to, self._cc).then(function (option) {
                self.editForm.updateItem(params);

                self.editForm.cancel();
                if (_.get(option, 'goListState')) {
                    $state.go('^');
                }
            }, self.editForm.focus);
        }

        function _createSubmitData() {
            return {
                users: {
                    to: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(self._to),
                    cc: TagInputTaskHelper.toMemberOrGroupFromTaskDetailUser(self._cc)
                }
            };
        }

        function _hasOnlyMe(to) {
            return _.get(to, 'length') === 1 && _.get(to[0], 'member.id') === myMemberId;
        }
    }

})();
