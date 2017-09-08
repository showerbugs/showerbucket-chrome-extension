(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayMemberImage', DoorayMemberImage);

    /* @ngInject */
    function DoorayMemberImage($parse) {
        return {
            templateUrl: function (element, attrs) {
                return attrs.oneTimeBinding ? 'modules/components/doorayMemberImage/doorayMemberImageOneTimeBinding.html' :
                    'modules/components/doorayMemberImage/doorayMemberImage.html';
            },
            scope: {
                size: '@',
                alt: '@',
                imageUrl: '<'
            },
            restrict: 'EA',
            link: function (scope, element, attrs) {
                var disableWatch = scope.$watch('imageUrl', function (newVal) {
                    if (_.isUndefined(newVal)) {
                        return;
                    }

                    if (!newVal) {
                        scope.emailAddress = $parse(attrs.emailAddress)(scope);
                    }

                    if (attrs.oneTimeBinding) {
                        disableWatch();
                    }
                });
            }
        };
    }

})();
