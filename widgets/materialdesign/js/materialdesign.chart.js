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

            $(el).find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
            let globalBarColor = getValueFromData(data.globalBarColor, '#1e88e5');

            var ctx = chartContainer.getContext('2d');

            // Global Options:
            Chart.defaults.global.defaultFontColor = '#1e88e5';
            Chart.defaults.global.defaultFontSize = 15;
            Chart.defaults.global.animation.duration = getNumberFromData(data.animationDuration, 1000);

            Chart.plugins.unregister(ChartDataLabels);

            let dataArray = []
            let labelArray = [];
            let barColorArray = [];
            for (var i = 0; i <= data.barCount; i++) {
                // row data
                dataArray.push(vis.states.attr(data.attr('oid' + i) + '.val'));
                labelArray.push(getValueFromData(data.attr('label' + i), '').split('\\n'));
                barColorArray.push(getValueFromData(data.attr('barColor' + i), globalBarColor));

                vis.states.bind(data.attr('oid' + i) + '.val', onChange);
            }

            // Data with datasets options
            var chartData = {
                labels: labelArray,
                datasets: [
                    {
                        label: getValueFromData(data.barLabelText, ''),
                        backgroundColor: barColorArray,
                        data: dataArray,
                        hoverBackgroundColor: getValueFromData(data.hoverBarColor, convertHex(globalBarColor, 80))
                    }
                ]
            };

            // Notice how nested the beginAtZero is
            var options = {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: data.showLegend,
                    position: data.legendPosition,
                    labels: {
                        fontColor: getValueFromData(data.legendFontColor, undefined),
                        fontFamily: getValueFromData(data.legendFontFamily, undefined),
                        fontSize: getNumberFromData(data.legendFontSize, undefined),
                        boxWidth: getNumberFromData(data.legendBoxWidth, 10),
                        usePointStyle: data.legendPointStyle
                    }
                },
                scales: {
                    yAxes: [{
                        categoryPercentage: getNumberFromData(data.barWidth, 80) / 100,
                        barPercentage: getNumberFromData(data.barWidth, 80) / 100,
                        scaleLabel: {       // y-Axis title
                            display: (getValueFromData(data.yAxisTitle, null) !== null),
                            labelString: getValueFromData(data.yAxisTitle, ''),
                            fontColor: getValueFromData(data.yAxisTitleColor, undefined),
                            fontFamily: getValueFromData(data.yAxisTitleFontFamily, undefined),
                            fontSize: getNumberFromData(data.yAxisTitleFontSize, undefined)
                        },
                        ticks: {        // y-Axis values
                            display: data.yAxisShowAxisLabels,
                            min: getNumberFromData(data.axisValueMin, undefined),                       // only for barType: vertical
                            max: getNumberFromData(data.axisValueMax, undefined),                       // only for barType: vertical
                            stepSize: getNumberFromData(data.axisValueStepSize, undefined),             // only for barType: vertical
                            autoSkip: (data.barType === 'horizontal' && (getNumberFromData(data.axisMaxLabel, undefined) > 0 || data.axisLabelAutoSkip)),
                            maxTicksLimit: (data.barType === 'horizontal') ? getNumberFromData(data.axisMaxLabel, undefined) : undefined,
                            callback: function (value, index, values) {
                                if (data.barType === 'vertical') {                                      // only for barType: vertical
                                    return `${value}${getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
                                }
                                return value;
                            },
                            fontColor: getValueFromData(data.yAxisValueLabelColor, undefined),
                            fontFamily: getValueFromData(data.yAxisValueFontFamily, undefined),
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
                        categoryPercentage: getNumberFromData(data.barWidth, 80) / 100,
                        barPercentage: getNumberFromData(data.barWidth, 80) / 100,
                        scaleLabel: {       // x-Axis title
                            display: (getValueFromData(data.xAxisTitle, null) !== null),
                            labelString: getValueFromData(data.xAxisTitle, ''),
                            fontColor: getValueFromData(data.xAxisTitleColor, undefined),
                            fontFamily: getValueFromData(data.xAxisTitleFontFamily, undefined),
                            fontSize: getNumberFromData(data.xAxisTitleFontSize, undefined)
                        },
                        ticks: {        // x-Axis values
                            display: data.xAxisShowAxisLabels,
                            min: getNumberFromData(data.axisValueMin, undefined),                       // only for barType: horizontal
                            max: getNumberFromData(data.axisValueMax, undefined),                       // only for barType: horizontal
                            stepSize: getNumberFromData(data.axisValueStepSize, undefined),             // only for barType: vertical
                            autoSkip: (data.barType === 'vertical' && (getNumberFromData(data.axisMaxLabel, undefined) > 0 || data.axisLabelAutoSkip)),
                            maxTicksLimit: (data.barType === 'vertical') ? getNumberFromData(data.axisMaxLabel, undefined) : undefined,
                            callback: function (value, index, values) {                                 // only for barType: horizontal
                                if (data.barType === 'horizontal') {
                                    return `${value}${getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
                                }
                                return value;
                            },
                            fontColor: getValueFromData(data.xAxisValueLabelColor, undefined),
                            fontFamily: getValueFromData(data.xAxisValueFontFamily, undefined),
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
                tooltips: {
                    enabled: data.showTooltip,
                    backgroundColor: getValueFromData(data.tooltipBackgroundColor, 'black'),
                    caretSize: getNumberFromData(data.tooltipArrowSize, 5),
                    caretPadding: getNumberFromData(data.tooltipDistanceToBar, 2),
                    cornerRadius: getNumberFromData(data.tooltipBoxRadius, 4),
                    displayColors: data.tooltipShowColorBox,
                    xPadding: getNumberFromData(data.tooltipXpadding, 10),
                    yPadding: getNumberFromData(data.tooltipYpadding, 10),
                    titleFontColor: getValueFromData(data.tooltipTitleFontColor, 'white'),
                    titleFontFamily: getValueFromData(data.tooltipTitleFontFamily, undefined),
                    titleFontSize: getNumberFromData(data.tooltipTitleFontSize, undefined),
                    titleMarginBottom: getNumberFromData(data.tooltipTitleMarginBottom, 6),
                    bodyFontColor: getValueFromData(data.tooltipBodyFontColor, 'white'),
                    bodyFontFamily: getValueFromData(data.tooltipBodyFontFamily, undefined),
                    bodyFontSize: getNumberFromData(data.tooltipBodyFontSize, undefined),
                    callbacks: {
                        label: function (tooltipItem, chart) {
                            console.log(chart.datasets[0].label);
                            return `${chart.datasets[0].label}: ${parseFloat(tooltipItem.value).round(getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${data.tooltipBodyAppend}`
                                    .split('\\n');
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: data.barValuePositionAnchor,
                        align: data.barValuePositionAlign,
                        clamp: true,
                        rotation: getNumberFromData(data.barValueRotation, undefined),
                        formatter: function (value, context) {
                            return `${value.round(getNumberFromData(data.barMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.barValueAppendText, '')}${getValueFromData(data.attr('labelValueAppend' + context.dataIndex), '')}`
                                .split('\\n');
                        },
                        font: {
                            family: getValueFromData(data.barValueFontFamily, undefined),
                            size: getNumberFromData(data.barValueFontSize, undefined),
                        },
                        color: getValueFromData(data.barValueFontColor, 'black'),
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
                    plugins: (data.barValueShow) ? [ChartDataLabels] : undefined     // show value labels
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
};

function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
}

Number.prototype.round = function (places) {
    return +(Math.round(this + "e+" + places) + "e-" + places);
}