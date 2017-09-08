(function () {

    'use strict';

    angular
        .module('doorayWebApp.editor')
        .factory('CustomTextPalette', CustomTextPalette);

    /* @ngInject */
    function CustomTextPalette() {

        function PaletteController($palette, $layer) {
            this.$palette = $palette;
            this.$layer = $layer;
            this.$body = this.$layer.find('.palette-body');
            this.$list = this.$body.find('ul');
            this.focusListIndex = 0;
            this.waitingSpaceCount = 0;
        }

        PaletteController.prototype.setActivePalette = function (palette) {
            this.activePalette = palette || null;
            if (palette) {
                this.sendQuery('');
            }
        };

        PaletteController.prototype.getActivePalette = function () {
            return this.activePalette;
        };

        PaletteController.prototype.onKeyPress = function (ev) {
            this.isAllowingChangeEvent = false;
            if (this.getActivePalette()) {
                switch (ev.keyMap) {
                    case 'ESCAPE':
                    {
                        this.inActivePalette();
                        break;
                    }
                    case 'DOWN':
                    {
                        if (this.isAbleMove()) {
                            ev.data.preventDefault();
                            this.isAllowingChangeEvent = true;
                            this.moveListItem(1);
                        }
                        break;
                    }
                    case 'UP':
                    {
                        if (this.isAbleMove()) {
                            ev.data.preventDefault();
                            this.isAllowingChangeEvent = true;
                            this.moveListItem(-1);
                        }
                        break;
                    }
                    default:
                }
            }
        };

        PaletteController.prototype.onKeyup = function (ev) {
            if (this.getActivePalette() && ev.keyCode === 32) {

                if (this.waitingSpaceCount > 2) {
                    this.inActivePalette();
                }
                this.waitingSpaceCount++;
            }
        };

        PaletteController.prototype.sendQuery = function (query) {
            query = query.slice(1);
            this.currentQuery = query;
            this.getActivePalette().querySender(query, function (list) {
                if (!this.getActivePalette() || this.currentQuery !== query) {
                    return;
                }

                if (list.length === 0) {
                    this.hidePalette();
                } else {
                    this.setList(list, query);
                    this.showPalette();
                }
            }.bind(this));
        };

        PaletteController.prototype.showPalette = function () {
            this.$layer.show();
            this.$palette.show();
            this._setLayerPosition();
        };

        PaletteController.prototype.hidePalette = function () {
            this.$list.html('');
            this.list = [];
            this.$layer.hide();
            this.$palette.hide();
        };

        PaletteController.prototype.inActivePalette = function () {
            this.setActivePalette(null);
            this.waitingSpaceCount = 0;
            this.hidePalette();
        };

        PaletteController.prototype.setList = function (list, query) {
            this.list = list;
            this.$list.html(this.renderList(query));
            this._setFocusItem(0);
        };

        PaletteController.prototype.renderList = function (query) {
            var listHtml = '',
                length = this.list.length,
                i = 0;
            for (; i < length; i += 1) {
                listHtml += '<li>' + this.getActivePalette().render(this.list[i].displayItem, query) + '</li>';
            }
            return listHtml;
        };

        /**
         * get selected search item in list
         * @returns {*}
         */
        PaletteController.prototype.getSelection = function (index) {
            return this.list[index || this.focusListIndex];
        };

        PaletteController.prototype.select = function (isWysiwygMode, index) {
            var selection = this.getSelection(index);
            if (!selection) {
                return;
            } else if (selection.nextPalette) {
                this.setActivePalette(selection.nextPalette);
                return selection.nextPalette;
            }

            return isWysiwygMode ? selection.convertHTML(selection.text) + '&nbsp;' : selection.text;
        };

        PaletteController.prototype._setLayerPosition = function () {
            var $palette = this.$palette,
                $layer = this.$layer,
                paletteOffsetTop = $palette.offset().top, //window 내의 top
                listHeight = $layer.height(),
                windowHeight = $(window).height(),
                LIST_MAX_HEIGHT = 300,
                LINE_HEIGHT = 30;

            //팔레트 레이어 창의 크기가 레이어가 들어갈 위치보다 클 때 팔레트 레이어를 위로 올려줌
            if (windowHeight - paletteOffsetTop - LIST_MAX_HEIGHT < 0) {
                $layer.css('top', paletteOffsetTop - listHeight - LINE_HEIGHT);
            } else {
                $layer.css('top', paletteOffsetTop);
            }
            $layer.css('left', $palette.offset().left);
        };

        PaletteController.prototype.isAbleMove = function () {
            if (this.list.length === 0) {
                this.inActivePalette();
                return;
            }
            return true;
        };
        /**
         * move list up and down
         * @param {number} val - up: 1, down: -1
         */
        PaletteController.prototype.moveListItem = function (val) {
            var focusListIndex = this.focusListIndex;
            focusListIndex += val;
            this._setFocusItem(focusListIndex);
        };

        /**
         * move list focus item
         * @param {number} focusListIndex index about focusing item
         */
        PaletteController.prototype._setFocusItem = function (focusListIndex) {
            var listLength = this.list.length,
                $listLi = this.$list.find('li');

            if (focusListIndex > listLength - 1) {
                focusListIndex = 0;
            } else if (focusListIndex < 0) {
                focusListIndex = listLength - 1;
            }

            this.focusListIndex = focusListIndex;

            if (listLength > 0) {
                $listLi.removeClass('active');
                $listLi.eq(focusListIndex).addClass('active');
                this._scrollList($listLi.eq(focusListIndex));
            }
        };

        /**
         * scroll list to focused item
         * @param {jquery} $focusedItem 포커싱할 대상
         */
        PaletteController.prototype._scrollList = function ($focusedItem) {
            var cursorTop = $focusedItem[0].offsetTop,
                scrollTop = this.$body.scrollTop(),
                itemHeight = $focusedItem.outerHeight(),
                listHeight = this.$body.height();

            if (this._isScrollInTopOfList(cursorTop, scrollTop, itemHeight)) {
                this.$body.scrollTop(cursorTop);
            } else if (this._isScrollInBottomOfList(cursorTop, scrollTop, itemHeight, listHeight)) {
                this.$body.scrollTop(cursorTop + itemHeight - listHeight);
            }
        };

        /**
         * 현재 포커싱된 위치가 화면에 보여지는 리스트의 가장 위인지 판단.
         * @param cursorTop cursor의 top
         * @param scrollTop 리스트의 스크롤 top
         * @param itemHeight item 하나의 height
         * @returns {boolean}
         * @private
         */
        PaletteController.prototype._isScrollInTopOfList = function (cursorTop, scrollTop, itemHeight) {
            return cursorTop - itemHeight < scrollTop;
        };

        /**
         * 현재 포커싱된 위치가 화면에 보여지는 리스트의 가장 밑인지 판단.
         * @param cursorTop cursor의 top
         * @param scrollTop 리스트의 스크롤 top
         * @param itemHeight item 하나의 height
         * @param listHeight list의 height
         * @returns {boolean}
         * @private
         */
        PaletteController.prototype._isScrollInBottomOfList = function (cursorTop, scrollTop, itemHeight, listHeight) {
            return cursorTop + itemHeight > scrollTop + listHeight;
        };

        return PaletteController;
    }

})();
