(function () {

    'use strict';

    angular
        .module('doorayWebApp.render')
        .factory('PaletteBiz', PaletteBiz);

    /* @ngInject */
    function PaletteBiz($q, $filter, ICON_LIST, Member, MyInfo, gravatarService, ResponseWrapAppendHelper, TaskQuickSearchStorage, TaskListBiz, mentionMarkdownFilter, SYNTAX_REGEX, BodyContentsConvertUtil, SyntaxToElement, gettextCatalog, _) {
        var orgId,
            QUERY_LIMIT_SIZE = 30,
            memberSearchBoost = {};

        MyInfo.getMyInfo().then(function (myInfo) {
            var defaultOrg = _.find(myInfo.organizationMemberRoleMap, 'defaultFlag', true);
            orgId = _.get(defaultOrg, 'organizationId');
        });

        function htmlEntityEncode(input) {
            return angular.element('<span>').text(input).html().replace(/\[/g, '&#91;').replace(/\]/g, '&#93;').replace(/\\/g, '');
        }

        function adaptToPaletteItems(list, makeItemFunction) {
            return _.map(list, function (item) {
                return makeItemFunction(item);
            });
        }

        var MentionPalette = {
            trigger: '@',
            triggerCondition: function (content, getPrevText) { // a@, ->@, ->>@ 모두 트리거
                if(SYNTAX_REGEX.mentionAddon.test(getPrevText(4))) {
                    return true;
                }
                var prevText = getPrevText(1).trim();
                return prevText.length === 0 || ')('.indexOf(prevText) > -1;
            },
            render: function (member, query) {
                var profile = '',
                    position = member.position ? '<span class="position">' + member.position + '</span>' : '',
                    department = member.department ? '<span class="department">' + member.department + '</span>' : '',
                    email = member.emailAddress ? '<span class="email">' + member.emailAddress + '</span>' : '',
                    name = member.name ? '<span class="name">' + $filter('uibTypeaheadHighlight')(htmlEntityEncode(member.name), query) + '</span>' : email;

                if (member.type === 'group') {
                    profile = ['<span class="profile v-icons-group-profile"/><span class="group">', gettextCatalog.getString('그룹'), '</span>'].join('');
                } else {
                    var imageUrl = _.get(member, 'profileImage.url', null) || gravatarService.url(member.emailAddress, {s: 16});
                    profile = '<img class="profile profile-picture" onerror="this.src=\'//dooray.com/static_images/profile.png\';" src="' + imageUrl + (_.get(member, 'profileImage.url', null) ? '" ' : '" width="16px" ') + 'height="16px">';
                }

                if (member.type === 'member' && member.tenantMemberRole === 'guest') {
                    profile += '<span class="guest">손님</span>';
                }

                return ['<a>', profile, name, position, department, email, '</a>'].join('');
            },
            querySender: function (query, done) {
                MentionPalette.search(query).then(function (result) {
                    done(result, MentionPalette.render);
                });
            },
            search: function (query) {
                var boostParam = _.isEmpty(query) ? {
                    ids: TaskQuickSearchStorage.getMentionMember()
                }: memberSearchBoost;

                return Member.searchWithParam(query, null, null, boostParam).then(function (result) {
                    return _.map(result.contents(), function (member) {
                        member[member.type].type = member.type;
                        return MentionPalette.makeItem(member[member.type]);
                    });
                });

            },
            makeItem: function (member) {
                var role = _.get(member, 'tenantMemberRole');

                if (member.type === 'group') {
                    member.name = member.fullCode;
                }

                return {
                    text: MentionPalette.setMarkdownText(member.type, member.name || member.emailAddress, orgId, member.id, role),
                    convertHTML: MentionPalette.changeHtml,
                    displayItem: member
                };
            },
            setMarkdownText: function (type, name, orgId, id, role, addMentionText) {
                var text = ['[@', htmlEntityEncode(name), '](dooray://', orgId];
                if (type === 'group') {
                    text.push('/member-groups/', id, ')');
                } else {
                    text.push('/members/', id, ' "', role, '")');
                }
                if (addMentionText) {
                    text.unshift(addMentionText);
                }
                return text.join('');
            },
            changeHtml: function (text) {
                return mentionMarkdownFilter(text, 'markdown');
            }
        };


        var TaskPalette = {
            trigger: '#',
            isHiddenTrigger: true, //실제로는 #룰 눌렀을 때 트리거 되지 않도록 하는 옵션
            render: function (text, query) {
                return ['<a><span class="icon icons-project"></span><span>',
                    $filter('uibTypeaheadHighlight')(htmlEntityEncode(text), query), '</span></a>'].join('');
            },
            querySender: function (query, done) {
                TaskPalette.search(query).then(function (result) {
                    var list = adaptToPaletteItems(result, TaskPalette._makeTaskItem);
                    done(list, this.render);
                }.bind(this));
            },
            search: function (query) {
                var param = {
                    subject: [query],
                    scope: '3', //all task
                    highlight: false,
                    page: 0,
                    size: QUERY_LIMIT_SIZE
                }, self = this;
                this.query = query;

                if (_.isEmpty(query)) {
                    return $q.when(TaskQuickSearchStorage.getRecentTasks());
                } else {
                    return TaskListBiz.fetchListBySearchV2(param).then(function (result) {
                        if (self.query !== query) {
                            return $q.reject();
                        }
                        result = ResponseWrapAppendHelper.create({contents: _.map(result.contents(), function (item) {
                            return item._wrap.refMap.postMap(item.postId);
                        }), references: result.references()});
                        return $q.when(result.contents());
                    });
                }
            },
            _makeTaskItem: function (task) {
                var projectCode = task.projectCode || task._wrap.refMap.projectMap(task.projectId).code,
                    postNumber = task.postNumber || task.number,
                    subject = task.taskName || task.subject;

                return {
                    text: TaskPalette.setMarkdownText(projectCode, postNumber, subject, task.workflowClass, task.id, orgId),
                    convertHTML: TaskPalette.changeHtml,
                    displayItem: [subject, ' (', projectCode, '/', postNumber, ')'].join('')
                };
            },
            setMarkdownText: function (projectCode, postNumber, subject, workflow, id, orgId) {
                var text = ['[', projectCode, '/', postNumber, ' ', htmlEntityEncode(subject), '](dooray://', orgId, '/tasks/', id, ' "', workflow, '")'];
                return text.join('');
            },
            changeHtml: function (text) {
                return mentionMarkdownFilter(text, 'markdown');
            }
        };

        var EmojiPalette = {
            trigger: ':',
            render: function (icon) {
                return ['<a><img class="profile icon-img" src="', icon.url, '"/>', '<span class="icon-text">:', icon.text, ':</span></a>'].join('');
            },
            search: function (query) {
                var result = [];

                _.forEach(ICON_LIST, function (icon) {
                    if (query.indexOf(icon.text) === 0) {
                        result.push(EmojiPalette.makeItem(icon));
                    }
                });
                return result;
            },
            querySender: function (query, done) {
                done(EmojiPalette.search(query), this.render);
            },
            makeItem: function (icon) {
                return {
                    text: ':' + icon.text + ':',
                    convertHTML: EmojiPalette.changeHtml,
                    displayItem: icon
                };
            },
            changeHtml: function (text) {
                return SyntaxToElement.icon(text.replace(/:/g, ''));
            }
        };

        var linkPalette = {
            trigger: '[',
            forbiddenQuery: true,
            render: function (text) {
                return ['<a><img class="profile" src="/assets/images/ver2/no_profile.png" width="16px"/><span>', text, '</span></a>'].join('');
            },
            querySender: function (query, done) {
                var result = [];
                if(query.length === 0) {
                    result = [
                        {
                            displayItem: gettextCatalog.getString('업무 참조'),
                            nextPalette: TaskPalette
                        }, {
                            displayItem: gettextCatalog.getString('멘션'),
                            nextPalette: MentionPalette
                        }
                    ];
                }
                done(result, this.render);
            }
        };

        return {
            link: linkPalette,
            mention: MentionPalette,
            task: TaskPalette,
            emoji: EmojiPalette,
            // option = { projectCode: '23', postNumber: 333, ids: ['1', '2', '3'] }
            setSearchBoost: function (boost) {
                boost = boost || {};
                memberSearchBoost = {};
                memberSearchBoost.projectCode = boost.projectCode;

                if (boost.postNumber) {
                    memberSearchBoost.post = {
                        projectCode: boost.projectCode,
                        number: boost.postNumber
                    };
                }

                if (boost.scheduleId) {
                    memberSearchBoost.schedule = {
                        scheduleId: boost.scheduleId
                    };
                }
            },
            markdownToHtmlConverter: function (markdown) {
                return BodyContentsConvertUtil.convertMarkdownBodyToContent(markdown);
            },
            htmlToMarkdownConverter: function (html) {
                return html.replace(SYNTAX_REGEX.doorayEmojiFromTag, function (match, text) {
                    return text;
                }).replace(SYNTAX_REGEX.doorayLink, function(match, addMentionText, addMentionTextHTML, text, fullUrl, linkType, id, etcFiled) {
                    if(linkType === 'tasks') {
                        text = text.replace(/\sl\s/, ' ');
                    }
                    if(addMentionText) {
                        addMentionText = addMentionText.replace(/\\>/g, '>');
                    }
                    if(addMentionTextHTML) {
                        addMentionTextHTML = addMentionTextHTML.replace(/\\>/g, '>');
                    }
                    text = htmlEntityEncode(text);
                    return (addMentionText || addMentionTextHTML || '') + '[' + text + '](' + fullUrl + ' "' + etcFiled + '")';
                });
            }
        };
    }

})();
