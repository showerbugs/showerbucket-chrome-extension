(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('TrelloCtrl', TrelloCtrl);

    /* @ngInject */
    function TrelloCtrl($scope, TrelloApi, hookUrl, $uibModalInstance, gettextCatalog) {

        $scope.registerWebHook = function (board) {
            var params = {
                "description": "Dooray " + board.name + " Web Hook",
                "callbackURL": hookUrl,
                "idModel": board.id
            };
            TrelloApi.Rest('POST', 'tokens/' + TrelloApi.Token() + '/webhooks', params).then(function () {
                //TODO 트렐로에서 거부 당했을 때 처리
                $uibModalInstance.close(true);
            });

        };
        $scope.isAuthenticate = false;
        $scope.authenticateTrello = function () {
            TrelloApi.Authenticate().then(function () {
                $scope.isAuthenticate = true;
                TrelloApi.Rest('GET', 'members/me/boards').then(function (res) {
                    $scope.boards = res;
                });
            }, function () {
                // TODO allow를 안했을때?
            });
        };
        $scope.integrationServiceBtnName = gettextCatalog.getString('연동하기');

        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }

})();
