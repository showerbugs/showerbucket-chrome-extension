(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('displayWorkflowUser', {
            /* @ngInject */
            templateUrl: function ($element, $attrs) {
                return $attrs.inGrid ? 'modules/project/components/displayWorkflowUser/displayWorkflowUser.fullViewTpl.html' :
                    ($attrs.templateUrl || 'modules/project/components/displayWorkflowUser/displayWorkflowUser.html');
            },
            controller: DisplayWorkflowUser,
            bindings: {
                users: '<',
                buttonTemplateUrl: '@',
                hidePopover: '@'
            }
        });

    /* @ngInject */
    function DisplayWorkflowUser($attrs, _) {
        var self = this;
        this.memberSize = 0;

        this.setPosition = setPosition;

        _init();

        function setPosition(position, index) {
            self.users[index]._placementClass = position.left < 100 ? 'left-margin' : '';
        }

        function _init() {
            if ($attrs.inGrid) {
                _setAllMemberSize();
            }
        }

        function _setAllMemberSize() {
            self.memberSize = _(self.users)
                .map(function (memberOrGroup) {
                    return memberOrGroup.type !== 'group' ?
                        memberOrGroup : memberOrGroup.group.members;
                })
                .flatten()
                .uniqBy('member.id').value().length;
        }
    }

})();
