(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('doorayFullViewGrid', DoorayFullViewGrid);

    /* @ngInject */
    function DoorayFullViewGrid($state, $templateCache, $timeout, EMIT_EVENTS, ApiPageSizeFactory, DigestService, FullViewBoxItemsBiz, RootScopeEventBindHelper) {
        var prefix = 'modules/components/doorayFullViewGrid/';
        return {
            templateUrl: 'modules/components/doorayFullViewGrid/doorayFullViewGrid.html',
            restrict: 'EA',
            scope: true,
            compile: function () {
                return {
                    pre: function (scope, element, attrs) {
                        // template 수정
                        $templateCache.put('ui-grid/uiGridHeaderCell', $templateCache.get(prefix + 'doorayFullViewGridHeaderCell.html'));
                        $templateCache.put('ui-grid/ui-grid-header', $templateCache.get(prefix + 'doorayFullViewGridHeader.html'));
                        $templateCache.put('ui-grid/ui-grid', $templateCache.get(prefix + 'doorayFullViewGridUiGrid.html'));
                        $templateCache.put('ui-grid/uiGridViewport', $templateCache.get(prefix + (attrs.mode === 'mail' ? 'mailFullViewGridViewport.html' : 'projectFullViewGridViewport.html')));
                        scope.hasShowHeader = function () {
                            return !scope.isProjectBox || (attrs.mode === 'notice' && scope.noticeTasks.length > 0) || (attrs.mode !== 'notice' && scope.noticeTasks.length === 0);
                        };
                        scope.fullViewOptions = FullViewBoxItemsBiz.getViewOptions(attrs.mode);
                        scope.options = {
                            onRegisterApi: function(gridApi){
                                scope.gridApi = gridApi;
                            },
                            rowHeight: 'auto',
                            enableSorting: false,
                            enableColumnMenus: false,
                            showGridFooter: false,
                            showColumnFooter: false,
                            showHeader: scope.hasShowHeader(),
                            minRowsToShow: ApiPageSizeFactory.getListApiSize(),
                            virtualizationThreshold: ApiPageSizeFactory.getListApiSize(),
                            enableHorizontalScrollbar: 0,//ref. ui-grid.js uiGridConstants.scrollbars.NEVER,
                            enableVerticalScrollbar: 0,//ref. ui-grid.js uiGridConstants.scrollbars.NEVER,
                            rowTemplate: prefix + (attrs.mode === 'mail' ? 'mailFullViewRowTpl.html' : 'projectFullViewRowTpl.html'),
                            columnDefs: FullViewBoxItemsBiz.getColumns(attrs.mode),
                            data: attrs.items
                        };
                        DigestService.safeLocalDigest(scope);
                    },
                    post: function (scope, element, attrs) {
                        scope.trackByFunc = trackByFunc;
                        scope.isInSearchList = $state.includes('**.search.**');

                        function trackByFunc(item) {
                            return attrs.mode === 'mail' ? item.id :
                                (item.id + item._getOrSetProp('fetchedAt'));
                        }

                        function init() {
                            scope.options.columnDefs = FullViewBoxItemsBiz.getColumns(attrs.mode);
                            scope.fullViewOptions = FullViewBoxItemsBiz.getViewOptions(attrs.mode);

                            DigestService.safeLocalDigest(scope);
                        }

                        function refresh() {
                            scope.refresh = true;
                            $timeout(function () {
                                scope.refresh = false;
                                DigestService.safeLocalDigest(scope);
                            }, 0, false);
                        }

                        scope.$watch(function () {
                            return FullViewBoxItemsBiz.getVersion();
                        }, function (newVal, oldVal) {
                            if (newVal === oldVal) {
                                return;
                            }
                            init();
                            scope.version = newVal;
                        });

                        scope.$watch(function () {
                            return scope.hasShowHeader();
                        }, function (newVal, oldVal) {
                            if (newVal !== oldVal) {
                                scope.options.showHeader = newVal;
                                refresh();
                            }
                        });

                        RootScopeEventBindHelper.withScope(scope).on(EMIT_EVENTS.RESIZE_NAVI, function () {
                            refresh();
                            DigestService.safeLocalDigest(scope);
                        });

                        DigestService.safeLocalDigest(scope);

                    }
                };
            }
        };
    }

})();
