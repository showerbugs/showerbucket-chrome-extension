(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.admin')
        .factory('OrgMailAttachmentFormValidator', OrgMailAttachmentFormValidator)
        .controller('OrgMailSettingsCtrl', OrgMailSettingsCtrl);

    /* @ngInject */
    function OrgMailAttachmentFormValidator(BytesFormatUtil, gettextCatalog) {
        return {
            validateBigFileAttribute: validateBigFileAttribute
        };

        function validateBigFileAttribute(bigFileSettings) {
            var MIN_FILESIZE_LIMIT = BytesFormatUtil.caculateBytesFromNumberWithUnit(1, 'MB');
            var MAX_TOTAL_FILESIZE_LIMIT = BytesFormatUtil.caculateBytesFromNumberWithUnit(5, 'GB');
            var MAX_EACH_FILESIZE_LIMIT = BytesFormatUtil.caculateBytesFromNumberWithUnit(2, 'GB');

            var fileTotalSizePerMailLimitValue = BytesFormatUtil.caculateBytesFromNumberWithUnit(bigFileSettings.fileTotalSizePerMailLimit.inputValue, bigFileSettings.fileTotalSizePerMailLimit.unit);
            var fileSizeLimitValue = BytesFormatUtil.caculateBytesFromNumberWithUnit(bigFileSettings.fileSizeLimit.inputValue, bigFileSettings.fileSizeLimit.unit);

            var minMaxValues;

            if (_invalidateIsOverMBValue(bigFileSettings.fileTotalSizePerMailLimit.inputValue, bigFileSettings.fileTotalSizePerMailLimit.unit)) {
                return {
                    title: gettextCatalog.getString('전체 용량'),
                    msg: gettextCatalog.getString('1024MB 이상인 경우 GB로 변경해 주세요.')
                };
            }

            if (_invalidateIsOverMBValue(bigFileSettings.fileSizeLimit.inputValue, bigFileSettings.fileSizeLimit.unit)) {
                return {
                    title: gettextCatalog.getString('개별 파일 용량'),
                    msg: gettextCatalog.getString('1024MB 이상인 경우 GB로 변경해 주세요.')
                };
            }

            if (fileTotalSizePerMailLimitValue < fileSizeLimitValue) {
                return {
                    title: gettextCatalog.getString('대용량 첨부'),
                    msg: gettextCatalog.getString('개별 파일 용량은 전체 용량보다 작게 설정해 주세요.')
                };
            }

            minMaxValues = {min: MIN_FILESIZE_LIMIT, max: MAX_TOTAL_FILESIZE_LIMIT};
            if (_invalidateMinMaxValue(fileTotalSizePerMailLimitValue, minMaxValues)) {
                return {
                    title: gettextCatalog.getString('전체 용량'),
                    msg: gettextCatalog.getString('{{min}}~{{max}}로 설정할 수 있습니다.', {min: '1MB', max: '5GB'})
                };
            }

            minMaxValues = {min: MIN_FILESIZE_LIMIT, max: MAX_EACH_FILESIZE_LIMIT};
            if (_invalidateMinMaxValue(fileSizeLimitValue, minMaxValues)) {
                return {
                    title: gettextCatalog.getString('개별 파일 용량'),
                    msg: gettextCatalog.getString('{{min}}~{{max}}로 설정할 수 있습니다.', {min: '1MB', max: '2GB'})
                };
            }

            minMaxValues = {min: 1, max: 10};
            if (_invalidateMinMaxValue(bigFileSettings.fileCountPerMailLimit.inputValue, minMaxValues)) {
                return {
                    title: gettextCatalog.getString('전체 첨부 개수'),
                    msg: gettextCatalog.getString('{{min}}~{{max}}개로 설정할 수 있습니다.', minMaxValues)
                };
            }

            minMaxValues = {min: 1, max: 30};
            if (_invalidateMinMaxValue(bigFileSettings.retentionPeriodDays.inputValue, minMaxValues)) {
                return {
                    title: gettextCatalog.getString('다운로드 기간'),
                    msg: gettextCatalog.getString('{{min}}~{{max}}일로 설정할 수 있습니다.', minMaxValues)
                };
            }

            minMaxValues = {min: 1, max: 20};
            if (_invalidateMinMaxValue(bigFileSettings.downloadCountLimit.inputValue, minMaxValues)) {
                return {
                    title: gettextCatalog.getString('다운로드 횟수'),
                    msg: gettextCatalog.getString('{{min}}~{{max}}회로 설정할 수 있습니다.', minMaxValues)
                };
            }
            return {};
        }

        function _invalidateIsOverMBValue(inputValue, unit) {
            return unit === 'MB' && inputValue >= 1024;
        }

        function _invalidateMinMaxValue(inputValue, minMaxValues) {
            return (inputValue < minMaxValues.min || inputValue > minMaxValues.max);
        }
    }

    /* @ngInject */
    function OrgMailSettingsCtrl($q, $scope, $timeout,
                                   MailAttachmentSettingsRepository, MailSecuritySettingsRepository,
                                   BytesFormatUtil, MessageModalFactory, OrgMailAttachmentFormValidator,
                                   gettextCatalog, _) {

        $scope.inputRangeOptions = {
            fileTotalSizePerMailLimit: {
                GB: {step: .1, min: 1, max: 5},
                MB: {step: 1, min: 1, max: 1023}
            },
            fileSizeLimit: {
                GB: {step: .1, min: 1, max: 2},
                MB: {step: 1, min: 1, max: 1023}
            },
            fileCountPerMailLimit: {step: 1, min: 1, max: 10},
            retentionPeriodDays: {step: 1, min: 1, max: 30},
            downloadCountLimit: {step: 1, min: 1, max: 20}
        };

        $scope.selectOptions = {
            fileSizeUnit: [{name: 'GB', value: 'GB'}, {name: 'MB', value: 'MB'}],
            fileTotalSizePerMailLimit: {
                GB: [
                    {name: 1, value: 1},
                    {name: 2, value: 2},
                    {name: 5, value: 5},
                    {name: gettextCatalog.getString('직접입력'), value: null}
                ],
                MB: [
                    {name: 50, value: 50},
                    {name: 100, value: 100},
                    {name: 500, value: 500},
                    {name: gettextCatalog.getString('직접입력'), value: null}
                ]
            },
            fileSizeLimit: {
                GB: [
                    {name: 1, value: 1},
                    {name: 2, value: 2},
                    {name: gettextCatalog.getString('직접입력'), value: null}
                ],
                MB: [
                    {name: 50, value: 50},
                    {name: 100, value: 100},
                    {name: 500, value: 500},
                    {name: gettextCatalog.getString('직접입력'), value: null}
                ]
            },
            fileCountPerMailLimit: [
                {name: 5, value: 5},
                {name: 10, value: 10},
                {name: gettextCatalog.getString('직접입력'), value: null}
            ],
            retentionPeriodDays: [
                {name: 7, value: 7},
                {name: 14, value: 14},
                {name: 30, value: 30},
                {name: gettextCatalog.getString('직접입력'), value: null}
            ],
            downloadCountLimit: [
                {name: 10, value: 10},
                {name: 20, value: 20},
                {name: gettextCatalog.getString('직접입력'), value: null}
            ]
        };

        $scope.selectedAttachment = _assignAttachmentDefaultValues();
        $scope.selectedSecurity = _assignSecurityDefaultValues();
        $scope.enableInputBySelectModel = enableInputBySelectModel;
        $scope.resetFileSizeSelectModel = resetFileSizeSelectModel;

        var resultMessage;
        $scope.showResultMessage = showResultMessage;
        $scope.submit = submit;
        $scope.cancel = cancel;

        _initalize();

        function enableInputBySelectModel(selectedTarget, value) {
            selectedTarget.enableInput = _.isNull(value);
            selectedTarget.focusInput = selectedTarget.enableInput;
            selectedTarget.inputValue = value;  //selectpicker.value -> input.value
        }

        function resetFileSizeSelectModel(selectedOptions, selectedTarget) {
            selectedTarget.enableInput = false;
            selectedTarget.focusInput = false;
            selectedTarget.selectedValue = selectedOptions[0].value;
            selectedTarget.inputValue = selectedOptions[0].value;
        }

        function submit() {
            var validateResult = OrgMailAttachmentFormValidator.validateBigFileAttribute($scope.selectedAttachment.bigfile);
            if (!_.isEmpty(validateResult)) {
                return MessageModalFactory.alert(validateResult.msg, validateResult.title);
            }

            var attachmentParams = {}, securityParams = {};
            attachmentParams.enableBigfile = $scope.selectedAttachment.enableBigfile.inputValue;
            attachmentParams.bigfile = _.reduce($scope.selectedAttachment.bigfile, function (result, valueObject, prop) {
                //input, selectpicker 에서 사용하기 위한 값을 bytes로 변환함
                if (_isFileSizeProperty(prop)) {
                    result[prop] = BytesFormatUtil.caculateBytesFromNumberWithUnit(valueObject.inputValue, valueObject.unit);
                } else {
                    result[prop] = valueObject.inputValue;
                }
                return result;
            }, {});

            securityParams.use = $scope.selectedSecurity.use.inputValue;

            return $q.all([
                MailAttachmentSettingsRepository.update(attachmentParams),
                MailSecuritySettingsRepository.update(securityParams)
            ]).then(function () {
                resultMessage = gettextCatalog.getString("저장되었습니다.");
                $timeout(function () {
                    resultMessage = '';
                }, 1000);
            });
        }

        function cancel() {
            _assignValuesFromAttachmentsRepository();
            _assignValuesFromSecurityRepository();
        }

        function showResultMessage() {
            return resultMessage;
        }

        function _initalize() {
            MailAttachmentSettingsRepository.fetchAndCache();
            MailSecuritySettingsRepository.fetchAndCache();
            $scope.$watch(MailAttachmentSettingsRepository.getContent, _assignValuesFromAttachmentsRepository);
            $scope.$watch(MailSecuritySettingsRepository.getContent, _assignValuesFromSecurityRepository);
        }

        function _isFileSizeProperty(prop) {
            return prop === 'fileTotalSizePerMailLimit' || prop === 'fileSizeLimit';
        }

        function _assignValuesFromAttachmentsRepository() {
            if (_.isEmpty(MailAttachmentSettingsRepository.getContent())) {
                return;
            }

            $scope.selectedAttachment.mimeSizeLimit = {value: MailAttachmentSettingsRepository.getContent().value.mimeSizeLimit};
            $scope.selectedAttachment.enableBigfile = {inputValue: MailAttachmentSettingsRepository.getContent().value.enableBigfile};
            $scope.selectedAttachment.bigfile = _.reduce(MailAttachmentSettingsRepository.getContent().value.bigfile, function (result, value, prop) {
                var byteCapacityValues, enableInput;
                //bytes 값을 input, selectpicker 에서 사용하기 위한 값으로 변환 {selectedValue, inputValue, unit} 추가
                if (_isFileSizeProperty(prop)) {
                    byteCapacityValues = BytesFormatUtil.caculateByteCapacityValues(value);
                    enableInput = !_.find($scope.selectOptions[prop][byteCapacityValues.unit], {value: byteCapacityValues.number});
                    result[prop] = _.assign(result[prop], {
                        focusInput: false,
                        enableInput: enableInput,
                        selectedValue: enableInput ? null : byteCapacityValues.number,
                        inputValue: byteCapacityValues.number,
                        unit: byteCapacityValues.unit,
                        value: value
                    });
                } else {
                    enableInput = !_.find($scope.selectOptions[prop], {value: value});
                    result[prop] = {
                        focusInput: false,
                        enableInput: enableInput,
                        selectedValue: enableInput ? null : value,
                        inputValue: value,
                        value: value
                    };
                }
                return result;
            }, {});
        }

        function _assignValuesFromSecurityRepository() {
            if (_.isEmpty(MailSecuritySettingsRepository.getContent())) {
                return;
            }
            $scope.selectedSecurity.use = {inputValue: MailSecuritySettingsRepository.getContent().value.use};
        }

        function _assignSecurityDefaultValues() {
            return {
                use: false
            };
        }

        function _assignAttachmentDefaultValues() {
            return {
                mimeSizeLimit: {value: Math.pow(1024, 2) * 20},
                enableBigfile: {inputValue: false},
                bigfile: {
                    fileSizeLimit: {
                        focusInput: false,
                        enableInput: false,
                        selectedValue: null,
                        inputValue: null,
                        unit: "MB",
                        value: 0
                    },
                    fileTotalSizePerMailLimit: {
                        focusInput: false,
                        enableInput: false,
                        selectedValue: null,
                        inputValue: null,
                        unit: "GB",
                        value: 0
                    },
                    fileCountPerMailLimit: {
                        focusInput: false,
                        enableInput: false,
                        selectedValue: null,
                        inputValue: null,
                        value: 0
                    },
                    downloadCountLimit: {
                        focusInput: false,
                        enableInput: false,
                        selectedValue: null,
                        inputValue: null,
                        value: 0
                    },
                    retentionPeriodDays: {
                        focusInput: false,
                        enableInput: false,
                        selectedValue: null,
                        inputValue: null,
                        value: 0
                    }
                }
            };
        }

    }

})();
