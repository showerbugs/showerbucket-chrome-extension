(function () {

    'use strict';

    angular
        .module('doorayWebApp.components')
        .directive('nanoSticky', nanoSticky)
        .factory('NanoStickyFactory', NanoStickyFactory)
        .factory('StickyComponent', StickyComponent);

    /* @ngInject */
    function nanoSticky(NanoStickyFactory, $timeout) {
        return {
            scope: {},
            priority: 0,
            link: function (scope, element) {
                $timeout(function () {
                    var sticky = new NanoStickyFactory.create(element);
                    scope.$on('$destroy', function () {
                        sticky.destroy();
                    });
                }, 0, false);
            }
        };
    }

    /* @ngInject */
    function NanoStickyFactory(StickyComponent) {

        var DEFAULT_OPTION = {
            scroller: '.nano-content',
            stickyClass: 'dooray-sticky-active'
        };

        return {
            create: function ($stickyEl, option) {
                return new StickyComponent($stickyEl, _.assign(DEFAULT_OPTION, option));
            },
            createStickyGroup: function ($stickyEls, option) {
                var group = _($stickyEls).filter(function($stickyEl) {
                    return $stickyEl.height() > 0 && $stickyEl.is(":visible");
                }).map(function ($stickyEl) {
                    return new StickyComponent($stickyEl, _.assign(DEFAULT_OPTION, option));
                }).value();

                _.forEach(group, function (item, index) {
                    var filterGroup = group.slice(0, index),
                        reverseFilterGroup = group.slice(index + 1);
                    item.setOption({
                        shouldPin: function () {
                            return _.every(filterGroup, function (s) {
                                return s.isSticky();
                            });
                        },
                        shouldUnPin: function () {
                            return _.every(reverseFilterGroup, function (s) {
                                return !s.isSticky();
                            });
                        }
                    });
                });
                return group;
            }
        };
    }

    /* @ngInject */
    function StickyComponent($window) {

        var Sticky = function ($el, option) {
            var option = _.assign({
                    wrapMargin: 0
                }, option),
                $sticky = $el,
                $section = $sticky.parents(option.scroller),
                $sectionWrap = $section.parent(),
                stickyTop = $sticky.offset().top - $section.offset().top + $section.scrollTop(),
                lastScrollTop = $section.scrollTop(),
                isSticky = false,
                width = $sectionWrap.width() - option.wrapMargin;

            if (option.hideEl$) {
                option.hideTop = option.hideEl$.offset().top - $section.offset().top + $section.scrollTop();
            }

            $section.on('scroll', update);
            angular.element($window).on('resize', onResize);

            function onResize() {
                //reset width
                width = $sectionWrap.width() - option.wrapMargin;
                $sticky.css({width: width});
                update();
            }

            function update() {
                if (shouldPin()) {
                    isSticky = true;
                    pin();
                } else if (shouldUnpin()) {
                    isSticky = false;
                    unpin();
                }
                lastScrollTop = $section.scrollTop();
            }

            function pin() {
                $sticky.addClass(option.stickyClass);
                $sticky.css({top: $section.offset().top, position: 'fixed', width: width});
                $sectionWrap.css({'margin-top': parseInt($sectionWrap.css('margin-top'), 10) + $sticky.outerHeight(true)});
            }

            function unpin() {
                if($sticky) {
                    $sticky.removeClass(option.stickyClass);
                    $sticky.css({top: 0, position: '', width: ''});
                    $sectionWrap.css({'margin-top': parseInt($sectionWrap.css('margin-top'), 10) - $sticky.outerHeight(true)});
                }
            }

            function shouldPin() {
                var scrollTop = $section.scrollTop(),
                    isDownDirection = scrollTop > lastScrollTop,
                    shouldPin = false;

                if (isSticky) {
                    return;
                }

                if (stickyTop < scrollTop && isDownDirection) {
                    shouldPin = true;
                }

                if (option.hideEl$) {
                    if (option.hideEl$.height() + option.hideTop > scrollTop && !isDownDirection && stickyTop + $sticky.outerHeight(true) < scrollTop) {
                        shouldPin = true;
                    } else if (option.hideEl$.height() + option.hideTop - $sticky.outerHeight(true) < scrollTop) {
                        shouldPin = false;
                    }
                }

                if (option.shouldPin && !option.shouldPin(isSticky)) {
                    return;
                }

                return shouldPin;
            }

            function shouldUnpin() {
                var scrollTop = $section.scrollTop(),
                    isUpDirection = scrollTop < lastScrollTop,
                    shouldUnpin = false;

                if (!isSticky) {
                    return;
                }

                if (option.hideEl$) {
                    if (option.hideEl$.height() + option.hideTop < scrollTop && !isUpDirection) {
                        shouldUnpin = true;
                    } else if (option.hideEl$.height() + option.hideTop > scrollTop) {
                        shouldUnpin = false;
                    }
                }

                if (stickyTop + $sticky.outerHeight(true) > scrollTop && isUpDirection) {
                    shouldUnpin = true;
                }

                if (option.shouldUnPin && !option.shouldUnPin() && !isUpDirection) {
                    return;
                }

                return shouldUnpin;
            }

            return {
                destroy: function () {
                    $section && $section.off('scroll', update);
                    angular.element($window).off('resize', onResize);
                    unpin();
                    $sectionWrap && $sectionWrap.css({'margin-top': 0});
                    $section = null;
                    $sticky = null;
                    $sectionWrap = null;
                },
                isSticky: function () {
                    return isSticky;
                },
                setOption: function (_option) {
                    option = _.assign(option, _option);
                }
            };
        };

        return Sticky;
    }


})();
