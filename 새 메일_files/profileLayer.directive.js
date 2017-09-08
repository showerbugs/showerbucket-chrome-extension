(function () {

    'use strict';

    angular
        .module('doorayWebApp.layout')
        .factory('ProfilePopoverFactory', ProfilePopoverFactory)
        .directive('profileLayer', ProfileLayer)
        .directive('profileLayerByEmail', ProfileLayerByEmail)
        //.directive('groupProfileLayer', GroupProfileLayer)
        .directive('mentionMarkdown', mentionMarkdown);
        //.directive('mentionGroupMarkdown', mentionGroupMarkdown);


    /* @ngInject */
    function ProfilePopoverFactory($compile, $document, $templateCache) {
        var popoverTemplate = {
            member: {
                popover: getPopoverTemplate(),
                content: $templateCache.get('modules/layouts/profileLayer/profileLayer.html'),
                maxHeight: 150
            },
            group: {
                popover: getPopoverTemplate('group'),
                content: $templateCache.get('modules/layouts/profileLayer/groupProfileLayer.html'),
                maxHeight: 300
            }
        };

        function getPopoverTemplate(className) {
            var popoverTemplate = ['<div class="profile-layer popover ', className || '', '">',
                '<div class="arrow"></div>',
                '<div class="popover-content">',
                '</div>',
                '</div>'];
            return popoverTemplate.join('');
        }


        function make(scope, element, template) {
            var data = {
                elementId: null
            };

            element.popover({
                placement: function() {
                    var offset = element.offset();

                    if (offset.top + template.maxHeight > $document.height()){
                        return "top";
                    }
                    return "bottom";
                },
                container: 'body',
                html: true,
                trigger: 'manual',
                content : $compile(template.content)(scope),
                template: template.popover
            });

            element.popover('show');
            data.elementId = element.attr('aria-describedby');

            function hide (e) {
                if(angular.element(e.target).parents('.profile-layer').length === 0) {
                    element.popover('hide');
                }
            }

            element.on('click', function (e) {
                e.stopPropagation();
                $document.find('body').trigger('click', hide);
                element.popover('toggle');
                data.elementId = element.attr('aria-describedby') || data.elementId;
            });

            $document.on('click', hide);
            $document.on('mousewheel', hide);

            scope.$on("$destroy", function() {
                element.popover('destroy');
                angular.element('#' + data.elementId).remove();
                $document.off('click', hide);
                $document.off('mousewheel', hide);
                element.off('click');
                element.removeData();
            });

            return true;
        }

        function makeProfilePopover (scope, element, overcallback) {
            element.on('click', onClick);
            scope.$on('$destroy', function () {
                element.off('click', onClick);
                element = null;
            });

            function onClick(e) {
                e.preventDefault();
                e.stopPropagation();
                $document.find('body').trigger('click');
                element.off('click');
                overcallback().then(function(result){
                    scope.member = result;
                    make(scope, element, popoverTemplate.member);
                });
            }
        }

        function makeGroupProfilePopover (scope, element, overcallback) {
            element.on('click', function(e){
                e.preventDefault();
                e.stopPropagation();
                $document.find('body').trigger('click');
                element.off('click');
                overcallback().then(function(result){
                    scope.group = result;
                    scope.members = _.map(result.organizationMemberIdList, function(id){
                        return result._wrap.refMap.organizationMemberMap(id);
                    });
                    make(scope, element, popoverTemplate.group);
                });
            });
        }
        return {
            make: make,
            makeProfilePopover: makeProfilePopover,
            makeGroupProfilePopover: makeGroupProfilePopover
        };
    }



    /* @ngInject */
    function ProfileLayer(ProfilePopoverFactory, Member, $q) {

        return {
            restrict: 'A',
            replace: false,
            scope: {
                'profileLayer': '@',
                'hidePopover': '@'
            },
            link: function (scope, element) {
                var unbindWatch = scope.$watch('profileLayer', function(val){
                    if(val && !scope.hidePopover ) {
                        unbindWatch();
                        ProfilePopoverFactory.makeProfilePopover(scope, element, function () {
                            return Member.getByMemberId(scope.profileLayer).then(function (result) {
                                var member = result.contents();
                                if(!member.id) {
                                    scope.$destroy();
                                    return $q.reject();
                                }
                                return member;
                            });

                        });
                    }
                });
            }
        };
    }



    /* @ngInject */
    function ProfileLayerByEmail(ProfilePopoverFactory, Member, $q) {

        return {
            restrict: 'A',
            replace: false,
            scope: {
                'profileLayerByEmail': '@',
                'hidePopover': '@'
            },
            link: function (scope, element) {
                var unbindWatch = scope.$watch('profileLayerByEmail', function(val){
                    if(val && !scope.hidePopover) {
                        unbindWatch();
                        ProfilePopoverFactory.makeProfilePopover(scope, element, function () {
                            return Member.searchWithParam(scope.profileLayerByEmail, 'emailAddress', ['member']).then(function (result) {
                                if(result.contents().length === 0 || _.get(result.contents()[0], 'member.emailAddress') !== scope.profileLayerByEmail) {
                                    scope.$destroy();
                                    return $q.reject();
                                }
                                var memberId = result.contents()[0].member.id;

                                return Member.getByMemberId(memberId).then(function (result) {
                                    element.addClass('profile-popover'); //For Style
                                    return result.contents();
                                });
                            });

                        });
                    }
                });
            }
        };
    }

    ///* @ngInject */
    //function GroupProfileLayer(ProfilePopoverFactory, ProjectMemberGroupBiz, $q) {
    //
    //    return {
    //        restrict: 'A',
    //        replace: false,
    //        scope: {
    //            'groupProfileLayer': '@',
    //            'groupCode': '@',
    //            'hidePopover': '@'
    //        },
    //        link: function (scope, element) {
    //            var unbindWatch = scope.$watch('groupProfileLayer', function(val){
    //                if(val && !scope.hidePopover ) {
    //                    unbindWatch();
    //                    var cor = /(.*)\/.+/.exec(scope.groupCode);
    //                    ProfilePopoverFactory.makeGroupProfilePopover(scope, element, function(){
    //                        return ProjectMemberGroupBiz.fetch({
    //                            projectCode: cor[1],
    //                            projectMemberGroupId: scope.groupProfileLayer
    //                        }).then(function (result) {
    //                            var group = result.contents();
    //                            if(!group.id) {
    //                                scope.$destroy();
    //                                return $q.reject();
    //                            }
    //                            element.addClass('profile-popover'); //For Style
    //                            return group;
    //                        });
    //                    });
    //                }
    //            });
    //        }
    //    };
    //}


    /* @ngInject */
    function mentionMarkdown(ProfilePopoverFactory, Member) {

        return {
            restrict: 'C',
            replace: false,
            link: function (scope, element) {
                var orgId = element.data('id');
                ProfilePopoverFactory.makeProfilePopover(scope, element, function(){
                    return Member.getByMemberId(orgId).then(function (result) {
                        return result.contents();
                    });
                });
            }
        };
    }

    ///* @ngInject */
    //function mentionGroupMarkdown(ProfilePopoverFactory, ProjectMemberGroupBiz) {
    //
    //    return {
    //        restrict: 'C',
    //        replace: false,
    //        link: function (scope, element) {
    //            var groupId = element.data('id');
    //            var cor = /@(.*)\/.+/.exec(element.text());
    //            ProfilePopoverFactory.makeGroupProfilePopover(scope, element, function(){
    //                return ProjectMemberGroupBiz.fetch({
    //                    projectCode: cor[1],
    //                    projectMemberGroupId: groupId
    //                }).then(function (result) {
    //                    return result.contents();
    //                });
    //            });
    //        }
    //    };
    //}


})();
