(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .factory('EmailAddressClassifyResource', EmailAddressClassifyResource)
        .factory('EmailAddressClassifyBiz', EmailAddressClassifyBiz);

    /* @ngInject */
    function EmailAddressClassifyResource($resource, ApiConfigUtil) {
        return $resource(ApiConfigUtil.wasContext() + '/email-addresses/classify', {}, {
            'query': {method: 'POST'}
        });
    }

    /* @ngInject */
    function EmailAddressClassifyBiz(EmailAddressClassifyResource) {
        return {
            query: function (emailList) {
                //var mock = {
                //    "header": {"resultCode": 0, "resultMessage": "", "isSuccessful": true},
                //    "result": {
                //        "qpitlove@naver.com": {
                //            "type": "distributionList",
                //            "distributionList": {
                //                "id": "1591838724142143829",
                //                //"name": "ne_cubrid",
                //                "emailAddress": "qpitlove@naver.com",
                //                "itemCount": 7
                //            }
                //            //"type": "emailUser",
                //            //"emailUser": {"emailAddress": "qpitlove@naver.com"}
                //        },
                //        "qpitlove+1000@gmail.com": {
                //            "type": "member",
                //            "member": {
                //                "id": "1683748197902212694",
                //                //"name": "qpitlove+1000",
                //                "emailAddress": "qpitlove+1000@gmail.com",
                //                "type": "member"
                //            }
                //        },
                //        "kim.jeongki@comt.in": {
                //            "type": "emailUser",
                //            "emailUser": {"emailAddress": "kim.jeongki@comt.in"}
                //        },
                //        "kim.jeongki@nhnent.dev.dooray.com": {
                //            "type": "emailUser",
                //            "emailUser": {"emailAddress": "kim.jeongki@nhnent.dev.dooray.com"}
                //        },
                //        "kim.jeongki@nhnent.com": {
                //            "type": "member",
                //            "member": {
                //                "id": "1683748197902212694",
                //                "emailAddress": "kim.jeongki@nhnent.com",
                //                "type": "member"
                //            }
                //        }
                //    }
                //};
                //return $q.when(ResponseWrapAppendHelper.create(mock.result));
                return EmailAddressClassifyResource.query({emailAddressList: emailList}).$promise.then(function (res) {
                    return res;
                });
            }
        };
    }

})();
