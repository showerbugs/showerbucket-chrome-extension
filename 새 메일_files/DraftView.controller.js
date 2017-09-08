(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .controller('DraftViewCtrl', DraftViewCtrl);

    /* @ngInject */
    function DraftViewCtrl($controller, $scope, $state, $element, CommonItemList, PopupUtil, ResizeDividingElementFactory, TaskDraftResource, gettextCatalog) {
        $controller('CommonViewCtrl', {$scope: $scope, $element: $element});

        $scope.ResizeDividingElementFactory = ResizeDividingElementFactory;

        function init() {
            $scope.ui = {
                visible: {
                    attachFiles: true
                }
            };
        }
        init();

        $scope.draftWriteForm = function (selectedDraft) {
            PopupUtil.openTaskWritePopup('draft', {draftId: selectedDraft.data.id});
        };

        $scope.removeDraft = function (post) {
            var draftId = post.id;
            CommonItemList.removeItems([draftId]);

            TaskDraftResource.remove({draftId: post.id}).$promise.then(function () {
                if (draftId === post.id) {
                    $state.go('^');
                }
            }, function () {
                CommonItemList.onErrorWhileRemoving(['<p class="text-center">', gettextCatalog.getString('업무가 정상적으로 삭제되지 않았습니다.'), '</p>'].join(''), function () {
                    $scope.removeDraft(post);
                });
            });
        };

    }

})();
