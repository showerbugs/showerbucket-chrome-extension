(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .component('doorayUser', {
            /* @ngInject */
            templateUrl: function ($attrs) {
                return $attrs.withProfileLayer ? 'modules/components/doorayUser/doorayUser.profile_layer.html' :
                    'modules/components/doorayUser/doorayUser.html';
            },
            controller: DoorayUser,
            bindings: {
                user: '<?',
                organizationMemberId: '<?',
                refMap: '<',
                withProfileImage: '@',
                profileSize: '@'
            }
        });

    /* @ngInject */
    function DoorayUser(USER_TYPE) {
        var $ctrl = this;

        this.USER_TYPE = USER_TYPE;
        var extractUserDetail = {};
        extractUserDetail[USER_TYPE.MEMBER] = _extractMember;
        extractUserDetail[USER_TYPE.EMAIL_USER] = _extractEmailUser;
        extractUserDetail[USER_TYPE.PROJECT_MEMBER_GROUP] = _extractGroupUser;

        this.$onChanges = _init;

        function _extractMember(user) {
            return $ctrl.refMap.organizationMemberMap(user.member.organizationMemberId);
        }

        function _extractEmailUser(user) {
            return user.emailUser;
        }

        function _extractGroupUser(user) {
            return $ctrl.refMap.projectMemberGroupMap(user.group.id);
        }

        function _init() {
            if ($ctrl.user) {
                $ctrl.userDetail = extractUserDetail[$ctrl.user.type]($ctrl.user);
            } else if ($ctrl.organizationMemberId) {
                $ctrl.userDetail = $ctrl.refMap.organizationMemberMap($ctrl.organizationMemberId);
            }
            $ctrl.profileSize = $ctrl.profileSize || 16;
        }
    }

})();
