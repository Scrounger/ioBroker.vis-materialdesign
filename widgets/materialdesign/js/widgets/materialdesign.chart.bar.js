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

            setTimeout(function () {
                var myBarChart;
                let myChartHelper = vis.binds.materialdesign.chart.helper;
                myChartHelper.registerChartAreaPlugin();

                if (myMdwHelper.getBooleanFromData(data.cardUse, false)) {
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

                    $this.find('.materialdesign-chart-container').css('background-color', myMdwHelper.getValueFromData(data.backgroundColor, ''));
                    let globalColor = myMdwHelper.getValueFromData(data.globalColor, '#44739e');

                    let colorScheme = myMdwHelper.getValueFromData(data.colorScheme, null);
                    if (colorScheme !== null) {
                        colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                    }

                    if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                        var ctx = chartContainer.getContext('2d');

                        // Global Options:
                        Chart.defaults.global.defaultFontColor = '#44739e';
                        Chart.defaults.global.defaultFontSize = 15;
                        Chart.defaults.global.animation.duration = myMdwHelper.getNumberFromData(data.animationDuration, 1000);

                        Chart.plugins.unregister(ChartDataLabels);

                        let dataArray = []
                        let labelArray = [];
                        let dataColorArray = [];
                        let hoverDataColorArray = [];
                        let globalValueTextColor = myMdwHelper.getValueFromData(data.valuesFontColor, 'black')
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

                            if (myMdwHelper.getValueFromData(data.hoverColor, null) === null) {
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
                                        label: myMdwHelper.getValueFromData(data.barLabelText, ''),
                                        categoryPercentage: myMdwHelper.getNumberFromData(data.barWidth, 80) / 100,
                                        barPercentage: myMdwHelper.getNumberFromData(data.barWidth, 80) / 100,
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
                                backgroundColor: myMdwHelper.getValueFromData(data.chartAreaBackgroundColor, ''),
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
                                            return `${chart.datasets[0].label}: ${myMdwHelper.formatNumber(tooltipItem.value, data.tooltipValueMinDecimals, data.tooltipValueMaxDecimals)}${myMdwHelper.getValueFromData(data.tooltipBodyAppend, '')}`
                                                .split('\\n');
                                        }
                                        return null;
                                    }
                                }
                            },
                            plugins: {
                                datalabels: {
                                    display: myMdwHelper.getValueFromData(data.showValues, 'showValuesOn') === 'showValuesOn' ? true : data.showValues === 'showValuesOff' ? false : 'auto',
                                    anchor: data.valuesPositionAnchor,
                                    align: data.valuesPositionAlign,
                                    clamp: true,
                                    offset: myMdwHelper.getNumberFromData(data.valuesPositionOffset, 0),
                                    rotation: myMdwHelper.getNumberFromData(data.valuesRotation, undefined),
                                    formatter: function (value, context) {
                                        if ((value || value === 0) && context.dataIndex % myMdwHelper.getNumberFromData(data.valuesSteps, 1) === 0) {
                                            let barItem = getBarItemObj(context.dataIndex, data, jsonData, globalColor, globalValueTextColor, value);
                                            return `${barItem.valueText}${barItem.valueAppendix}`.split('\\n');
                                        }
                                        return null;
                                    },
                                    font: {
                                        family: myMdwHelper.getValueFromData(data.valuesFontFamily, undefined),
                                        size: myMdwHelper.getNumberFromData(data.valuesFontSize, undefined),
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

                                                if (myMdwHelper.getValueFromData(data.hoverColor, null) === null) {
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
                                    label: myMdwHelper.getValueFromData(data.attr('label' + i), ''),
                                    value: vis.states.attr(data.attr('oid' + i) + '.val'),
                                    dataColor: myMdwHelper.getValueFromData(data.attr('dataColor' + i), globalColor),
                                    valueText: myMdwHelper.getValueFromData(data.attr('valueText' + i), `${myMdwHelper.formatNumber(parseFloat(value), data.valuesMinDecimals, data.valuesMaxDecimals)}${myMdwHelper.getValueFromData(data.valuesAppendText, '')}`),
                                    valueColor: myMdwHelper.getValueFromData(data.attr('valueTextColor' + i), globalValueTextColor),
                                    valueAppendix: myMdwHelper.getValueFromData(data.attr('labelValueAppend' + i), ''),
                                    tooltipTitle: myMdwHelper.getValueFromData(data.attr('tooltipTitle' + i), undefined),
                                    tooltipText: myMdwHelper.getValueFromData(data.attr('tooltipText' + i), undefined),
                                }
                            } else {
                                if (jsonData && jsonData[i]) {
                                    return {
                                        label: myMdwHelper.getValueFromData(jsonData[i].label, ''),
                                        value: jsonData[i].value,
                                        dataColor: myMdwHelper.getValueFromData(jsonData[i].dataColor, globalColor),
                                        valueText: myMdwHelper.getValueFromData(jsonData[i].valueText, `${myMdwHelper.formatNumber(parseFloat(value), data.valuesMinDecimals, data.valuesMaxDecimals)}${myMdwHelper.getValueFromData(data.valuesAppendText, '')}`),
                                        valueColor: myMdwHelper.getValueFromData(jsonData[i].valueColor, globalValueTextColor),
                                        valueAppendix: myMdwHelper.getValueFromData(jsonData[i].valueAppendix, ''),
                                        tooltipTitle: myMdwHelper.getValueFromData(jsonData[i].tooltipTitle, undefined),
                                        tooltipText: myMdwHelper.getValueFromData(jsonData[i].tooltipText, undefined),
                                    }
                                } else {
                                    return undefined;
                                }
                            }
                        }
                    }
                }
            }, 1);
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
}