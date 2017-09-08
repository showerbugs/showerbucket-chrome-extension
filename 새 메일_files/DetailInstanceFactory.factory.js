(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .factory('DetailInstanceFactory', DetailInstanceFactory);

    /* @ngInject */
    function DetailInstanceFactory(ITEM_TYPE, MailDetail, ScheduleDetail, TaskDetail, _) {
        var instances = { };

        return {
            createDummyItem: createDummyItem,
            getOrMakeSelectedItem: function (type) {
                if (!type) {
                    return;
                }
                return getOrMakeInstance(makeInstanceName('selected', type), type);
            },
            getOrMakeModalItem: function (type) {
                if (!type) {
                    return;
                }
                return getOrMakeInstance(makeInstanceName('modal', type), type);
            },
            getOrMakeStreamItem: function (type) {
                if (!type) {
                    return;
                }
                return getOrMakeInstance(makeInstanceName('stream', type), type);
            },
            getStreamItem: function (type) {
                if (!type) {
                    return;
                }
                return getStreamInstance(makeInstanceName('stream', type));
            },
            removeStreamItem: function (type) {
                var targetName = makeInstanceName('stream', type);
                delete instances[targetName];
            }
        };

        function makeInstanceName(prefix, type) {
            return prefix + _.capitalize(type);
        }

        function createDummyItem(type) {
            if (!type) {
                return;
            }

            var newDetailInstance = createDetailInstance(type);
            newDetailInstance.name = 'dummy';
            return newDetailInstance;
        }

        function createDetailInstance(type) {
            if (type === ITEM_TYPE.POST) {
                return new TaskDetail();
            } else if (type === ITEM_TYPE.MAIL) {
                return new MailDetail();
            } else if (type === ITEM_TYPE.SCHEDULE) {
                return new ScheduleDetail();
            }
        }

        function getOrMakeInstance(name, type) {
            if (_.isEmpty(instances[name])) {
                instances[name] = createDetailInstance(type);
                instances[name].name = name;
            }
            return instances[name];
        }

        function getStreamInstance(name) {
            return instances[name];
        }
    }

})();
