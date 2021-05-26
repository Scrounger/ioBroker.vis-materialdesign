/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.chart.lineHistory = function (el, data) {
    let widgetName = 'Line History Chart';

    try {
        let debug = myMdwHelper.getBooleanFromData(data.debug, false);
        if (debug) console.log(`[${widgetName} ${data.wid}] widget setting: ${JSON.stringify(data)}`);

        let $this = $(el);

        myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

        setTimeout(function () {
            let myChartHelper = vis.binds.materialdesign.chart.helper;
            myChartHelper.registerChartAreaPlugin();
            let myChart;
            let errorsOnDataLoading = [];

            if (myMdwHelper.getBooleanFromData(data.cardUse, false)) {
                // Card Layout
                $this.html(`<div class="material-progress-circular-container">
                                <progress class="material-progress-circular"/>
                            </div>
                            ${myChartHelper.getCardBackground(data)}`);
            } else {
                $this.html(`<div class="material-progress-circular-container">
                                <progress class="material-progress-circular"/>
                            </div>
                            <canvas class="materialdesign-chart-container"></canvas>`);
            }

            $(document).on("mdwSubscribe", function (e, oids) {
                if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                    setLayout(true);
                }
            });

            vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                setLayout(true);
            });

            vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                setLayout(true);
            });

            setLayout();
            function setLayout(changed = false) {
                $this.context.style.setProperty("--materialdesign-font-card-title", myMdwHelper.getValueFromData(data.titleFontFamily, ''));

                $this.context.style.setProperty("--materialdesign-color-card-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                $this.context.style.setProperty("--materialdesign-color-card-title-section-background", myMdwHelper.getValueFromData(data.colorTitleSectionBackground, ''));
                $this.context.style.setProperty("--materialdesign-color-card-text-section-background", myMdwHelper.getValueFromData(data.colorTextSectionBackground, ''));
                $this.context.style.setProperty("--materialdesign-color-card-title", myMdwHelper.getValueFromData(data.colorTitle, ''));

                let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
                if (titleFontSize && titleFontSize.style) {
                    $this.find('.card-title').css('font-size', myMdwHelper.getStringFromNumberData(data.titleLayout, 'inherit', '', 'px'));
                }

                if (changed) {
                    createChart();
                }
            }

            createChart();
            function createChart() {
                var chartContainer = $this.find('.materialdesign-chart-container').get(0);

                var progressBar = $this.find('.material-progress-circular-container');

                progressBar.show();


                let timeInterval = data.timeIntervalToShow;
                let dataRangeStartTime = new Date().getTime() - myChartHelper.intervals[timeInterval];
                if (myMdwHelper.getValueFromData(data.time_interval_oid, null) !== null) {
                    let val = vis.states.attr(data.time_interval_oid + '.val');

                    if (typeof (val) === 'string' && myChartHelper.intervals[val] !== undefined) {
                        dataRangeStartTime = new Date().getTime() - myChartHelper.intervals[val]
                        timeInterval = vis.states.attr(data.time_interval_oid + '.val');
                    } else {
                        dataRangeStartTime = val;
                    }

                    vis.states.bind(data.time_interval_oid + '.val', onChange);
                }

                $this.find('.materialdesign-chart-container').css('background-color', myMdwHelper.getValueFromData(data.backgroundColor, ''));
                let globalColor = myMdwHelper.getValueFromData(data.globalColor, '#44739e');

                let colorScheme = myMdwHelper.getValueFromData(data.colorScheme, null);
                if (colorScheme !== null) {
                    colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                }

                // manual refresh through dp
                if (myMdwHelper.getValueFromData(data.manualRefreshTrigger, null) !== null) {
                    vis.states.bind(data.manualRefreshTrigger + '.ts', onChange);
                }

                if (data.refreshMethod === 'timeInterval') {
                    setInterval(function () {
                        if (debug) console.log(`[${widgetName} ${data.wid}] ************************************************************** onChange - TimeInterval by Editor **************************************************************`);
                        onChange();
                    }, myChartHelper.intervals[data.refreshTimeInterval]);
                }

                if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                    var ctx = chartContainer.getContext('2d');

                    // Global Options:
                    Chart.defaults.global.defaultFontColor = '#44739e';
                    Chart.defaults.global.defaultFontSize = 15;
                    Chart.defaults.global.animation.duration = myMdwHelper.getNumberFromData(data.animationDuration, 1000);

                    Chart.plugins.unregister(ChartDataLabels);

                    if (myMdwHelper.getValueFromData(data.historyAdapterInstance, null) !== null) {

                        let operations = [];
                        for (var i = 0; i <= data.dataCount; i++) {
                            if (myMdwHelper.getValueFromData(data.attr('oid' + i), null) !== null) {
                                operations.push(myChartHelper.getTaskForHistoryData(i, data, dataRangeStartTime, debug))

                                if (data.refreshMethod === 'realtime') {
                                    vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                                }
                            }
                        }

                        Promise.all(operations).then((result) => {
                            // execute all db queries -> getting all needed data at same time
                            if (debug) console.log(`[${widgetName} ${data.wid}] promise all datasets - count: ${result.length}`);

                            let myDatasets = [];
                            let myYAxis = [];
                            let myDatalabels = [];

                            errorsOnDataLoading = [];

                            for (var i = 0; i <= result.length - 1; i++) {

                                let dataArray = myChartHelper.getPreparedData(result[i], data, i, debug);

                                if (debug) console.log(`[${widgetName} ${data.wid}] prepare dataset for '${result[i].id}'`);

                                if (result[i].error) {
                                    errorsOnDataLoading.push(`[${i}] ${result[i].error}`);
                                }

                                myDatasets.push(
                                    {
                                        data: dataArray,
                                        lineTension: myMdwHelper.getNumberFromData(data.attr('lineTension' + i), 0.4),
                                        borderWidth: myMdwHelper.getNumberFromData(data.attr('lineThikness' + i), 2),
                                        steppedLine: myMdwHelper.getBooleanFromData(data.attr('steppedLine' + i), false),
                                        label: myMdwHelper.getValueFromData(data.attr('legendText' + i), ''),
                                        borderColor: myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor),     // Line Color
                                        pointBackgroundColor: myMdwHelper.getValueFromData(data.attr('pointColor' + i), myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        pointBorderColor: myMdwHelper.getValueFromData(data.attr('pointColor' + i), myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        fill: myMdwHelper.getBooleanFromData(data.attr('useFillColor' + i), false),
                                        backgroundColor: myMdwHelper.getValueFromData(data.attr('fillColor' + i), myChartHelper.addOpacityToColor(myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor), 10)),  //Fill Background color
                                        pointRadius: myMdwHelper.getNumberFromData(data.pointSize, 3),
                                        pointHoverRadius: myMdwHelper.getNumberFromData(data.pointSizeHover, 4),
                                        pointStyle: myMdwHelper.getValueFromData(data.pointStyle, 'circle'),
                                        pointHoverBackgroundColor: myMdwHelper.getValueFromData(data.attr('pointHoverColor' + i), myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        pointHoverBorderColor: myMdwHelper.getValueFromData(data.attr('pointHoverColor' + i), myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                        yAxisID: 'yAxis_id_' + myMdwHelper.getNumberFromData(data.attr('commonYAxis' + i), i),
                                        spanGaps: data.attr('lineSpanGaps' + i),
                                        datalabels: {
                                            // Plugin datalabels
                                            display: myMdwHelper.getValueFromData(data.attr('showValues' + i), 'showValuesOn') === 'showValuesOn' ? true : data.attr('showValues' + i) === 'showValuesOff' ? false : 'auto',
                                            anchor: data.attr('valuesPositionAnchor' + i),
                                            align: data.attr('valuesPositionAlign' + i),
                                            offset: myMdwHelper.getNumberFromData(data.attr('valuesPositionOffset' + i), 0),
                                            clamp: true,
                                            rotation: myMdwHelper.getNumberFromData(data.attr('valuesRotation' + i), undefined),
                                            formatter: function (value, context) {
                                                if ((value.y || value.y === 0) && context.dataIndex % myMdwHelper.getNumberFromData(data.attr('valuesSteps' + context.datasetIndex), 1) === 0) {
                                                    let minDigits = data.attr('valuesMinDecimals' + context.datasetIndex) >= 0 ? data.attr('valuesMinDecimals' + context.datasetIndex) : 0;
                                                    let maxDigits = data.attr('valuesMaxDecimals' + context.datasetIndex) >= 0 ? data.attr('valuesMaxDecimals' + context.datasetIndex) : 0;

                                                    return `${myMdwHelper.formatNumber(value.y, minDigits, maxDigits)}${myMdwHelper.getValueFromData(data.attr('valuesAppendText' + context.datasetIndex), '')}`
                                                        .split('\\n');
                                                }
                                                return null;
                                            },
                                            font: {
                                                family: myMdwHelper.getValueFromData(data.attr('valuesFontFamily' + i), undefined),
                                                size: myMdwHelper.getNumberFromData(data.attr('valuesFontSize' + i), undefined),
                                            },
                                            color: myMdwHelper.getValueFromData(data.attr('valuesFontColor' + i), myMdwHelper.getValueFromData(data.attr('dataColor' + i), (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor)),
                                            textAlign: data.attr('valuesTextAlign' + i)
                                        },
                                    }
                                );

                                if (debug) console.log(`[${widgetName} ${data.wid}] prepare yAxis for '${result[i].id}'`);

                                myYAxis.push(
                                    {
                                        id: 'yAxis_id_' + i,
                                        type: 'linear',
                                        position: data.attr('yAxisPosition' + i),
                                        display: (myMdwHelper.getNumberFromData(data.attr('commonYAxis' + i), i) === i) ? data.attr('showYAxis' + i) : false,
                                        scaleLabel: {       // y-Axis title
                                            display: (myMdwHelper.getValueFromData(data.attr('yAxisTitle' + i), null) !== null),
                                            labelString: myMdwHelper.getValueFromData(data.attr('yAxisTitle' + i), ''),
                                            fontColor: myMdwHelper.getValueFromData(data.yAxisTitleColor, undefined),
                                            fontFamily: myMdwHelper.getValueFromData(data.yAxisTitleFontFamily, undefined),
                                            fontSize: myMdwHelper.getNumberFromData(data.yAxisTitleFontSize, undefined)
                                        },
                                        ticks: {
                                            min: myMdwHelper.getNumberFromData(data.attr('yAxisMinValue' + i), undefined),
                                            max: myMdwHelper.getNumberFromData(data.attr('yAxisMaxValue' + i), undefined),
                                            stepSize: myMdwHelper.getNumberFromData(data.attr('yAxisStep' + i), undefined),
                                            autoSkip: true,
                                            maxTicksLimit: myMdwHelper.getNumberFromData(data.attr('yAxisMaxLabel' + i), undefined),
                                            fontColor: myMdwHelper.getValueFromData(data.attr('yAxisValueColor' + i), myMdwHelper.getValueFromData(data.yAxisValueLabelColor, undefined)),
                                            fontFamily: myMdwHelper.getValueFromData(data.yAxisValueFontFamily, undefined),
                                            fontSize: myMdwHelper.getNumberFromData(data.yAxisValueFontSize, undefined),
                                            padding: myMdwHelper.getNumberFromData(data.yAxisValueDistanceToAxis, 0),
                                            callback: function (value, index, values) {
                                                try {
                                                    let axisId = this.id.replace('yAxis_id_', '');
                                                    let minDigits = data.attr('yAxisValueMinDigits' + axisId) >= 0 ? data.attr('yAxisValueMinDigits' + axisId) : 0;
                                                    let maxDigits = data.attr('yAxisValueMaxDigits' + axisId) >= 0 ? data.attr('yAxisValueMaxDigits' + axisId) : 0;

                                                    return `${myMdwHelper.formatNumber(value, minDigits, maxDigits)}${myMdwHelper.getValueFromData(data.attr('yAxisValueAppendText' + axisId), '')}`.split('\\n');
                                                } catch (ex) {
                                                    console.error(`[${widgetName} - ${data.wid}] [ticks callback] error: ${ex.message}, stack: ${ex.stack}`);
                                                }
                                            },
                                            source: myMdwHelper.getValueFromData(data.xAxisTicksSource, 'auto')
                                        },
                                        gridLines: {
                                            display: true,
                                            color: myMdwHelper.getValueFromData(data.attr('yAxisGridLinesColor' + i), 'black'),
                                            lineWidth: myMdwHelper.getNumberFromData(data.attr('yAxisGridLinesWitdh' + i), 0.1),
                                            drawBorder: data.attr('yAxisShowAxisBorder' + i),
                                            drawOnChartArea: data.attr('yAxisShowGridLines' + i),
                                            drawTicks: data.attr('yAxisShowTicks' + i),
                                            tickMarkLength: myMdwHelper.getNumberFromData(data.attr('yAxisTickLength' + i), 5),
                                            zeroLineWidth: myMdwHelper.getNumberFromData(data.attr('yAxisZeroLineWidth' + i), 1),
                                            zeroLineColor: myMdwHelper.getValueFromData(data.attr('yAxisZeroLineColor' + i), 'rgba(0, 0, 0, 0.25)'),
                                        }
                                    }
                                );
                            }

                            // Data with datasets options
                            var chartData = {
                                datasets: myDatasets,
                            };

                            let xAxisTimeFormats = myChartHelper.defaultTimeFormats();
                            try {
                                xAxisTimeFormats = JSON.parse(data.xAxisTimeFormats)
                            } catch (errJSON) {
                                // Formatierung kann ggf. Binding sein -> Workaroung damit chart in VIS Editor angezeigt wird
                                var bindingVal = vis.states.attr(data.xAxisTimeFormats.replace('{', '').replace('}', '') + '.val');
                                if (bindingVal && bindingVal !== null && bindingVal !== 'null') {
                                    try {
                                        xAxisTimeFormats = JSON.parse(bindingVal)
                                    } catch (errJsonBinding) {
                                        console.error(`[${widgetName} - ${data.wid}] parsing Binding for xaxis time format  failed! error in json syntax: ${errJsonBinding.message}`);
                                    }
                                } else {
                                    console.error(`[${widgetName} - ${data.wid}] xaxis time format parsing failed! error in json syntax: ${errJSON.message}`);
                                }
                            }

                            if (debug) console.log(`[${widgetName} - ${data.wid}] prepare chart options`);

                            // Notice how nested the beginAtZero is
                            var options = {
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: myChartHelper.getLayout(data),
                                chartArea: {
                                    backgroundColor: myMdwHelper.getValueFromData(data.chartAreaBackgroundColor, ''),
                                },
                                hover: {
                                    mode: 'nearest'
                                },
                                legend: Object.assign(myChartHelper.getLegend(data), myChartHelper.getLegendClickEvent(myYAxis)),
                                scales: {
                                    xAxes: [{
                                        beforeCalculateTickRotation: function (axis) {
                                            if (data.xAxisLabelUseTodayYesterday) {
                                                for (const scaleId in axis.chart.scales) {

                                                    if (!scaleId.includes('yAxis')) {
                                                        if (axis._ticks) {
                                                            let unit = axis._unit;

                                                            for (const tick in axis._ticks) {
                                                                let date = moment(axis._ticks[tick].value);

                                                                if (date.isSame(moment(), 'day')) {
                                                                    axis._ticks[tick].label = `${date.format(xAxisTimeFormats[unit].replace('dddd', `[${_('Today')}]`).replace('ddd', `[${_('Today')}]`).replace('dd', `[${_('Today')}]`))}${myMdwHelper.getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
                                                                } else if (date.isSame(moment().subtract(1, 'day'), 'day')) {
                                                                    axis._ticks[tick].label = `${date.format(xAxisTimeFormats[unit].replace('dddd', `[${_('Yesterday')}]`).replace('ddd', `[${_('Yesterday')}]`).replace('dd', `[${_('Yesterday')}]`))}${myMdwHelper.getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
                                                                } else {
                                                                    axis._ticks[tick].label = `${axis._ticks[tick].label}${myMdwHelper.getValueFromData(data.axisValueAppendText, '')}`.split('\\n')
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        },
                                        type: 'time',
                                        bounds: (myMdwHelper.getValueFromData(data.xAxisBounds, '') === 'axisTicks') ? 'ticks' : 'data',
                                        time:
                                        {
                                            displayFormats: xAxisTimeFormats,      // muss entsprechend konfigurietr werden siehe 
                                            tooltipFormat: 'll'
                                        },
                                        position: data.xAxisPosition,
                                        scaleLabel: {       // x-Axis title
                                            display: (myMdwHelper.getValueFromData(data.xAxisTitle, null) !== null),
                                            labelString: myMdwHelper.getValueFromData(data.xAxisTitle, ''),
                                            fontColor: myMdwHelper.getValueFromData(data.xAxisTitleColor, undefined),
                                            fontFamily: myMdwHelper.getValueFromData(data.xAxisTitleFontFamily, undefined),
                                            fontSize: myMdwHelper.getNumberFromData(data.xAxisTitleFontSize, undefined)
                                        },
                                        ticks: {        // x-Axis values
                                            display: myMdwHelper.getBooleanFromData(data.xAxisShowAxisLabels, true),
                                            autoSkip: true,
                                            autoSkipPadding: myMdwHelper.getNumberFromData(data.xAxisDistanceBetweenTicks, 10),
                                            maxTicksLimit: myMdwHelper.getNumberFromData(data.xAxisMaxLabel, undefined),
                                            minRotation: parseInt(myMdwHelper.getNumberFromData(data.xAxisMinRotation, 0)),
                                            maxRotation: parseInt(myMdwHelper.getNumberFromData(data.xAxisMaxRotation, 0)),
                                            callback: function (value, index, values) {
                                                if (!data.xAxisLabelUseTodayYesterday) {                      // only for chartType: horizontal
                                                    return `${value}${myMdwHelper.getValueFromData(data.axisValueAppendText, '')}`.split('\\n');
                                                }
                                                return value;
                                            },
                                            fontColor: myMdwHelper.getValueFromData(data.xAxisValueLabelColor, undefined),
                                            fontFamily: myMdwHelper.getValueFromData(data.xAxisValueFontFamily, undefined),
                                            fontSize: myMdwHelper.getNumberFromData(data.xAxisValueFontSize, undefined),
                                            padding: myMdwHelper.getNumberFromData(data.xAxisValueDistanceToAxis, 0),
                                        },
                                        gridLines: {
                                            display: true,
                                            color: myMdwHelper.getValueFromData(data.xAxisGridLinesColor, 'black'),
                                            lineWidth: myMdwHelper.getNumberFromData(data.xAxisGridLinesWitdh, 0.1),
                                            drawBorder: data.xAxisShowAxis,
                                            drawOnChartArea: data.xAxisShowGridLines,
                                            drawTicks: data.xAxisShowTicks,
                                            tickMarkLength: myMdwHelper.getNumberFromData(data.xAxisTickLength, 5),
                                            zeroLineWidth: myMdwHelper.getNumberFromData(data.xAxisZeroLineWidth, 0.1),
                                            zeroLineColor: myMdwHelper.getValueFromData(data.xAxisZeroLineColor, 'black'),
                                            offsetGridLines: myMdwHelper.getBooleanFromData(data.xAxisOffsetGridLines, false),
                                        }
                                    }],
                                    yAxes: myYAxis,
                                },
                                tooltips: {
                                    position: data.tooltipPosition,
                                    mode: data.tooltipMode,
                                    enabled: data.showTooltip,
                                    backgroundColor: myMdwHelper.getValueFromData(data.tooltipBackgroundColor, 'black'),
                                    caretSize: myMdwHelper.getNumberFromData(data.tooltipArrowSize, 5),
                                    caretPadding: myMdwHelper.getNumberFromData(data.tooltipDistanceToBar, 2),
                                    cornerRadius: myMdwHelper.getNumberFromData(data.tooltipBoxRadius, 4),
                                    displayColors: data.tooltipShowColorBox,
                                    xPadding: myMdwHelper.getNumberFromData(data.tooltipXpadding, 10),
                                    yPadding: myMdwHelper.getNumberFromData(data.tooltipYpadding, 10),
                                    titleFontColor: myMdwHelper.getValueFromData(data.tooltipTitleFontColor, 'white'),
                                    titleFontFamily: myMdwHelper.getValueFromData(data.tooltipTitleFontFamily, undefined),
                                    titleFontSize: myMdwHelper.getNumberFromData(data.tooltipTitleFontSize, undefined),
                                    titleMarginBottom: myMdwHelper.getNumberFromData(data.tooltipTitleMarginBottom, 6),
                                    bodyFontColor: myMdwHelper.getValueFromData(data.tooltipBodyFontColor, 'white'),
                                    bodyFontFamily: myMdwHelper.getValueFromData(data.tooltipBodyFontFamily, undefined),
                                    bodyFontSize: myMdwHelper.getNumberFromData(data.tooltipBodyFontSize, undefined),
                                    callbacks: {
                                        title: function (tooltipItem, chart) {

                                            let datasetIndex = tooltipItem[0].datasetIndex;

                                            let index = tooltipItem[0].index;
                                            let metaIndex = Object.keys(chart.datasets[datasetIndex]._meta)[0];
                                            let currentUnit = chart.datasets[datasetIndex]._meta[metaIndex].controller._xScale._unit;
                                            let timestamp = moment(chart.datasets[datasetIndex].data[index].t);

                                            let timeFormats = (myMdwHelper.getValueFromData(data.tooltipTimeFormats, null) !== null) ? JSON.parse(data.tooltipTimeFormats) : myChartHelper.defaultToolTipTimeFormats();

                                            if (data.tooltipLabelUseTodayYesterday) {
                                                if (timestamp.isSame(moment(), 'day')) {
                                                    return timestamp.format(timeFormats[currentUnit].replace('dddd', `[${_('Today')}]`).replace('ddd', `[${_('Today')}]`).replace('dd', `[${_('Today')}]`)).split('\\n');
                                                } else if (timestamp.isSame(moment().subtract(1, 'day'), 'day')) {
                                                    return timestamp.format(timeFormats[currentUnit].replace('dddd', `[${_('Yesterday')}]`).replace('ddd', `[${_('Yesterday')}]`).replace('dd', `[${_('Yesterday')}]`)).split('\\n');
                                                }
                                            }

                                            return timestamp.format(timeFormats[currentUnit]);
                                        },
                                        label: function (tooltipItem, chart) {
                                            if (tooltipItem && tooltipItem.value) {
                                                return `${chart.datasets[tooltipItem.datasetIndex].label}: ${myMdwHelper.formatNumber(tooltipItem.value, data.tooltipValueMinDecimals, data.tooltipValueMaxDecimals)}${myMdwHelper.getValueFromData(data.tooltipBodyAppend, '')}`
                                                    .split('\\n');
                                            }
                                            return '';
                                        },
                                        labelColor: function (tooltipItem, chart) {
                                            let dataSetColor = chart.config.data.datasets[tooltipItem.datasetIndex].borderColor;

                                            return {
                                                borderColor: dataSetColor,
                                                backgroundColor: dataSetColor
                                            };
                                        }
                                    }
                                }
                            };

                            if (data.disableHoverEffects) options.hover = { mode: null };

                            if (debug) console.log(`[${widgetName} ${data.wid}] chart creating...`);

                            if (errorsOnDataLoading.length > 0) {
                                options.title = {
                                    display: true,
                                    text: `Error: ${errorsOnDataLoading.join(', ')}`,
                                    fontColor: 'red'
                                };
                            }

                            if (myChart) {
                                myChart.destroy();
                            }

                            // Chart declaration:
                            myChart = new Chart(ctx, {
                                type: 'line',
                                data: chartData,
                                options: options,
                                plugins: [ChartDataLabels, myChartHelper.myDistanceLegendPlugin(data)]     // show value labels
                            });

                            progressBar.hide();

                            if (debug) console.log(`[${widgetName} ${data.wid}] chart successful created`);
                        });
                    }
                }

                function onChange(e, newVal, oldVal) {
                    try {
                        // value or timeinterval changed
                        if (e && e.type && !e.type.includes(data.manualRefreshTrigger) && !e.type.includes(data.time_interval_oid)) {
                            if (debug) console.log(`[${widgetName} ${data.wid}] ************************************************************** onChange - Data changed **************************************************************`);
                            if (debug) console.log(`[${widgetName} ${data.wid}] data changed for '${e.type}'`);
                        }

                        let needsChange = true

                        if (e && e.type && e.type.includes(data.manualRefreshTrigger)) {
                            // oid - manuell refresh trigger
                            if (moment(newVal).diff(moment(oldVal)) < 2000) {
                                if (debug) console.log(`[${widgetName} ${data.wid}] trigger '${e.type}' - you have to wait 2 seconds until next refresh!: ${moment(newVal).diff(moment(oldVal))} ms`);
                                needsChange = false;
                            } else {
                                if (debug) console.log(`[${widgetName} ${data.wid}] ************************************************************** onChange - OID Refresh Trigger **************************************************************`);
                                if (debug) console.log(`[${widgetName} ${data.wid}] time diff since last refresh from '${e.type}': ${moment(newVal).diff(moment(oldVal))} ms`);
                            }
                        }

                        if (myChart && needsChange) {
                            progressBar.show();

                            let timeInterval = data.timeIntervalToShow;
                            dataRangeStartTime = new Date().getTime() - myChartHelper.intervals[timeInterval];

                            if (myMdwHelper.getValueFromData(data.time_interval_oid, null) !== null) {
                                let val = vis.states.attr(data.time_interval_oid + '.val');

                                if (e && e.type && e.type.includes(data.time_interval_oid)) {
                                    if (debug) console.log(`[${widgetName} ${data.wid}] ************************************************************** onChange - OID TimeInterval **************************************************************`);
                                    if (debug) console.log(`[${widgetName} ${data.wid}] time interval changed by '${data.time_interval_oid}' to: ${val}`);
                                }

                                if (typeof (val) === 'string' && myChartHelper.intervals[val] !== undefined) {
                                    dataRangeStartTime = new Date().getTime() - myChartHelper.intervals[val]
                                    timeInterval = vis.states.attr(data.time_interval_oid + '.val');
                                } else {
                                    dataRangeStartTime = val;
                                }
                            }

                            let operations = [];
                            for (var i = 0; i <= data.dataCount; i++) {
                                if (myMdwHelper.getValueFromData(data.attr('oid' + i), null) !== null) {
                                    operations.push(myChartHelper.getTaskForHistoryData(i, data, dataRangeStartTime, debug))
                                }
                            }

                            Promise.all(operations).then((result) => {
                                // execute all db queries -> getting all needed data at same time
                                if (debug) console.log(`[${widgetName} ${data.wid}] promise all datasets - count: ${result.length}`);

                                errorsOnDataLoading = []
                                for (var i = 0; i <= result.length - 1; i++) {
                                    let dataArray = myChartHelper.getPreparedData(result[i], data, i, debug);

                                    myChart.data.datasets[i].data = dataArray;

                                    if (result[i].error) {
                                        errorsOnDataLoading.push(`[${i}] ${result[i].error}`);
                                    }
                                }

                                if (errorsOnDataLoading.length > 0) {
                                    myChart.options.title = {
                                        display: true,
                                        text: `Error: ${errorsOnDataLoading.join(', ')}`,
                                        fontColor: 'red'
                                    };
                                } else {
                                    myChart.options.title = {
                                        display: false
                                    };
                                }

                                if (debug) console.log(`[${widgetName} ${data.wid}] chart updating...`);
                                myChart.update();

                                progressBar.hide();
                                if (debug) console.log(`[${widgetName} ${data.wid}] chart successful updated`);

                            });
                        }
                    } catch (onChangeError) {
                        console.error(`[${widgetName} - ${data.wid}] onChange error: ${onChangeError.message}, stack: ${onChangeError.stack}`);
                    }
                };
            }
        }, 1);
    } catch (ex) {
        console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
    }
}