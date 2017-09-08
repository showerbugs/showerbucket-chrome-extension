(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .service('ProjectArchiveService', ProjectArchiveService);

    /* @ngInject */
    function ProjectArchiveService($q, MessageModalFactory, Project, RootScopeEventBindHelper, gettextCatalog, _) {
        var msg = {
            archived: function (project) {
                var msg = (project._counts.notClosedTaskCount > 0 ? gettextCatalog.getString('<p>현재 완료되지 않은 업무가 <span class="highlight">{{::workingtaskcount}}</span>개 있습니다.</p>', {workingtaskcount: project._counts.notClosedTaskCount}) : '') +
                    gettextCatalog.getString('<p>프로젝트를 종료하면 비활성화 상태로 보관되며, 이후 다시 진행 상태로 변경할 수 있습니다.</p>') +
                    gettextCatalog.getString('<p>프로젝트가 종료된 이후에는 업무 등록 및 진행, 댓글 입력 등이 불가능합니다.</p>');
                return msg;
            },
            active: function () {
                return gettextCatalog.getString('해당 프로젝트를 다시 진행하시겠습니까?');
            },
            trashed: function (/*project*/) {
                //var msg = '진행 중인 업무가 <span class="hightlight">:WORKING_TASK_COUNT:</span>개 있습니다.\n' +
                //    '프로젝트를 삭제하시겠습니까?';

                var msg = gettextCatalog.getString('해당 프로젝트를 삭제하시겠습니까?');

                //msg = msg.replace(':PROJECT_NAME:', project.code)
                //    .replace(':MEMBER_COUNT:', project._counts.memberCount)
                //    .replace(':WORKING_TASK_COUNT:', project._counts.notClosedTaskCount);
                return msg;
            },
            deleted: function () {
                var msg = gettextCatalog.getString('<p>프로젝트를 영구 삭제하면 다시 복구할 수 없습니다.</p><p>해당 프로젝트를 영구 삭제하시겠습니까?</p>');
                return msg;
            }
        };

        var openConfirm = {
            'openArchivedConfirm': function (_project) {
                return MessageModalFactory.confirm(msg.archived(_project), gettextCatalog.getString('프로젝트 종료'), {confirmBtnLabel: gettextCatalog.getString('종료.1')}).result;
            },
            'openActiveConfirm': function () {
                return MessageModalFactory.confirm(msg.active(), gettextCatalog.getString('프로젝트 진행'), {confirmBtnLabel: gettextCatalog.getString('진행.2')}).result;
            },
            'openTrashedConfirm': function (_project) {
                return MessageModalFactory.confirm(msg.trashed(_project), gettextCatalog.getString('프로젝트 삭제'), {confirmBtnLabel: gettextCatalog.getString('삭제')}).result;
            },
            'openDeletedConfirm': function () {
                return MessageModalFactory.confirm(msg.deleted(), gettextCatalog.getString('프로젝트 영구 삭제'), {confirmBtnLabel: gettextCatalog.getString('영구 삭제')}).result;
            }
        };

        return _.assign(openConfirm, {
            //TODO 리팩토링 : 중복로직 제거
            'updateProject': function (project, msg, state, title, op) {
                var deferred = $q.defer();
                MessageModalFactory.confirm(msg, title, op).result.then(function () {
                    project.state = state;
                    Project.update(project.code, project).then(function () {
                        deferred.resolve();
                    }, function () {
                        deferred.reject();
                    });
                }, function () {
                    deferred.reject();
                });

                return deferred.promise;
            },
            'archived': function (_project) {
                var project = _project;
                return this.updateProject(project, msg.archived(_project), 'archived', gettextCatalog.getString('프로젝트 종료'), {confirmBtnLabel: gettextCatalog.getString('종료.1')});
            },
            'active': function (_project) {
                var project = _project;
                return this.updateProject(project, msg.active(), 'active', gettextCatalog.getString('프로젝트 진행'), {confirmBtnLabel: gettextCatalog.getString('진행.2')});
            },
            'trashed': function (_project) {
                var project = _project;
                return this.updateProject(project, msg.trashed(_project), 'trashed', gettextCatalog.getString('프로젝트 삭제'), {confirmBtnLabel: gettextCatalog.getString('삭제')});
            },
            'deleted': function (_project) {
                return this.updateProject(_project, msg.deleted(), 'deleted', gettextCatalog.getString('프로젝트 영구 삭제'), {confirmBtnLabel: gettextCatalog.getString('영구 삭제')});
            },
            //TODO: 리팩토링
            'bindService': function ($scope, projectCode) {
                var fetchProject = function () {
                    Project.fetchByCode(projectCode, Project.PARAM_NAMES.EXT_FIELDS.COUNTS).then(function (project) {
                        project._counts = {
                            'memberCount': _.get(project, 'counts.memberCount', 0),
                            'allTaskCount': _.get(project, 'counts.postCount.workflow.registered', 0) + _.get(project, 'counts.postCount.workflow.working', 0) + _.get(project, 'counts.postCount.workflow.completed', 0) + _.get(project, 'counts.postCount.workflow.closed', 0),
                            'notClosedTaskCount': _.get(project, 'counts.postCount.workflow.registered', 0) + _.get(project, 'counts.postCount.workflow.working', 0) + _.get(project, 'counts.postCount.workflow.completed', 0)
                        };

                        $scope.project = project;
                    });
                };

                var updateProject = function (msg, state) {
                    var deferred = $q.defer();

                    MessageModalFactory.confirm(msg).result.then(function () {
                        $scope.project.state = state;
                        Project.update(projectCode, $scope.project).then(function () {
                            deferred.resolve();
                        }, function () {
                            deferred.reject();
                        });
                    }, function () {
                        deferred.reject();
                    });

                    return deferred.promise;
                };

                $scope.archived = function () {
                    return updateProject(msg.archived($scope.project), 'archived');
                };

                $scope.trashEmpty = function () {
                    return updateProject(msg.trashed(), 'trashed');
                };

                $scope.trashed = function () {
                    return updateProject(msg.trashed($scope.project), 'trashed');
                };

                $scope.active = function () {
                    return updateProject(msg.active(), 'active');
                };

                $scope.deleted = function () {
                    return updateProject(msg.deleted(), 'deleted');
                };

                fetchProject();
                RootScopeEventBindHelper.withScope($scope).on(Project.EVENTS.RESETCACHE, fetchProject);
            }
        });
    }

})();
