(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailListItemDragDropUtil', MailListItemDragDropUtil);

    /* @ngInject */
    function MailListItemDragDropUtil(MailFolderUtil, StateHelperUtil,
                                       MailListRepository, MailListItemCheckboxRepository) {

        return {
            isDraggableItemInStateName: isDraggableItemInStateName,
            getSelectedItems: getSelectedItems,
            getDragItemImageElementWithMessage: getDragItemImageElementWithMessage,
            getDragItemImageElementWithSelectedItemMessages: getDragItemImageElementWithSelectedItemMessages
        };

        // 현재 선택된 폴더가 보낸 메일함이나 임시 보관함일 경우 메일을 다른 폴더로 이동하지 못하도록 함
        function isDraggableItemInStateName(stateName) {
            return !MailFolderUtil.isForbiddenMailMoveByStateName(StateHelperUtil.computeListStateNameByName(stateName));
        }

        //체크 박스로 선택된 메일 목록이 없으면 현재 드래그 이벤트를 발생시키는 메일만을 대상으로 함
        function getSelectedItems(mail) {
            var checkedMailList = _.map(MailListItemCheckboxRepository.getCheckedAllItems(), MailListRepository.getContentById);
            checkedMailList = checkedMailList.length > 0 ? checkedMailList : (mail ? [mail] : []);
            return {
                type: 'mail',
                items: checkedMailList
            };
        }

        function getDragItemImageElementWithMessage(text) {
            return {image: angular.element('#mail-drag-item-holder').html(text)[0]};
        }

        function getDragItemImageElementWithSelectedItemMessages(item) {
            return getDragItemImageElementWithMessage(getSelectedItems(item).items.length + ' item(s) selected.');
        }
    }

})();
