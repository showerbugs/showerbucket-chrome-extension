(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .controller('AuditLogCtrl', AuditLogCtrl);

    /* @ngInject */
    function AuditLogCtrl($scope, ApiPageSizeFactory, DateConvertUtil, FileAccessLogBiz, FileService, gettextCatalog, moment) {
        var DATE_FILTER_FORMAT = 'YYYY-MM-DD';

        _init();

        $scope.changeSize = changeSize;
        $scope.fetchList = fetchList;
        $scope.convertDateTimeInView = convertDateTimeInView;
        $scope.getFileType = getFileType;

        function _init() {
            $scope.LOG_TYPE_MAP = {
                upload: gettextCatalog.getString('업로드'),
                download: gettextCatalog.getString('다운로드')
            };
            $scope.sizeList = [100, 50, 30];
            $scope.current = {
                startDate: moment().subtract(3, 'months').format(),
                endDate: moment().format(),
                page: 0,
                size: ApiPageSizeFactory.getListApiSize(),
                showError: false
            };

            fetchList();

            $scope.$watch(function () {
                return {
                    startDate: $scope.current.startDate,
                    endDate: $scope.current.endDate
                };
            }, function (newVal, oldVal) {
                if (!_.isEqual(newVal, oldVal)) {
                    fetchList();
                }
            }, true);
        }

        /*function _makeMockData() {
            return $q.when(ResponseWrapAppendHelper.create({
                totalCount: 4,
                contents: [{
                    "id": "111",
                    "organizationMemberId": "1387695622474687232",
                    "fileId": "1784641143468549151",
                    "createdAt": "2016-09-28T17:03:23+0900",
                    "clientIp": "1.1.1.1",
                    "mimeType": "image/png",
                    "name": "스크린샷 2016-09-28 오후 5.03.10.png",
                    "type": "upload"
                }, {
                    "id": "112",
                    "organizationMemberId": "1387695621901053184",
                    "fileId": "1784641143468549151",
                    "createdAt": "2016-09-08T17:03:23+0900",
                    "clientIp": "1.1.1.1",
                    "mimeType": "image/png",
                    "name": "Inline-image-2016-09-28 16.42.45.938.png",
                    "type": "download"
                }, {
                    "id": "113",
                    "organizationMemberId": "1387695622474687232",
                    "fileId": "1784641143468549151",
                    "createdAt": "2016-09-28T17:03:23+0900",
                    "clientIp": "1.1.1.1",
                    "mimeType": "image/png",
                    "name": "스크린샷 2016-09-28 오후 5.03.10.png",
                    "type": "upload"
                }, {
                    "id": "1141",
                    "organizationMemberId": "1387695621901053184",
                    "fileId": "1784641143468549151",
                    "createdAt": "2016-09-08T17:03:23+0900",
                    "clientIp": "1.1.1.1",
                    "mimeType": "image/png",
                    "name": "Inline-image-2016-09-28 16.42.45.938.png",
                    "type": "download"
                }],
                references: {
                    organizationMemberMap: {
                        "1387695622474687232": {
                            "name": "김건우[건빵] \uD83C\uDF83:)",
                            "emailAddress": "keonwoo.kim@nhnent.com",
                            "department": "협업시스템개발팀"
                        },
                        "1387695621901053184": {
                            "name": "백창열[요다]",
                            "emailAddress": "cybaek@nhnent.com",
                            "department": "B-Flat개발랩"
                        }
                    }
                }
            }))
        }*/

        function changeSize() {
            ApiPageSizeFactory.changeOrApiSize($scope.current.size);
            fetchList();
        }

        function fetchList() {
            var startDateMoment = moment($scope.current.startDate),
                endDateMoment = moment($scope.current.endDate);

            if (startDateMoment.isAfter(endDateMoment)) {
                $scope.current.showError = true;
                return;
            }
            $scope.current.showError = false;

            var params = {
                startDate: moment($scope.current.startDate).format(DATE_FILTER_FORMAT),
                endDate: moment($scope.current.endDate).format(DATE_FILTER_FORMAT),
                page: $scope.current.page,
                size: $scope.current.size
            };
            //_makeMockData()
                FileAccessLogBiz.fetchMessengerLogList(params).then(function (result) {
                    $scope.refreshScroll();
                    $scope.current.totalLogCount = result.totalCount();
                    $scope.logs = result.contents();
                });
        }

        function convertDateTimeInView(date) {
            return DateConvertUtil.convertDateTimeInView(date);
        }

        function getFileType(mimeType) {
            return FileService.getFileType(mimeType);
        }
    }

})();
