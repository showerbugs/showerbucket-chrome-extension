(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .controller('FullViewModalResizingCtrl', FullViewModalResizingCtrl)
        .factory('ResizingModalConstructor', ResizingModalConstructor);

    /* @ngInject */
    function FullViewModalResizingCtrl($scope, $window, ResizeDividingElementFactory) {
        var TYPE = 'fullViewModal';

        var window$ = angular.element($window),
            divider;

        var onWindowResize = _.debounce(function () {
            divider.calcWindowSize();
            divider.restoreDivideRatio();
        }, 200);

        $scope.initialize = function () {
            divider = ResizeDividingElementFactory.getDivider(TYPE);
            window$.on('resize', onWindowResize);
        };

        $scope.$on('$destroy', function () {
            window$.off('resize', onWindowResize);
        });
    }

    /* @ngInject */
    function ResizingModalConstructor($document, $timeout, SCREEN_MODE, FullViewBoxItemsBiz, ResizeDividingElementFactory, SizeAndViewModeStorage, _) {
        var NAVI_DIVIDER_WIDTH = 4,
            DIVIDER_WIDTH = 4,
            SHADOW_WIDTH = 10;

        var body$ = angular.element('body');
        return angular.element.inherit({
            __constructor: function (type, el$) {
                this.type = type;
                this.el$ = el$;
                this.reset();
            },
            reset: function () {
                var self = this;

                this.widthRatio =  null;
                this.resizing = false;
                this.storageKey = SizeAndViewModeStorage.makeStorageKey(this.type);
                this._naviDivider = ResizeDividingElementFactory.getDivider('navi');

                $timeout(function () {
                    var mode = SizeAndViewModeStorage.loadMode(self.storageKey);
                    self.calcWindowSize();
                    self.calcNaviWidth();
                    self.setMode(mode);
                }, 0, false);
            },
            initialize: function () {
                var options = FullViewBoxItemsBiz.getViewOptions(),
                    self = this;
                if (options.subject || options.tags) {
                    $timeout(function () {
                        self.setSize(self._calcSubjectWidth());
                    }, 0, false);
                }
                this.initialize = null;
            },
            startResizing: function () {
                this.resizing = true;
                this._applyModeToDom(SCREEN_MODE.NORMAL);
                this._saveMode(SCREEN_MODE.NORMAL);
                this.calcNaviWidth();
                this.calcWindowSize();
                body$.addClass('none-selectable');
                this._fetchFromElement();
            },
            calculate: function (event) {
                var newModalDialogSize = this.windowSize - event.pageX;
                this.setSize(newModalDialogSize);
                return newModalDialogSize;
            },
            endResizing: function () {
                this._saveSize();
                body$.removeClass('none-selectable');
                this.resizing = false;
            },
            setSize: function (size) {
                if (!this.resizing) {
                    this._fetchFromElement();
                }
                size = size || 0;
                var _size = size;
                size = Math.max(size, 720 + DIVIDER_WIDTH);
                size = Math.min(size, this.windowSize - this.naviWidth);

                this.widthRatio = _size !== size ? this.widthRatio : (size / (this.windowSize - this.naviWidth));

                this.resizingEls.dialog$.width(size);
                this.resizingEls.modal$.width(size + SHADOW_WIDTH);
                this.currentSize = size;
            },
            setMode: function (mode) {
                this.resizing = true;
                this._fetchFromElement();
                if (mode === SCREEN_MODE.FULL) {
                    this._saveSize();
                }
                this._saveMode(mode);
                this._applyModeSize(mode);
                this._applyModeToDom(mode);
                this.resizing = false;
            },
            getSize: function () {
                return this.currentSize;
            },
            restoreSize: function () {
                var size = SizeAndViewModeStorage.loadSize(this.storageKey),
                    mode = SizeAndViewModeStorage.loadMode(this.storageKey);

                if (mode === SCREEN_MODE.FULL) {
                    this.setSize(100000);
                    return;
                }

                if (size) {
                    this.setSize(size);
                } else {
                    this.initialize && this.initialize();
                }
            },
            restoreDivideRatio: function () {
                var maxWidth = this.windowSize - this.naviWidth;

                if (this._viewMode === SCREEN_MODE.FULL) {
                    this.setSize(100000);
                    return;
                }

                if (this.widthRatio) {
                    this.setSize(maxWidth * this.widthRatio);
                    return;
                }
                this.restoreSize();
            },
            calcWindowSize: function () {
                this.windowSize = $document.width();
            },
            calcNaviWidth: function () {
                this.naviWidth = this._naviDivider.getSize() + NAVI_DIVIDER_WIDTH;
            },
            _applyModeSize: function (mode) {
                this._viewMode = mode;
                if (mode === SCREEN_MODE.FULL) {
                    this.setSize(100000);
                } else {
                    this.restoreDivideRatio();
                }
            },
            _applyModeToDom: function (mode) {
                var self = this;
                this._viewMode = mode;

                if (_.isEmpty(this.modalBody$)) {
                    this.modalBody$ = this.resizingEls.modal$.find('.modal-body');
                }
                _.forEach(SCREEN_MODE, function (_mode) {
                    if (_mode === mode) {
                        self.modalBody$.addClass(_mode);
                    } else {
                        self.modalBody$.removeClass(_mode);
                    }
                });
            },
            _calcSubjectWidth: function () {
                var subjectItem$ = angular.element('.subject-item');
                if (!_.isEmpty(subjectItem$)) {
                    subjectItem$ = angular.element(subjectItem$[0]);
                    return this.windowSize - (subjectItem$.offset().left + (subjectItem$.width() / 2));
                }
            },
            _fetchFromElement: function () {
                var el$ = this.el$;
                this.resizingEls = {
                    dialog$: el$.parents('.modal-dialog'),
                    modal$: el$.parents('.modal')
                };
                this.currentSize = this.resizingEls.dialog$.width();
            },
            _saveMode: function (mode) {
                SizeAndViewModeStorage.saveMode(this.storageKey, mode || this._viewMode);
            },
            _saveSize: function () {
                SizeAndViewModeStorage.saveSize(this.storageKey, this.currentSize);
            }
        });
    }

})();
