/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.2"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.chart = {
    bar: function (el, data) {
        try {
            let $this = $(el);
            var chartContainer = $(el).find('.materialdesign-chart-container').get(0);
            let globalColor = getValueFromData(data.globalBarColor, '#1e88e5');

            setTimeout(function () {
                let chartWidth = window.getComputedStyle($this.context, null).width.replace('px', '');
                let chartHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                let xAxisLabels = [];
                let dataValues = [];
                let barColors = []

                for (var i = 0; i <= data.barCount; i++) {
                    // row data
                    xAxisLabels.push(getValueFromData(data.attr('label' + i), ''));
                    dataValues.push(vis.states.attr(data.attr('oid' + i) + '.val'));
                    barColors.push(getValueFromData(data.attr('barColor' + i), globalColor));
                    // let value = vis.states.attr(data.attr('oid' + i) + '.val');
                    // let label = getValueFromData(data.attr('label' + i), '');
                    // let color = getValueFromData(data.attr('barColor' + i), globalColor);

                    // myDataArray.push([label, value, `color: ${color};`, value + '%']);

                    vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                }

                var chartData = {
                    categories: xAxisLabels,
                    series: [
                        {
                            name: 'Budget',
                            data: dataValues
                        }
                    ]
                };
                var options = {
                    usageStatistics: false,         // disable Google Analytics
                    chart: {
                        width: chartWidth,
                        height: chartHeight,
                        title: 'Monthly Revenue',
                        format: '1,000'
                    },
                    yAxis: {
                        title: 'Amount',
                        min: 0,
                        // max: 9000
                    },
                    xAxis: {
                        title: 'Month'
                    },
                    legend: {
                        align: 'top'
                    },
                    series: {
                        showLabel: true,
                        // colorByPoint: true      // activate color for every bar -> geht aktuell nicht mit setData()
                    }
                };
                var theme = {
                    series: {
                        colors: barColors
                    }
                };
                // For apply theme
                tui.chart.registerTheme('myTheme', theme);
                options.theme = 'myTheme';

                let chart = tui.chart.columnChart(chartContainer, chartData, options);

                function onChange(e, newVal, oldVal) {
                    // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                    let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                    for (var d = 0; d <= data.barCount; d++) {
                        if (oidId === data.attr('oid' + d)) {
                            let index = d;
                            console.log(chartData.series[0].data);
                            chartData.series[0].data[index] = newVal;
                            console.log(chartData.series[0].data);
                        }
                    }

                    chart.setData(chartData);
                };

            }, 1);
        } catch (ex) {
            console.exception(`bar: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    googleBar: function (el, data) {
        try {
            let $this = $(el);
            var chartContainer = $(el).find('.materialdesign-chart-container').get(0);
            let globalColor = getValueFromData(data.globalBarColor, '#1e88e5');

            setTimeout(function () {
                let chartWidth = window.getComputedStyle($this.context, null).width.replace('px', '');
                let chartHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                google.charts.load("current", { packages: ['corechart'] });
                google.charts.setOnLoadCallback(drawChart);

                function drawChart() {
                    var chart = new google.visualization.ColumnChart(chartContainer);
                    let myDataArray = [];

                    // Cols added
                    myDataArray.push(["label", "value", { role: "style" }, { role: 'annotation' }]);

                    for (var i = 0; i <= data.barCount; i++) {
                        // row data
                        let value = vis.states.attr(data.attr('oid' + i) + '.val');
                        let label = getValueFromData(data.attr('label' + i), '');
                        let color = getValueFromData(data.attr('barColor' + i), globalColor);

                        myDataArray.push([label, value, `fill-color: ${color}; stroke-width: 0;`, value + '%']);

                        vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                    }

                    var chartData = google.visualization.arrayToDataTable(myDataArray);
                    // var view = new google.visualization.DataView(chartData);
                    // view.setColumns([0, 1,
                    //     {
                    //         calc: "stringify",
                    //         sourceColumn: 1,
                    //         type: "string",
                    //         role: "annotation"
                    //     },
                    //     2]);

                    var options = {
                        title: "Density of Precious Metals, in g/cm^3",
                        width: chartWidth,
                        height: chartHeight,
                        backgroundColor: getValueFromData(data.backgroundColor, 'transparent'),
                        vAxis: {
                            title: getValueFromData(data.yAxisTitle, ''),
                            titleTextStyle: { color: getValueFromData(data.yAxisTitleColor, '#1e88e5'), fontSize: getValueFromData(data.yAxisTitleFontSize, '') },
                            textStyle: { color: getValueFromData(data.yAxisValueLabelColor, '#1e88e5'), fontSize: getValueFromData(data.yAxisValueFontSize, '') },
                            gridlines: { count: 5 },
                            baselineColor: getValueFromData(data.xAxisColor, '#ccc'),
                            gridlineColor: getValueFromData(data.gridLineColor, '#ccc'),
                        },
                        hAxis: {
                            title: getValueFromData(data.xAxisTitle, ''),
                            titleTextStyle: { color: getValueFromData(data.xAxisTitleColor, '#1e88e5'), fontSize: getValueFromData(data.xAxisTitleFontSize, '') },
                            textStyle: { color: getValueFromData(data.xAxisValueLabelColor, '#1e88e5'), fontSize: getValueFromData(data.xAxisValueFontSize, '') },
                            gridlines: { count: 5 },
                            baselineColor: getValueFromData(data.yAxisColor, '#ccc'),
                        },
                        annotations: {
                            alwaysOutside: true,
                            style: 'point',
                            highContrast: false,
                            textStyle: {
                                //       fontSize: 15,
                                color: 'black',
                                //       strokeSize: 0,
                                //       auraColor: 'transparent'
                            },
                            //     alwaysOutside: true,
                            stem: {
                                color: 'transparent',
                            },
                        },
                    };

                    chart.draw(chartData, options);

                    function onChange(e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                        let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                        for (var d = 0; d <= data.barCount; d++) {
                            if (oidId === data.attr('oid' + d)) {
                                let index = d;

                                chartData.setValue(index, 1, newVal);
                                chartData.setValue(index, 3, newVal + ' %');

                                // var view = new google.visualization.DataView(chartData);
                                // view.setColumns([0, 1,
                                //     {
                                //         calc: "stringify",
                                //         sourceColumn: 1,
                                //         type: "string",
                                //         role: "annotation",
                                //     },
                                //     2]);

                                chart.draw(chartData, options);
                            }
                        }
                    }
                }

            }, 1);
        } catch (ex) {
            console.exception(`bar: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    chartJsBar: function (el, data) {
        try {
            let $this = $(el);
            var chartContainer = $(el).find('.materialdesign-chart-container').get(0);
            let globalColor = getValueFromData(data.globalBarColor, '#1e88e5');

            var ctx = chartContainer.getContext('2d');

            // Global Options:
            Chart.defaults.global.defaultFontColor = 'dodgerblue';
            Chart.defaults.global.defaultFontSize = 15;
            Chart.plugins.unregister(ChartDataLabels);

            // ctx.canvas.parentNode.style.height = chartWidth;
            // ctx.canvas.parentNode.style.width = chartHeight;

            let dataArray = []
            let labelArray = [];
            let barColorArray = [];
            for (var i = 0; i <= data.barCount; i++) {
                // row data
                dataArray.push(vis.states.attr(data.attr('oid' + i) + '.val'));
                labelArray.push(getValueFromData(data.attr('label' + i), ''));
                barColorArray.push(getValueFromData(data.attr('barColor' + i), globalColor));

                vis.states.bind(data.attr('oid' + i) + '.val', onChange);
            }

            // Data with datasets options
            var chartData = {
                labels: labelArray,
                datasets: [
                    {
                        label: "Leistung",
                        backgroundColor: barColorArray,
                        data: dataArray,
                        hoverBackgroundColor: 'red'
                    }
                ]
            };

            // Notice how nested the beginAtZero is
            var options = {
                responsive: true,
                maintainAspectRatio: false,
                title: {
                    display: true,
                    text: 'Ice Cream Truck Report',
                    position: 'bottom'
                },
                scales: {
                    yAxes: [{
                        scaleLabel: {       // y-Axis title
                            display: (getValueFromData(data.yAxisTitle, null) !== null),
                            labelString: getValueFromData(data.yAxisTitle, ''),
                            fontColor: getValueFromData(data.yAxisTitleColor, ''),
                            fontFamily: getValueFromData(data.yAxisTitleFontFamily, 'RobotoCondensed-Regular'),
                            fontSize: getNumberFromData(data.yAxisTitleFontSize, undefined)
                        },
                        ticks: {        // y-Axis values
                            display: data.yAxisShowAxisLabels,
                            min: getNumberFromData(data.axisValueMin, undefined),                       // only for barType: vertical
                            max: getNumberFromData(data.axisValueMax, undefined),                       // only for barType: vertical
                            stepSize: getNumberFromData(data.axisValueStepSize, undefined),             // only for barType: vertical
                            callback: function (value, index, values) {
                                if (data.barType === 'vertical') {                                      // only for barType: vertical
                                    return `${value}${getValueFromData(data.axisValueAppendText, '')}`;
                                }
                                return value;
                            },
                            fontColor: getValueFromData(data.yAxisValueLabelColor, ''),
                            fontFamily: getValueFromData(data.yAxisValueFontFamily, 'RobotoCondensed-Light'),
                            fontSize: getNumberFromData(data.yAxisValueFontSize, undefined),
                            padding: getNumberFromData(data.yAxisValueDistanceToAxis, 0),
                        },
                        gridLines: {
                            display: true,
                            color: getValueFromData(data.yAxisGridLinesColor, 'black'),
                            lineWidth: getNumberFromData(data.yAxisGridLinesWitdh, 0.1),
                            drawBorder: data.yAxisShowAxis,
                            drawOnChartArea: data.yAxisShowGridLines,
                            drawTicks: data.yAxisShowTicks,
                            tickMarkLength: getNumberFromData(data.yAxisTickLength, 5),
                        }
                    }],
                    xAxes: [{
                        scaleLabel: {       // x-Axis title
                            display: (getValueFromData(data.xAxisTitle, null) !== null),
                            labelString: getValueFromData(data.xAxisTitle, ''),
                            fontColor: getValueFromData(data.xAxisTitleColor, ''),
                            fontFamily: getValueFromData(data.xAxisTitleFontFamily, 'RobotoCondensed-Regular'),
                            fontSize: getNumberFromData(data.xAxisTitleFontSize, undefined)
                        },
                        ticks: {        // x-Axis values
                            display: data.xAxisShowAxisLabels,
                            min: getNumberFromData(data.axisValueMin, undefined),                       // only for barType: horizontal
                            max: getNumberFromData(data.axisValueMax, undefined),                       // only for barType: horizontal
                            stepSize: getNumberFromData(data.axisValueStepSize, undefined),             // only for barType: vertical
                            callback: function (value, index, values) {                                 // only for barType: horizontal
                                if (data.barType === 'horizontal') {
                                    return `${value}${getValueFromData(data.axisValueAppendText, '')}`;
                                }
                                return value;
                            },
                            fontColor: getValueFromData(data.xAxisValueLabelColor, ''),
                            fontFamily: getValueFromData(data.xAxisValueFontFamily, 'RobotoCondensed-Light'),
                            fontSize: getNumberFromData(data.xAxisValueFontSize, undefined),
                            padding: getNumberFromData(data.xAxisValueDistanceToAxis, 0),
                        },
                        gridLines: {
                            display: true,
                            color: getValueFromData(data.xAxisGridLinesColor, 'black'),
                            lineWidth: getNumberFromData(data.xAxisGridLinesWitdh, 0.1),
                            drawBorder: data.xAxisShowAxis,
                            drawOnChartArea: data.xAxisShowGridLines,
                            drawTicks: data.xAxisShowTicks,
                            tickMarkLength: getNumberFromData(data.xAxisTickLength, 5),
                        }
                    }],
                },
                plugins: {
                    datalabels: {
                        anchor: 'end',
                        align: 'start',
                        formatter: function (value, context) {
                            return value + ' W';
                        },
                        font: {
                            weight: 'bold'
                        },
                        color: 'black',
                    }
                }
            };


            // Chart declaration:
            var myBarChart = null;
            setTimeout(function () {
                myBarChart = new Chart(ctx, {
                    type: (data.barType === 'vertical') ? 'bar' : 'horizontalBar',
                    data: chartData,
                    options: options,
                    plugins: [ChartDataLabels]     // show value labels
                });
            }, 1)

            function onChange(e, newVal, oldVal) {
                // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                for (var d = 0; d <= data.barCount; d++) {
                    if (oidId === data.attr('oid' + d)) {
                        let index = d;
                        myBarChart.data.datasets[0].data[index] = newVal;
                        myBarChart.update();
                    }
                }
            };

        } catch (ex) {
            console.exception(`bar: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
};