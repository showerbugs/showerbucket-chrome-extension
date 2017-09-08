(function () {

    'use strict';

    angular
        .module('doorayWebApp.stream', [])
        .constant('STREAM_SHORT_CONTENT_LENGTH', 200)
        .constant('STREAM_ITEM_TYPE', {
            POST: 'post',
            EVENT: 'event',
            MAIL: 'mail',
            PROJECT: 'project',
            SCHEDULE: 'schedule'
        });
})();
