(function () {

    'use strict';

    angular
        .module('doorayWebApp.setting.user')
        .component('selectTimezone', {
            templateUrl: 'modules/setting/user/commonService/selectTimezone/selectTimezone.html',
            controller: SelectTimezone,
            bindings: {
                zone: '='
            }
        });

    /* @ngInject */
    function SelectTimezone(HelperLocaleUtil, moment) {
        var $ctrl = this;
        $ctrl.zoneList = _makeZoneList(HelperLocaleUtil.getLanguage());

        function _makeZoneList(lang) {
            lang = lang.substr(0, 2);
            var now = moment();
            var zoneList = [{
                "offset": "-11:00",
                "name": {"en": "Samoa", "ko": "사모아", "ja": "サモア", "zh": "萨摩亚"},
                "zone": "US/Samoa"
            }, {
                "offset": "-10:00",
                "name": {"en": "Hawaii", "ko": "하와이", "ja": "ハワイ", "zh": "夏威夷"},
                "zone": "US/Hawaii"
            }, {
                "offset": "-09:30",
                "name": {"en": "Marquesas Islands", "ko": "마키저스 제도", "ja": "マルキーズ諸島", "zh": "马克萨斯群岛"},
                "zone": "Pacific/Marquesas"
            }, {
                "offset": "-09:00",
                "name": {"en": "Alaska", "ko": "알래스카", "ja": "アラスカ", "zh": "阿拉斯加"},
                "zone": "US/Alaska"
            }, {
                "offset": "-08:00",
                "name": {
                    "en": "Pacific Time (US & Canada)",
                    "ko": "태평양 표준시(미국과 캐나다)",
                    "ja": "太平洋標準時 (米国およびカナダ)",
                    "zh": "太平洋时间(美国和加拿大)"
                },
                "zone": "Canada/Pacific"
            }, {
                "offset": "-07:00",
                "name": {
                    "en": "Mountain Time (US & Canada)",
                    "ko": "산지 표준시(미국과 캐나다)",
                    "ja": "山地標準時 (米国およびカナダ)",
                    "zh": "山地时间(美国和加拿大)"
                },
                "zone": "Canada/Mountain"
            }, {
                "offset": "-06:00",
                "name": {
                    "en": "Central Time (US & Canada)",
                    "ko": "중부 표준시 (미국과 캐나다)",
                    "ja": "中部標準時 (米国およびカナダ)",
                    "zh": "中部时间(美国和加拿大)"
                },
                "zone": "Canada/Central"
            }, {
                "offset": "-05:00",
                "name": {
                    "en": "Eastern Time (US & Canada)",
                    "ko": "동부 표준시(미국과 캐나다)",
                    "ja": "東部標準時 (米国およびカナダ)",
                    "zh": "东部时间(美国和加拿大)"
                },
                "zone": "US/Eastern"
            }, {
                "offset": "-04:00",
                "name": {"en": "Atlantic Time (Canada)", "ko": "대서양 표준시(캐나다)", "ja": "大西洋標準時 (カナダ)", "zh": "大西洋时间(加拿大)"},
                "zone": "Canada/Atlantic"
            }, {
                "offset": "-03:30",
                "name": {"en": "Newfoundland", "ko": "뉴펀들랜드", "ja": "ニューファンドランド", "zh": "纽芬兰"},
                "zone": "Canada/Newfoundland"
            }, {
                "offset": "-03:00",
                "name": {"en": "Brasilia", "ko": "브라질리아", "ja": "ブラジリア", "zh": "巴西利亚"},
                "zone": "America/Fortaleza"
            }, {
                "offset": "-02:00",
                "name": {"en": "Mid-Atlantic", "ko": "중부-대서양", "ja": "中央大西洋", "zh": "中大西洋"},
                "zone": "America/Noronha"
            }, {
                "offset": "-01:00",
                "name": {"en": "Azores", "ko": "아조레스", "ja": "アゾレス諸島", "zh": "亚速尔群岛"},
                "zone": "Atlantic/Azores"
            }, {
                "offset": "+00:00",
                "name": {
                    "en": "Dublin, Edinburgh, Lisbon, London",
                    "ko": "더블린, 에든버러, 리스본, 런던",
                    "ja": "ダブリン、エジンバラ、リスボン、ロンドン",
                    "zh": "都柏林，爱丁堡，里斯本，伦敦"
                },
                "zone": "Europe/London"
            }, {
                "offset": "+01:00",
                "name": {
                    "en": "Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
                    "ko": "암스테르담, 베를린, 베른, 로마, 스톡홀름, 빈",
                    "ja": "アムステルダム、ベルリン、ベルン、ローマ、ストックホルム、ウィーン",
                    "zh": "阿姆斯特丹，柏林，伯尔尼，罗马，斯德哥尔摩，维也纳"
                },
                "zone": "Europe/Amsterdam"
            }, {
                "offset": "+02:00",
                "name": {"en": "Athens, Bucharest", "ko": "아테네, 부카레스트", "ja": "アテネ、ブカレスト", "zh": "雅典，布加勒斯特"},
                "zone": "Europe/Athens"
            }, {
                "offset": "+03:00",
                "name": {
                    "en": "Moscow, St. Petersburg, Volgograd",
                    "ko": "모스크바, 상트페테르부르크, 볼고그라드",
                    "ja": "モスクワ、サンクトペテルブルク、ボルゴグラード",
                    "zh": "莫斯科、圣彼得堡、伏尔加格勒"
                },
                "zone": "Europe/Moscow"
            }, {
                "offset": "+03:30",
                "name": {"en": "Tehran", "ko": "테헤란", "ja": "テヘラン", "zh": "德黑兰"},
                "zone": "Asia/Tehran"
            }, {
                "offset": "+04:00",
                "name": {"en": "Abu Dhabi, Muscat", "ko": "아부다비, 무스카트", "ja": "アブダビ、マスカット", "zh": "阿布扎比，马斯喀特"},
                "zone": "Asia/Muscat"
            }, {
                "offset": "+04:30",
                "name": {"en": "Kabul", "ko": "카불", "ja": "カブール", "zh": "喀布尔"},
                "zone": "Asia/Kabul"
            }, {
                "offset": "+05:00",
                "name": {"en": "Ashgabat, Tashkent", "ko": "아슈하바트, 타슈켄트", "ja": "アシハバード、タシケント", "zh": "阿什哈巴德，塔什干"},
                "zone": "Asia/Ashgabat"
            }, {
                "offset": "+05:30",
                "name": {
                    "en": "Chennai, Kolkata, Mumbai, New Delhi",
                    "ko": "첸나이, 콜카타, 뭄바이, 뉴델리",
                    "ja": "チェンナイ、コルカタ、ムンバイ、ニューデリー",
                    "zh": "钦奈，加尔各答，孟买，新德里"
                },
                "zone": "Asia/Kolkata"
            }, {
                "offset": "+05:45",
                "name": {"en": "Kathmandu", "ko": "카트만두", "ja": "カトマンズ", "zh": "加德满都"},
                "zone": "Asia/Kathmandu"
            }, {
                "offset": "+06:00",
                "name": {"en": "Astana", "ko": "아스타나", "ja": "アスタナ", "zh": "阿斯塔纳"},
                "zone": "Asia/Dhaka"
            }, {
                "offset": "+06:30",
                "name": {"en": "Yangon (Rangoon)", "ko": "양곤", "ja": "ヤンゴン (ラングーン)", "zh": "仰光"},
                "zone": "Asia/Yangon"
            }, {
                "offset": "+07:00",
                "name": {"en": "Bangkok, Hanoi, Jakarta", "ko": "방콕, 하노이, 자카르타", "ja": "バンコク、ハノイ、ジャカルタ", "zh": "曼谷，河内，雅加达"},
                "zone": "Asia/Bangkok"
            }, {
                "offset": "+08:00",
                "name": {
                    "en": "Beijing, Chongqing, Hong Kong, Urumqi",
                    "ko": "베이징, 충칭, 홍콩 특별 행정구, 우루무치",
                    "ja": "北京、重慶、香港、ウルムチ",
                    "zh": "北京，重庆，香港特别行政区，乌鲁木齐"
                },
                "zone": "Hongkong"
            }, {
                "offset": "+08:30",
                "name": {"en": "Pyongyang", "ko": "평양", "ja": "平壌", "zh": "平壤"},
                "zone": "Asia/Pyongyang"
            }, {
                "offset": "+08:45",
                "name": {"en": "Eucla", "ko": "유클라", "ja": "ユークラ", "zh": "尤克拉"},
                "zone": "Australia/Eucla"
            }, {
                "offset": "+09:00",
                "name": {"en": "Osaka, Sapporo, Tokyo", "ko": "오사카, 삿포로, 도쿄", "ja": "大阪、札幌、東京", "zh": "大坂，扎幌，东京"},
                "zone": "Asia/Tokyo"
            }, {
                "offset": "+09:00",
                "name": {"en": "Seoul", "ko": "서울", "ja": "ソウル", "zh": "首尔"},
                "zone": "Asia/Seoul"
            }, {
                "offset": "+09:30",
                "name": {"en": "Darwin", "ko": "다윈", "ja": "ダーウィン", "zh": "达尔文"},
                "zone": "Australia/Darwin"
            }, {
                "offset": "+10:00",
                "name": {
                    "en": "Canberra, Melbourne, Sydney",
                    "ko": "캔버라, 멜버른, 시드니",
                    "ja": "キャンベラ、メルボルン、シドニー",
                    "zh": "堪培拉，墨尔本，悉尼"
                },
                "zone": "Australia/Canberra"
            }, {
                "offset": "+10:30",
                "name": {"en": "Lord Howe Island", "ko": "로드하우 섬", "ja": "ロードハウ島", "zh": "豪勋爵岛"},
                "zone": "Australia/Lord_Howe"
            }, {
                "offset": "+11:00",
                "name": {
                    "en": "Solomon Is., New Caledonia",
                    "ko": "솔로몬 제도, 뉴칼레도니아",
                    "ja": "ソロモン諸島、ニューカレドニア",
                    "zh": "所罗门群岛，新喀里多尼亚"
                },
                "zone": "Pacific/Noumea"
            }, {
                "offset": "+12:00",
                "name": {"en": "Auckland, Wellington", "ko": "오클랜드, 웰링턴", "ja": "オークランド、ウェリントン", "zh": "奥克兰，惠灵顿"},
                "zone": "Pacific/Auckland"
            }];

            return _.map(zoneList, function (zone) {
                zone.offset = now.tz(zone.zone).format('Z');
                zone.displayName = zone.name[lang] || zone.name.en;
                zone.displayName = ['(UTC', zone.offset, ')', zone.displayName].join('');
                return zone;
            });
        }
    }

})();
