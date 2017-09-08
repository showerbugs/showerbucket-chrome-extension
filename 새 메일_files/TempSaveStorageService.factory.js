(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('TempSaveStorageService', TempSaveStorageService);

    /* @ngInject */
    function TempSaveStorageService($timeout, MyCryptoJSStorage, moment, _) {
        var DEFAULT_MAX_SAVE_LENGTH = 10,
            DEFAULT_MAX_SAVE_DAYS = 7,
            TEMPSAVE_ORDER_POSTFIX_KEY = '.orderstack';

        return {
            createStoragekeyMap: createStoragekeyMap,
            removeStorage: removeStorage,
            rotateSaveStorage: rotateSaveStorage
        };

        function createStoragekeyMap(storagePrefixKey, key) {
            return {
                id: key,
                orderKey: storagePrefixKey + TEMPSAVE_ORDER_POSTFIX_KEY,
                dataKey: storagePrefixKey + '-' + key
            };
        }

        function removeStorage(storagePrefixKey, defaultId) {
            var keyMap = createStoragekeyMap(storagePrefixKey, defaultId);
            var orderStackFromStorage = MyCryptoJSStorage.get(keyMap.orderKey) || [];
            _.remove(orderStackFromStorage, {'id': keyMap.id});
            MyCryptoJSStorage.set(keyMap.orderKey, orderStackFromStorage);
            MyCryptoJSStorage.remove(keyMap.dataKey);
        }

        function rotateSaveStorage(storagePrefixKey, defaultId, valueObject, tmpFileIdList, option) {
            var updatedTimestamp = moment().valueOf();
            option = option || {};

            var keyMap = createStoragekeyMap(storagePrefixKey, defaultId);

            //자기 자신을 맨 뒤로 저장하기 위해 기존에 있던 내용 제거
            MyCryptoJSStorage.remove(keyMap.dataKey);
            // 먼저 스토리지에 item을 저장함
            MyCryptoJSStorage.set(keyMap.dataKey, {
                value: valueObject,
                tmpFileIdList: tmpFileIdList,
                updatedTimestamp: updatedTimestamp
            });

            // 성능향상을 위해 저장의 경우 비동기적으로 처리
            $timeout(function () {
                var orderStackFromStorage = MyCryptoJSStorage.get(keyMap.orderKey) || [];

                //자기 자신을 맨 뒤로 저장하기 위해 기존에 있던 내용 제거
                _.remove(orderStackFromStorage, {'id': keyMap.id});


                //10개 이상 임시저장은 삭제함
                while (orderStackFromStorage.length >= (option.maxSaveLength || DEFAULT_MAX_SAVE_LENGTH)) {
                    var order = orderStackFromStorage.shift();
                    MyCryptoJSStorage.remove(createStoragekeyMap(storagePrefixKey, order.id).dataKey);
                }

                //7day가 지난 임시저장은 삭제함
                var momentForValidDay = moment().subtract((option.maxSaveDays || DEFAULT_MAX_SAVE_DAYS), 'day');
                var removeDatasByTimeToLiveOver = _.filter(orderStackFromStorage, function (order) {
                    var updatedTimestamp = _.get(order, 'updatedTimestamp');
                    return (!updatedTimestamp || moment(updatedTimestamp).isBefore(momentForValidDay));
                });
                _.remove(orderStackFromStorage, function (order) {
                    if (_.includes(removeDatasByTimeToLiveOver, order)) {
                        MyCryptoJSStorage.remove(createStoragekeyMap(storagePrefixKey, order.id).dataKey);
                        return true;
                    }
                    return false;
                });

                //모든 조건 만족 후 스토리지 맨 마지막 위치에 저장
                orderStackFromStorage.push({
                    id: keyMap.id,
                    updatedTimestamp: updatedTimestamp
                });
                MyCryptoJSStorage.set(keyMap.orderKey, orderStackFromStorage);
            }, 0, false);
        }
    }

})();
