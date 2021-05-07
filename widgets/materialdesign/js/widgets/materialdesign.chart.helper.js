/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.chart.helper = {
    // TODO: chromaJS verwenden
    addOpacityToColor: function (color, opacity) {
        return chroma(color).alpha(opacity / 100).hex();
    },
    get_Y_AxisObject: function (chartType, yAxisPosition, yAxisTitle, yAxisTitleColor, yAxisTitleFontFamily, yAxisTitleFontSize, yAxisShowAxisLabels, axisValueMin,
        axisValueMax, axisValueStepSize, axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, yAxisValueLabelColor, yAxisValueFontFamily, yAxisValueFontSize,
        yAxisValueDistanceToAxis, yAxisGridLinesColor, yAxisGridLinesWitdh, yAxisShowAxis, yAxisShowGridLines, yAxisShowTicks, yAxisTickLength, yAxisZeroLineWidth, yAxisZeroLineColor, axisValueMinDigits, axisValueMaxDigits) {
        return {
            position: yAxisPosition,
            scaleLabel: {       // y-Axis title
                display: (myMdwHelper.getValueFromData(yAxisTitle, null) !== null),
                labelString: myMdwHelper.getValueFromData(yAxisTitle, ''),
                fontColor: myMdwHelper.getValueFromData(yAxisTitleColor, undefined),
                fontFamily: myMdwHelper.getValueFromData(yAxisTitleFontFamily, undefined),
                fontSize: myMdwHelper.getNumberFromData(yAxisTitleFontSize, undefined)
            },
            ticks: {        // y-Axis values
                display: yAxisShowAxisLabels,
                min: myMdwHelper.getNumberFromData(axisValueMin, undefined),                       // only for chartType: vertical
                max: myMdwHelper.getNumberFromData(axisValueMax, undefined),                       // only for chartType: vertical
                stepSize: myMdwHelper.getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'horizontal' && (myMdwHelper.getNumberFromData(axisMaxLabel, undefined) > 0) || myMdwHelper.getBooleanFromData(axisLabelAutoSkip, false)),
                maxTicksLimit: (chartType === 'horizontal') ? myMdwHelper.getNumberFromData(axisMaxLabel, undefined) : undefined,
                callback: function (value, index, values) {
                    try {
                        if (isNaN(value)) {
                            return `${value}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');;
                        } else {
                            if (axisValueMinDigits || axisValueMaxDigits) {
                                return `${myMdwHelper.formatNumber(value, axisValueMinDigits, axisValueMaxDigits)}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            } else {
                                return `${value}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            }
                        }
                    } catch (ex) {
                        console.error(`[chart helper] [ticks callback] error: ${ex.message}, stack: ${ex.stack}`);
                    }
                },
                fontColor: myMdwHelper.getValueFromData(yAxisValueLabelColor, undefined),
                fontFamily: myMdwHelper.getValueFromData(yAxisValueFontFamily, undefined),
                fontSize: myMdwHelper.getNumberFromData(yAxisValueFontSize, undefined),
                padding: myMdwHelper.getNumberFromData(yAxisValueDistanceToAxis, 0),
            },
            gridLines: {
                display: true,
                color: myMdwHelper.getValueFromData(yAxisGridLinesColor, 'black'),
                lineWidth: myMdwHelper.getNumberFromData(yAxisGridLinesWitdh, 0.1),
                drawBorder: yAxisShowAxis,
                drawOnChartArea: yAxisShowGridLines,
                drawTicks: yAxisShowTicks,
                tickMarkLength: myMdwHelper.getNumberFromData(yAxisTickLength, 5),
                zeroLineWidth: myMdwHelper.getNumberFromData(yAxisZeroLineWidth, 1),
                zeroLineColor: myMdwHelper.getValueFromData(yAxisZeroLineColor, 'rgba(0, 0, 0, 0.25)'),
            }
        }
    },
    get_X_AxisObject: function (chartType, xAxisPosition, xAxisTitle, xAxisTitleColor, xAxisTitleFontFamily, xAxisTitleFontSize, xAxisShowAxisLabels, axisValueMin, axisValueMax, axisValueStepSize,
        axisMaxLabel, axisLabelAutoSkip, axisValueAppendText, xAxisValueLabelColor, xAxisValueFontFamily, xAxisValueFontSize, xAxisValueDistanceToAxis, xAxisGridLinesColor, xAxisGridLinesWitdh,
        xAxisShowAxis, xAxisShowGridLines, xAxisShowTicks, xAxisTickLength, xAxisZeroLineWidth, xAxisZeroLineColor, xAxisOffsetGridLines, axisValueMinDigits, axisValueMaxDigits, minRotation, maxRotation, isTimeAxis, xAxisOffset, xAxisTicksSource, displayFormats, useTodayYesterday, autoSkipPadding) {

        let result = {
            beforeCalculateTickRotation: function (axis) {
                if (isTimeAxis && useTodayYesterday) {
                    for (const scaleId in axis.chart.scales) {
                        if (!scaleId.includes('yAxis')) {
                            if (axis._ticks) {
                                let unit = axis._unit;

                                for (const tick in axis._ticks) {
                                    let date = moment(axis._ticks[tick].value);

                                    if (date.isSame(moment(), 'day')) {
                                        axis._ticks[tick].label = date.format(displayFormats[unit].replace('dddd', `[${_('Today')}]`).replace('ddd', `[${_('Today')}]`).replace('dd', `[${_('Today')}]`)).split('\\n');
                                    } else if (date.isSame(moment().subtract(1, 'day'), 'day')) {
                                        axis._ticks[tick].label = date.format(displayFormats[unit].replace('dddd', `[${_('Yesterday')}]`).replace('ddd', `[${_('Yesterday')}]`).replace('dd', `[${_('Yesterday')}]`)).split('\\n');
                                    }
                                }
                            }
                        }
                    }
                }
            },
            position: xAxisPosition,
            scaleLabel: {       // x-Axis title
                display: (myMdwHelper.getValueFromData(xAxisTitle, null) !== null),
                labelString: myMdwHelper.getValueFromData(xAxisTitle, ''),
                fontColor: myMdwHelper.getValueFromData(xAxisTitleColor, undefined),
                fontFamily: myMdwHelper.getValueFromData(xAxisTitleFontFamily, undefined),
                fontSize: myMdwHelper.getNumberFromData(xAxisTitleFontSize, undefined)
            },
            ticks: {        // x-Axis values
                display: xAxisShowAxisLabels,
                min: myMdwHelper.getNumberFromData(axisValueMin, undefined),                       // only for chartType: horizontal
                max: myMdwHelper.getNumberFromData(axisValueMax, undefined),                       // only for chartType: horizontal
                stepSize: myMdwHelper.getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'vertical' && (myMdwHelper.getNumberFromData(axisMaxLabel, undefined) > 0) || myMdwHelper.getBooleanFromData(axisLabelAutoSkip, false)),
                autoSkipPadding: myMdwHelper.getNumberFromData(autoSkipPadding, 10),
                minRotation: parseInt(myMdwHelper.getNumberFromData(minRotation, 0)),
                maxRotation: parseInt(myMdwHelper.getNumberFromData(maxRotation, 0)),
                maxTicksLimit: (chartType === 'vertical') ? myMdwHelper.getNumberFromData(axisMaxLabel, undefined) : undefined || myMdwHelper.getNumberFromData(axisMaxLabel, undefined),
                callback: function (value, index, values) {
                    if (isTimeAxis) {
                        return value.split('\\n');
                    } else {
                        if (isNaN(value)) {
                            return `${value}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');;
                        } else {
                            if (axisValueMinDigits || axisValueMaxDigits) {
                                return `${myMdwHelper.formatNumber(value, axisValueMinDigits, axisValueMaxDigits)}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            } else {
                                return `${value}${myMdwHelper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            }
                        }
                    }
                },
                fontColor: myMdwHelper.getValueFromData(xAxisValueLabelColor, undefined),
                fontFamily: myMdwHelper.getValueFromData(xAxisValueFontFamily, undefined),
                fontSize: myMdwHelper.getNumberFromData(xAxisValueFontSize, undefined),
                padding: myMdwHelper.getNumberFromData(xAxisValueDistanceToAxis, 0),
                source: myMdwHelper.getValueFromData(xAxisTicksSource, 'auto')
            },
            gridLines: {
                display: true,
                color: myMdwHelper.getValueFromData(xAxisGridLinesColor, 'black'),
                lineWidth: myMdwHelper.getNumberFromData(xAxisGridLinesWitdh, 0.1),
                drawBorder: xAxisShowAxis,
                drawOnChartArea: xAxisShowGridLines,
                drawTicks: xAxisShowTicks,
                tickMarkLength: myMdwHelper.getNumberFromData(xAxisTickLength, 5),
                zeroLineWidth: myMdwHelper.getNumberFromData(xAxisZeroLineWidth, 0.1),
                zeroLineColor: myMdwHelper.getValueFromData(xAxisZeroLineColor, 'black'),
                offsetGridLines: myMdwHelper.getBooleanFromData(xAxisOffsetGridLines, false),
            }
        }

        if (xAxisOffset) {
            result.offset = true;
        }

        return result;
    },
    getDataset: function (dataArray, dataColorArray, hoverDataColorArray, borderColor, hoverBorderColor, borderWidth, hoverBorderWidth) {
        return {
            data: dataArray,

            backgroundColor: dataColorArray,
            hoverBackgroundColor: hoverDataColorArray,

            borderColor: myMdwHelper.getValueFromData(borderColor, 'white'),
            hoverBorderColor: myMdwHelper.getValueFromData(hoverBorderColor, undefined),

            borderWidth: myMdwHelper.getNumberFromData(borderWidth, undefined),
            hoverBorderWidth: myMdwHelper.getNumberFromData(hoverBorderWidth, undefined),
        }
    },
    getLegend: function (data) {
        return {
            display: data.showLegend,
            position: data.legendPosition,
            labels: {
                fontColor: myMdwHelper.getValueFromData(data.legendFontColor, undefined),
                fontFamily: myMdwHelper.getValueFromData(data.legendFontFamily, undefined),
                fontSize: myMdwHelper.getNumberFromData(data.legendFontSize, undefined),
                boxWidth: myMdwHelper.getNumberFromData(data.legendBoxWidth, 10),
                usePointStyle: data.legendPointStyle,
                padding: myMdwHelper.getNumberFromData(data.legendPadding, 10),

                filter: function (item, chart) {
                    // Logic to remove a particular legend item goes here
                    if (item && item.text) {

                        if (item.fillStyle === 'transparent') {
                            item.fillStyle = chart.datasets[item.datasetIndex].borderColor;
                        }

                        return item;
                    }
                }
            }
        }
    },
    getLegendClickEvent: function (myYAxis) {
        return {
            // custom to hide / show also yAxis if data de-/selected
            onClick: function (event, legendItem) {
                var index = legendItem.datasetIndex;
                var ci = this.chart;
                var meta = ci.getDatasetMeta(index);

                // See controller.isDatasetVisible comment
                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;

                // ci.options.scales.yAxes[ci.data.datasets[index].yAxisID.replace('yAxis_id_', '')].display = checkAnyDataIsVisible();
                let visibility = checkAnyDataIsVisible();
                for (var i = 0; i <= ci.options.scales.yAxes.length - 1; i++) {
                    if (ci.options.scales.yAxes[i].id === ci.data.datasets[index].yAxisID && myYAxis[index].display) {
                        ci.options.scales.yAxes[i].display = visibility;
                    }
                }
                ci.update();

                function checkAnyDataIsVisible() {
                    let result = null;
                    for (var i = 0; i <= ci.data.datasets.length - 1; i++) {
                        // Schauen ob yAxis gemeinsam genutzt wird und Daten angezeigt werden -> nur ausblenden wenn alle Daten die gemeinsame Achsen nicht sichtbar sind
                        if (ci.data.datasets[i].yAxisID === ci.data.datasets[index].yAxisID) {
                            result = (ci.getDatasetMeta(i).hidden === null) ? true : false;

                            if (result) {
                                return result;
                            }
                        }
                    }
                    return result;
                }
            }
        }
    },
    getLayout: function (data) {
        return {
            padding: {
                top: myMdwHelper.getValueFromData(data.chartPaddingTop, 0),
                left: myMdwHelper.getValueFromData(data.chartPaddingLeft, 0),
                right: myMdwHelper.getValueFromData(data.chartPaddingRight, 0),
                bottom: myMdwHelper.getValueFromData(data.chartPaddingBottom, 0)
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
                "day":            "ddd DD.",
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
    getTaskForHistoryData: function (index, data, dataRangeStartTime, debug = false) {
        return new Promise((resolve, reject) => {
            try {
                let id = data.attr('oid' + index);
                let historyOptions = {
                    instance: data.historyAdapterInstance,
                    count: parseInt(myMdwHelper.getNumberFromData(data.attr('maxDataPoints' + index), (data.attr('aggregate' + index) === 'minmax') ? 50 : 100)),
                    step: (myMdwHelper.getNumberFromData(data.attr('minTimeInterval' + index), undefined)) ? parseInt(data.attr('minTimeInterval' + index)) * 1000 : undefined,
                    aggregate: data.attr('aggregate' + index) || 'minmax',
                    start: dataRangeStartTime,
                    end: new Date().getTime(),
                    timeout: parseInt(myMdwHelper.getNumberFromData(data.chartTimeout, 2)) * 1000
                }

                if (debug) console.log(`[getTaskForHistoryData ${data.wid}] history options for '${id}': ${JSON.stringify(historyOptions)}`);

                vis.getHistory(id, historyOptions, function (err, result) {
                    if (!err && result) {
                        if (debug) console.log(`[getTaskForHistoryData ${data.wid}] history data result '${id}' length: ${result.length}`);
                        if (debug) console.log(`[getTaskForHistoryData ${data.wid}] history data result '${id}': ${JSON.stringify(result)}`);
                        resolve({ id: id, data: result, error: undefined });
                    } else {
                        if (debug) console.error(`[getTaskForHistoryData - ${data.wid}] result error: ${err}`);
                        resolve({ id: id, data: null, error: err });
                    }
                });
            } catch (ex) {
                console.error(`[getTaskForHistoryData - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
                resolve({ id: id, data: null, error: ex.message });
            }
        });
    },
    getPreparedData: function (result, data, index, debug = false) {
        let dataArray = [];
        try {
            if (result.data) {
                if (debug) console.log(`[getPreparedData ${data.wid}] prepare data for '${result.id}' length: ${result.data.length}`);
                dataArray = result.data.map(elm => ({
                    t: (elm.ts !== null && elm.ts !== undefined) ? elm.ts : null,
                    y: (elm.val !== null && elm.val !== undefined) ? elm.val * myMdwHelper.getNumberFromData(data.attr('multiply' + index), 1) : null
                }));
            }
        } catch (ex) {
            console.error(`[getPreparedData - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }

        return dataArray;
    },
    registerChartAreaPlugin: function () {
        Chart.pluginService.register({
            beforeDraw: function (chart, easing) {
                if (chart.config.options.chartArea && chart.config.options.chartArea.backgroundColor) {
                    var ctx = chart.chart.ctx;
                    var chartArea = chart.chartArea;

                    if (chartArea) {
                        ctx.save();
                        ctx.fillStyle = chart.config.options.chartArea.backgroundColor;
                        ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartArea.bottom - chartArea.top);
                        ctx.restore();
                    }
                }
            }
        });
    },
    getMyGradientPlugin(data) {
        const pluginId = "myGradientColors";

        const regenerateGradient = (chart, pluginOpts) => {
            try {
                if (chart && chart.chartArea) {
                    if (chart.chartArea.bottom && !isNaN(chart.chartArea.bottom) && chart.chartArea.top && !isNaN(chart.chartArea.top)) {

                        for (var i = 0; i <= chart.data.datasets.length - 1; i++) {
                            let graph = chart.data.datasets[i];

                            // Line / Bar Color
                            if (graph[pluginId] && graph[pluginId].useGradientColor) {
                                if (graph[pluginId].gradientColors && graph[pluginId].gradientColors.length > 0) {
                                    let gradientLine = getGradient(chart, graph, graph[pluginId].gradientColors);

                                    if (graph.type === 'line') {
                                        graph.borderColor = gradientLine;
                                    } else if (graph.type === 'bar') {
                                        graph.backgroundColor = gradientLine;
                                    }
                                }
                            } else {
                                // zurück auf graph color
                                graph.borderColor = graph[pluginId].gradientColors;
                            }

                            // FillColor for Line
                            if (graph.type === 'line') {
                                if (graph[pluginId] && graph[pluginId].useGradientFillColor) {
                                    if (graph[pluginId].gradientFillColors && graph[pluginId].gradientFillColors.length > 0) {
                                        let gradientFill = getGradient(chart, graph, graph[pluginId].gradientFillColors);

                                        graph.backgroundColor = gradientFill;
                                    }
                                } else {
                                    graph.backgroundColor = graph[pluginId].gradientFillColors;
                                }
                            }

                            function getGradient(chart, graph, gradientColors) {
                                const scale = chart.scales[graph.yAxisID];
                                let gradient = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);

                                if (gradientColors && Array.isArray(gradientColors) && gradientColors.length > 0) {
                                    gradientColors.forEach(item => {
                                        const pixel = scale.getPixelForValue(item.value);
                                        const stop = Math.max(scale.getDecimalForPixel(pixel), 0);

                                        if (stop <= 1) {
                                            // This if can fail if the levels are outside the scale bounds.
                                            gradient.addColorStop(stop, chroma(item.color).css());
                                        }
                                    });
                                } else {
                                    console.warn(`[regenerateGradient - ${data.wid}] gradient color definition is not correct -> check documentation!`);
                                }

                                return gradient
                            }
                        }
                    }
                } else {
                    console.warn(`[regenerateGradient - ${data.wid}] chartarea is not defined!`);
                }
            } catch (ex) {
                console.error(`[regenerateGradient - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
            }
        }

        return {
            id: pluginId,
            beforeDatasetsUpdate: regenerateGradient,
            resize: (chart, newSize, opts) => regenerateGradient(chart, opts),
        }
    },
    myDistanceLegendPlugin(data) {
        const pluginId = "myDistanceLegendPlugin";

        return {
            id: 'myDistanceLegendPlugin',
            beforeInit: function (chart, options) {
                chart.legend.afterFit = function () {
                    this.height = this.height + myMdwHelper.getNumberFromData(data.legendDistanceToChart, 0);
                };
            }
        }
    },
    getCardBackground(data) {
        let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
        let showTitleSection = 'display: none;';
        if (myMdwHelper.getValueFromData(data.title, null) != null) {
            showTitleSection = '';
        }

        return `<div class="materialdesign-html-card mdc-card" style="margin-top: 3px; margin-left: 3px; width: calc(100% - 6px); height: calc(100% - 6px);">
                    <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                        <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}">${data.title}</div>
                    </div>
                    <div class="materialdesign-html-card card-text-section iconlist" style="height: 100%; ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'overflow-y: auto; overflow-x: hidden;' : ''} margin: ${myMdwHelper.getNumberFromData(data.borderDistance, 10)}px;">
                        <div class="materialdesign-html-card" style="height: 100%">
                            <canvas class="materialdesign-chart-container"></canvas>
                        </div>
                    </div>
                </div>`
    }
}