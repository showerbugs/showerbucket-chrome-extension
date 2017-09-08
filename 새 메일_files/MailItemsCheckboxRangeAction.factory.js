(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailItemsCheckboxRangeAction', MailItemsCheckboxRangeAction);

    /* @ngInject */
    function MailItemsCheckboxRangeAction(MailListItemCheckboxRepository, MailListRepository, _) {
        var rangeStartMailInfo = {};

        return {
            toggleCheckboxRangeByShiftKey: toggleCheckboxRangeByShiftKey,
            clearRange: clearRange
        };

        function toggleCheckboxRangeByShiftKey(mailId, isShiftKeyPressed) {
            MailListItemCheckboxRepository.toggleCheckItem(mailId);
            if (!isShiftKeyPressed) {
                rangeStartMailInfo = {
                    id: mailId,
                    checked: MailListItemCheckboxRepository.isCheckedItem(mailId)
                };
            }

            if (rangeStartMailInfo.id && isShiftKeyPressed) {
                var firstIndex = _.findIndex(MailListRepository.getContents(), {id: rangeStartMailInfo.id});
                var lastIndex = _.findIndex(MailListRepository.getContents(), {id: mailId});
                if (firstIndex === -1 || lastIndex === -1 || firstIndex === lastIndex) {
                    clearRange();
                    return;
                }

                var startPos = firstIndex < lastIndex ? firstIndex : lastIndex,
                    endPos = firstIndex < lastIndex ? lastIndex + 1 : firstIndex + 1;

                var actionRangekMailIdList = _.map(MailListRepository.getContents().slice(startPos, endPos), 'id');
                MailListItemCheckboxRepository.toggleCheckAllItems(actionRangekMailIdList, rangeStartMailInfo.checked);
                //console.log('rangeStartMailInfo', rangeStartMailInfo, firstIndex, actionRangekMailIdList);
            }
        }

        function clearRange() {
            rangeStartMailInfo = {};
        }
    }

})();
