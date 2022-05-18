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
                display: (vis.binds.materialdesign.chart.helper.getValueFromData(yAxisTitle, null) !== null),
                labelString: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisTitle, ''),
                fontColor: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisTitleColor, undefined),
                fontFamily: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisTitleFontFamily, undefined),
                fontSize: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisTitleFontSize, undefined)
            },
            ticks: {        // y-Axis values
                display: yAxisShowAxisLabels,
                min: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueMin, undefined),                       // only for chartType: vertical
                max: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueMax, undefined),                       // only for chartType: vertical
                stepSize: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'horizontal' && (vis.binds.materialdesign.chart.helper.getNumberFromData(axisMaxLabel, undefined) > 0) || vis.binds.materialdesign.chart.helper.getBooleanFromData(axisLabelAutoSkip, false)),
                maxTicksLimit: (chartType === 'horizontal') ? vis.binds.materialdesign.chart.helper.getNumberFromData(axisMaxLabel, undefined) : undefined,
                callback: function (value, index, values) {
                    try {
                        if (isNaN(value)) {
                            return `${value}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');;
                        } else {
                            if (axisValueMinDigits || axisValueMaxDigits) {
                                return `${myMdwHelper.formatNumber(value, axisValueMinDigits, axisValueMaxDigits)}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            } else {
                                return `${value}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            }
                        }
                    } catch (ex) {
                        console.error(`[chart helper] [ticks callback] error: ${ex.message}, stack: ${ex.stack}`);
                    }
                },
                fontColor: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisValueLabelColor, undefined),
                fontFamily: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisValueFontFamily, undefined),
                fontSize: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisValueFontSize, undefined),
                padding: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisValueDistanceToAxis, 0),
            },
            gridLines: {
                display: true,
                color: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisGridLinesColor, 'black'),
                lineWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisGridLinesWitdh, 0.1),
                drawBorder: yAxisShowAxis,
                drawOnChartArea: yAxisShowGridLines,
                drawTicks: yAxisShowTicks,
                tickMarkLength: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisTickLength, 5),
                zeroLineWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(yAxisZeroLineWidth, 1),
                zeroLineColor: vis.binds.materialdesign.chart.helper.getValueFromData(yAxisZeroLineColor, 'rgba(0, 0, 0, 0.25)'),
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
                display: (vis.binds.materialdesign.chart.helper.getValueFromData(xAxisTitle, null) !== null),
                labelString: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisTitle, ''),
                fontColor: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisTitleColor, undefined),
                fontFamily: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisTitleFontFamily, undefined),
                fontSize: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisTitleFontSize, undefined)
            },
            ticks: {        // x-Axis values
                display: xAxisShowAxisLabels,
                min: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueMin, undefined),                       // only for chartType: horizontal
                max: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueMax, undefined),                       // only for chartType: horizontal
                stepSize: vis.binds.materialdesign.chart.helper.getNumberFromData(axisValueStepSize, undefined),             // only for chartType: vertical
                autoSkip: (chartType === 'vertical' && (vis.binds.materialdesign.chart.helper.getNumberFromData(axisMaxLabel, undefined) > 0) || vis.binds.materialdesign.chart.helper.getBooleanFromData(axisLabelAutoSkip, false)),
                autoSkipPadding: vis.binds.materialdesign.chart.helper.getNumberFromData(autoSkipPadding, 10),
                minRotation: parseInt(vis.binds.materialdesign.chart.helper.getNumberFromData(minRotation, 0)),
                maxRotation: parseInt(vis.binds.materialdesign.chart.helper.getNumberFromData(maxRotation, 0)),
                maxTicksLimit: (chartType === 'vertical') ? vis.binds.materialdesign.chart.helper.getNumberFromData(axisMaxLabel, undefined) : undefined || vis.binds.materialdesign.chart.helper.getNumberFromData(axisMaxLabel, undefined),
                callback: function (value, index, values) {
                    if (isTimeAxis) {
                        return value.split('\\n');
                    } else {
                        if (isNaN(value)) {
                            return `${value}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');;
                        } else {
                            if (axisValueMinDigits || axisValueMaxDigits) {
                                return `${myMdwHelper.formatNumber(value, axisValueMinDigits, axisValueMaxDigits)}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            } else {
                                return `${value}${vis.binds.materialdesign.chart.helper.getValueFromData(axisValueAppendText, '')}`.split('\\n');
                            }
                        }
                    }
                },
                fontColor: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisValueLabelColor, undefined),
                fontFamily: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisValueFontFamily, undefined),
                fontSize: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisValueFontSize, undefined),
                padding: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisValueDistanceToAxis, 0),
                source: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisTicksSource, 'auto')
            },
            gridLines: {
                display: true,
                color: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisGridLinesColor, 'black'),
                lineWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisGridLinesWitdh, 0.1),
                drawBorder: xAxisShowAxis,
                drawOnChartArea: xAxisShowGridLines,
                drawTicks: xAxisShowTicks,
                tickMarkLength: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisTickLength, 5),
                zeroLineWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(xAxisZeroLineWidth, 0.1),
                zeroLineColor: vis.binds.materialdesign.chart.helper.getValueFromData(xAxisZeroLineColor, 'black'),
                offsetGridLines: vis.binds.materialdesign.chart.helper.getBooleanFromData(xAxisOffsetGridLines, false),
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

            borderColor: vis.binds.materialdesign.chart.helper.getValueFromData(borderColor, 'white'),
            hoverBorderColor: vis.binds.materialdesign.chart.helper.getValueFromData(hoverBorderColor, undefined),

            borderWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(borderWidth, undefined),
            hoverBorderWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(hoverBorderWidth, undefined),
        }
    },
    getLegend: function (data) {
        return {
            display: data.showLegend,
            position: data.legendPosition,
            labels: {
                fontColor: vis.binds.materialdesign.chart.helper.getValueFromData(data.legendFontColor, undefined),
                fontFamily: vis.binds.materialdesign.chart.helper.getValueFromData(data.legendFontFamily, undefined),
                fontSize: vis.binds.materialdesign.chart.helper.getNumberFromData(data.legendFontSize, undefined),
                boxWidth: vis.binds.materialdesign.chart.helper.getNumberFromData(data.legendBoxWidth, 10),
                usePointStyle: data.legendPointStyle,
                padding: vis.binds.materialdesign.chart.helper.getNumberFromData(data.legendPadding, 10),

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
                top: vis.binds.materialdesign.chart.helper.getValueFromData(data.chartPaddingTop, 0),
                left: vis.binds.materialdesign.chart.helper.getValueFromData(data.chartPaddingLeft, 0),
                right: vis.binds.materialdesign.chart.helper.getValueFromData(data.chartPaddingRight, 0),
                bottom: vis.binds.materialdesign.chart.helper.getValueFromData(data.chartPaddingBottom, 0)
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
                    count: parseInt(vis.binds.materialdesign.chart.helper.getNumberFromData(data.attr('maxDataPoints' + index), (data.attr('aggregate' + index) === 'minmax') ? 50 : 100)),
                    step: (vis.binds.materialdesign.chart.helper.getNumberFromData(data.attr('minTimeInterval' + index), undefined)) ? parseInt(data.attr('minTimeInterval' + index)) * 1000 : undefined,
                    aggregate: data.attr('aggregate' + index) || 'minmax',
                    start: dataRangeStartTime,
                    end: new Date().getTime(),
                    timeout: parseInt(vis.binds.materialdesign.chart.helper.getNumberFromData(data.chartTimeout, 2)) * 1000
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
                    y: (elm.val !== null && elm.val !== undefined) ? elm.val * vis.binds.materialdesign.chart.helper.getNumberFromData(data.attr('multiply' + index), 1) : null
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
                    this.height = this.height + vis.binds.materialdesign.chart.helper.getNumberFromData(data.legendDistanceToChart, 0);
                };
            }
        }
    },
    getCardBackground(data) {
        let titleFontSize = vis.binds.materialdesign.chart.helper.getFontSize(data.titleLayout);
        let showTitleSection = 'display: none;';
        if (vis.binds.materialdesign.chart.helper.getValueFromData(data.title, null) != null) {
            showTitleSection = '';
        }

        return `<div class="materialdesign-html-card mdc-card" style="margin-top: 3px; margin-left: 3px; width: calc(100% - 6px); height: calc(100% - 6px);">
                    <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                        <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}">${data.title}</div>
                    </div>
                    <div class="materialdesign-html-card card-text-section iconlist" style="height: 100%; ${vis.binds.materialdesign.chart.helper.getBooleanFromData(data.showScrollbar, true) ? 'overflow-y: auto; overflow-x: hidden;' : ''} margin: ${vis.binds.materialdesign.chart.helper.getNumberFromData(data.borderDistance, 10)}px;">
                        <div class="materialdesign-html-card" style="height: 100%">
                            <canvas class="materialdesign-chart-container"></canvas>
                        </div>
                    </div>
                </div>`
    },
    getCssVariableValue(dataValue) {
        if (dataValue && dataValue.toString().startsWith('var(--')) {
            return getComputedStyle(document.documentElement).getPropertyValue(dataValue.replace('var(', '').replace(')', ''));
        }
        return undefined
    },
    getValueFromData: function (dataValue, nullValue, prepand = '', append = '') {
        let cssVar = this.getCssVariableValue(dataValue);
        return myMdwHelper.getValueFromData(cssVar ? cssVar : dataValue, nullValue, prepand, append);
    },
    getFontSize: function (fontSizeValue) {
        let cssVar = this.getCssVariableValue(fontSizeValue);
        return myMdwHelper.getFontSize(cssVar ? cssVar : fontSizeValue)
    },
    getNumberFromData: function (dataValue, nullValue) {
        let cssVar = this.getCssVariableValue(dataValue);
        return myMdwHelper.getNumberFromData(cssVar ? cssVar : dataValue, nullValue)
    },
    getBooleanFromData: function (dataValue, nullValue) {
        let cssVar = this.getCssVariableValue(dataValue);
        return myMdwHelper.getBooleanFromData(cssVar ? cssVar : dataValue, nullValue)
    },
    getStringFromNumberData: function (dataValue, nullValue, prepand = '', append = '') {
        let cssVar = this.getCssVariableValue(dataValue);
        return myMdwHelper.getStringFromNumberData(cssVar ? cssVar : dataValue, nullValue, prepand, append);
    }
}