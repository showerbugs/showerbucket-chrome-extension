(function () {

    'use strict';

    angular.module('doorayWebApp.layout')

        //.config(['uibDatepickerPopupConfig', function (uibDatepickerPopupConfig) {
        //    uibDatepickerPopupConfig.currentText = '오늘';
        //    uibDatepickerPopupConfig.clearText = '초기화';
        //    uibDatepickerPopupConfig.closeText = '닫기';
        //}])
        .config(['growlProvider', function (growlProvider) {
            growlProvider.globalTimeToLive(2000);
            growlProvider.onlyUniqueMessages(false);
            growlProvider.globalDisableCountDown(true);
        }])
        .config(['$uibTooltipProvider', function ($uibTooltipProvider) {
            $uibTooltipProvider.options({
                placement: 'bottom'
            });
        }])
        .config(['LightboxProvider', function (LightboxProvider) {
            LightboxProvider.templateUrl = 'modules/layouts/view/viewAttachedFileList/viewAttachedFilePreviewLightBox.html';
        }])
        .config(['TrelloApiProvider', function (TrelloApiProvider) {
            TrelloApiProvider.init({
                key: 'dcac84559be3596392b79eaa9ba88694',
                secret: 'b0a955768081aa1cfbdd658b6ce9821abff878c62c58a27c66d01bba5ccb4200',
                scopes: {read: true},
                AppName: 'Dooray'
            });

            //TODO 트렐로 API 요청을 angular-trello.js에서 이관해야 함
            //var a = document.createElement("script");
            //a.type = "text/javascript";
            //a.async = true;
            //a.src = "https://api.trello.com/1/client.js?key=" + options.key;
            //var b = document.getElementsByTagName("script")[0];
            //b && b.parentNode.insertBefore(a, b);
        }])
        .config(['gravatarServiceProvider', function (gravatarServiceProvider) {
            gravatarServiceProvider.defaults = {
                size: 16,
                'default': '//dooray.com/static_images/profile.png'
            };
        }])
        .config(['flowFactoryProvider', 'httpStatusCode', '_', function (flowFactoryProvider, httpStatusCode, _) {
            flowFactoryProvider.defaults = {
                target: null, //ApiConfigUtil.wasContext() + '/files',   //overriding DefaultFileBiz/MailFlowTempFileBiz
                testChunks: false,
                allowDuplicateUploads: true,
                chunkSize: Math.pow(1024, 4), //1TB
                permanentErrors: [
                    httpStatusCode.NOT_FOUND,
                    httpStatusCode.METHOD_NOT_ALLOWED,
                    httpStatusCode.FORBIDDEN,
                    httpStatusCode.UNSUPPORTED_MEDIA_TYPE,
                    httpStatusCode.INTERNAL_SERVER_ERROR,
                    httpStatusCode.NOT_IMPLEMENTED
                ],
                readFileFn: function (fileObj, startByte, endByte, fileType, chunk) {
                    //https://github.com/flowjs/flow.js/issues/171
                    //PATCH FOR mimeType settings if fileType is undefined
                    fileType = _.isUndefined(fileType) ? fileObj.file.type : fileType;
                    chunk.fileType = fileType;

                    //references flow.js#L1052
                    var function_name = 'slice';

                    if (fileObj.file.slice)
                        function_name = 'slice';
                    else if (fileObj.file.mozSlice)
                        function_name = 'mozSlice';
                    else if (fileObj.file.webkitSlice)
                        function_name = 'webkitSlice';

                    chunk.readFinished(fileObj.file[function_name](startByte, endByte, fileType));
                }
            };

            flowFactoryProvider.on('fileError', function (flowFile, errorResponse, flowChunk) {
                //현재 config 시점에서 주입받는 $injector는 doorayWebApp.main modules로서 doorayWebApp의 서비스 접근을 위해 global single instance를 직접 접근
                angular.element(document).injector().invoke(['MessageModalFactory', 'gettextCatalog', function (MessageModalFactory, gettextCatalog) {
                    MessageModalFactory.alert([
                        '<p>', gettextCatalog.getString('파일 업로드에 실패했습니다.'), '</p>' +
                        '<p>(', gettextCatalog.getString('오류코드: HTTP'), ' ', _.get(flowChunk, 'xhr.status', gettextCatalog.getString('알 수 없음')), ')</p>'
                    ].join(''));
                }]);
            });

            // Can be used with different implementations of Flow.js if html5 api not support
            if (!!(window.File && window.FormData)) {
                flowFactoryProvider.factory = window.fustyFlowFactory;
            }
        }])
        .config(['$provide', function ($provide) {
            var uiSelectDecoratorList = ['uiSelectChoicesDirective', 'uiSelectDirective', 'uiSelectMatchDirective'],
                i = 0, len = uiSelectDecoratorList.length;
            for (; i < len; i++) {
                var directiveName = uiSelectDecoratorList[i];
                $provide.decorator(directiveName, function ($delegate) {
                    var preserveTemplateUrl = $delegate[0].templateUrl;
                    $delegate[0].templateUrl = function (element, attrs) {
                        var ref = preserveTemplateUrl(element, attrs);
                        return attrs.templateUrl || ref;
                    };
                    return $delegate;
                });
            }
        }])
        .config(['uiSelectConfig', function (uiSelectConfig) {
            uiSelectConfig.theme = 'modules/vendor/ui-templates/ui-select/dooray';
            uiSelectConfig.dropdownPosition = 'bottom';
        }])
        .constant('addressparser', window.addressparser)
        .constant('Autolinker', window.Autolinker)
        .constant('CryptoJS', window.CryptoJS)
        .constant('EMIT_EVENTS', {
            'RESIZE_NAVI': '_resizeNavi',
            'RESIZE_VIEW': '_resizeView',
            'CHANGE_DIVIDE_VIEW_MODE': '_changeViewMode',
            'CHANGE_MOBILE_MODE': '_changeMobileMode',
            'SAVE_DRAFT': '_saveDraft',
            'COLLECT_INLINE_EDITING_PROMISE': '_collect_inline_editing_promise',
            'CHANGE_PROJECT_MANAGEMENT_TAB_INDEX': '_changeProjectManagementTabIndex',
            'CUSTOM_DOM_RENDERED': '_customDomRendered'
        })
        .constant('REPLACE_REGEX', {
            doubleBlank: /\s{2,}/,
            blank: /\s+/,
            notStartSharp: /^(?!#)/
        })
        //TODO: mouseTrap에서 sequence한 문자열 조합일 경우 한글조합을 따로 등록해줘야함
        //일본어일 경우는? 중국어일 경우는? mouseTrap에 issue 남겨서 히스토리 관리할 수 있도록
        .constant('KEYMAP', {
            "SUBMIT": 'mod+enter',
            'OPEN_RECENT_POST': ['command+k', 'ctrl+k'],
            'OPEN_PRESENTATION_VIEW': ['v p', 'ㅍ ㅔ'],
            'OPEN_MEETING_VIEW': ['v m', 'ㅍ ㅡ'],
            'OPEN_NEW_WRITEFORM': ['w w', 'ㅈ ㅈ'],
            'OPEN_NEW_SIMPLE_WRITEFORM': ['f w', 'ㄹ ㅈ'],
            'OPEN_NEW_POST_POPUP': ['v n', 'ㅍ ㅜ'],
            'MOVE_PROJECT_TAB': ['g p', 'ㅎ ㅔ'],
            'MOVE_MAIL_TAB': ['g m', 'ㅎ ㅡ'],
            'MOVE_CALENDAR_TAB': ['g c', 'ㅎ ㅊ'],
            'OPEN_STREAM_MODAL': ['g s', 'ㅎ ㄴ'],
            'TOGGLE_FAVORITE': ['m s', 'ㅡ ㄴ'],
            'MOVE_FOCUS_COMMENT_WRITE_FORM': ['c c', 'ㅊ ㅊ'],
            'TOGGLE_ZOOM_VIEW': ['v w', 'ㅍ ㅈ']
        })
        .constant('USE_NAVER_TRANSLATOR_TENANT', ['lineis.dooray.com', 'neqa3.dooray.com'])
        .constant('TENANT_MEMBER_ROLE', {
            OWNER: {
                NAME: '대표',
                ROLE: 'owner'
            },
            ADMIN: {
                NAME: '관리자',
                ROLE: 'admin'
            },
            MEMBER: {
                NAME: '멤버',
                ROLE: 'member'
            },
            GUEST: {
                NAME: '손님',
                ROLE: 'guest'
            },
            LEAVER: {
                ROLE: 'leaver'  //퇴사자
            }

        })
        .constant('ORG_MEMBER_ROLE', {
            OWNER: {
                NAME: '대표',
                ROLE: 'owner'
            },
            ADMIN: {
                NAME: '관리자',
                ROLE: 'admin'
            },
            MEMBER: {
                NAME: '멤버',
                ROLE: 'member'
            },
            GUEST: {
                NAME: '손님',
                ROLE: 'guest'
            },
            LEAVER: {
                ROLE: 'leaver'  //퇴사자
            }
        })
        .constant('PROJECT_MEMBER_ROLE', {
            ADMIN: {
                NAME: '관리자',
                ROLE: 'admin'
            },
            MEMBER: {
                NAME: '멤버',
                ROLE: 'member'
            },
            POSTUSER: {
                ROLE: 'postuser'    //업무유저
            }
        })
        .constant('WORKFLOWS_MAP', {
            registered: {
                NAME: '등록'
            },
            working: {
                NAME: '진행'
            },
            closed: {
                NAME: '완료'
            }
        })
        .constant('WORKFLOWS', ['registered', 'working', 'closed'])
        .constant('ITEM_TYPE', {
            'POST': 'post',
            'MAIL': 'mail',
            'CALENDAR': 'calendar',
            'SCHEDULE': 'schedule'
        })
        .constant('DISABLED_ORG_ID_LIST', [
            '1387695619855943168', // comico
            '1387695620108223488', // commerce ES개발실(사용안함)
            '1409828720108523734'  // unione,유니원
        ])
        // UI 팀 인원은 예외처리필요하여 추가

        .constant('UI_TEAM', [
            '1544591163454281105', // 문병철 팀장님 byungcheol.moon@nhnent.com
            '1561544306365306112', // 정민선 책임님 minsun.choung@nhnent.com
            '1561544345086349665', // 김세원 선임님 seone.kim@nhnent.com
            '1666142437402105250', // 김보름 전임님 boreum.kim@nhnent.com
            '1544586177282911515', // 김정민 전임님 jungmin.kim@nhnent.com
            '1640773100509229178', // 서인영 전임님 inyoung.seo@nhnent.com
            '1601496454127807614', // 최윤아 전임님 yuna.choi@nhnent.com
            '1387695626904007680', // 한다경 전임님 ddkkaayy@nhnent.com
            '1550335776955453397', // 허재연 전임님 jaeyeon.heo@nhnent.com
            '1561544300921332676', // 황애리 전임님 aeri.hwang@nhnent.com
            '1645846489084355615', // 전가영 사원님 gayoung.jun@nhnent.com
            '1666142436608223707', // 룡룡
            '1561205468423003623'  // 전뉴
        ]);

})();
