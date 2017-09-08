(function () {

    'use strict';

    angular
        .module('doorayWebApp.popup')
        .constant('POPUP_STATE_NAMES', {
            ROOT: 'main.popup',
            TASK: 'main.popup.task',
            TASK_VIEW: 'main.popup.task.projects',
            TASK_WRITE: 'main.popup.task.write',
            TASK_WRITE_NEW: 'main.popup.task.write.new',
            TASK_WRITE_NEW_FROM_TASK: 'main.popup.task.write.newfromtask',
            TASK_WRITE_DRAFT: 'main.popup.task.write.draft',
            TASK_WRITE_UPDATE: 'main.popup.task.write.update',
            TASK_WRITE_NEWSUB: 'main.popup.task.write.newsub',
            TASK_TEMPLATE: 'main.popup.task.template',
            TASK_TEMPLATE_WRITE: 'main.popup.task.template.write',
            MAIL: 'main.popup.mail',
            MAIL_VIEW: 'main.popup.mail.folders',
            MAIL_WRITE: 'main.popup.mail.write',
            MAIL_WRITE_NEW: 'main.popup.mail.write.new',
            MAIL_WRITE_DRAFT: 'main.popup.mail.write.draft',
            MAIL_WRITE_REGISTERTASK: 'main.popup.mail.write.registertask',
            MAIL_WRITE_OTHERS: 'main.popup.mail.write.others',
            CALENDAR: 'main.popup.calendar',
            CALENDAR_VIEW: 'main.popup.calendar.folders',
            CALENDAR_WRITE: 'main.popup.calendar.write',
            CALENDAR_WRITE_NEW: 'main.popup.calendar.write.new',
            CALENDAR_WRITE_UPDATE: 'main.popup.calendar.write.update',
            TRANSLATOR: 'main.popup.translator'
        })
        .run(runInitializeUiRouter);

    /* @ngInject */
    function runInitializeUiRouter(POPUP_STATE_NAMES, Router, _) {
        //TODO 업무 신규, 메일 신규 쓰기에 대한 정확한 URL로 redirect 처리 필요
        Router.when('/project/write/new', '/project/write/new/');
        Router.when('/mail/write/new', '/mail/write/new/');

        var DefaultWriteStateBuilder = angular.element.inherit({
            __constructor: function (name, url) {
                this._state = {
                    name: name,
                    url: url,
                    templateUrl: 'modules/layouts/writeform/writeformLayout.html',
                    controller: 'WriteformLayoutCtrl as writeformLayerCtrl',
                    resolve: {
                        fragments: null,
                        writeFormBiz: null,
                        submitForm: null
                    }
                };
            },
            withOnEnter: function (onEnter) {
                this._state.onEnter = onEnter;
                return this;
            },
            withResolve: function (resolve) {
                this._state.resolve = angular.extend({}, this._state.resolve, resolve);
                return this;
            },
            build: function () {
                Router.registerState(this._state);
                return this;
            }
        });

        registerStateInfos();

        function registerStateInfos() {
            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.ROOT,
                'url': '/popup',
                'views': {
                    '@': {
                        'templateUrl': 'modules/layouts/main/popup.html',
                        'controller': 'PopupCtrl as popupCtrl'
                    }
                }
            });

            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.TASK,
                'url': '/project',
                'templateUrl': 'modules/layouts/view/popupView.html',
                'onEnter': ['ServiceUseRouter', function (ServiceUseRouter) {
                    ServiceUseRouter.routeToUsingService('project');
                }]
            });

            //업무 상세 새창으로 보기
            Router.registerState({
                'name': POPUP_STATE_NAMES.TASK_VIEW,
                'url': '/projects/{projectCode:any}/{postNumber:int}',
                'templateUrl': 'modules/project/view/taskView.html',
                'controller': 'TaskViewCtrl'
            });

            var TaskWriteStateBuilder = angular.element.inherit(DefaultWriteStateBuilder, {
                build: function () {
                    this.withResolve({
                        fragments: ['$q', function ($q) {
                            return $q.when({
                                head: {
                                    controller: 'TaskWriteformFragmentsHeadCtrl as headctrl',
                                    template: 'modules/project/writeform/taskWriteFormHead.html'
                                },
                                body: {
                                    controller: 'TaskWriteformFragmentsBodyCtrl as bodyctrl',
                                    template: 'modules/project/writeform/taskWriteFormBody.html'
                                }
                            });
                        }],
                        writeFormBiz: ['TaskWriteformBiz', function (TaskWriteformBiz) {
                            return TaskWriteformBiz;
                        }]
                    });
                    return this.__base();
                }
            });

            //업무 임시저장 신규/하위신규/수정 새창으로 보기
            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.TASK_WRITE,
                'url': '/write',
                'templateUrl': 'modules/views/blank.html'
            });

            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_WRITE_NEW_FROM_TASK, '/new/{projectCode:any}/{postNumber:int}')   //type === 'new' and from existed task clone
                .withResolve({
                    submitForm: ['$stateParams', 'TaskSubmitFormRouterFactory', function ($stateParams, TaskSubmitFormRouterFactory) {
                        //Parameter로 넘어온 값을 폼의 입력값으로 반영
                        var paramForm = _.set({}, 'projectCode', $stateParams.projectCode);

                        //우선순위1 postNumber
                        if ($stateParams.projectCode && $stateParams.postNumber) {
                            return TaskSubmitFormRouterFactory.newFromTask($stateParams.projectCode, $stateParams.postNumber);
                        }

                        //기본 Empty Form
                        return TaskSubmitFormRouterFactory.new(paramForm);
                    }]
                }).build();
            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_WRITE_NEW, '/new/{projectCode:any}?{templateId:string}{to:string}{cc:string}{subject:string}')    //type === 'new'
                .withResolve({
                    submitForm: ['$stateParams', '$q', '$window', 'TagInputTaskHelper', 'Member', 'TaskSubmitFormRouterFactory', 'TaskTemplateApiBiz', '_',
                        function ($stateParams, $q, $window, TagInputTaskHelper, Member, TaskSubmitFormRouterFactory, TaskTemplateApiBiz, _) {
                            //Parameter로 넘어온 값을 폼의 입력값으로 반영
                            var paramForm = {projectCode: $stateParams.projectCode}, option = {};

                            //우선순위 templateId
                            if ($stateParams.projectCode && $stateParams.templateId) {
                                return TaskSubmitFormRouterFactory.newFromTemplateId($stateParams.projectCode, $stateParams.templateId);
                            }

                            //우선순위2 param.projectCode(옵션) param.subject, param.to, param.cc
                            if ($stateParams.subject || $stateParams.to || $stateParams.cc) {
                                _.set(paramForm, 'subject', $window.decodeURIComponent($stateParams.subject || ''));

                                if (_.isEmpty($stateParams.to) && _.isEmpty($stateParams.cc)) {
                                    return TaskSubmitFormRouterFactory.new(paramForm);
                                }

                                return $q.all([
                                    findMemberOrGroupForSubmitFromCode($window.decodeURIComponent($stateParams.to || '')).then(function (result) {
                                        _.set(paramForm, 'users.to', result);
                                        return TagInputTaskHelper.toDetailMemberOrGroupFromIds(result).then(function (resultDetail) {
                                            _.set(option, 'users.to', resultDetail);
                                        });
                                    }),
                                    findMemberOrGroupForSubmitFromCode($window.decodeURIComponent($stateParams.cc || '')).then(function (result) {
                                        _.set(paramForm, 'users.cc', result);
                                        return TagInputTaskHelper.toDetailMemberOrGroupFromIds(result).then(function (resultDetail) {
                                            _.set(option, 'users.cc', resultDetail);
                                        });
                                    })])
                                    .then(function () {
                                        return TaskSubmitFormRouterFactory.new(paramForm, option);
                                    });
                            }

                            //우선순위3 기본템플릿 적용여부 - param.projectCode(필수)
                            if ($stateParams.projectCode) {
                                var submitForm = TaskSubmitFormRouterFactory.new(paramForm);
                                $q.all([submitForm, TaskTemplateApiBiz.query($stateParams.projectCode)]).then(function (result) {
                                    var submitForm = result[0];
                                    var defaultTemplate = _.find(result[1].contents(), {'isDefault': true});
                                    if (defaultTemplate) {
                                        submitForm.withForm({
                                            id: null,
                                            template: {id: defaultTemplate.id}
                                        })
                                            .withOption({
                                                project: {code: $stateParams.projectCode},
                                                needApplyTemplate: true
                                            });
                                    }
                                });
                                return submitForm;
                            }

                            //기본 Empty Form
                            return TaskSubmitFormRouterFactory.new(paramForm);

                            function findMemberOrGroupForSubmitFromCode(codeString) {
                                var param = {
                                        page: 0,
                                        size: 1
                                    },
                                    userOrGroupCodeList = _.isString(codeString) && codeString.length > 0 ? codeString.split(',') : [];
                                return $q.all(_.map(userOrGroupCodeList, function (memberOrGroupCode) {
                                    return Member.search(_.assign({all: memberOrGroupCode}, param));
                                })).then(function (datas) {
                                    return _(datas)
                                        .map(function (result) {
                                            return result.contents()[0];
                                        })
                                        .filter(function (data) {
                                            return !_.isEmpty(data);
                                        })
                                        .map(function (memberOrGroup) {
                                            return memberOrGroup.type === 'member' ?
                                                TagInputTaskHelper.toMemberFromMemberIds(memberOrGroup.member.id) :
                                                TagInputTaskHelper.toMemberGroupFromMemberIds(memberOrGroup.group.id);
                                        })
                                        .flatten().value();
                                });
                            }
                        }
                    ]
                }).build();
            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_WRITE_DRAFT, '/draft/{draftId}')   //type === 'draft'
                .withResolve({
                    submitForm: ['$stateParams', 'TaskSubmitFormRouterFactory', function ($stateParams, TaskSubmitFormRouterFactory) {
                        return TaskSubmitFormRouterFactory.draft($stateParams.draftId);
                    }]
                }).build();
            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_WRITE_UPDATE, '/update/{projectCode:any}/{postNumber:int}?{forceLoadContent:string}')   //type = 'update'
                .withResolve({
                    submitForm: ['$stateParams', 'TaskSubmitFormRouterFactory', function ($stateParams, TaskSubmitFormRouterFactory) {
                        return TaskSubmitFormRouterFactory.update($stateParams.projectCode, $stateParams.postNumber);
                    }]
                }).build();
            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_WRITE_NEWSUB, '/newsub/{projectCode:any}/{postNumber:int}')   //type = 'newsub'
                .withResolve({
                    submitForm: ['$stateParams', 'TaskSubmitFormRouterFactory', 'TaskTemplateApiBiz', '_', function ($stateParams, TaskSubmitFormRouterFactory, TaskTemplateApiBiz, _) {
                        return TaskTemplateApiBiz.query($stateParams.projectCode).then(function (result) {
                            var defaultTemplate = _.find(result.contents(), {'isDefault': true});
                            return defaultTemplate ? TaskSubmitFormRouterFactory.newsubFromTemplateId($stateParams.projectCode, $stateParams.postNumber, defaultTemplate.id) :
                                TaskSubmitFormRouterFactory.newsub($stateParams.projectCode, $stateParams.postNumber);
                        });
                    }]
                }).build();


            //업무 템플릿 등록
            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.TASK_TEMPLATE,
                'url': '/template',
                'templateUrl': 'modules/views/blank.html'
            });

            new TaskWriteStateBuilder(POPUP_STATE_NAMES.TASK_TEMPLATE_WRITE, '/write/{projectCode:any}?{templateId:string}')
                .withResolve({
                    submitForm: ['$stateParams', 'TaskSubmitFormRouterFactory', function ($stateParams, TaskSubmitFormRouterFactory) {
                        return TaskSubmitFormRouterFactory.template($stateParams.projectCode, $stateParams.templateId);
                    }]
                }).build();


            ////////// 메일 STATE ROUTE

            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.MAIL,
                'url': '/mail',
                'templateUrl': 'modules/layouts/view/popupView.html',
                'onEnter': ['ServiceUseRouter', function (ServiceUseRouter) {
                    ServiceUseRouter.routeToUsingService('mail');
                }]
            });

            //TODO 메일 상세 새창으로 보기 - 신규 메일 서비스로 이관 필요
            Router.registerState({
                'name': POPUP_STATE_NAMES.MAIL_VIEW,
                'url': '/mails/{mailId:string}',
                'template': '<mail-contents-view></mail-contents-view>'
            });

            var MailWriteStateBuilder = angular.element.inherit(DefaultWriteStateBuilder, {
                build: function () {
                    this.withResolve({
                        fragments: ['$q', function ($q) {
                            return $q.when({
                                head: {
                                    controller: 'MailWriteformFragmentsHeadCtrl as headctrl',
                                    template: 'modules/mail/legacy/writeform/mailWriteFormHead.html'
                                },
                                body: {
                                    controller: 'MailWriteformFragmentsBodyCtrl as bodyctrl',
                                    template: 'modules/mail/legacy/writeform/mailWriteFormBody.html'
                                }
                            });
                        }],
                        writeFormBiz: ['MailWriteformBiz', function (MailWriteformBiz) {
                            return MailWriteformBiz;
                        }]
                    });
                    return this.__base();
                }
            });

            //메일 임시저장 신규/답장하기/전달하기 업무등록 새창으로 보기
            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.MAIL_WRITE,
                'url': '/write',
                'templateUrl': 'modules/views/blank.html'
            });

            new MailWriteStateBuilder(POPUP_STATE_NAMES.MAIL_WRITE_NEW, '/new/?{to:string}{cc:string}{subject:string}')   //type === 'new'
                .withResolve({
                    submitForm: ['$stateParams', '$window', 'MailSubmitFormRouterFactory', '_',
                        function ($stateParams, $window, MailSubmitFormRouterFactory, _) {
                            //Parameter로 넘어온 값을 폼의 입력값으로 반영
                            var paramForm = {};
                            _.set(paramForm, 'subject', $window.decodeURIComponent($stateParams.subject || ''));
                            _.set(paramForm, 'users.to', parseEmailStringToArray($stateParams.to));
                            _.set(paramForm, 'users.cc', parseEmailStringToArray($stateParams.cc));
                            return MailSubmitFormRouterFactory.new(paramForm);

                            function parseEmailStringToArray(emailString) {
                                return _.isString(emailString) && emailString.length > 0 ? emailString.split(',') : [];
                            }
                        }
                    ]
                }).build();
            new MailWriteStateBuilder(POPUP_STATE_NAMES.MAIL_WRITE_DRAFT, '/draft/{draftId}')   //type === 'draft'
                .withResolve({
                    submitForm: ['$stateParams', 'MailSubmitFormRouterFactory', function ($stateParams, MailSubmitFormRouterFactory) {
                        return MailSubmitFormRouterFactory.draft($stateParams.draftId);
                    }]
                }).build();
            //MAIL -> TASK 이므로 TaskWriteStateBulder 적용
            new TaskWriteStateBuilder(POPUP_STATE_NAMES.MAIL_WRITE_REGISTERTASK, '/registertask/{mailId}')   //type = 'registertask'
                .withResolve({
                    submitForm: ['$stateParams', 'MailSubmitFormRouterFactory', function ($stateParams, MailSubmitFormRouterFactory) {
                        return MailSubmitFormRouterFactory.registertask($stateParams.mailId);
                    }]
                }).build();
            new MailWriteStateBuilder(POPUP_STATE_NAMES.MAIL_WRITE_OTHERS, '/:type/{mailId}')   //type === 'reply'|'replyall'|'forward'|'resend'
                .withResolve({
                    submitForm: ['$stateParams', 'MailSubmitFormRouterFactory', function ($stateParams, MailSubmitFormRouterFactory) {
                        return MailSubmitFormRouterFactory[$stateParams.type]($stateParams.mailId);
                    }]
                }).build();


            ////////// 캘린더 STATE ROUTE

            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.CALENDAR,
                'url': '/calendar',
                'templateUrl': 'modules/layouts/view/popupView.html',
                'onEnter': ['ServiceUseRouter', function (ServiceUseRouter) {
                    ServiceUseRouter.routeToUsingService('calendar');
                }]
            });

            var CalendarWriteStateBuilder = angular.element.inherit(DefaultWriteStateBuilder, {
                build: function () {
                    this.withResolve({
                        fragments: ['$q', function ($q) {
                            return $q.when({
                                head: {
                                    controller: 'CalendarWriteformFragmentsHeadCtrl as headctrl',
                                    template: 'modules/calendar/legacy/writeform/calendarWriteFormHead.html'
                                },
                                body: {
                                    controller: 'CalendarWriteformFragmentsBodyCtrl as bodyctrl',
                                    template: 'modules/calendar/legacy/writeform/calendarWriteFormBody.html'
                                }
                            });
                        }],
                        writeFormBiz: ['CalendarWriteformBiz', function (CalendarWriteformBiz) {
                            return CalendarWriteformBiz;
                        }]
                    });
                    return this.__base();
                }
            });

            //캘린더 업무등록/업무수정 새창으로 보기
            Router.registerState({
                'abstract': true,
                'name': POPUP_STATE_NAMES.CALENDAR_WRITE,
                'url': '/write',
                'templateUrl': 'modules/views/blank.html'
            });
            new CalendarWriteStateBuilder(POPUP_STATE_NAMES.CALENDAR_WRITE_NEW, '/new/{calendarId}?{startedAt:string}{endedAt:string}{wholeDayFlag:boolean}{autoFreebusy:boolean}{subject:string}')   //type === 'new'
                .withResolve({
                    submitForm: ['$stateParams', '$window', 'CalendarSubmitFormRouterFactory', '_',
                        function ($stateParams, $window, CalendarSubmitFormRouterFactory, _) {
                            //Parameter로 넘어온 값을 폼의 입력값으로 반영
                            var paramForm = _.set({}, 'calendarId', $stateParams.calendarId);
                            _.set(paramForm, 'startedAt', $stateParams.startedAt);
                            _.set(paramForm, 'endedAt', $stateParams.endedAt);
                            _.set(paramForm, 'subject', $stateParams.subject);
                            _.set(paramForm, 'wholeDayFlag', $stateParams.wholeDayFlag);
                            return CalendarSubmitFormRouterFactory.new(_.omitBy(paramForm, _.isNil), {autoFreebusy: $stateParams.autoFreebusy});
                        }
                    ]
                }).build();
            new CalendarWriteStateBuilder(POPUP_STATE_NAMES.CALENDAR_WRITE_UPDATE, '/update/{calendarId}/{scheduleId}?{updateType:string}')   //type === 'update'
                .withResolve({
                    submitForm: ['$stateParams', '$window', 'CalendarSubmitFormRouterFactory',
                        function ($stateParams, $window, CalendarSubmitFormRouterFactory) {
                            return CalendarSubmitFormRouterFactory.update($stateParams.calendarId, $stateParams.scheduleId, $stateParams.updateType);
                        }
                    ]
                }).build();

            Router.registerState({
                'name': POPUP_STATE_NAMES.TRANSLATOR,
                'url': '/translator',
                'template': '<translator-page></translator-page>'
            });
        }
    }
})();
