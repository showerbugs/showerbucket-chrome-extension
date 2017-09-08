(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('WelcomeGuideModalFactory', WelcomeGuideModalFactory)
        .controller('WelcomeGuideModalFactoryCtrl', WelcomeGuideModalFactoryCtrl)
        .run(runInitializeUiRouter);

    /* @ngInject */
    function WelcomeGuideModalFactory($uibModal, SettingBiz, TenantRepository, $q, _) {

        var GUIDE_INFO = {
            'project': {
                templates: [
                    'modules/layouts/welcomeGuide/ui-templates/editorSetting.html',
                    'modules/layouts/welcomeGuide/ui-templates/project.html',
                    'modules/layouts/welcomeGuide/ui-templates/download.html'
                ],
                blueholeTemplates: [
                    'modules/layouts/welcomeGuide/ui-templates/editorSetting.html',
                    'modules/layouts/welcomeGuide/ui-templates/project.html',
                    'modules/layouts/welcomeGuide/ui-templates/download_only_project.html'
                ]
            },
            'mail': {
                templates: [
                    'modules/layouts/welcomeGuide/ui-templates/mail.html'
                ]
            },
            'calendar': {
                templates: [
                    'modules/layouts/welcomeGuide/ui-templates/calendar.html'
                ]
            }
        };

        return {
            openIfFirstType: openIfFirstType,
            open: open
        };

        function openIfFirstType(category) {
            checkFirstTimeCategory(category).then(function(originalSettingProperty){
                createMessageModalInstance(category, originalSettingProperty);
            });
        }

        function open(category) {
            createMessageModalInstance(category);
        }

        function createMessageModalInstance(category, originalSettingProperty) {
            _promiseSetTemplates(category).then(function () {
                $uibModal.open({
                    'controller': 'WelcomeGuideModalFactoryCtrl',
                    'windowClass': 'welcome-guide',
                    'backdrop': 'static', /*  this prevent user interaction with the background  */
                    'templateUrl': 'modules/layouts/welcomeGuide/welcomeGuide.html',
                    'keyboard': false,
                    'resolve': {
                        templates: function() {
                            return GUIDE_INFO[category].templates;
                        },
                        category: function(){
                            return category;
                        },
                        originalSettingProperty: function() {
                            return originalSettingProperty;
                        }
                    }
                });
            });
        }

        function checkFirstTimeCategory(category) {
            return SettingBiz.fetchMySetting('welcome-guide').then(function (value) {
                return !_.isUndefined(value[category]) && !value[category] ? $q.resolve(value): $q.reject();
            });
        }

        function _promiseSetTemplates(category) {
            if (category !== 'project') {
                return $q.when();
            }

            return TenantRepository.getOrFetch().then(function () {
                if (TenantRepository.getModel().domainList.indexOf('bluehole.dooray.com') > -1) {
                    GUIDE_INFO.project.templates = GUIDE_INFO.project.blueholeTemplates;
                }
            });
        }

    }

    /* @ngInject */
    function WelcomeGuideModalFactoryCtrl($scope, $uibModalInstance, templates, HelperLocaleUtil, category, originalSettingProperty, SettingBiz, SettingModalFactory) {

        var currentIndex = 0;
        $scope.currentTemplateUrl = templates[currentIndex];
        $scope.locale = HelperLocaleUtil.getLanguage();
        $scope.markdownUrl = '/htmls/guides/markdown_' + ($scope.locale === 'zh_CN' ? 'en_US' : $scope.locale) + '.html';
        $scope.editor = 'wysiwyg';

        $scope.nextPage = function () {
            currentIndex += 1;
            if(templates.length > currentIndex) {
                $scope.currentTemplateUrl = templates[currentIndex];
            } else {
                $scope.finishGuide();
            }
        };

        $scope.finishGuide = function () {
            $uibModalInstance.close();
            originalSettingProperty[category] = true;
            SettingBiz.updateMySetting('welcome-guide', originalSettingProperty).then(function(){
                $uibModalInstance.close();
            });
        };

        $scope.openSettingModal = function ($event, category) {
            $event.preventDefault();
            SettingModalFactory.open(category);
        };

        $scope.changeDefaultEditor = function (value) {
            SettingBiz.updateMySetting('common.write', {
                editor: value
            });
        };
    }

    //QA를 위한 임시 라우터 설정
    function runInitializeUiRouter(Router) {
        Router.when('/empty/welcome/**', '/empty/welcome/project');
        Router.registerState({
            name: 'welcome',
            url: '/empty/welcome'
        });

        Router.registerState({
            name: 'welcome.project',
            url: '/project',
            onEnter: ['WelcomeGuideModalFactory', function (WelcomeGuideModalFactory) {
                WelcomeGuideModalFactory.open('project');
            }]
        });

        Router.registerState({
            name: 'welcome.mail',
            url: '/mail',
            onEnter: ['WelcomeGuideModalFactory', function (WelcomeGuideModalFactory) {
                WelcomeGuideModalFactory.open('mail');
            }]
        });

        Router.registerState({
            name: 'welcome.calendar',
            url: '/calendar',
            onEnter: ['WelcomeGuideModalFactory', function (WelcomeGuideModalFactory) {
                WelcomeGuideModalFactory.open('calendar');
            }]
        });
    }


})();
