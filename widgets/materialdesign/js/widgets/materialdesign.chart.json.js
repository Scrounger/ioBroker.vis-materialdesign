/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.chart.json = function (el, data) {
    let widgetName = 'JSON Chart';

    try {
        let debug = myMdwHelper.getBooleanFromData(data.debug, false);
        if (debug) console.log(`[${widgetName} ${data.wid}] widget setting: ${JSON.stringify(data)}`);

        let $this = $(el);

        myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

        setTimeout(function () {
            let myChart;
            let myChartHelper = vis.binds.materialdesign.chart.helper;
            myChartHelper.registerChartAreaPlugin();


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

                $this.find('.materialdesign-chart-container').css('background-color', myMdwHelper.getValueFromData(data.backgroundColor, ''));

                if (chartContainer !== undefined && chartContainer !== null && chartContainer !== '') {
                    var ctx = chartContainer.getContext('2d');

                    // intialize chart -> some parameters needed
                    if (myChart) myChart.destroy();
                    myChart = new Chart(ctx, {
                        type: myMdwHelper.getValueFromData(data.chartType, 'bar'),
                        plugins: [ChartDataLabels, myChartHelper.getMyGradientPlugin(data), myChartHelper.myDistanceLegendPlugin(data)]     // show value labels
                    });

                    // Global Options:
                    Chart.defaults.global.defaultFontColor = '#44739e';
                    Chart.defaults.global.defaultFontSize = 15;
                    Chart.defaults.global.animation.duration = myMdwHelper.getNumberFromData(data.animationDuration, 1000);

                    Chart.plugins.unregister(ChartDataLabels);

                    if (vis.states.attr(data.oid + '.val') && vis.states.attr(data.oid + '.val') !== 'null') {
                        let mydata = getDataFromJson(vis.states.attr(data.oid + '.val'));

                        if (debug) console.log(`[${widgetName} ${data.wid}] mydata: ${JSON.stringify(mydata)}`);

                        myChart.type = myMdwHelper.getValueFromData(data.chartType, 'bar');
                        myChart.data.labels = mydata.labels;
                        myChart.data.datasets = mydata.datasets;
                        myChart.options = mydata.options;
                        myChart.update();
                        progressBar.hide();

                        vis.states.bind(data.oid + '.val', onChange);
                    } else {
                        myChart.options.title = {
                            display: true,
                            text: `${_("datapoint '{0}' not exist!").replace('{0}', data.oid)}`,
                            fontColor: 'red'
                        };
                        myChart.update();
                        progressBar.hide();

                        console.error(`[${widgetName} - ${data.wid}] ${_("datapoint '{0}' not exist!").replace('{0}', data.oid)}`);
                    }

                    function getDataFromJson(oidVal) {
                        let myDatasets = [];
                        let myXAxis = [];
                        let myYAxis = [];
                        let timeAxisSettings = {};
                        let labels = []
                        let options = {}

                        let globalColor = myMdwHelper.getValueFromData(data.globalColor, '#44739e');

                        let jsonData = undefined
                        try {
                            jsonData = JSON.parse(oidVal);
                            if (debug) console.log(`[${widgetName} ${data.wid}] json: ${JSON.stringify(jsonData)}`);
                        } catch (jsonError) {
                            options = {
                                title: {
                                    display: true,
                                    text: `${_("Error in JSON string")}<br>${jsonError.message}`.split('<br>'),
                                    fontColor: 'red'
                                }
                            };
                            console.error(`[${widgetName} - ${data.wid}] cannot parse json string! Error: ${jsonError.message}`);
                            return { labels: [], datasets: [], options: options }
                        }

                        if (jsonData && Object.keys(jsonData).length > 0) {

                            labels = (jsonData.axisLabels) ? jsonData.axisLabels : [];

                            let colorScheme = myMdwHelper.getValueFromData(data.colorScheme, null);
                            if (colorScheme !== null) {
                                colorScheme = vis.binds.materialdesign.colorScheme.get(data.colorScheme, data.dataCount);
                            }

                            if (jsonData && jsonData.graphs) {
                                for (const i of Object.keys(jsonData.graphs)) {
                                    let graph = jsonData.graphs[i];
                                    let isTimeAxis = false;

                                    if (debug) console.log(`[${widgetName} ${data.wid}] graph[${i}]: ${JSON.stringify(graph)}`);

                                    if (graph) {
                                        let graphColor = myMdwHelper.getValueFromData(graph.color, (colorScheme) ? myMdwHelper.getValueFromData(colorScheme[i], globalColor) : globalColor);

                                        let fillColor = myChartHelper.addOpacityToColor(graphColor, 20);
                                        if (myMdwHelper.getValueFromData(graph.line_FillColor, null) !== null) {
                                            fillColor = chroma(graph.line_FillColor).css();
                                        }

                                        let barColorHover = myChartHelper.addOpacityToColor(graphColor, 80);
                                        if (myMdwHelper.getValueFromData(graph.barColorHover, null) !== null) {
                                            barColorHover = graph.barColorHover;
                                        }

                                        if (graph.data && graph.data.length > 0) {
                                            if (typeof (graph.data[0]) === 'object') {
                                                isTimeAxis = true;
                                                if (debug) console.log(`[${widgetName} ${data.wid}] graph[${i}].data is data object -> using time axis`);
                                            }
                                        }

                                        if (graph.data) {
                                            if (debug) console.log(`[${widgetName} ${data.wid}] graph[${i}].data length: ${graph.data.length}`);

                                            let graphObj = {
                                                data: isTimeAxis ? graph.data : graph.data.map(Number, null),
                                                label: myMdwHelper.getValueFromData(graph.legendText, ""),
                                                type: graph.type,
                                                order: myMdwHelper.getNumberFromData(graph.displayOrder, i),
                                                yAxisID: `yAxis_id_${myMdwHelper.getNumberFromData(graph.yAxis_id, i)}`,
                                                datalabels: {
                                                    // Plugin datalabels
                                                    display: graph.datalabel_show && graph.datalabel_show.toString() === 'auto' ? 'auto' : myMdwHelper.getBooleanFromData(graph.datalabel_show, true) === false ? false : true,
                                                    anchor: myMdwHelper.getValueFromData(graph.datalabel_anchor, 'end'),
                                                    align: myMdwHelper.getValueFromData(graph.datalabel_align, 'top'),
                                                    textAlign: myMdwHelper.getValueFromData(graph.datalabel_text_align, 'center'),
                                                    offset: myMdwHelper.getNumberFromData(graph.datalabel_offset, 0),
                                                    clamp: true,
                                                    rotation: myMdwHelper.getNumberFromData(graph.datalabel_rotation, undefined),
                                                    formatter: function (value, context) {
                                                        try {
                                                            if (myMdwHelper.getValueFromData(graph.datalabel_override, undefined)) {
                                                                // Datalabel override
                                                                if (Array.isArray(graph.datalabel_override)) {
                                                                    // Datalabel override is array -> override every single datalabel, undefined -> use default rules for datalabel
                                                                    if (graph.datalabel_override[context.dataIndex]) {
                                                                        return graph.datalabel_override[context.dataIndex].split('\\n');
                                                                    } else if (graph.datalabel_override[context.dataIndex] === '') {
                                                                        // empty string set by user -> remove datalabel
                                                                        return null;
                                                                    }
                                                                } else {
                                                                    // Datalabel ovveride is string -> override all datalabels
                                                                    return graph.datalabel_override.split('\\n');
                                                                }
                                                            }

                                                            if (!isTimeAxis) {
                                                                if ((value || value === 0) && context.dataIndex % myMdwHelper.getNumberFromData(graph.datalabel_steps, 1) === 0) {
                                                                    return `${myMdwHelper.formatNumber(value, graph.datalabel_minDigits, graph.datalabel_maxDigits)}${myMdwHelper.getValueFromData(graph.datalabel_append, '')}`
                                                                        .split('\\n');
                                                                }
                                                            } else {
                                                                if ((value.y || value.y === 0) && context.dataIndex % myMdwHelper.getNumberFromData(graph.datalabel_steps, 1) === 0) {
                                                                    return `${myMdwHelper.formatNumber(value.y, graph.datalabel_minDigits, graph.datalabel_maxDigits)}${myMdwHelper.getValueFromData(graph.datalabel_append, '')}`
                                                                        .split('\\n');
                                                                }
                                                            }

                                                            return null;
                                                        } catch (ex) {
                                                            console.error(`[${widgetName} - ${data.wid}] [datalabels format] error: ${ex.message}, stack: ${ex.stack}`);
                                                        }
                                                    },
                                                    font: {
                                                        family: myMdwHelper.getValueFromData(graph.datalabel_fontFamily, undefined),
                                                        size: myMdwHelper.getNumberFromData(graph.datalabel_fontSize, undefined),
                                                    },
                                                    color: myMdwHelper.getValueFromData(graph.datalabel_color, graphColor),
                                                    backgroundColor: myMdwHelper.getValueFromData(graph.datalabel_backgroundColor, undefined),
                                                    borderColor: myMdwHelper.getValueFromData(graph.datalabel_borderColor, undefined),
                                                    borderWidth: myMdwHelper.getNumberFromData(graph.datalabel_borderWidth, 0),
                                                    borderRadius: myMdwHelper.getNumberFromData(graph.datalabel_borderRadius, 0),
                                                },
                                                myGradientColors: {
                                                    useGradientColor: myMdwHelper.getBooleanFromData(graph.use_gradient_color, false),
                                                    gradientColors: myMdwHelper.getBooleanFromData(graph.use_gradient_color, false) ? myMdwHelper.getValueFromData(graph.gradient_color, undefined) : graphColor,
                                                    useGradientFillColor: myMdwHelper.getBooleanFromData(graph.use_line_gradient_fill_color, false),
                                                    gradientFillColors: myMdwHelper.getBooleanFromData(graph.use_line_gradient_fill_color, false) ? myMdwHelper.getValueFromData(graph.line_gradient_fill_color, undefined) : (graph.type === 'line') ? fillColor : barColorHover,
                                                }
                                            }

                                            if (graph.type && graph.type === 'line') {
                                                // line graph
                                                let fillBetweenLines = myMdwHelper.getValueFromData(graph.line_FillBetweenLines, undefined);

                                                Object.assign(graphObj,
                                                    {
                                                        // line graph specific properties
                                                        borderColor: graphColor,
                                                        steppedLine: myMdwHelper.getBooleanFromData(graph.line_steppedLine, false),

                                                        // JSON Daten
                                                        pointStyle: myMdwHelper.getValueFromData(graph.line_pointStyle, 'circle'),
                                                        pointRadius: myMdwHelper.getNumberFromData(graph.line_pointSize, 3),
                                                        pointHoverRadius: myMdwHelper.getNumberFromData(graph.line_pointSizeHover, 4),

                                                        pointBackgroundColor: myMdwHelper.getValueFromData(graph.line_PointColor, graphColor),
                                                        pointBorderColor: myMdwHelper.getValueFromData(graph.line_PointColorBorder, myMdwHelper.getValueFromData(graph.line_PointColor, graphColor)),
                                                        pointHoverBackgroundColor: myMdwHelper.getValueFromData(graph.line_PointColorHover, graphColor),
                                                        pointHoverBorderColor: myMdwHelper.getValueFromData(graph.line_PointColorBorderHover, myMdwHelper.getValueFromData(graph.line_PointColorHover, graphColor)),
                                                        spanGaps: myMdwHelper.getBooleanFromData(graph.line_spanGaps, true),
                                                        lineTension: myMdwHelper.getNumberFromData(graph.line_Tension, 0.4),
                                                        borderWidth: myMdwHelper.getNumberFromData(graph.line_Thickness, 2),
                                                        fill: fillBetweenLines ? fillBetweenLines : myMdwHelper.getBooleanFromData(graph.line_UseFillColor, false) || myMdwHelper.getBooleanFromData(graph.use_line_gradient_fill_color, false),
                                                        backgroundColor: fillColor,
                                                    }
                                                )
                                            } else {
                                                // bar graph
                                                Object.assign(graphObj,
                                                    {
                                                        // bar chart specific properties
                                                        backgroundColor: graphColor,
                                                        hoverBackgroundColor: barColorHover,

                                                        // JSON Daten
                                                        borderColor: myMdwHelper.getValueFromData(graph.barBorderColor, 'white'),
                                                        borderWidth: myMdwHelper.getNumberFromData(graph.barBorderWidth, undefined),
                                                        hoverBorderColor: myMdwHelper.getValueFromData(graph.barBorderColorHover, undefined),
                                                        hoverBorderWidth: myMdwHelper.getNumberFromData(graph.barBorderWidthHover, undefined),
                                                        stack: myMdwHelper.getNumberFromData(graph.barStackId, (myMdwHelper.getBooleanFromData(graph.barIsStacked, false)) ? 0 : undefined),

                                                        // Editor Daten
                                                        categoryPercentage: myMdwHelper.getNumberFromData(data.barWidth, 80) / 100,
                                                        barPercentage: myMdwHelper.getNumberFromData(data.barWidth, 80) / 100,
                                                    }
                                                )
                                            }

                                            myDatasets.push(graphObj);

                                            myYAxis.push(
                                                {
                                                    id: `yAxis_id_${myMdwHelper.getNumberFromData(graph.yAxis_id, i)}`,
                                                    type: 'linear',
                                                    position: myMdwHelper.getValueFromData(graph.yAxis_position, 'left'),
                                                    display: myMdwHelper.getBooleanFromData(graph.yAxis_show, true),
                                                    stacked: myMdwHelper.getBooleanFromData(graph.barIsStacked, false),
                                                    scaleLabel: {       // y-Axis title
                                                        display: myMdwHelper.getValueFromData(graph.yAxis_title_text, '') !== '' ? true : false,
                                                        labelString: myMdwHelper.getValueFromData(graph.yAxis_title_text, ''),
                                                        fontColor: myMdwHelper.getValueFromData(graph.yAxis_title_color, myMdwHelper.getValueFromData(data.yAxisTitleColor, undefined)),
                                                        fontFamily: myMdwHelper.getValueFromData(graph.yAxis_title_fontFamily, myMdwHelper.getValueFromData(data.yAxisTitleFontFamily, undefined)),
                                                        fontSize: myMdwHelper.getNumberFromData(graph.yAxis_title_fontSize, myMdwHelper.getNumberFromData(data.yAxisTitleFontSize, undefined))
                                                    },
                                                    ticks: {
                                                        min: myMdwHelper.getNumberFromData(graph.yAxis_min, undefined),
                                                        max: myMdwHelper.getNumberFromData(graph.yAxis_max, undefined),
                                                        stepSize: myMdwHelper.getNumberFromData(graph.yAxis_step, undefined),
                                                        autoSkip: true,
                                                        maxTicksLimit: myMdwHelper.getNumberFromData(graph.yAxis_maxSteps, undefined),
                                                        fontColor: myMdwHelper.getValueFromData(graph.yAxis_color, myMdwHelper.getValueFromData(data.yAxisValueLabelColor, undefined)),
                                                        fontFamily: myMdwHelper.getValueFromData(graph.yAxis_fontFamily, myMdwHelper.getValueFromData(data.yAxisValueFontFamily, undefined)),
                                                        fontSize: myMdwHelper.getNumberFromData(graph.yAxis_fontSize, myMdwHelper.getNumberFromData(data.yAxisValueFontSize, undefined)),
                                                        padding: myMdwHelper.getNumberFromData(graph.yAxis_distance, myMdwHelper.getNumberFromData(data.yAxisValueDistanceToAxis, 0)),
                                                        callback: function (value, index, values) {
                                                            try {
                                                                let axisId = this.id.replace('yAxis_id_', '');
                                                                return `${myMdwHelper.formatNumber(value, myMdwHelper.getNumberFromData(jsonData.graphs[axisId].yAxis_minimumDigits, 0), myMdwHelper.getNumberFromData(jsonData.graphs[axisId].yAxis_maximumDigits, 0))}${myMdwHelper.getValueFromData(jsonData.graphs[axisId].yAxis_appendix, '')}`.split('\\n');
                                                            } catch (ex) {
                                                                console.error(`[${widgetName} - ${data.wid}] [ticks callback] error: ${ex.message}, stack: ${ex.stack}`);
                                                            }
                                                        }
                                                    },
                                                    gridLines: {
                                                        display: true,
                                                        color: myMdwHelper.getValueFromData(graph.yAxis_gridLines_color, 'black'),
                                                        lineWidth: myMdwHelper.getNumberFromData(graph.yAxis_gridLines_lineWidth, 0.1),
                                                        drawBorder: myMdwHelper.getBooleanFromData(graph.yAxis_gridLines_border_show, true),
                                                        drawOnChartArea: myMdwHelper.getBooleanFromData(graph.yAxis_gridLines_show, true),
                                                        drawTicks: myMdwHelper.getBooleanFromData(graph.yAxis_gridLines_ticks_show, true),
                                                        tickMarkLength: myMdwHelper.getNumberFromData(graph.yAxis_gridLines_ticks_length, 5),
                                                        zeroLineWidth: myMdwHelper.getNumberFromData(graph.yAxis_zeroLineWidth, 1),
                                                        zeroLineColor: myMdwHelper.getValueFromData(graph.yAxis_zeroLineColor, 'rgba(0, 0, 0, 0.25)'),
                                                    }
                                                }
                                            )
                                            timeAxisSettings = {
                                                id: i,
                                                display: (i > 0) ? false : true,
                                                stacked: myMdwHelper.getBooleanFromData(graph.barIsStacked, false)
                                            }

                                            if (isTimeAxis) {
                                                timeAxisSettings = Object.assign(timeAxisSettings,
                                                    {
                                                        type: 'time',
                                                        bounds: (graph.xAxis_bounds === 'data') ? 'data' : 'ticks',
                                                        time:
                                                        {
                                                            displayFormats: (graph.xAxis_timeFormats) ? graph.xAxis_timeFormats : myChartHelper.defaultTimeFormats(),
                                                            tooltipFormat: (graph.xAxis_tooltip_timeFormats) ? graph.xAxis_tooltip_timeFormats : 'lll',
                                                            unit: (graph.xAxis_time_unit) ? graph.xAxis_time_unit : undefined
                                                        }
                                                    }
                                                );
                                            }

                                            myXAxis.push(Object.assign(
                                                myChartHelper.get_X_AxisObject(graph.type, data.xAxisPosition, data.xAxisTitle, data.xAxisTitleColor, data.xAxisTitleFontFamily, data.xAxisTitleFontSize,
                                                    data.xAxisShowAxisLabels, undefined, undefined, undefined, data.xAxisMaxLabel, data.axisLabelAutoSkip, undefined,
                                                    data.xAxisValueLabelColor, data.xAxisValueFontFamily, data.xAxisValueFontSize, data.xAxisValueDistanceToAxis, data.xAxisGridLinesColor,
                                                    data.xAxisGridLinesWitdh, data.xAxisShowAxis, data.xAxisShowGridLines, data.xAxisShowTicks, data.xAxisTickLength, data.xAxisZeroLineWidth, data.xAxisZeroLineColor, data.xAxisOffsetGridLines, undefined, undefined, data.xAxisMinRotation, data.xAxisMaxRotation, isTimeAxis, data.xAxisOffset, data.xAxisTicksSource, (graph.xAxis_timeFormats) ? graph.xAxis_timeFormats : myChartHelper.defaultTimeFormats(), data.xAxisLabelUseTodayYesterday, data.xAxisDistanceBetweenTicks),
                                                timeAxisSettings
                                            ));

                                        } else {
                                            console.error(`[${widgetName} - ${data.wid}] graph[${i}].data is null! Check json string input!`);
                                        }
                                    } else {
                                        console.error(`[${widgetName} - ${data.wid}] graph[${i}] is null! Check json string input!`);
                                    }
                                }
                            } else {
                                console.warn(`[${widgetName} - ${data.wid}] your json data is not correct -> check documentation!`);
                            }

                            // Notice how nested the beginAtZero is
                            options = {
                                responsive: true,
                                maintainAspectRatio: false,
                                layout: myChartHelper.getLayout(data),
                                hover: myMdwHelper.getBooleanFromData(data.disableHoverEffects, false) ? { mode: null } : { mode: 'nearest' },
                                chartArea: {
                                    backgroundColor: myMdwHelper.getValueFromData(data.chartAreaBackgroundColor, ''),
                                },
                                scales: {
                                    xAxes: myXAxis,
                                    yAxes: myYAxis,
                                },
                                legend: Object.assign(myChartHelper.getLegend(data), myChartHelper.getLegendClickEvent(myYAxis)),
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
                                    bodyAlign: myMdwHelper.getValueFromData(data.tooltipBodyAlignment, 'left'),
                                    callbacks: {
                                        title: function (tooltipItem, chart) {
                                            try {
                                                let index = tooltipItem[0].index;

                                                if (jsonData.graphs[tooltipItem[0].datasetIndex].tooltip_title) {
                                                    if (Array.isArray(jsonData.graphs[tooltipItem[0].datasetIndex].tooltip_title)) {
                                                        if (jsonData.graphs[tooltipItem[0].datasetIndex].tooltip_title[index]) {
                                                            return jsonData.graphs[tooltipItem[0].datasetIndex].tooltip_title[index].split('\\n');
                                                        }
                                                    } else {
                                                        return jsonData.graphs[tooltipItem[0].datasetIndex].tooltip_title.split('\\n');
                                                    }
                                                }

                                                let datasetIndex = tooltipItem[0].datasetIndex;
                                                let metaIndex = Object.keys(chart.datasets[datasetIndex]._meta)[0];

                                                if (chart.datasets[datasetIndex]._meta[metaIndex].controller.chart.scales[datasetIndex]._unit) {
                                                    let currentUnit = chart.datasets[datasetIndex]._meta[metaIndex].controller.chart.scales[datasetIndex]._unit;
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
                                                } else {
                                                    return tooltipItem[0].label.split('\\n');
                                                }
                                            } catch (ex) {
                                                console.error(`[${widgetName} - ${data.wid}] [tooltip title] error: ${ex.message}, stack: ${ex.stack}`);
                                            }
                                        },
                                        label: function (tooltipItem, chart) {
                                            try {
                                                if (jsonData.graphs[tooltipItem.datasetIndex].tooltip_text) {
                                                    if (Array.isArray(jsonData.graphs[tooltipItem.datasetIndex].tooltip_text)) {
                                                        if (jsonData.graphs[tooltipItem.datasetIndex].tooltip_text[tooltipItem.index]) {
                                                            return jsonData.graphs[tooltipItem.datasetIndex].tooltip_text[tooltipItem.index].split('\\n');
                                                        } else {
                                                            if (tooltipItem && tooltipItem.value) {
                                                                return chart.datasets[tooltipItem.datasetIndex].label;
                                                            }
                                                        }
                                                    } else {
                                                        return jsonData.graphs[tooltipItem.datasetIndex].tooltip_text.split('\\n');
                                                    }
                                                } else if (tooltipItem && tooltipItem.value) {
                                                    return `${chart.datasets[tooltipItem.datasetIndex].label}: ${myMdwHelper.formatNumber(tooltipItem.value, jsonData.graphs[tooltipItem.datasetIndex].tooltip_MinDigits, jsonData.graphs[tooltipItem.datasetIndex].tooltip_MaxDigits)}${myMdwHelper.getValueFromData(jsonData.graphs[tooltipItem.datasetIndex].tooltip_AppendText, '')}`
                                                        .split('\\n');
                                                }
                                                return '';
                                            } catch (ex) {
                                                console.error(`[${widgetName} - ${data.wid}] [tooltip label] error: ${ex.message}, stack: ${ex.stack}`);
                                            }
                                        },
                                        labelColor: function (tooltipItem, chart) {
                                            try {
                                                let dataSetColor = chart.config.data.datasets[tooltipItem.datasetIndex].borderColor;

                                                return {
                                                    borderColor: dataSetColor,
                                                    backgroundColor: dataSetColor
                                                };
                                            } catch (ex) {
                                                console.error(`[${widgetName} - ${data.wid}] [labelColor] error: ${ex.message}, stack: ${ex.stack}`);
                                            }
                                        }
                                    }
                                },
                            }
                        } else {
                            console.error(`[${widgetName} - ${data.wid}] ${_("datapoint '{0}' has no data!").replace('{0}', data.oid)}`);
                        }

                        if (myDatasets.length > 0) {
                            return { labels: labels, datasets: myDatasets, options: options }
                        } else {
                            console.error(`[${widgetName} - ${data.wid}] ${_("datapoint '{0}' has no datasets!").replace('{0}', data.oid)}`);
                            return { labels: [], datasets: [], options: [] }
                        }
                    }

                    function onChange(e, newVal, oldVal) {
                        try {
                            if (debug) console.log(`[${widgetName} ${data.wid}] ************************************************************** onChange **************************************************************`);
                            progressBar.show();

                            let changedData = getDataFromJson(newVal);

                            let chartNeedsUpdate = false;

                            if (!myUnderscore.isEqual(myChart.data.labels, changedData.labels)) {
                                if (debug) console.log(`[${widgetName} ${data.wid}] [onChange]: chart 'labels' changed`);
                                myChart.data.labels = changedData.labels;
                                chartNeedsUpdate = true;
                            }

                            let datasetsCounter = changedData.datasets.length;
                            if (myChart.data.datasets.length > datasetsCounter) {
                                datasetsCounter = myChart.data.datasets.length;
                            }

                            for (var i = 0; i <= datasetsCounter - 1; i++) {
                                if (myChart.data.datasets[i] && changedData.datasets[i]) {
                                    // dataset exist in chart and json
                                    if (!myUnderscore.isEqual(myChart.data.datasets[i], changedData.datasets[i])) {
                                        for (var prop in changedData.datasets[i]) {
                                            // check only if prop has changed, so chart will only update the changes
                                            if (!myUnderscore.isEqual(myChart.data.datasets[i][prop], changedData.datasets[i][prop])) {

                                                if (debug) {
                                                    if (!Array.isArray(changedData.datasets[i][prop]) && typeof (changedData.datasets[i][prop]) === 'object') {
                                                        for (var subProp in changedData.datasets[i][prop]) {
                                                            if (!myUnderscore.isEqual(myChart.data.datasets[i][prop][subProp], changedData.datasets[i][prop][subProp])) {
                                                                console.log(`[${widgetName} ${data.wid}] [onChange]: chart graph '${changedData.datasets[i].label ? changedData.datasets[i].label : 'not defined'} (${i})' '${prop}.${subProp}' changed`);
                                                            }
                                                        }
                                                    } else {
                                                        console.log(`[${widgetName} ${data.wid}] [onChange]: chart graph '${changedData.datasets[i].label ? changedData.datasets[i].label : 'not defined'} (${i})' '${prop}' changed`);
                                                    }
                                                }

                                                myChart.data.datasets[i][prop] = changedData.datasets[i][prop];
                                                chartNeedsUpdate = true;
                                            }
                                        }
                                    }
                                } else {
                                    if (changedData.datasets[i]) {
                                        // new dataset in json
                                        if (debug) console.log(`[${widgetName} ${data.wid}] [onChange]: chart new graph '${changedData.datasets[i].label ? changedData.datasets[i].label : 'not defined'} (${i})' added`);

                                        myChart.data.datasets.push(changedData.datasets[i]);
                                        chartNeedsUpdate = true;

                                    } else {
                                        // dataset in json removed
                                        if (debug) console.log(`[${widgetName} ${data.wid}] [onChange]: chart graph '${changedData.datasets[i].label ? changedData.datasets[i].label : 'not defined'} (${i})' removed`);

                                        myChart.data.datasets.splice(i);
                                        chartNeedsUpdate = true;
                                    }
                                }
                            }

                            if (!myUnderscore.isEqual(myChart.options, changedData.options)) {
                                for (var prop in changedData.options) {
                                    if (!myUnderscore.isEqual(myChart.options[prop], changedData.options[prop])) {

                                        if (debug) {
                                            if (!Array.isArray(changedData.options[prop]) && typeof (changedData.options[prop]) === 'object') {
                                                for (var subProp in changedData.options[prop]) {
                                                    if (!myUnderscore.isEqual(myChart.options[prop][subProp], changedData.options[prop][subProp])) {
                                                        console.log(`[${widgetName} ${data.wid}] [onChange]: chart option '${prop}.${subProp}' changed`);
                                                    }
                                                }
                                            } else {
                                                console.log(`[${widgetName} ${data.wid}] [onChange]: chart option '${prop}' changed`);
                                            }
                                        }

                                        myChart.options[prop] = changedData.options[prop];
                                        chartNeedsUpdate = true;
                                    }
                                }
                            }

                            if (chartNeedsUpdate) {
                                if (debug) console.log(`[${widgetName} ${data.wid}] [onChange]: chart updated`);

                                myChart.update();
                                progressBar.hide();
                            }
                        } catch (err) {
                            console.error(`[${widgetName} - ${data.wid}] [onChange] error: ${err.message}, stack: ${err.stack}`);
                        }
                    }
                }
            }
        }, 1);
    } catch (ex) {
        console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
    }
}