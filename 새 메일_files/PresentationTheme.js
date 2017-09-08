(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .constant('PresentationTheme', {
            'mw': {
                caption: 'Modern White',
                ratio: '16:9',
                background: {
                    title: '#fff',
                    body: '#fff',
                    subTitle: '#fff'
                },
                style: '/assets/presentation/theme/modern-white.css',
                samples: ['/assets/images/presentation/modern-white1.png', '/assets/images/presentation/modern-white2.png', '/assets/images/presentation/modern-white3.png']
            },
            'md': {
                caption: 'Modern Dark',
                ratio: '16:9',
                background: {
                    title: '#000',
                    body: '#000',
                    subTitle: '#000'
                },
                style: '/assets/presentation/theme/modern-dark.css',
                samples: ['/assets/images/presentation/modern-dark1.png', '/assets/images/presentation/modern-dark2.png', '/assets/images/presentation/modern-dark3.png']
            },
            'sb': {
                caption: 'Simple Blue',
                ratio: '16:9',
                background: {
                    title: '/assets/images/presentation/BG_blue.png',
                    body: '/assets/images/presentation/dooray-blue-body.jpg',
                    subTitle: '#fff'
                },
                style: '/assets/presentation/theme/simple-blue.css',
                samples: ['/assets/images/presentation/simple-blue1.png', '/assets/images/presentation/simple-blue2.png', '/assets/images/presentation/simple-blue3.png']
            },
            'sd': {
                caption: 'Simple Dark',
                ratio: '16:9',
                background: {
                    title: '/assets/images/presentation/BG_black.png',
                    body: '#262626',
                    subTitle: '#262626'
                },
                style: '/assets/presentation/theme/simple-dark.css',
                samples: ['/assets/images/presentation/simple-dark1.png', '/assets/images/presentation/simple-dark2.png', '/assets/images/presentation/simple-dark3.png']
            }, 'sbt': {
                caption: 'Simple Blue Resize',
                enableNewFeature: true,
                ratio: '16:9',
                background: {
                    title: '/assets/images/presentation/BG_blue.png',
                    body: '/assets/images/presentation/dooray-blue-body.jpg',
                    subTitle: '#fff'
                },
                style: '/assets/presentation/theme/simple-blue-test.css',
                samples: ['/assets/images/presentation/simple-blue1.png', '/assets/images/presentation/simple-blue2.png', '/assets/images/presentation/simple-blue3.png']
            }
        });
})();
