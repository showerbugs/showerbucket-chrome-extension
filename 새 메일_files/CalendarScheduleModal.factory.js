(function () {

    'use strict';

    angular
        .module('doorayWebApp.calendar')
        .factory('CalendarScheduleModal', CalendarScheduleModal)
        .controller('CalendarScheduleModalCtrl', CalendarScheduleModalCtrl);

    /* @ngInject */
    function CalendarScheduleModal($uibModal, $document, _) {
        var modalInstance,
            MODAL_PADDING_TOP = 20,
            MODAL_MAX_WIDTH = 450,
            MODAL_MAX_HEIGHT = 460;

        function getTemplateName(category) {
            if (category === 'allday' || category === 'time') {
                return 'general';
            } else if (category === 'task') {
                return 'post';
            }
            return category;
        }

        return {
            //일단은 캘린더 클릭시에는 요약뷰가 아니라 바로 아지몽뷰로 뜨도록
            open: function (model, references, position) {

                if (modalInstance) {
                    return;
                }

                var category = getTemplateName(model.category);
                var option = {
                    templateUrl: _.template('modules/calendar/modals/CalendarScheduleModal/<%=category%>ModalController/calendarScheduleModal.<%=category%>.html')({category: category}),
                    controller: 'CalendarScheduleModalCtrl',
                    windowClass: 'dooray-setting-content calendar-schedule-modal',
                    resolve: {
                        model: function () {
                            return model;
                        },
                        references: function () {
                            return references;
                        }
                    }
                };

                if (category === 'general') {
                    modalInstance = $uibModal.open(_.assign(option, {
                        windowClass: 'calendar-schedule-general-modal modal-itemview'
                    }));
                } else {
                    var calendarModal$ = $document.find('.calendar-modal');

                    modalInstance = $uibModal.open(_.assign(option, {
                        backdrop: false,
                        appendTo: calendarModal$
                    }));

                    position.top += MODAL_PADDING_TOP;

                    if ($document.height() < position.top + MODAL_MAX_HEIGHT) {
                        position.top = $document.height() - MODAL_MAX_HEIGHT;
                    }

                    if ($document.width() < position.left + MODAL_MAX_WIDTH) {
                        position.left = $document.width() - MODAL_MAX_WIDTH;
                    }

                    calendarModal$.css(position);

                    $document.on('click', closeModal);

                    modalInstance.closed.finally(function () {
                        $document.off('click', closeModal);
                    });

                }
                modalInstance.result.finally(function () {
                    modalInstance = null;
                });

                function closeModal(e) {
                    if ($(e.target).parents('.calendar-modal').length === 0) {
                        modalInstance.close('success');
                        e.stopPropagation();
                        e.preventDefault();
                    }
                }

                return modalInstance;
            }
        };
    }

    /* @ngInject */
    function CalendarScheduleModalCtrl($scope, $uibModalInstance, model, references) {
        $scope.model = model;
        $scope.references = references;

        $scope.ok = function () {
            $uibModalInstance.close('success');
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    }

})();
