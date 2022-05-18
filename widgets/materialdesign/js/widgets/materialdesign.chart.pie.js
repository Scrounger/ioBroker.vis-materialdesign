/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.chart.pie = function (el, data) {
    let widgetName = 'Pie Chart';

    try {
        let $this = $(el);

        myMdwHelper.subscribeThemesAtRuntime(data, widgetName)

        myMdwHelper.waitForCssVariable(function () {
            let myPieChart;
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
                myMdwHelper.waitForCssVariable(function () {
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
                }, 0, data.debug);
            }

            createChart();

            function createChart() {
                var chartContainer = $(el).find('.materialdesign-chart-container').get(0);

                $(el).find('.materialdesign-chart-container').css('background-color', myChartHelper.getValueFromData(data.backgroundColor, ''));
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

                    // Chart declaration:
                    if (myPieChart) myPieChart.destroy();
                    myPieChart = new Chart(ctx, {
                        type: (data.chartType === 'pie') ? 'pie' : 'doughnut',
                        plugins: (data.showValues) ? [ChartDataLabels, myChartHelper.myDistanceLegendPlugin(data)] : [myChartHelper.myDistanceLegendPlugin(data)]     // show value labels
                    });

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
                        } catch (jsonError) {
                            myPieChart.options.title = {
                                display: true,
                                text: `${_("Error in JSON string")}<br>${jsonError.message}`.split('<br>'),
                                fontColor: 'red'
                            };
                            myPieChart.update();

                            console.error(`[Pie Chart - ${data.wid}] cannot parse json string! Error: ${jsonError.message}`);
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

                        let pieItem = getPieItemObj(i, data, jsonData, globalColor, globalValueTextColor);

                        dataArray.push(pieItem.value);
                        labelArray.push(pieItem.label);

                        dataColorArray.push(pieItem.dataColor);

                        if (myChartHelper.getValueFromData(data.hoverColor, null) === null) {
                            hoverDataColorArray.push(myChartHelper.addOpacityToColor(pieItem.dataColor, 80))
                        } else {
                            hoverDataColorArray.push(data.hoverColor)
                        }

                        valueTextColorArray.push(pieItem.valueColor);

                        vis.states.bind(data.attr('oid' + i) + '.val', onChange);
                    }

                    // Data with datasets options
                    var chartData = {
                        labels: labelArray,
                        datasets: [
                            Object.assign(myChartHelper.getDataset(dataArray, dataColorArray, hoverDataColorArray, data.borderColor, data.hoverBorderColor, data.borderWidth, data.hoverBorderWidth),
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
                        layout: myChartHelper.getLayout(data),
                        legend: myChartHelper.getLegend(data),
                        onResize: function (chart, size) {
                            // reRender after orientation change
                            let parentViewId = $(el).parent().attr('id');

                            if (!vis.editMode) {
                                if (parentViewId.includes('visview_')) {
                                    parentViewId = parentViewId.replace('visview_', '')
                                    vis.reRenderWidget(parentViewId, parentViewId, data.wid);
                                } else {
                                    console.error(`[Pie Chart - ${data.wid}] parent view not contains 'visview_'`);
                                    console.error($(el).parent());
                                }
                            }
                        },
                        cutoutPercentage: (data.chartType === 'doughnut') ? myChartHelper.getNumberFromData(data.doughnutCutOut, 50) : 0,
                        chartArea: {
                            backgroundColor: myChartHelper.getValueFromData(data.chartAreaBackgroundColor, ''),
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
                                    let pieItem = getPieItemObj(tooltipItem[0].index, data, jsonData, globalColor, globalValueTextColor);

                                    if (pieItem && pieItem.tooltipTitle) {
                                        return pieItem.tooltipTitle.split('\\n');
                                    } else {
                                        return null;
                                    }
                                },
                                label: function (tooltipItem, chart) {
                                    let pieItem = getPieItemObj(tooltipItem.index, data, jsonData, globalColor, globalValueTextColor);

                                    if (pieItem && pieItem.tooltipText) {
                                        return pieItem.tooltipText.split('\\n');
                                    } else if (tooltipItem) {
                                        return `${labelArray[tooltipItem.index]}: ${myMdwHelper.formatNumber(chart.datasets[0].data[tooltipItem.index], data.tooltipValueMinDecimals, data.tooltipValueMaxDecimals)}${myChartHelper.getValueFromData(data.tooltipBodyAppend, '')}`
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
                                        let pieItem = getPieItemObj(context.dataIndex, data, jsonData, globalColor, globalValueTextColor, value);

                                        return `${pieItem.valueText}${pieItem.valueAppendix}`.split('\\n');
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
                    if (myPieChart) myPieChart.destroy();
                    myPieChart = new Chart(ctx, {
                        type: (data.chartType === 'pie') ? 'pie' : 'doughnut',
                        data: chartData,
                        options: options,
                        plugins: [ChartDataLabels, myChartHelper.myDistanceLegendPlugin(data)]
                    });

                    myPieChart.update(options);

                    function onChange(e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen, um index zu erhalten
                        try {
                            myMdwHelper.waitForCssVariable(function () {
                                if (data.chartDataMethod === 'inputPerEditor') {
                                    let oidId = e.type.substr(0, e.type.lastIndexOf("."));

                                    for (var d = 0; d <= data.dataCount; d++) {
                                        if (oidId === data.attr('oid' + d)) {
                                            let index = d;
                                            myPieChart.data.datasets[0].data[index] = newVal;
                                            myPieChart.update();
                                        }
                                    }
                                } else {
                                    let jsonData = undefined;

                                    try {
                                        jsonData = JSON.parse(newVal);
                                    } catch (errJson) {
                                        myPieChart.options.title = {
                                            display: true,
                                            text: `${_("Error in JSON string")}<br>${errJson.message}`.split('<br>'),
                                            fontColor: 'red'
                                        };
                                        myPieChart.update();

                                        console.error(`[Pie Chart - ${data.wid}] onChange: cannot parse json string! Error: ${errJson.message}`);
                                    }

                                    if (jsonData && jsonData.length > 0) {
                                        myPieChart.data.datasets[0].data = [];
                                        myPieChart.data.datasets[0].backgroundColor = [];
                                        myPieChart.data.labels = [];
                                        myPieChart.data.datasets[0].hoverBackgroundColor = [];
                                        myPieChart.options.plugins.datalabels.color = [];

                                        for (var d = 0; d <= jsonData.length - 1; d++) {
                                            if (colorScheme !== null) {
                                                globalColor = colorScheme[d];
                                            }

                                            let pieItem = getPieItemObj(d, data, jsonData, globalColor, globalValueTextColor);

                                            if (pieItem) {
                                                myPieChart.data.datasets[0].data[d] = pieItem.value;
                                                myPieChart.data.datasets[0].backgroundColor[d] = pieItem.dataColor;
                                                myPieChart.data.labels[d] = pieItem.label;

                                                if (myChartHelper.getValueFromData(data.hoverColor, null) === null) {
                                                    myPieChart.data.datasets[0].hoverBackgroundColor[d] = myChartHelper.addOpacityToColor(pieItem.dataColor, 80);
                                                } else {
                                                    myPieChart.data.datasets[0].hoverBackgroundColor[d] = data.hoverColor;
                                                }

                                                myPieChart.options.plugins.datalabels.color[d] = pieItem.valueColor;

                                                myPieChart.options.plugins.datalabels.formatter = function (value, context) {
                                                    if (value) {
                                                        let pieItem = getPieItemObj(context.dataIndex, data, jsonData, globalColor, globalValueTextColor, value);
                                                        if (pieItem) {
                                                            return `${pieItem.valueText}${pieItem.valueAppendix}`.split('\\n');
                                                        }
                                                    }
                                                    return '';
                                                }
                                            }
                                        }
                                        myPieChart.update();
                                    }
                                }
                            }, 0, data.debug);
                        } catch (err) {
                            myPieChart.options.title = {
                                display: true,
                                text: `onChange: error: ${err.message}, stack: ${err.message}`,
                                fontColor: 'red'
                            };
                            myPieChart.update();

                            console.error(`[Pie Chart - ${data.wid}] onChange: error: ${err.message}, stack: ${err.message}`);
                        }
                    };

                    function getPieItemObj(i, data, jsonData, globalColor, globalValueTextColor, value = 0) {
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