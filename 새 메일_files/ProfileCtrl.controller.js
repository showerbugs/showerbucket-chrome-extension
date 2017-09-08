(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('ProfileCtrl', ProfileCtrl);


    /* @ngInject */
    function ProfileCtrl($scope, ID_PROVIDER_ID, ORG_MEMBER_ROLE, HelperFormUtil, Member, MyInfo, ProjectMemberBiz, gettextCatalog, _) {


        var editProperties = {
            'Dooray' : ['department', 'position', 'tel', 'phone'],
            'SSO': []
        };

        $scope.isEditable = isEditable;
        $scope.isShowingInformation = isShowingInformation;
        $scope.getId = getId;
        $scope.getMemberRole = getMemberRole;
        $scope.submit = submit;
        $scope.cancel = cancel;

        _init();

        function isEditable(property) {
            var idProvider = $scope.myInfo.idProvider;
            if(!idProvider) {
                return;
            }
            return _.indexOf(editProperties[idProvider], property) > -1;
        }

        //사내 규정상 sso 이용자를 제외하고는 개인 정보노출 x
        function isShowingInformation(){
            return $scope.myInfo.idProvider === 'SSO';
        }

        function getId(myInfo) {
            return myInfo.idProvider === 'Dooray' ? myInfo.userCode : myInfo.emailAddress;
        }

        function getMemberRole() {
            var myRole = _.get($scope, 'myInfo.tenantMemberRole');
            return myRole ? _.find(ORG_MEMBER_ROLE, function(role) {
                return role.ROLE === myRole;
            }).NAME : ORG_MEMBER_ROLE.GUEST.NAME;
        }

        function submit() {
            if (HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            Member.changeWithUserCode({
                memberId: 'me',
                name: $scope.form.name,
                department: $scope.form.department,
                position: $scope.form.position,
                phone: $scope.form.phone,
                tel: $scope.form.tel
            }).then(function () {
                $scope.resultMsg = gettextCatalog.getString("저장되었습니다.");
                _reset();
            });
        }

        function cancel() {
            $scope.form = _.cloneDeep($scope.myInfo);
            $scope.resultMsg = gettextCatalog.getString("취소되었습니다.");
        }

        function _init(){
            $scope.FORM_NAME = 'profileForm';
            $scope.myInfo.idProvider = ID_PROVIDER_ID[$scope.myInfo.idProviderId];
            HelperFormUtil.bindService($scope, $scope.FORM_NAME);
            MyInfo.getMyOrgList().then(function (data) {
                $scope.myOrgList = data;
            });

            $scope.$watch('myInfo', function(newVal) {
                if(newVal) {
                    $scope.form = _.cloneDeep(newVal);
                }
            });
        }

        function _reset() {
            Member.resetCache();
            $scope.refreshMyInfo();
            ProjectMemberBiz.resetCache();
        }
    }
})();
