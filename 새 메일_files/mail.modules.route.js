(function () {

    'use strict';

    angular
        .module('doorayWebApp.mail')
        .constant('DEFAULT_STATE_NAMES', {
            PAGE: 'page',
            BLOCK: 'page.block',
            BLOCK_LAYOUT: 'page.block.layout'
        })
        .constant('MAIL_STATE_NAMES', {
            ROOT: 'page.mail',
            LAYOUT: 'page.mail.layout',

            VIEW: 'page.mail.layout.view',

            NEW_BOX: 'page.mail.layout.new',
            IMPORTANT_BOX: 'page.mail.layout.important',
            ATTACHMENT_BOX: 'page.mail.layout.attachment',
            //POST_BOX: 'page.mail.layout.post',

            SYSTEM_FOLDERS: 'page.mail.layout.systems',
            INBOX: 'page.mail.layout.systems.inbox',
            SENT_BOX: 'page.mail.layout.systems.sent',
            DRAFT_BOX: 'page.mail.layout.systems.draft',
            SPAM_BOX: 'page.mail.layout.systems.spam',
            TRASH_BOX: 'page.mail.layout.systems.trash',
            ARCHIVE_BOX: 'page.mail.layout.systems.archive',
            FOLDERS: 'page.mail.layout.folders',
            //FAVORITE_FOLDERS: 'page.mail.layout.favoritefolders',
            SEARCH_BOX: 'page.mail.layout.search'
        })
        .run(runInitializeUiRouterDefaultStatus)
        .run(runInitializeUiRouterMailStatus)
        .run(runInitializeViewModeLoad);

    /* @ngInject */
    function runInitializeViewModeLoad(MainContentsViewModeRepository) {
        MainContentsViewModeRepository.set(MainContentsViewModeRepository.loadFromStorage());
    }

    /* @ngInject */
    function runInitializeUiRouterDefaultStatus(DEFAULT_STATE_NAMES, Router) {
        registerStateInfos();

        function registerStateInfos() {
            Router.registerState({
                name: DEFAULT_STATE_NAMES.PAGE
            });

            Router.registerState({
                name: DEFAULT_STATE_NAMES.BLOCK,
                views: {
                    '@': {
                        template: '<header ui-view="header"></header><section layout flex ui-view="body"></section><footer class="mail-footer" layout layout-align="center center" ui-view="footer"></footer>'
                    }
                }
            });

            Router.registerState({
                name: DEFAULT_STATE_NAMES.BLOCK_LAYOUT,
                url: '/block',
                views: {
                    header: {
                        template: '<mail-header></mail-header>'
                    },
                    body: {
                        template: '<div ng-include="\'modules/layouts/main/emptyServicePage.html\'" style="position:absolute;top:40%;text-align:center;width:100%;"></div>'
                    },
                    footer: {
                        templateUrl: 'modules/layouts/main/Footer/footer.html'
                    }
                }
            });
        }
    }

    /* @ngInject */
    function runInitializeUiRouterMailStatus(MAIL_STATE_NAMES, Router) {
        Router.when('/mail', '/mail/systems/inbox');
        registerStateInfos();

        function registerStateInfos() {
            Router.registerState({
                abstract: true,
                url: '/mail',
                name: MAIL_STATE_NAMES.ROOT,
                views: {
                    '@': {
                        templateUrl: 'modules/mail/mailPage.html'
                    }
                },
                onEnter: ['ServiceUseRouter', 'WelcomeGuideModalFactory', function (ServiceUseRouter, WelcomeGuideModalFactory) {
                    if (!ServiceUseRouter.routeToUsingService('mail')) {
                        WelcomeGuideModalFactory.openIfFirstType('mail');
                    }
                }]
            });

            Router.registerState({
                abstract: true,
                name: MAIL_STATE_NAMES.LAYOUT,
                views: {
                    header: {
                        template: '<mail-header></mail-header>'
                    },
                    body: {
                        template: '<mail-body-container layout flex></mail-body-container>'
                    },
                    footer: {
                        templateUrl: 'modules/layouts/main/Footer/footer.html'
                    }
                }
            });

            Router.registerState({
                name: MAIL_STATE_NAMES.VIEW,
                url: '/mails/{mailId:string}'
            });

            Router.registerState({
                abstract: true,
                name: MAIL_STATE_NAMES.SYSTEM_FOLDERS,
                url: '/systems'
            });

            MailListViewStateBuilder(MAIL_STATE_NAMES.INBOX, '/inbox')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.SENT_BOX, '/sent')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.DRAFT_BOX, '/draft')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.SPAM_BOX, '/spam')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.TRASH_BOX, '/trash')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.NEW_BOX, '/new')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.IMPORTANT_BOX, '/important')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.ATTACHMENT_BOX, '/attachment')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.ARCHIVE_BOX, '/archive')
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.SEARCH_BOX, '/search', '?{page:int}{query:string}') // 검색 조건
                .build().buildView();

            MailListViewStateBuilder(MAIL_STATE_NAMES.FOLDERS, '/folders/{folderId:string}')
                .withViewUrl('/{mailId:string}')
                .build().buildView();


            function MailListViewStateBuilder(name, url, params) {
                var stateList = {
                    name: name,
                    url: url + (params || '?{read:string}{page:int}{order:string}'),
                    onEnter: onEnterListStateCallback
                };

                var stateView = {
                    name: name + '.view',
                    url: '/{mailId:string}'
                };

                /* @ngInject */
                function onEnterListStateCallback($stateParams,
                                                  MailListUtil, StateHelperUtil,
                                                  MailItemsCheckboxRangeAction,
                                                  MailListRepository) {
                    MailItemsCheckboxRangeAction.clearRange();
                    return MailListRepository.fetchAndCacheWithLoading(MailListUtil.makeApiParams(StateHelperUtil.computeListStateNameByName(this.name), $stateParams));
                }

                return {
                    withViewUrl: function (url) {
                        stateView.url = url;
                        return this;
                    },
                    build: function () {
                        Router.registerState(stateList);
                        return this;
                    },
                    buildView: function () {
                        Router.registerState(stateView);
                        return this;
                    }
                };
            }
        }
    }

})();
