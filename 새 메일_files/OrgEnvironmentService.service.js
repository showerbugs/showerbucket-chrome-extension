(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .service('OrgEnvironmentService', OrgEnvironmentService);

    /* @ngInject */
    function OrgEnvironmentService(gettextCatalog, _) {
        var SERVICE_KEYS = {
                DOORAY_HOME: 'home-web',
                DOORAY_PROJECT: 'project-web',
                DOORAY_MAIL: 'mail-web',
                DOORAY_CALENDAR: 'calendar-web',
                DOORAY_ADDRESS: 'address-web',
                DOORAY_APP: 'dooray-mobile',
                MESSENGER_DESKTOP: 'messenger-web',
                MESSENGER_MOBILE: 'messenger-mobile'
            },
            SERVICE_ORDER = ['DOORAY_PROJECT', 'DOORAY_MAIL', 'DOORAY_CALENDAR', 'DOORAY_APP'],
                //['DOORAY_HOME', 'DOORAY_PROJECT', 'DOORAY_MAIL', 'DOORAY_CALENDAR', 'DOORAY_ADDRESS', 'DOORAY_APP', 'MESSENGER_DESKTOP', 'MESSENGER_MOBILE'],
            SERVICE_NAMES = {},
            SERVICE_GROUP_MAP = {
                DOORAY: gettextCatalog.getString('두레이'),
                MESSENGER: gettextCatalog.getString('메신저')
            },
            ORG_ACL_OPTIONS = [{
                name: gettextCatalog.getString('허용'),
                allow: true
            }, {
                name: gettextCatalog.getString('차단'),
                allow: false
            }],
            MODAL_TAB_KEYS = {
                IP: 'ip',
                MEMBER: 'member'
            };

        SERVICE_NAMES[SERVICE_KEYS.DOORAY_HOME] = gettextCatalog.getString('회사 홈');
        SERVICE_NAMES[SERVICE_KEYS.DOORAY_PROJECT] = gettextCatalog.getString('프로젝트');
        SERVICE_NAMES[SERVICE_KEYS.DOORAY_MAIL] = gettextCatalog.getString('메일');
        SERVICE_NAMES[SERVICE_KEYS.DOORAY_CALENDAR] = gettextCatalog.getString('캘린더');
        SERVICE_NAMES[SERVICE_KEYS.DOORAY_ADDRESS] = gettextCatalog.getString('주소록');
        SERVICE_NAMES[SERVICE_KEYS.DOORAY_APP] = gettextCatalog.getString('모바일 앱');
        SERVICE_NAMES[SERVICE_KEYS.MESSENGER_DESKTOP] = gettextCatalog.getString('데스크톱 앱');
        SERVICE_NAMES[SERVICE_KEYS.MESSENGER_MOBILE] = gettextCatalog.getString('모바일 앱');

        return {
            SERVICE_KEYS: SERVICE_KEYS,
            SERVICE_NAMES: SERVICE_NAMES,
            SERVICE_GROUP_MAP: SERVICE_GROUP_MAP,
            ORG_ACL_OPTIONS: ORG_ACL_OPTIONS,
            MODAL_TAB_KEYS: MODAL_TAB_KEYS,
            setInitialValue: setInitialValue,
            getServiceList: getServiceList,
            getServiceGroupInfo: getServiceGroupInfo,
            makeIpAclRequestParam: makeIpAclRequestParam
        };

        function setInitialValue(service) {
            service._getOrSetProp('defaultAcl', service.ipAcl.splice(service.ipAcl.length - 1, 1)[0].allow);
            service._getOrSetProp('ipAllowedAcl', _.filter(service.ipAcl, {allow: true}));
            service._getOrSetProp('ipDeniedAcl', _.filter(service.ipAcl, {allow: false}));
            service._getOrSetProp('memberAllowedAcl', _.filter(service.memberAcl, {allow: true}));
            service._getOrSetProp('memberDeniedAcl', _.filter(service.memberAcl, {allow: false}));
        }

        function getServiceList() {
            return _.map(SERVICE_ORDER, function (value) {
                return SERVICE_KEYS[value];
            });
        }

        function getServiceGroupInfo() {
            var result = {};
            _.forEach(SERVICE_GROUP_MAP, function (value, key) {
                _setRowGroupInfo(result, key, value);
            });
            return result;
        }

        function _setRowGroupInfo(result, prefix, groupName) {
            var groupedKeyList = _.filter(SERVICE_ORDER, function (value) {
                return _.startsWith(value, prefix);
            });
            result[SERVICE_KEYS[groupedKeyList[0]]] = {
                name: groupName,
                rowspan: groupedKeyList.length
            };
        }

        function makeIpAclRequestParam(service) {
            return service.ipAcl.concat({ipCidr: 'all', allow: service._getOrSetProp('defaultAcl')});
        }
    }

})();
