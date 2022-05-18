/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.chart = {
    bar: function (el, data) {
        let widgetName = 'Bar Chart';

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            myMdwHelper.waitForCssVariable(function () {
                var myBarChart;
                let myChartHelper = vis.binds.materialdesign.chart.helper;
                myChartHelper.registerChartAreaPlugin();

                if (myChartHelper.getBooleanFromData(data.cardUse, false)) {
                    // Card Layout
                    $this.html(myChartHelper.getCardBackground(data));
                } else {
                    $this.html('<canvas class="materialdesign-chart-container"></canvas>');
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
                    $this.context.style.setProperty("--materialdesign-font-card-title", myChartHelper.getValueFromData(data.titleFontFamily, ''));

                    $this.context.style.setProperty("--materialdesign-color-card-background", myChartHelper.getValueFromData(data.colorBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-title-section-background", myChartHelper.getValueFromData(data.colorTitleSectionBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-text-section-background", myChartHelper.getValueFromData(data.colorTextSectionBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-title", myChartHelper.getValueFromData(data.colorTitle, ''));

                    let titleFontSize = myChartHelper.getFontSize(data.titleLayout);
                    if (titleFontSize && titleFontSize.style) {
                        $this.find('.card-title').css('font-size', myChartHelper.getStringFromNumberData(data.titleLayout, 'inherit', '', 'px'));
                    }

                    if (changed) {
                        createChart();
                    }
                }

                createChart();
                function createChart() {
                    var chartContainer = $this.find('.materialdesign-chart-container').get(0);

                    $this.find('.materialdesign-chart-container').css('background-color', myChartHelper.getValueFromData(data.backgroundColor, ''));
                    let globalColor = myChartHelper.getValueFromData(data.globalColor, '#44739e');

                    let colorScheme = myChartHelper.getValueFromData(data.colorScheme, null);
                    if (colorScheme !== null) {
                        colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                    }

                    if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                        var ctx = chartContainer.getContext('2d');

                        // Global Options:
                        Chart.defaults.global.defaultFontColor = '#44739e';
                        Chart.defaults.global.defaultFontSize = 15;
                        Chart.defaults.global.animation.duration = myChartHelper.getNumberFromData(data.animationDuration, 1000);

                        Chart.plugins.unregister(ChartDataLabels);

                        let dataArray = []
                        let labelArray = [];
                        let dataColorArray = [];
                        let hoverDataColorArray = [];
                        let globalValueTextColor = myChartHelper.getValueFromData(data.valuesFontColor, 'black')
                        let valueTextColorArray = [];
                        let countOfItems = 0;
                        let jsonData = null;

                        if (data.chartDataMethod === 'jsonStringObject') {
                            try {
                                jsonData = JSON.parse(vis.states.attr(data.oid + '.val'));
                                countOfItems = jsonData.length - 1;
                            } catch (errJson) {
                                if (myBarChart) myBarChart.destroy();

                                myBarChart = new Chart(ctx, {
                                    type: (data.chartType === 'vertical') ? 'bar' : 'horizontalBar',
                                    options: {
                                        title: {
                                            display: true,
                                            text: `${_("Error in JSON string")}<br>${errJson.message}`.split('<br>'),
                                            fontColor: 'red'
                                        }
                                    },
                                    plugins: [ChartDataLabels, myChartHelper.myDistanceLegendPlugin(data)]
                                });

                                myBarChart.update();

                                console.error(`[Bar Chart - ${data.wid}] cannot parse json string! Error: ${errJson.message}`);
                            }

                            vis.states.bind(data.oid + '.val', onChange);
                        } else {
                            countOfItems = data.dataCount;
                        }

                        for (var i = 0; i <= countOfItems; i++) {
                            // row data
                            if (colorScheme !== null) {
                                globalColor = colorScheme[i];
                            }

                            let barItem = getBarItemObj(i, data, jsonData, globalColor, globalValueTextColor);

                            dataArray.push(barItem.value);
                            labelArray.push(barItem.label);

                            dataColorArray.push(barItem.dataColor);

                            if (myChartHelper.getValueFromData(data.hoverColor, null) === null) {
                                hoverDataColorArray.push(myChartHelper.addOpacityToColor(barItem.dataColor, 80))
                            } else {
                                hoverDataColorArray.push(data.hoverColor)
                            }

                            valueTextColorArray.push(barItem.valueColor)

                            vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                        }



                        // Data with datasets options
                        var chartData = {
                            labels: labelArray,
                            datasets: [
                                Object.assign(myChartHelper.getDataset(dataArray, dataColorArray, hoverDataColorArray, undefined, data.hoverBorderColor, undefined, data.hoverBorderWidth),
                                    {
                                        // chart specific properties
                                        label: myChartHelper.getValueFromData(data.barLabelText, ''),
                                        categoryPercentage: myChartHelper.getNumberFromData(data.barWidth, 80) / 100,
                                        barPercentage: myChartHelper.getNumberFromData(data.barWidth, 80) / 100,
                                    }
                                )
                            ]
                        };

                        // Notice how nested the beginAtZero is
                        var options = {
                            responsive: true,
                            maintainAspectRatio: false,
                            layout: myChartHelper.getLayout(data),
                            legend: myChartHelper.getLegend(data),
                            chartArea: {
                                backgroundColor: myChartHelper.getValueFromData(data.chartAreaBackgroundColor, ''),
                            },
                            scales: {
                                yAxes: [
                                    myChartHelper.get_Y_AxisObject(data.chartType, data.yAxisPosition, data.yAxisTitle, data.yAxisTitleColor, data.yAxisTitleFontFamily, data.yAxisTitleFontSize,
                                        data.yAxisShowAxisLabels, data.axisValueMin, data.axisValueMax, data.axisValueStepSize, data.axisMaxLabel, data.axisLabelAutoSkip, data.axisValueAppendText,
                                        data.yAxisValueLabelColor, data.yAxisValueFontFamily, data.yAxisValueFontSize, data.yAxisValueDistanceToAxis, data.yAxisGridLinesColor,
                                        data.yAxisGridLinesWitdh, data.yAxisShowAxis, data.yAxisShowGridLines, data.yAxisShowTicks, data.yAxisTickLength, data.yAxisZeroLineWidth, data.yAxisZeroLineColor, data.axisValueMinDigits, data.axisValueMaxDigits)
                                ],
                                xAxes: [
                                    myChartHelper.get_X_AxisObject(data.chartType, data.xAxisPosition, data.xAxisTitle, data.xAxisTitleColor, data.xAxisTitleFontFamily, data.xAxisTitleFontSize,
                                        data.xAxisShowAxisLabels, data.axisValueMin, data.axisValueMax, data.axisValueStepSize, data.axisMaxLabel, data.axisLabelAutoSkip, data.axisValueAppendText,
                                        data.xAxisValueLabelColor, data.xAxisValueFontFamily, data.xAxisValueFontSize, data.xAxisValueDistanceToAxis, data.xAxisGridLinesColor,
                                        data.xAxisGridLinesWitdh, data.xAxisShowAxis, data.xAxisShowGridLines, data.xAxisShowTicks, data.xAxisTickLength, data.xAxisZeroLineWidth, data.xAxisZeroLineColor, data.xAxisOffsetGridLines, data.axisValueMinDigits, data.axisValueMaxDigits, data.xAxisMinRotation, data.xAxisMaxRotation, false, data.xAxisOffset, data.xAxisTicksSource, undefined, false, undefined)
                                ],
                            },
                            tooltips: {
                                enabled: data.showTooltip,
                                backgroundColor: myChartHelper.getValueFromData(data.tooltipBackgroundColor, 'black'),
                                caretSize: myChartHelper.getNumberFromData(data.tooltipArrowSize, 5),
                                caretPadding: myChartHelper.getNumberFromData(data.tooltipDistanceToBar, 2),
                                cornerRadius: myChartHelper.getNumberFromData(data.tooltipBoxRadius, 4),
                                displayColors: data.tooltipShowColorBox,
                                xPadding: myChartHelper.getNumberFromData(data.tooltipXpadding, 10),
                                yPadding: myChartHelper.getNumberFromData(data.tooltipYpadding, 10),
                                titleFontColor: myChartHelper.getValueFromData(data.tooltipTitleFontColor, 'white'),
                                titleFontFamily: myChartHelper.getValueFromData(data.tooltipTitleFontFamily, undefined),
                                titleFontSize: myChartHelper.getNumberFromData(data.tooltipTitleFontSize, undefined),
                                titleMarginBottom: myChartHelper.getNumberFromData(data.tooltipTitleMarginBottom, 6),
                                bodyFontColor: myChartHelper.getValueFromData(data.tooltipBodyFontColor, 'white'),
                                bodyFontFamily: myChartHelper.getValueFromData(data.tooltipBodyFontFamily, undefined),
                                bodyFontSize: myChartHelper.getNumberFromData(data.tooltipBodyFontSize, undefined),
                                callbacks: {
                                    title: function (tooltipItem, chart) {
                                        let barItem = getBarItemObj(tooltipItem[0].index, data, jsonData, globalColor, globalValueTextColor);

                                        if (barItem && barItem.tooltipTitle) {
                                            return barItem.tooltipTitle.split('\\n');
                                        } else {
                                            return null;
                                        }
                                    },
                                    label: function (tooltipItem, chart) {
                                        let barItem = getBarItemObj(tooltipItem.index, data, jsonData, globalColor, globalValueTextColor);

                                        if (barItem && barItem.tooltipText) {
                                            return barItem.tooltipText.split('\\n');
                                        } else if (tooltipItem && tooltipItem.value) {
                                            return `${chart.datasets[0].label}: ${myMdwHelper.formatNumber(tooltipItem.value, data.tooltipValueMinDecimals, data.tooltipValueMaxDecimals)}${myChartHelper.getValueFromData(data.tooltipBodyAppend, '')}`
                                                .split('\\n');
                                        }
                                        return null;
                                    }
                                }
                            },
                            plugins: {
                                datalabels: {
                                    display: myChartHelper.getValueFromData(data.showValues, 'showValuesOn') === 'showValuesOn' ? true : data.showValues === 'showValuesOff' ? false : 'auto',
                                    anchor: data.valuesPositionAnchor,
                                    align: data.valuesPositionAlign,
                                    clamp: true,
                                    offset: myChartHelper.getNumberFromData(data.valuesPositionOffset, 0),
                                    rotation: myChartHelper.getNumberFromData(data.valuesRotation, undefined),
                                    formatter: function (value, context) {
                                        if ((value || value === 0) && context.dataIndex % myChartHelper.getNumberFromData(data.valuesSteps, 1) === 0) {
                                            let barItem = getBarItemObj(context.dataIndex, data, jsonData, globalColor, globalValueTextColor, value);
                                            return `${barItem.valueText}${barItem.valueAppendix}`.split('\\n');
                                        }
                                        return null;
                                    },
                                    font: {
                                        family: myChartHelper.getValueFromData(data.valuesFontFamily, undefined),
                                        size: myChartHelper.getNumberFromData(data.valuesFontSize, undefined),
                                    },
                                    color: valueTextColorArray,
                                    textAlign: data.valuesTextAlign
                                }
                            }
                        };



                        if (data.disableHoverEffects) options.hover = { mode: null };

                        // Chart declaration:
                        if (myBarChart) myBarChart.destroy();

                        myBarChart = new Chart(ctx, {
                            type: (data.chartType === 'vertical') ? 'bar' : 'horizontalBar',
                            data: chartData,
                            options: options,
                            plugins: [ChartDataLabels, myChartHelper.myDistanceLegendPlugin(data)]
                        });

                        myBarChart.update();

                        console.warn(JSON.stringify(options));

                        function onChange(e, newVal, oldVal) {
                            // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                            try {
                                if (data.chartDataMethod === 'inputPerEditor') {
                                    let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                                    for (var d = 0; d <= data.dataCount; d++) {
                                        if (oidId === data.attr('oid' + d)) {
                                            let index = d;
                                            myBarChart.data.datasets[0].data[index] = newVal;
                                            myBarChart.update();
                                        }
                                    }
                                } else {
                                    let jsonData = undefined;

                                    try {
                                        jsonData = JSON.parse(newVal);
                                    } catch (errJson) {
                                        myBarChart.options.title = {
                                            display: true,
                                            text: `${_("Error in JSON string")}<br>${errJson.message}`.split('<br>'),
                                            fontColor: 'red'
                                        };
                                        myBarChart.update();

                                        console.error(`[Bar Chart - ${data.wid}] onChange: cannot parse json string! Error: ${errJson.message}`);
                                    }

                                    if (jsonData && jsonData.length > 0) {
                                        // first remove old data, because count of items could changed
                                        myBarChart.data.datasets[0].data = [];
                                        myBarChart.data.datasets[0].backgroundColor = [];
                                        myBarChart.data.labels = [];
                                        myBarChart.data.datasets[0].hoverBackgroundColor = [];
                                        myBarChart.options.plugins.datalabels.color = [];

                                        for (var d = 0; d <= jsonData.length - 1; d++) {
                                            if (colorScheme !== null) {
                                                globalColor = colorScheme[d];
                                            }

                                            let barItem = getBarItemObj(d, data, jsonData, globalColor, globalValueTextColor);

                                            if (barItem) {
                                                myBarChart.data.datasets[0].data[d] = barItem.value;
                                                myBarChart.data.datasets[0].backgroundColor[d] = barItem.dataColor;
                                                myBarChart.data.labels[d] = barItem.label;

                                                if (myChartHelper.getValueFromData(data.hoverColor, null) === null) {
                                                    myBarChart.data.datasets[0].hoverBackgroundColor[d] = myChartHelper.addOpacityToColor(barItem.dataColor, 80);
                                                } else {
                                                    myBarChart.data.datasets[0].hoverBackgroundColor[d] = data.hoverColor;
                                                }

                                                myBarChart.options.plugins.datalabels.color[d] = barItem.valueColor;

                                                myBarChart.options.plugins.datalabels.formatter = function (value, context) {
                                                    if (value) {
                                                        let barItem = getBarItemObj(context.dataIndex, data, jsonData, globalColor, globalValueTextColor, value);
                                                        if (barItem) {
                                                            return `${barItem.valueText}${barItem.valueAppendix}`.split('\\n');
                                                        }
                                                    }
                                                    return '';
                                                }
                                            }
                                        }
                                        myBarChart.update();
                                    }
                                }
                            } catch (err) {
                                myBarChart.options.title = {
                                    display: true,
                                    text: `onChange: error: ${err.message}, stack: ${err.message}`,
                                    fontColor: 'red'
                                };
                                myBarChart.update();

                                console.error(`[Bar Chart - ${data.wid}] onChange: error: ${err.message}, stack: ${err.message}`);
                            }
                        }

                        function getBarItemObj(i, data, jsonData, globalColor, globalValueTextColor, value = 0) {
                            if (data.chartDataMethod === 'inputPerEditor') {
                                return {
                                    label: myChartHelper.getValueFromData(data.attr('label' + i), ''),
                                    value: vis.states.attr(data.attr('oid' + i) + '.val'),
                                    dataColor: myChartHelper.getValueFromData(data.attr('dataColor' + i), globalColor),
                                    valueText: myChartHelper.getValueFromData(data.attr('valueText' + i), `${myMdwHelper.formatNumber(parseFloat(value), data.valuesMinDecimals, data.valuesMaxDecimals)}${myChartHelper.getValueFromData(data.valuesAppendText, '')}`),
                                    valueColor: myChartHelper.getValueFromData(data.attr('valueTextColor' + i), globalValueTextColor),
                                    valueAppendix: myChartHelper.getValueFromData(data.attr('labelValueAppend' + i), ''),
                                    tooltipTitle: myChartHelper.getValueFromData(data.attr('tooltipTitle' + i), undefined),
                                    tooltipText: myChartHelper.getValueFromData(data.attr('tooltipText' + i), undefined),
                                }
                            } else {
                                if (jsonData && jsonData[i]) {
                                    return {
                                        label: myChartHelper.getValueFromData(jsonData[i].label, ''),
                                        value: jsonData[i].value,
                                        dataColor: myChartHelper.getValueFromData(jsonData[i].dataColor, globalColor),
                                        valueText: myChartHelper.getValueFromData(jsonData[i].valueText, `${myMdwHelper.formatNumber(parseFloat(value), data.valuesMinDecimals, data.valuesMaxDecimals)}${myChartHelper.getValueFromData(data.valuesAppendText, '')}`),
                                        valueColor: myChartHelper.getValueFromData(jsonData[i].valueColor, globalValueTextColor),
                                        valueAppendix: myChartHelper.getValueFromData(jsonData[i].valueAppendix, ''),
                                        tooltipTitle: myChartHelper.getValueFromData(jsonData[i].tooltipTitle, undefined),
                                        tooltipText: myChartHelper.getValueFromData(jsonData[i].tooltipText, undefined),
                                    }
                                } else {
                                    return undefined;
                                }
                            }
                        }
                    }
                }
            }, 0, data.debug);
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
}