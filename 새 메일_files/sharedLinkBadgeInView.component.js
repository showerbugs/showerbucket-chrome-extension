(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .component('sharedLinkBadgeInView', {
            templateUrl: 'modules/project/view/component/sharedLinkBadgeInView/sharedLinkBadgeInView.html',
            controller: SharedLinkBadgeInView,
            bindings: {
                post: '<',
                validSharedLinkLength: '<',
                openSettingModal: '&'
            }
        });

    /* @ngInject */
    function SharedLinkBadgeInView(SHARED_LINK_PARTS, ArrayUtil, gettextCatalog, _) {
        var self = this,
            partsList = [];

        this.uiVersion = 0;
        this.hideView = false;
        this.$onChanges = function (changes) {
            if (_.isEmpty(self.post) || (!changes.validSharedLinkLength && !self.validSharedLinkLength)) {
                if (!self.hideView) {
                    self.hideView = true;
                    self.uiVersion += 1;
                }
                return;
            }

            if (changes.validSharedLinkLength && !self.validSharedLinkLength) {
                self.hideView = true;
                partsList = [];
            } else if (hasPartChanges()) {
                self.hideView = false;
            }
            self.uiVersion += 1;
        };

        this.makeSharedLinkText = function () {
            var partsMsg = _(partsList).map(function (part) {
                return SHARED_LINK_PARTS[part];
            }).join(', ');

            return gettextCatalog.getString('공유 중: {{::parts}}', {parts: partsMsg});
        };

        function hasPartChanges() {
            var _sharedLinkMap = self.post._wrap.refMap.sharedLinkMap(),
                _partsList = [];
            _.forEach(_sharedLinkMap, function (value) {
                _partsList = _.union(_partsList, value.parts);
            });

            var hasChnage = !ArrayUtil.isEqualEntity(partsList, _partsList);
            partsList = _partsList;
            return hasChnage;
        }
    }

})();
