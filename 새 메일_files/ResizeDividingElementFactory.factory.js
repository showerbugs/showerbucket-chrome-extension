(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .constant('SCREEN_MODE', {
            FULL: 'full-view-task-detail',
            NORMAL: 'divide'
        })
        .factory('ResizeDividingElementFactory', ResizeDividingElementFactory)
        .factory('ResizingDividerConstructor', ResizingDividerConstructor);

    /* @ngInject */
    function ResizeDividingElementFactory(SCREEN_MODE, _) {

        var dividers = {};

        return {
            SCREEN_MODE: SCREEN_MODE,
            setScreenMode: setScreenMode,
            isFullScreenMode: isFullScreenMode,
            toggleScreenMode: toggleScreenMode,
            addDivider: function (type, divider) {
                dividers[type] = divider;
            },
            removeDivider: function (type) {
                delete dividers[type];
            },
            getDivider: function (type) {
                return dividers[type];
            },
            clear: function () {
                var self = this;
                _.forEach(dividers, function (type) {
                    self.removeDivider(type);
                });
                dividers = {};
            },
            restoreRatio: function (type) {
                _.result(dividers[type], 'restoreSize');
            }
        };

        function isFullScreenMode(type) {
            return _.get(dividers[type], '_viewMode', SCREEN_MODE.NORMAL) === SCREEN_MODE.FULL;
        }

        function setScreenMode(mode, type) {
            if (mode === _.get(dividers[type], '_viewMode', SCREEN_MODE.NORMAL)) {
                return;
            }
            dividers[type].setMode(mode);
        }

        function toggleScreenMode(type) {
            setScreenMode(_.get(dividers[type], '_viewMode', SCREEN_MODE.NORMAL) === SCREEN_MODE.NORMAL ?
                SCREEN_MODE.FULL : SCREEN_MODE.NORMAL, type);
        }
    }

    /* @ngInject */
    function ResizingDividerConstructor($timeout, SCREEN_MODE, SizeAndViewModeStorage, _) {
        var body$ = angular.element('body');

        return angular.element.inherit({
            // option: {leftMinWidth: 180, leftMaxWidth: 250, defaultLeftWidth: 180,
            //          rightMinWidth: 180, rightMaxWidth: 250
            //          fullSize: 0}
            __constructor: function (type, el$, option) {
                this.type = type;
                this.el$ = el$;
                this.reset(option);
            },
            reset: function (option) {
                var self = this;
                this._viewMode = null;
                this.option = option || this.option;
                this.resizing = false;
                this.storageKey = SizeAndViewModeStorage.makeStorageKey(this.type);
                this.sizeFilters = this._makeSizeFilters();

                $timeout(function () {
                    self.restoreSize();
                }, 0, false);
            },
            startResizing: function () {
                this.resizing = true;
                body$.addClass('none-selectable');
                if (this.option.rightMinWidth || this.option.rightMaxWidth) {
                    this.parentWidth = this.el$.parent().width();
                }
                this._fetchFromElement();
            },
            calculate: function (event) {
                var offset = event.pageX - this.resizingEls.right$.offset().left,
                    newSize = this.currentSize + offset;

                _.forEach(this.sizeFilters, function (func) {
                    newSize = func(newSize);
                });
                this.setSize(newSize);
                return newSize;
            },
            endResizing: function () {
                this._save();
                body$.removeClass('none-selectable');
                this.resizing = false;
            },
            setSize: function (size) {
                if (!this.resizing) {
                    this._fetchFromElement();
                }
                this.resizingEls.left$.css('width', size + 'px');
                this.resizingEls.right$.css('width', 'calc(100% - ' + size + 'px)');
                this.currentSize = size;
            },
            setMode: function (mode) {
                this._viewMode = mode;
                var parent$ = this.el$.parent();
                _.forEach(SCREEN_MODE, function (_mode) {
                    if (_mode === mode) {
                        parent$.addClass(_mode);
                    } else {
                        parent$.removeClass(_mode);
                    }
                });
            },
            getSize: function () {
                return this.currentSize || this.option.defaultLeftWidth;
            },
            restoreSize: function () {
                var size = SizeAndViewModeStorage.loadSize(this.storageKey);
                size && this.setSize(size);
            },
            _fetchFromElement: function () {
                var el$ = this.el$;
                this.resizingEls = {
                    left$: el$.prev(),
                    right$: el$.next()
                };
                this.currentSize = this.resizingEls.left$.width();
            },
            _save: function () {
                SizeAndViewModeStorage.saveSize(this.storageKey, this.currentSize);
            },
            _makeSizeFilters: function () {
                var filters = [],
                    option = this.option,
                    self = this;
                if (option.leftMinWidth) {
                    filters.push(function (size) {
                        return Math.max(size, option.leftMinWidth);
                    });
                }

                if (option.leftMaxWidth) {
                    filters.push(function (size) {
                        return Math.min(size, option.leftMaxWidth);
                    });
                }

                if (option.rightMinWidth) {
                    filters.push(function (size) {
                        return self.parentWidth - Math.max(self.parentWidth - size, option.rightMinWidth);
                    });
                }

                if (option.rightMaxWidth) {
                    filters.push(function (size) {
                        return self.parentWidth - Math.min(self.parentWidth - size, option.rightMaxWidth);
                    });
                }
                return filters;
            }
        });
    }
})();
