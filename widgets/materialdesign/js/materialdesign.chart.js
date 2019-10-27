/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.5"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";



// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.chart = {
    bar: function (el, data) {
        try {
            let myHelper = vis.binds.materialdesign.chart.helper;

            let $this = $(el);
            var chartContainer = $(el).find('.materialdesign-chart-container').get(0);

            $(el).find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
            let globalColor = getValueFromData(data.globalColor, '#1e88e5');

            var ctx = chartContainer.getContext('2d');

            // Global Options:
            Chart.defaults.global.defaultFontColor = '#1e88e5';
            Chart.defaults.global.defaultFontSize = 15;
            Chart.defaults.global.animation.duration = getNumberFromData(data.animationDuration, 1000);

            Chart.plugins.unregister(ChartDataLabels);

            let dataArray = []
            let labelArray = [];
            let dataColorArray = [];
            let hoverDataColorArray = [];
            let globalValueTextColor = getValueFromData(data.valuesFontColor, 'black')
            let valueTextColorArray = [];
            for (var i = 0; i <= data.dataCount; i++) {
                // row data
                dataArray.push(vis.states.attr(data.attr('oid' + i) + '.val'));
                labelArray.push(getValueFromData(data.attr('label' + i), '').split('\\n'));

                let bgColor = getValueFromData(data.attr('dataColor' + i), globalColor)
                dataColorArray.push(bgColor);

                if (getValueFromData(data.hoverColor, null) === null) {
                    hoverDataColorArray.push(convertHex(bgColor, 80))
                } else {
                    hoverDataColorArray.push(data.hoverColor)
                }

                valueTextColorArray.push(getValueFromData(data.attr('valueTextColor' + i), globalValueTextColor))

                vis.states.bind(data.attr('oid' + i) + '.val', onChange);
            }

            // Data with datasets options
            var chartData = {
                labels: labelArray,
                datasets: [
                    Object.assign(myHelper.getDataset(dataArray, dataColorArray, hoverDataColorArray, undefined, data.hoverBorderColor, undefined, data.hoverBorderWidth),
                        {
                            // chart specific properties
                            label: getValueFromData(data.barLabelText, ''),
                        }
                    )
                ]
            };

            // Notice how nested the beginAtZero is
            var options = {
                responsive: true,
                maintainAspectRatio: false,
                layout: myHelper.getLayout(data),
                legend: myHelper.getLegend(data),
                scales: {
                    yAxes: [
                        myHelper.get_Y_AxisObject(data.chartType, data.yAxisPosition, data.barWidth, data.yAxisTitle, data.yAxisTitleColor, data.yAxisTitleFontFamily, data.yAxisTitleFontSize,
                            data.yAxisShowAxisLabels, data.axisValueMin, data.axisValueMax, data.axisValueStepSize, data.axisMaxLabel, data.axisLabelAutoSkip, data.axisValueAppendText,
                            data.yAxisValueLabelColor, data.yAxisValueFontFamily, data.yAxisValueFontSize, data.yAxisValueDistanceToAxis, data.yAxisGridLinesColor,
                            data.yAxisGridLinesWitdh, data.yAxisShowAxis, data.yAxisShowGridLines, data.yAxisShowTicks, data.yAxisTickLength)
                    ],
                    xAxes: [
                        myHelper.get_X_AxisObject(data.chartType, data.xAxisPosition, data.barWidth, data.xAxisTitle, data.xAxisTitleColor, data.xAxisTitleFontFamily, data.xAxisTitleFontSize,
                            data.xAxisShowAxisLabels, data.axisValueMin, data.axisValueMax, data.axisValueStepSize, data.axisMaxLabel, data.axisLabelAutoSkip, data.axisValueAppendText,
                            data.xAxisValueLabelColor, data.xAxisValueFontFamily, data.xAxisValueFontSize, data.xAxisValueDistanceToAxis, data.xAxisGridLinesColor,
                            data.xAxisGridLinesWitdh, data.xAxisShowAxis, data.xAxisShowGridLines, data.xAxisShowTicks, data.xAxisTickLength)
                    ],
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
                            if (tooltipItem && tooltipItem.value) {
                                return `${chart.datasets[0].label}: ${myHelper.roundNumber(parseFloat(tooltipItem.value), getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.tooltipBodyAppend,'')}`
                                    .split('\\n');
                            }
                            return '';
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: data.valuesPositionAnchor,
                        align: data.valuesPositionAlign,
                        clamp: true,
                        rotation: getNumberFromData(data.valuesRotation, undefined),
                        formatter: function (value, context) {
                            if (value) {
                                return `${myHelper.roundNumber(value, getNumberFromData(data.valuesMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.valuesAppendText, '')}${getValueFromData(data.attr('labelValueAppend' + context.dataIndex), '')}`
                                    .split('\\n');
                            }
                            return '';
                        },
                        font: {
                            family: getValueFromData(data.valuesFontFamily, undefined),
                            size: getNumberFromData(data.valuesFontSize, undefined),
                        },
                        color: valueTextColorArray,
                        textAlign: data.valuesTextAlign
                    }
                }
            };

            if (data.disableHoverEffects) options.hover = { mode: null };

            // Chart declaration:
            var myBarChart = null;
            setTimeout(function () {
                myBarChart = new Chart(ctx, {
                    type: (data.chartType === 'vertical') ? 'bar' : 'horizontalBar',
                    data: chartData,
                    options: options,
                    plugins: (data.showValues) ? [ChartDataLabels] : undefined     // show value labels
                });
            }, 1)

            function onChange(e, newVal, oldVal) {
                // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                for (var d = 0; d <= data.dataCount; d++) {
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
    pie: function (el, data) {
        try {
            let myHelper = vis.binds.materialdesign.chart.helper;

            let $this = $(el);
            var chartContainer = $(el).find('.materialdesign-chart-container').get(0);

            $(el).find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
            let globalColor = getValueFromData(data.globalColor, '#1e88e5');

            var ctx = chartContainer.getContext('2d');

            // Global Options:
            Chart.defaults.global.defaultFontColor = '#1e88e5';
            Chart.defaults.global.defaultFontSize = 15;
            Chart.defaults.global.animation.duration = getNumberFromData(data.animationDuration, 1000);

            Chart.plugins.unregister(ChartDataLabels);

            let dataArray = []
            let labelArray = [];
            let dataColorArray = [];
            let hoverDataColorArray = [];
            let globalValueTextColor = getValueFromData(data.valuesFontColor, 'black')
            let valueTextColorArray = [];
            for (var i = 0; i <= data.dataCount; i++) {
                // row data
                dataArray.push(vis.states.attr(data.attr('oid' + i) + '.val'));
                labelArray.push(getValueFromData(data.attr('label' + i), '').split('\\n'));

                let bgColor = getValueFromData(data.attr('dataColor' + i), globalColor)
                dataColorArray.push(bgColor);

                if (getValueFromData(data.hoverColor, null) === null) {
                    hoverDataColorArray.push(convertHex(bgColor, 80))
                } else {
                    hoverDataColorArray.push(data.hoverColor)
                }

                valueTextColorArray.push(getValueFromData(data.attr('valueTextColor' + i), globalValueTextColor))

                vis.states.bind(data.attr('oid' + i) + '.val', onChange);
            }

            // Data with datasets options
            var chartData = {
                labels: labelArray,
                datasets: [
                    Object.assign(myHelper.getDataset(dataArray, dataColorArray, hoverDataColorArray, data.borderColor, data.hoverBorderColor, data.borderWidth, data.hoverBorderWidth),
                        {
                            // chart specific properties
                            borderAlign: 'inner',
                        }
                    )
                ]
            };

            // Notice how nested the beginAtZero is
            var options = {
                responsive: true,
                maintainAspectRatio: false,
                layout: myHelper.getLayout(data),
                legend: myHelper.getLegend(data),
                cutoutPercentage: (data.chartType === 'doughnut') ? getNumberFromData(data.doughnutCutOut, 50) : 0,
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
                            if (tooltipItem) {
                                return `${labelArray[tooltipItem.index]}: ${myHelper.roundNumber(parseFloat(chart.datasets[0].data[tooltipItem.index]), getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.tooltipBodyAppend,'')}`
                                    .split('\\n');
                            }
                            return '';
                        }
                    }
                },
                plugins: {
                    datalabels: {
                        anchor: data.valuesPositionAnchor,
                        align: data.valuesPositionAlign,
                        clamp: true,
                        rotation: getNumberFromData(data.valuesRotation, undefined),
                        formatter: function (value, context) {
                            if (value) {
                                return `${myHelper.roundNumber(value, getNumberFromData(data.valuesMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.valuesAppendText, '')}${getValueFromData(data.attr('labelValueAppend' + context.dataIndex), '')}`
                                    .split('\\n');
                            }
                            return '';
                        },
                        font: {
                            family: getValueFromData(data.valuesFontFamily, undefined),
                            size: getNumberFromData(data.valuesFontSize, undefined),
                        },
                        color: valueTextColorArray,
                        textAlign: data.valuesTextAlign
                    }
                }
            };

            if (data.disableHoverEffects) options.hover = { mode: null };

            // Chart declaration:
            var myBarChart = null;
            setTimeout(function () {
                myBarChart = new Chart(ctx, {
                    type: (data.chartType === 'pie') ? 'pie' : 'doughnut',
                    data: chartData,
                    options: options,
                    plugins: (data.showValues) ? [ChartDataLabels] : undefined     // show value labels
                });
            }, 1)

            function onChange(e, newVal, oldVal) {
                // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                for (var d = 0; d <= data.dataCount; d++) {
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
            let globalColor = getValueFromData(data.globalColor, '#1e88e5');

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

                    for (var i = 0; i <= data.dataCount; i++) {
                        // row data
                        let value = vis.states.attr(data.attr('oid' + i) + '.val');
                        let label = getValueFromData(data.attr('label' + i), '');
                        let color = getValueFromData(data.attr('dataColor' + i), globalColor);

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

                        for (var d = 0; d <= data.dataCount; d++) {
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

vis.binds.materialdesign.chart.helper = {
    get_Y_AxisObject: function (chartType, yAxisPosition, barWidth, yAxisTitle, yAxisTitleColor, yAxisTitleFontFamily, yAxisTitleFontSize, yAxisShowAxisLabels, axisValueMin,
        axisValueMax, axisValueStepSize, axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, yAxisValueLabelColor, yAxisValueFontFamily, yAxisValueFontSize,
        yAxisValueDistanceToAxis, yAxisGridLinesColor, yAxisGridLinesWitdh, yAxisShowAxis, yAxisShowGridLines, yAxisShowTicks, yAxisTickLength) {
        return {
            categoryPercentage: getNumberFromData(barWidth, 80) / 100,
            barPercentage: getNumberFromData(barWidth, 80) / 100,
            position: yAxisPosition,
            scaleLabel: {       // y-Axis title
                display: (getValueFromData(yAxisTitle, null) !== null),
                labelString: getValueFromData(yAxisTitle, ''),
                fontColor: getValueFromData(yAxisTitleColor, undefined),
                fontFamily: getValueFromData(yAxisTitleFontFamily, undefined),
                fontSize: getNumberFromData(yAxisTitleFontSize, undefined)
            },
            ticks: {        // y-Axis values
                display: yAxisShowAxisLabels,
                min: getNumberFromData(axisValueMin, undefined),                       // only for chartType: vertical
                max: getNumberFromData(axisValueMax, undefined),                       // only for chartType: vertical
                stepSize: getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'horizontal' && (getNumberFromData(axisMaxLabel, undefined) > 0 || axisLabelAutoSkip)),
                maxTicksLimit: (chartType === 'horizontal') ? getNumberFromData(axisMaxLabel, undefined) : undefined,
                callback: function (value, index, values) {
                    if (chartType === 'vertical') {                                      // only for chartType: vertical
                        return `${value}${getValueFromData(axisValueAppendText, '')}`.split('\\n');
                    }
                    return value;
                },
                fontColor: getValueFromData(yAxisValueLabelColor, undefined),
                fontFamily: getValueFromData(yAxisValueFontFamily, undefined),
                fontSize: getNumberFromData(yAxisValueFontSize, undefined),
                padding: getNumberFromData(yAxisValueDistanceToAxis, 0),
            },
            gridLines: {
                display: true,
                color: getValueFromData(yAxisGridLinesColor, 'black'),
                lineWidth: getNumberFromData(yAxisGridLinesWitdh, 0.1),
                drawBorder: yAxisShowAxis,
                drawOnChartArea: yAxisShowGridLines,
                drawTicks: yAxisShowTicks,
                tickMarkLength: getNumberFromData(yAxisTickLength, 5),
            }
        }
    },
    get_X_AxisObject: function (chartType, xAxisPosition, barWidth, xAxisTitle, xAxisTitleColor, xAxisTitleFontFamily, xAxisTitleFontSize, xAxisShowAxisLabels, axisValueMin, axisValueMax, axisValueStepSize,
        axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, xAxisValueLabelColor, xAxisValueFontFamily, xAxisValueFontSize, xAxisValueDistanceToAxis, xAxisGridLinesColor, xAxisGridLinesWitdh,
        xAxisShowAxis, xAxisShowGridLines, xAxisShowTicks, xAxisTickLength) {
        return {
            categoryPercentage: getNumberFromData(barWidth, 80) / 100,
            barPercentage: getNumberFromData(barWidth, 80) / 100,
            position: xAxisPosition,
            scaleLabel: {       // x-Axis title
                display: (getValueFromData(xAxisTitle, null) !== null),
                labelString: getValueFromData(xAxisTitle, ''),
                fontColor: getValueFromData(xAxisTitleColor, undefined),
                fontFamily: getValueFromData(xAxisTitleFontFamily, undefined),
                fontSize: getNumberFromData(xAxisTitleFontSize, undefined)
            },
            ticks: {        // x-Axis values
                display: xAxisShowAxisLabels,
                min: getNumberFromData(axisValueMin, undefined),                       // only for chartType: horizontal
                max: getNumberFromData(axisValueMax, undefined),                       // only for chartType: horizontal
                stepSize: getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'vertical' && (getNumberFromData(axisMaxLabel, undefined) > 0 || axisLabelAutoSkip)),
                maxTicksLimit: (chartType === 'vertical') ? getNumberFromData(axisMaxLabel, undefined) : undefined,
                callback: function (value, index, values) {                                 // only for chartType: horizontal
                    if (chartType === 'horizontal') {
                        return `${value}${getValueFromData(axisValueAppendText, '')}`.split('\\n');
                    }
                    return value;
                },
                fontColor: getValueFromData(xAxisValueLabelColor, undefined),
                fontFamily: getValueFromData(xAxisValueFontFamily, undefined),
                fontSize: getNumberFromData(xAxisValueFontSize, undefined),
                padding: getNumberFromData(xAxisValueDistanceToAxis, 0),

            },
            gridLines: {
                display: true,
                color: getValueFromData(xAxisGridLinesColor, 'black'),
                lineWidth: getNumberFromData(xAxisGridLinesWitdh, 0.1),
                drawBorder: xAxisShowAxis,
                drawOnChartArea: xAxisShowGridLines,
                drawTicks: xAxisShowTicks,
                tickMarkLength: getNumberFromData(xAxisTickLength, 5),
            }
        }
    },
    getDataset: function (dataArray, dataColorArray, hoverDataColorArray, borderColor, hoverBorderColor, borderWidth, hoverBorderWidth) {
        return {
            data: dataArray,

            backgroundColor: dataColorArray,
            hoverBackgroundColor: hoverDataColorArray,

            borderColor: getValueFromData(borderColor, 'white'),
            hoverBorderColor: getValueFromData(hoverBorderColor, undefined),

            borderWidth: getNumberFromData(borderWidth, undefined),
            hoverBorderWidth: getNumberFromData(hoverBorderWidth, undefined),
        }
    },
    getLegend: function (data) {
        return {
            display: data.showLegend,
            position: data.legendPosition,
            labels: {
                fontColor: getValueFromData(data.legendFontColor, undefined),
                fontFamily: getValueFromData(data.legendFontFamily, undefined),
                fontSize: getNumberFromData(data.legendFontSize, undefined),
                boxWidth: getNumberFromData(data.legendBoxWidth, 10),
                usePointStyle: data.legendPointStyle
            }
        }
    },
    getLayout: function (data) {
        return {
            padding: {
                top: getValueFromData(data.chartPaddingTop, 0),
                left: getValueFromData(data.chartPaddingLeft, 0),
                right: getValueFromData(data.chartPaddingRight, 0),
                bottom: getValueFromData(data.chartPaddingBottom, 0)
            }
        }
    },
    roundNumber(value, maxDecimals) {
        return +(Math.round(value + "e+" + maxDecimals) + "e-" + maxDecimals);
    }
}