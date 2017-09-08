(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('calDavSetting', {
            templateUrl: 'modules/setting/user/calDavSetting/calDavSetting.html',
            controller: CalDavSetting
        });

    /* @ngInject */
    function CalDavSetting(API_PAGE_SIZE, MemberMeEmailAddresses, MemberTokenRepository, MessageModalFactory, MyInfo, gettextCatalog, _) {
        var $ctrl = this,
            DOORAY_ID_PROVIDER_ID = '5';

        $ctrl.regenerateKey = regenerateKey;
        $ctrl.MemberTokenRepository = MemberTokenRepository;

        _init();

        function _init() {
            MyInfo.getMyInfo().then(function (myInfo) {
                $ctrl.isSignedInDooray = myInfo.idProviderId === DOORAY_ID_PROVIDER_ID;

                if (!$ctrl.isSignedInDooray) {
                    MemberTokenRepository.getOrFetch()/*.catch(function () {
                        MessageModalFactory.alert(gettextCatalog.getString('1일, 최대 5개까지 새 비밀번호를 받을 수 있습니다.'));
                    })*/;
                }
            });

            MemberMeEmailAddresses.fetchList({size: API_PAGE_SIZE.ALL}).then(function (result) {
                $ctrl.calDavId = _.get(_.find(result.contents(), {'default': true}), 'emailAddress');
            });
        }

        function regenerateKey() {
            if (_.isEmpty(MemberTokenRepository.getToken())) {
                return;
            }

            var msg = gettextCatalog.getString('비밀번호를 새로 받으면, 사용 중인 메일과 캘린더 프로그램 또는 어플리케이션에 새로 받은 비밀번호로 다시 등록해야 합니다.<br>기존 비밀번호를 만료시키고, 새로 받으시겠습니까?');

            MessageModalFactory.confirm(msg, '', {confirmBtnLabel: gettextCatalog.getString('새로 받기')}).result.then(function () {
                MemberTokenRepository.regenerate(MemberTokenRepository.getToken().id).catch(function () {
                    return MemberTokenRepository.fetchOrGenerateAndCache();
                });
            });
        }

    }

})();
