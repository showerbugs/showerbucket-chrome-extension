/**
 * Created by nhnent on 15. 12. 1..
 */
(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .controller('OrgLinkageCtrl', OrgLinkageCtrl)
        .controller('LinkageFormCtrl', LinkageFormCtrl)
        .factory('LinkageModalFormFactory', LinkageModalFormFactory)
        .factory('AuthorityModalFormFactory', AuthorityModalFormFactory)
        .factory('LinkageUtil', LinkageUtil);

    /* @ngInject */
    function OrgLinkageCtrl($scope, $timeout, $uiViewScroll, Bot, DateConvertUtil, DomainRepository, HelperPromiseUtil, LinkageModalFormFactory, LinkageUtil, _) {
        var promise = null;

        $scope.activeIndex = 0;
        $scope.LinkageUtil = LinkageUtil;
        $scope.changeTab = function (tab) {
            $scope.current.tab = tab;
            if (tab === "connected") {
                fetchBotList();
            }
        };

        function fetchBotList() {
            Bot.fetchMyList().then(function (result) {
                $scope.botList = result.contents();
                // track by를 위해 수정
                _.forEach(result.contents(), function (bot) {
                    bot._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                });
            });
        }

        $scope.updateBot = function (bot, index) {
            LinkageModalFormFactory.open(bot).then(function (result) {
                result.result.then(function (changedBot) {
                    // track by를 위해 수정
                    changedBot._getOrSetProp('fetchedAt', DateConvertUtil.makeTimestamp());
                    $scope.botList.splice(index, 1, changedBot);
                });
            });
        };

        $scope.getServiceImage = function (bot) {
            var service = _.find($scope.connectableServices, {'serviceType': bot.serviceType});
            return _.get(service, 'image', '/assets/images/refactoring/bi/d-blue.png' );
        };

        $scope.deleteBot = function (bot) {
            Bot.delete(bot);
            _.remove($scope.botList, bot);
        };

        var services = {
            Jenkins: {
                'name': 'Jenkins',
                'serviceType': 'jenkins',
                'image': '/assets/images/other_service/jenkins.png'
            },
            GitHub: {
                'name': 'GitHub',
                'serviceType': 'github',
                'image': '/assets/images/other_service/github.png'
            },
            Trello: {
                'name': 'Trello',
                'serviceType': 'trello',
                'authority': {
                    'controller': 'TrelloCtrl',
                    'templateUrl': 'modules/setting/user/linkage/authority/trello/trelloAuthority.html'

                },
                'image': '/assets/images/other_service/trello.png'
            },
            NewRelic: {
                'name': 'NewRelic',
                'serviceType': 'newrelic',
                'image': '/assets/images/other_service/new_relic.png'
            },
            JIRA: {
                'name': 'JIRA',
                'serviceType': 'jira',
                'image': '/assets/images/other_service/jira.png'
            },
            Bitbucket: {
                'name': 'Bitbucket',
                'serviceType': 'bitbucket',
                'image': '/assets/images/other_service/bitbucket.png'
            },
            IFTTT: {
                'name': 'IFTTT',
                'serviceType': 'ifttt',
                'image': '/assets/images/other_service/ifttt.png'
            },
            Incoming: {
                'name': 'Incoming',
                'serviceType': 'incoming',
                'image': '/assets/images/refactoring/bi/d-blue.png'
            }
        };

        DomainRepository.defaultDomainPromise().then(function(domain) {
            var _serviceNames = domain === 'nhnent.dooray.com' ?
                    ["Jenkins", "GitHub", "NewRelic", "JIRA", "Bitbucket", "IFTTT", "Incoming"] :
                    ["Jenkins", "GitHub", "Trello", "NewRelic", "JIRA", "Bitbucket", "IFTTT", "Incoming"];
            $scope.connectableServices = _.map(_serviceNames, function (name) {
                return services[name];
            });
        });

        $scope.addConnect = function (service) {
            if (HelperPromiseUtil.isResourcePending(promise)) {
                return;
            }

            var defaultBot = {
                serviceName: service.name,
                serviceType: service.serviceType
            };
            promise = Bot.add({serviceType: service.serviceType}).then(function (result) {
                LinkageModalFormFactory.open(_.assign(defaultBot, result.result()[0]), true, service.authority).then(function () {
                    $scope.changeTab('connected');
                    $scope.activeIndex = 0;
                    $timeout(function() {
                        $uiViewScroll(angular.element('.linkable-table-bottom'));
                    }, 200, false);
                });
                return result;
            });
        };

    }

    /* @ngInject */
    function LinkageModalFormFactory($uibModal) {
        var openForm = function (bot, isCreate, authority) {
            return $uibModal.open({
                'templateUrl': 'modules/setting/user/linkage/linkageForm.html',
                'backdrop': 'static',
                'windowClass': 'dooray-setting-content setting-modal linkage-modal',
                'controller': LinkageFormCtrl,
                'resolve': {
                    authority: function () {
                        return authority;
                    },
                    bot: function () {
                        return bot || {};
                    },
                    isCreate: function () {
                        return isCreate || false;
                    }
                }
            });
        };
        return {
            open: function (bot, isCreate, authority) {
                return openForm(bot, isCreate, authority).result;
            }
        };
    }

    /* @ngInject */
    function AuthorityModalFormFactory($uibModal) {

        var open = function (authority, hookUrl) {
            return $uibModal.open({
                'templateUrl': authority.templateUrl,
                'backdrop': 'static',
                'windowClass': 'dooray-setting-content setting-modal authority-modal',
                'controller': authority.controller,
                'resolve': {
                    hookUrl: function () {
                        return hookUrl || "";
                    }
                }
            });
        };
        return {
            open: function (authority, hookUrl) {
                return open(authority, hookUrl).result;
            }
        };
    }

    /* @ngInject */
    function LinkageUtil(HelperConfigUtil) {
        return {
            makeUrl: makeUrl
        };

        function makeUrl(bot) {
            var env = HelperConfigUtil.env();
            return (env === 'real' ? 'https://hook.dooray.com' : 'https://' + env + '.dooray.com') + "/services/" + bot.organizationId + "/" + bot.id + "/" + bot.token;
        }
    }

    /* @ngInject */
    function LinkageFormCtrl($q, $scope, $uibModalInstance, AuthorityModalFormFactory, Bot, Clipboard, HelperFormUtil, LinkageUtil, Messenger, MessageModalFactory, Project, ResponseWrapAppendHelper, authority, bot, gettextCatalog, isCreate, _) {
        var CAN_TASK_TRACKER_INTEGRATION = ['github', 'bitbucket'];

        $scope.FORM_NAME = 'linkage';
        HelperFormUtil.bindService($scope, $scope.FORM_NAME);

        bot.name = bot.name || bot.serviceName;
        $scope.bot = bot;
        $scope.url = LinkageUtil.makeUrl(bot);
        $scope.completedAuthority = true;
        $scope.canIntegrationWithTaskTracker = _.includes(CAN_TASK_TRACKER_INTEGRATION, bot.serviceType);
        $uibModalInstance.result.catch(function() {
            //쓰기 모드였으면 봇설정 취소하면 만들어진 봇 제거
            if (isCreate) {
                Bot.delete(bot);
            }
        });

        $scope.doAuthority = function () {
            $scope.completedAuthority = false;
            AuthorityModalFormFactory.open(authority, $scope.url).then(function () {
                $scope.completedAuthority = true;
            });
        };

        if (authority) {
            $scope.doAuthority();
        }

        function setSelectedValue(list, targetProperty) {
            _.forEach(bot[targetProperty], function (id) {
                var target = _.find(list, {id: id || null});
                target._getOrSetProp('selected', true);
            });
        }

        function asyncProjectList() {
            return Project.fetchMyActiveList().then(function (result) {
                setSelectedValue(result.contents(), 'projectIdList');
                $scope.projects = result.contents();
                return result.contents();
            });
        }

        function asyncMessengerList() {
            return Messenger.fetchList().then(function (result) {
                var channels = _.filter(result.contents(), 'title');
                setSelectedValue(channels, 'channelIdList');
                $scope.channels = channels;
                return channels;
            });
        }

        asyncProjectList();
        asyncMessengerList();

        $scope.ok = function () {
            if (!$scope.completedAuthority || HelperFormUtil.checkInvaild($scope[$scope.FORM_NAME])) {
                return;
            }
            var changedBot = _.cloneDeep(bot);
            changedBot.projectIdList = _($scope.projects).filter('_props.selected').map('id').value();
            changedBot.channelIdList = _($scope.channels).filter('_props.selected').map('id').value();

            if (_.isEmpty(changedBot.projectIdList) && _.isEmpty(changedBot.channelIdList)) {
                MessageModalFactory.alert(gettextCatalog.getString('프로젝트 또는 채팅방을 1개 이상 선택해 주세요.'));
                return;
            }

            ResponseWrapAppendHelper.create({
                content: changedBot,
                references: {
                    projectMap: _.keyBy($scope.projects, 'id'),
                    channelMap: _.keyBy($scope.channels, 'id')
                }
            });

            _confirmCopyUrl().then(function () {
                var target$ = angular.element('<div>');
                var clipborad = new Clipboard(target$[0], {
                    text: function () {
                        return $scope.url;
                    }
                });
                target$.click();
                clipborad.destroy();
            }).finally(function () {
                $uibModalInstance.close(Bot.update(changedBot).then(function () { return changedBot; }));
            });
        };

        function _confirmCopyUrl() {
            if (!isCreate) {
                return $q.when();
            }
            return MessageModalFactory.confirm(gettextCatalog.getString('연동 URL을 클립보드에 복사하시겠습니까?'), gettextCatalog.getString('URL 복사'), {
                confirmBtnLabel: gettextCatalog.getString('복사')
            }).result;
        }

        // 지우기 delete
        $scope.cancel = function () {
            $uibModalInstance.dismiss();
        };
    }
})();
