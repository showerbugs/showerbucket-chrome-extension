(function () {

    'use strict';

    angular
        .module('doorayWebApp.share')
        .factory('StreamCountRepository', StreamCountRepository)
        .factory('ProjectCountRepository', ProjectCountRepository)
        .factory('MailCountRepository', MailCountRepository)
        .factory('CountRepositoryBuilder', CountRepositoryBuilder);

    /* @ngInject */
    function StreamCountRepository(CountRepositoryBuilder, HelperConfigUtil, ServiceUseUtil) {
        return CountRepositoryBuilder.make()
            .withParam({
                service: 'stream',
                services: HelperConfigUtil.enableNewFeature() ?
                    'project,mail,calendar' :
                    ServiceUseUtil.getUseServiceNames().join(',')
            })
            .withTotalCount(function (model) {
                return Math.min(99, _.get(model, 'counts.stream.unread', 0));
            })
            .build();
    }

    /* @ngInject */
    function ProjectCountRepository(CountRepositoryBuilder, _) {
        return CountRepositoryBuilder.make()
            .withParam({service: 'project', fields: 'post'})
            .withTotalCount(function (model) {
                return Math.min(99, _(_.get(model, 'counts.post')).map('unread').filter().sum());
            })
            .build();
    }

    /* @ngInject */
    function MailCountRepository(PATTERN_REGEX, CountRepositoryBuilder, _) {
        return CountRepositoryBuilder.make()
            .withParam({service: 'mail'})
            .withTotalCount(function (model) {
                return Math.min(999999, _.reduce(_.get(model, 'counts.folders'), function (sum, count, key) {
                    return sum + ((PATTERN_REGEX.doorayId.test(key) || key === 'inbox') ? _.get(count, 'unread', 0) : 0);
                }, 0));
            })
            .build();
    }

    /* @ngInject */
    function CountRepositoryBuilder(CountResource, HelperPromiseUtil) {
        return {
            make: make
        };

        function make() {
            var _calcTotalCount = angular.noop,
                _param = {};

            return {
                withParam: withParam,
                withTotalCount: withTotalCount,
                build: build
            };

            function withParam(param) {
                _param = param;
                return this;
            }

            function withTotalCount(func) {
                _calcTotalCount = func;
                return this;
            }

            function build() {
                var model = {},
                    totalCount = 0,
                    resource = null;

                return {
                    fetchAndCache: fetchAndCache,
                    getModel: getModel,
                    getTotalCount: getTotalCount
                };

                function fetchAndCache() {
                    HelperPromiseUtil.cancelResource(resource);
                    resource = CountResource.get(_param);

                    return resource.$promise.then(function (result) {
                        model = result.contents();
                        totalCount = _calcTotalCount(model);
                        return result;
                    });
                }

                function getModel() {
                    return model;
                }

                function getTotalCount() {
                    return totalCount;
                }
            }
        }
    }

})();
