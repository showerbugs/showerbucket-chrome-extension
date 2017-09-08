(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('MailDetail', MailDetailFactory);

    //TODO: 차후 maildetail과 taskdetail을 통일하고 서비스를 인잭션 받아서 처리
    /* @ngInject */
    function MailDetailFactory($q, HelperPromiseUtil, MailDisplayHelperFactory, MailsBiz) {
        function MailDetail() {
            this.name = '';
            this.status = {
                loading: false,
                isNotSelected: true,
                fileLoading: false,
                isDraft: false
            };
            this.data = {};
            this.param = {};
            var self = this;

            this.setParam = function (mailId) {
                self.param = {mailId: mailId};
                self.status.isNotSelected = false;
                this.refreshItem();
            };
            this.assignMailDisplayProperties = function (mail) {
                return MailDisplayHelperFactory.assignDisplayPropertiesInView(mail);
            };
            this.refreshItem = function () {
                self.status.loading = false;

                return MailsBiz.fetchMail(self.param).then(function (data) {
                    self.data = data.contents();
                    self.assignMailDisplayProperties(self.data);
                    return self.data;
                }, function (errorResponse) {
                    return $q.reject(errorResponse);
                }).finally(function () {
                    self.status.loading = true;
                });
            };

            var removePromise;

            this.remove = {
                action: function (target) {
                    if (HelperPromiseUtil.isResourcePending(removePromise)) {
                        return $q.reject();
                    }

                    return this[target]();
                },
                draft: function () {
                    var id = self.param.mailId;
                    return MailsBiz.removeDraft({'draftId': id});
                },
                mail: function () {
                    return MailsBiz.removeMail(self.param).$promise;
                }
            };
            this.reset = function () {
                this.data = {};
                this.status.loading = false;
            };
        }

        return MailDetail;
    }

})();
