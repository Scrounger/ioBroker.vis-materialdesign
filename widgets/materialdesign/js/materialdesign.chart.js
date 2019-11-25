
/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.7"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";



// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.chart = {
    bar: function (el, data) {
        try {
            setTimeout(function () {
                let myHelper = vis.binds.materialdesign.chart.helper;
                myHelper.registerChartAreaPlugin();

                let $this = $(el);
                var chartContainer = $(el).find('.materialdesign-chart-container').get(0);

                $(el).find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
                let globalColor = getValueFromData(data.globalColor, '#44739e');

                let colorScheme = getValueFromData(data.colorScheme, null);
                if (colorScheme != null) {
                    colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                }

                if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                    var ctx = chartContainer.getContext('2d');

                    // Global Options:
                    Chart.defaults.global.defaultFontColor = '#44739e';
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

                        if (colorScheme != null) {
                            globalColor = colorScheme[i];
                        }

                        let bgColor = getValueFromData(data.attr('dataColor' + i), globalColor)
                        dataColorArray.push(bgColor);

                        if (getValueFromData(data.hoverColor, null) === null) {
                            hoverDataColorArray.push(myHelper.convertHex(bgColor, 80))
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
                                    categoryPercentage: getNumberFromData(data.barWidth, 80) / 100,
                                    barPercentage: getNumberFromData(data.barWidth, 80) / 100,
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
                        chartArea: {
                            backgroundColor: getValueFromData(data.chartAreaBackgroundColor, ''),
                        },
                        scales: {
                            yAxes: [
                                myHelper.get_Y_AxisObject(data.chartType, data.yAxisPosition, data.yAxisTitle, data.yAxisTitleColor, data.yAxisTitleFontFamily, data.yAxisTitleFontSize,
                                    data.yAxisShowAxisLabels, data.axisValueMin, data.axisValueMax, data.axisValueStepSize, data.axisMaxLabel, data.axisLabelAutoSkip, data.axisValueAppendText,
                                    data.yAxisValueLabelColor, data.yAxisValueFontFamily, data.yAxisValueFontSize, data.yAxisValueDistanceToAxis, data.yAxisGridLinesColor,
                                    data.yAxisGridLinesWitdh, data.yAxisShowAxis, data.yAxisShowGridLines, data.yAxisShowTicks, data.yAxisTickLength)
                            ],
                            xAxes: [
                                myHelper.get_X_AxisObject(data.chartType, data.xAxisPosition, data.xAxisTitle, data.xAxisTitleColor, data.xAxisTitleFontFamily, data.xAxisTitleFontSize,
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
                                        return `${chart.datasets[0].label}: ${myHelper.roundNumber(parseFloat(tooltipItem.value), getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.tooltipBodyAppend, '')}`
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
                    var myBarChart = new Chart(ctx, {
                        type: (data.chartType === 'vertical') ? 'bar' : 'horizontalBar',
                        data: chartData,
                        options: options,
                        plugins: (data.showValues) ? [ChartDataLabels] : undefined     // show value labels
                    });

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
                }
            }, 1)
        } catch (ex) {
            console.exception(`bar: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    lineHistory: function (el, data) {
        let logPrefix = `lineHistory[${data.wid}]:`;

        try {
            setTimeout(function () {
                let myHelper = vis.binds.materialdesign.chart.helper;
                myHelper.registerChartAreaPlugin();

                var myChart;

                let $this = $(el);
                var chartContainer = $this.find('.materialdesign-chart-container').get(0);

                var progressBar = $this.find('.material-progress-circular-container');

                progressBar.show();


                let timeInterval = data.timeIntervalToShow;
                if (getValueFromData(data.time_interval_oid, null) !== null && myHelper.intervals[vis.states.attr(data.time_interval_oid + '.val')] !== undefined) {
                    timeInterval = vis.states.attr(data.time_interval_oid + '.val');
                    vis.states.bind(data.time_interval_oid + '.val', onChange);
                }
                let dataRangeStartTime = myHelper.intervals[timeInterval] ? new Date().getTime() - myHelper.intervals[timeInterval] : undefined;


                $this.find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
                let globalColor = getValueFromData(data.globalColor, '#44739e');

                let colorScheme = getValueFromData(data.colorScheme, null);
                if (colorScheme != null) {
                    colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                }

                // manual refresh through dp
                if (getValueFromData(data.manualRefreshTrigger, null) !== null) {
                    vis.states.bind(data.manualRefreshTrigger + '.ts', onChange);
                }

                if (data.refreshMethod === 'timeInterval') {
                    setInterval(function () {
                        onChange();
                    }, myHelper.intervals[data.refreshTimeInterval]);
                }

                if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                    var ctx = chartContainer.getContext('2d');

                    // Global Options:
                    Chart.defaults.global.defaultFontColor = '#44739e';
                    Chart.defaults.global.defaultFontSize = 15;
                    Chart.defaults.global.animation.duration = getNumberFromData(data.animationDuration, 1000);

                    Chart.plugins.unregister(ChartDataLabels);

                    if (getValueFromData(data.historyAdapterInstance, null) !== null) {

                        let operations = [];
                        for (var i = 0; i <= data.dataCount; i++) {
                            if (getValueFromData(data.attr('oid' + i), null) !== null) {
                                operations.push(myHelper.getTaskForHistoryData(data.attr('oid' + i), data, dataRangeStartTime))

                                if (data.refreshMethod === 'realtime') {
                                    vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                                }
                            }
                        }

                        Promise.all(operations).then((result) => {
                            // execute all db queries -> getting all needed data at same time
                            // console.log(result);

                            let myDatasets = [];
                            let myYAxis = [];
                            for (var i = 0; i <= result.length - 1; i++) {

                                let dataArray = myHelper.getPreparedData(result[i], data, i);

                                myDatasets.push(
                                    {
                                        data: dataArray,
                                        lineTension: getNumberFromData(data.attr('lineTension' + i), 0.4),
                                        borderWidth: getNumberFromData(data.attr('lineThikness' + i), 3),
                                        label: getValueFromData(data.attr('legendText' + i), ''),
                                        borderColor: getValueFromData(data.attr('dataColor' + i), (colorScheme) ? getValueFromData(colorScheme[i], globalColor) : globalColor),     // Line Color
                                        pointBackgroundColor: getValueFromData(data.attr('dataColor' + i), (colorScheme) ? getValueFromData(colorScheme[i], globalColor) : globalColor),
                                        fill: data.attr('useFillColor' + i),
                                        backgroundColor: getValueFromData(data.attr('fillColor' + i), myHelper.convertHex(getValueFromData(data.attr('dataColor' + i), (colorScheme) ? getValueFromData(colorScheme[i], globalColor) : globalColor), 10)),  //Fill Background color
                                        pointRadius: getNumberFromData(data.pointSize, 3),
                                        pointHoverRadius: getNumberFromData(data.pointSizeHover, 4),
                                        pointStyle: getValueFromData(data.pointStyle, 'circle'),
                                        pointHoverBorderColor: getValueFromData(data.attr('pointHoverColor' + i), getValueFromData(data.attr('dataColor' + i), (colorScheme) ? getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        pointHoverBackgroundColor: getValueFromData(data.attr('pointHoverColor' + i), getValueFromData(data.attr('dataColor' + i), (colorScheme) ? getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        yAxisID: 'yAxis_id_' + getNumberFromData(data.attr('commonYAxis' + i), i),
                                        spanGaps: data.attr('lineSpanGaps' + i),
                                    }
                                );

                                myYAxis.push(
                                    {
                                        id: 'yAxis_id_' + i,
                                        type: 'linear',
                                        position: data.attr('yAxisPosition' + i),
                                        display: (getNumberFromData(data.attr('commonYAxis' + i), i) === i) ? data.attr('showYAxis' + i) : false,
                                        scaleLabel: {       // y-Axis title
                                            display: (getValueFromData(data.attr('yAxisTitle' + i), null) !== null),
                                            labelString: getValueFromData(data.attr('yAxisTitle' + i), ''),
                                            fontColor: getValueFromData(data.yAxisTitleColor, undefined),
                                            fontFamily: getValueFromData(data.yAxisTitleFontFamily, undefined),
                                            fontSize: getNumberFromData(data.yAxisTitleFontSize, undefined)
                                        },
                                        ticks: {
                                            min: getNumberFromData(data.attr('yAxisMinValue' + i), undefined),
                                            max: getNumberFromData(data.attr('yAxisMaxValue' + i), undefined),
                                            stepSize: getNumberFromData(data.attr('yAxisStep' + i), undefined),
                                            autoSkip: true,
                                            maxTicksLimit: getNumberFromData(data.attr('yAxisMaxLabel' + i), undefined),
                                            fontColor: getValueFromData(data.yAxisValueLabelColor, undefined),
                                            fontFamily: getValueFromData(data.yAxisValueFontFamily, undefined),
                                            fontSize: getNumberFromData(data.yAxisValueFontSize, undefined),
                                            padding: getNumberFromData(data.yAxisValueDistanceToAxis, 0),
                                            callback: function (value, index, values) {
                                                let axisId = this.id.replace('yAxis_id_','');
                                                return `${value}${getValueFromData(data.attr('yAxisValueAppendText' + axisId), '')}`.split('\\n');
                                            }
                                        },
                                        gridLines: {
                                            display: true,
                                            color: getValueFromData(data.attr('yAxisGridLinesColor' + i), 'black'),
                                            lineWidth: getNumberFromData(data.attr('yAxisGridLinesWitdh' + i), 0.1),
                                            drawBorder: data.attr('yAxisShowAxisBorder' + i),
                                            drawOnChartArea: data.attr('yAxisShowGridLines' + i),
                                            drawTicks: data.attr('yAxisShowTicks' + i),
                                            tickMarkLength: getNumberFromData(data.attr('yAxisTickLength' + i), 5),
                                        }
                                    }
                                )
                            }

                            // Data with datasets options
                            var chartData = {
                                datasets: myDatasets,
                            };

                            // Notice how nested the beginAtZero is
                            var options = {
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: myHelper.getLayout(data),
                                chartArea: {
                                    backgroundColor: getValueFromData(data.chartAreaBackgroundColor, ''),
                                },
                                hover: {
                                    mode: 'nearest'
                                },
                                legend: Object.assign(myHelper.getLegend(data),
                                    {
                                        // custom to hide / show also yAxis if data de-/selected
                                        onClick: function (event, legendItem) {
                                            var index = legendItem.datasetIndex;

                                            var ci = this.chart;
                                            var meta = ci.getDatasetMeta(index);

                                            // hide / show yAxis 
                                            if (getNumberFromData(data.attr('commonYAxis' + index), index) === index) {
                                                myChart.options.scales.yAxes[index].display = !myChart.options.scales.yAxes[index].display;
                                            }

                                            // See controller.isDatasetVisible comment
                                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

                                            // We hid a dataset ... rerender the chart
                                            ci.update();
                                        }
                                    }
                                ),
                                scales: {
                                    xAxes: [{
                                        type: 'time',
                                        distribution: 'series',
                                        time:
                                        {
                                            displayFormats: (getValueFromData(data.xAxisTimeFormats, null) !== null) ? JSON.parse(data.xAxisTimeFormats) : myHelper.defaultTimeFormats(),      // muss entsprechend konfigurietr werden siehe 
                                            tooltipFormat: 'll'
                                        },
                                        position: data.xAxisPosition,
                                        scaleLabel: {       // x-Axis title
                                            display: (getValueFromData(data.xAxisTitle, null) !== null),
                                            labelString: getValueFromData(data.xAxisTitle, ''),
                                            fontColor: getValueFromData(data.xAxisTitleColor, undefined),
                                            fontFamily: getValueFromData(data.xAxisTitleFontFamily, undefined),
                                            fontSize: getNumberFromData(data.xAxisTitleFontSize, undefined)
                                        },
                                        ticks: {        // x-Axis values
                                            display: data.xAxisShowAxisLabels,
                                            autoSkip: true,
                                            autoSkipPadding: 10,
                                            maxTicksLimit: getNumberFromData(data.xAxisMaxLabel, undefined),
                                            maxRotation: 0,
                                            minRotation: 0,
                                            callback: function (value, index, values) {                                 // only for chartType: horizontal
                                                return `${value}${getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
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
                                    yAxes: myYAxis,
                                },
                                tooltips: {
                                    mode: 'nearest',
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
                                        title: function (tooltipItem, chart) {

                                            let datasetIndex = tooltipItem[0].datasetIndex;

                                            let index = tooltipItem[0].index;
                                            let metaIndex = Object.keys(chart.datasets[datasetIndex]._meta)[0];
                                            let currentUnit = chart.datasets[datasetIndex]._meta[metaIndex].controller._xScale._unit;
                                            let timestamp = moment(chart.datasets[datasetIndex].data[index].t);

                                            let timeFormats = (getValueFromData(data.tooltipTimeFormats, null) !== null) ? JSON.parse(data.tooltipTimeFormats) : myHelper.defaultToolTipTimeFormats();

                                            return timestamp.format(timeFormats[currentUnit]);
                                        },
                                        label: function (tooltipItem, chart) {


                                            if (tooltipItem && tooltipItem.value) {
                                                return `${chart.datasets[tooltipItem.datasetIndex].label}: ${myHelper.roundNumber(parseFloat(tooltipItem.value), getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.tooltipBodyAppend, '')}`
                                                    .split('\\n');
                                            }
                                            return '';
                                        }
                                    }
                                },
                                // plugins: {
                                //     datalabels: {
                                //         anchor: data.valuesPositionAnchor,
                                //         align: data.valuesPositionAlign,
                                //         clamp: true,
                                //         rotation: getNumberFromData(data.valuesRotation, undefined),
                                //         formatter: function (value, context) {
                                //             if (value) {
                                //                 return `${myHelper.roundNumber(value, getNumberFromData(data.valuesMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.valuesAppendText, '')}${getValueFromData(data.attr('labelValueAppend' + context.dataIndex), '')}`
                                //                     .split('\\n');
                                //             }
                                //             return '';
                                //         },
                                //         font: {
                                //             family: getValueFromData(data.valuesFontFamily, undefined),
                                //             size: getNumberFromData(data.valuesFontSize, undefined),
                                //         },
                                //         color: valueTextColorArray,
                                //         textAlign: data.valuesTextAlign
                                //     }
                                // }

                            };

                            if (data.disableHoverEffects) options.hover = { mode: null };

                            // Chart declaration:
                            myChart = new Chart(ctx, {
                                type: 'line',
                                data: chartData,
                                options: options,
                                // plugins: (data.showValues) ? [ChartDataLabels] : undefined     // show value labels
                            });


                            progressBar.hide();
                        });
                    }
                }

                function onChange(e, newVal, oldVal) {
                    // value or timeinterval changed

                    if (myChart) {
                        progressBar.show();

                        let timeInterval = data.timeIntervalToShow;
                        if (getValueFromData(data.time_interval_oid, null) !== null && myHelper.intervals[vis.states.attr(data.time_interval_oid + '.val')] !== undefined) {
                            timeInterval = vis.states.attr(data.time_interval_oid + '.val');

                            if (getValueFromData(newVal, null) !== null && myHelper.intervals[newVal] !== undefined) {
                                // timeinterval changed
                                timeInterval = newVal;
                            }
                        }
                        dataRangeStartTime = myHelper.intervals[timeInterval] ? new Date().getTime() - myHelper.intervals[timeInterval] : undefined;

                        let operations = [];
                        for (var i = 0; i <= data.dataCount; i++) {
                            if (getValueFromData(data.attr('oid' + i), null) !== null) {
                                operations.push(myHelper.getTaskForHistoryData(data.attr('oid' + i), data, dataRangeStartTime))
                            }
                        }

                        Promise.all(operations).then((result) => {
                            // execute all db queries -> getting all needed data at same time

                            for (var i = 0; i <= result.length - 1; i++) {
                                let dataArray = myHelper.getPreparedData(result[i], data, i);

                                myChart.data.datasets[i].data = dataArray;
                            }

                            myChart.update();

                            progressBar.hide();
                        });
                    }
                };
            }, 1)
        } catch (ex) {
            console.exception(`${logPrefix} ${ex.message}, stack: ${ex.stack}`);
        }
    },
    pie: function (el, data) {
        try {
            setTimeout(function () {
                let myHelper = vis.binds.materialdesign.chart.helper;
                myHelper.registerChartAreaPlugin();

                let $this = $(el);
                var chartContainer = $(el).find('.materialdesign-chart-container').get(0);

                $(el).find('.materialdesign-chart-container').css('background-color', getValueFromData(data.backgroundColor, ''));
                let globalColor = getValueFromData(data.globalColor, '#44739e');

                let colorScheme = getValueFromData(data.colorScheme, null);
                if (colorScheme != null) {
                    colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                }

                if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                    var ctx = chartContainer.getContext('2d');

                    // Global Options:
                    Chart.defaults.global.defaultFontColor = '#44739e';
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

                        if (colorScheme != null) {
                            globalColor = colorScheme[i];
                        }

                        let bgColor = getValueFromData(data.attr('dataColor' + i), globalColor)
                        dataColorArray.push(bgColor);

                        if (getValueFromData(data.hoverColor, null) === null) {
                            hoverDataColorArray.push(myHelper.convertHex(bgColor, 80))
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
                        chartArea: {
                            backgroundColor: getValueFromData(data.chartAreaBackgroundColor, ''),
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
                                    if (tooltipItem) {
                                        return `${labelArray[tooltipItem.index]}: ${myHelper.roundNumber(parseFloat(chart.datasets[0].data[tooltipItem.index]), getNumberFromData(data.tooltipValueMaxDecimals, 10)).toLocaleString()}${getValueFromData(data.tooltipBodyAppend, '')}`
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
                    var myBarChart = new Chart(ctx, {
                        type: (data.chartType === 'pie') ? 'pie' : 'doughnut',
                        data: chartData,
                        options: options,
                        plugins: (data.showValues) ? [ChartDataLabels] : undefined     // show value labels
                    });

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
                }
            }, 1)
        } catch (ex) {
            console.exception(`bar: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};


vis.binds.materialdesign.chart.helper = {
    convertHex: function (hex, opacity) {
        hex = hex.replace('#', '');
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    },
    get_Y_AxisObject: function (chartType, yAxisPosition, yAxisTitle, yAxisTitleColor, yAxisTitleFontFamily, yAxisTitleFontSize, yAxisShowAxisLabels, axisValueMin,
        axisValueMax, axisValueStepSize, axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, yAxisValueLabelColor, yAxisValueFontFamily, yAxisValueFontSize,
        yAxisValueDistanceToAxis, yAxisGridLinesColor, yAxisGridLinesWitdh, yAxisShowAxis, yAxisShowGridLines, yAxisShowTicks, yAxisTickLength) {
        return {
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
    get_X_AxisObject: function (chartType, xAxisPosition, xAxisTitle, xAxisTitleColor, xAxisTitleFontFamily, xAxisTitleFontSize, xAxisShowAxisLabels, axisValueMin, axisValueMax, axisValueStepSize,
        axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, xAxisValueLabelColor, xAxisValueFontFamily, xAxisValueFontSize, xAxisValueDistanceToAxis, xAxisGridLinesColor, xAxisGridLinesWitdh,
        xAxisShowAxis, xAxisShowGridLines, xAxisShowTicks, xAxisTickLength) {
        return {
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
    },
    intervals: {
        '30 seconds': 30000,
        '1 minute': 60000,
        '2 minutes': 120000,
        '5 minutes': 300000,
        '10 minutes': 600000,
        '30 minutes': 1800000,
        '1 hour': 3600000,
        '2 hours': 7200000,
        '4 hours': 14400000,
        '8 hours': 28800000,
        '12 hours': 43200000,
        '1 day': 86400000,
        '2 days': 172800000,
        '3 days': 259200000,
        '7 days': 604800000,
        '14 days': 1209600000,
        '1 month': 2628000000,
        '2 months': 5256000000,
        '3 months': 7884000000,
        '6 months': 15768000000,
        '1 year': 31536000000,
        '2 years': 63072000000
    },
    defaultTimeFormats: function () {
        return JSON.parse(`
            {
                "millisecond":    "H:mm:ss.SSS",
                "second":         "H:mm:ss",
                "minute":         "H:mm",
                "hour":           "H",
                "day":            "MMM D",
                "week":           "ll",
                "month":          "MMM YYYY",
                "quarter":        "[Q]Q - YYYY",
                "year":           "YYYY"
            }
            `);
    },
    defaultToolTipTimeFormats: function () {
        return JSON.parse(`
            {
                "millisecond":    "lll:ss",
                "second":         "lll:ss",
                "minute":         "lll",
                "hour":           "lll",
                "day":            "lll",
                "week":           "lll",
                "month":          "lll",
                "quarter":        "lll",
                "year":           "lll"
            }
            `);
    },
    getTaskForHistoryData: function (id, data, dataRangeStartTime) {
        return new Promise((resolve, reject) => {
            vis.getHistory(id, {
                instance: data.historyAdapterInstance,
                count: parseInt(getNumberFromData(data.maxDataPoints, 100)),
                step: parseInt(getNumberFromData(data.minTimeInterval, 0)) * 1000,
                aggregate: data.aggregate || 'average',
                start: dataRangeStartTime,
                end: new Date().getTime(),
                timeout: 2000
            }, function (err, result) {
                if (!err && result) {
                    resolve(result);
                } else {
                    resolve(null);
                }
            });
        });
    },
    getPreparedData: function (result, data, index) {
        let dataArray = [];

        if (result) {
            dataArray = result.map(elm => ({
                t: (elm.ts !== null && elm.ts !== undefined) ? elm.ts : null,
                y: (elm.val !== null && elm.val !== undefined) ? elm.val * getNumberFromData(data.attr('multiply' + index), 1) : null
            }));
        }

        return dataArray;
    },
    registerChartAreaPlugin: function () {
        Chart.pluginService.register({
            beforeDraw: function (chart, easing) {
                if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                    var helpers = Chart.helpers;
                    var ctx = chart.chart.ctx;
                    var chartArea = chart.chartArea;

                    ctx.save();
                    ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                    ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                    ctx.restore();
                }
            }
        });
    }
}