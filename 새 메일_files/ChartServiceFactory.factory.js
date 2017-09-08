(function () {

    'use strict';

    angular
        .module('doorayWebApp.project')
        .factory('ChartServiceFactory', ChartServiceFactory);

    /* @ngInject */
    function ChartServiceFactory(DateConvertUtil, gettextCatalog, moment, _) {
        // 참고. https://github.com/nhnent/fe.application-chart/wiki/application-tutorial

        var chartLegendNames = {
            notClosed: gettextCatalog.getString('등록 + 진행'),
            guideLine: gettextCatalog.getString('가이드 라인')
        };

        var MilestoneChart = {
            makeData: function (milestone) {
                if (!milestone.stat) {
                    return;
                }

                var data = {
                    notClosed: []
                }, chartData = [
                    {
                        key: chartLegendNames.notClosed,
                        values: data.notClosed,
                        color: '#1c2b94'
                    }
                ], maxCount = 0;

                _.forEach(_.get(milestone, 'stat.date'), function (date, index) {
                    var dateForUnixFormat = DateConvertUtil.convertDateToDays(date);
                    data.notClosed.push([dateForUnixFormat, _.get(milestone, 'stat.registeredPostCount[' + index + ']', 0) + _.get(milestone, 'stat.workingPostCount[' + index + ']', 0)]);
                    maxCount = Math.max(maxCount, data.notClosed[index][1] + _.get(milestone, 'stat.closedPostCount[' + index + ']', 0));
                });

                if (milestone.endedAt && !_.isEmpty(data.notClosed)) {
                    chartData.push({
                        key: chartLegendNames.guideLine,
                        // 가이드라인 그래프를 위해 만듬
                        // [[마일스톤 시작일, 마일스톤 업무 총합], [종료일, 0]]
                        values: [[data.notClosed[0][0], maxCount], [DateConvertUtil.convertDateToDays(moment(milestone.endedAt).startOf('day')), 0]],
                        color: '#ccc'
                    });
                }

                return chartData;
            },
            getDefaultOptions: function (milestone) {
                return {
                    chart: {
                        type: 'lineChart',
                        height: 280,
                        margin: {
                            left: 30
                        },
                        x: function (d) {
                            return d[0] || 0;
                        },
                        y: function (d) {
                            return d[1] || 0;
                        },
                        xAxis: {
                            tickFormat: function (d) {
                                return DateConvertUtil.convertDaysToDate(d).format('MM-DD');
                            }
                        }
                    },
                    title: {
                        enable: true,
                        text: _.get(milestone, 'name')
                    }
                };
            },
            getDefaultXAxisRange: function (chartData) {
                var startDate = chartData[0].values[0][0];
                return [startDate, startDate + 1];
            },
            getChartData: function (milestone) {
                var self = this;
                if (!milestone) {
                    return;
                }
                return self.makeData(milestone);
            },
            reloadChart: function (api, data) {
                api.refresh();

                var chart = api.getScope().chart;
                chart.forceY([0, 1]).update();
                chart.forceX(this.getDefaultXAxisRange(data)).update();
            }
        };

        return {
            milestone: MilestoneChart
        };
    }

})();
