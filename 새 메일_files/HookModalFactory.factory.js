(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.common')
        .factory('HookModalFactory', HookModalFactory);

    /* @ngInject */
    function HookModalFactory($uibModal) {

        return {
            openCreate: function (projectCode) {
                return _openModal({
                    templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/createHookModal.html',
                    controller: CreateHookModalCtrl,
                    resolve: {
                        projectCode: function () {
                            return projectCode;
                        }
                    }
                });
            },
            openUpdate: function (projectCode, hook) {
                return _openModal({
                    templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/updateHookModal.html',
                    controller: UpdateHookModalCtrl,
                    resolve: {
                        projectCode: function () {
                            return projectCode;
                        },
                        hook: function () {
                            return hook;
                        }
                    }
                });
            },
            openLogList: function (projectCode, hook) {
                return _openModal({
                    templateUrl: 'modules/setting/common/project/webhook/HookModalFactory/logListModal.html',
                    controller: LogListModalCtrl,
                    resolve: {
                        projectCode: function () {
                            return projectCode;
                        },
                        hook: function () {
                            return hook;
                        }
                    }
                });
            }
        };

        function _openModal(modalOption) {
            return $uibModal.open(_.assign({
                'windowClass': 'setting-modal project-management dooray-setting-content',
                'backdrop': 'static', /*  this prevent user interaction with the background  */
                'controllerAs': '$ctrl'
            }, modalOption));
        }
    }

    /* @ngInject */
    function CreateHookModalCtrl($uibModalInstance, HookBiz, projectCode) {
        this.closeModal = $uibModalInstance.dismiss;
        this.submit = submit;

        function submit(form) {
            HookBiz.add(projectCode, form).then(function () {
                $uibModalInstance.close();
            });
        }
    }

    /* @ngInject */
    function UpdateHookModalCtrl($uibModalInstance, HookBiz, hook, projectCode) {
        this.closeModal = $uibModalInstance.dismiss;
        this.form = hook;
        this.submit = submit;

        function submit(form) {
            HookBiz.update(projectCode, hook.id, form).then(function () {
                $uibModalInstance.close();
            });
        }
    }

    /* @ngInject */
    function LogListModalCtrl($uibModalInstance, hook, projectCode) {
        this.closeModal = $uibModalInstance.dismiss;
        this.hook = hook;
        this.projectCode = projectCode;
    }

})();
