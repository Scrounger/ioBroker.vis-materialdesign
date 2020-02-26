/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.62"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.progress =
    function (el, data) {
        try {
            let $this = $(el);
            let progressElement = $this.context;
            var oid = $this.attr('data-oid');

            const mdcProgress = new mdc.linearProgress.MDCLinearProgress(progressElement);

            setTimeout(function () {

                // since mdc 4.0.0, current progress is styled over border-top property
                // let widgetHeight = window.getComputedStyle($this.context, null).height;
                // let currentProgressEl = $this.find('.mdc-linear-progress__bar-inner');
                // $this.find('.mdc-linear-progress__bar-inner').css('border-top', `${widgetHeight} solid`).css('-webkit-border-top', `${widgetHeight} solid`);

                var min = myMdwHelper.getValueFromData(data.min, 0);
                var max = myMdwHelper.getValueFromData(data.max, 1);
                var unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');
                var decimals = myMdwHelper.getValueFromData(data.valueMaxDecimals, 0);

                mdcProgress.reverse = data.reverse;

                var color = myMdwHelper.getValueFromData(data.colorProgress, '');
                var colorOneCondition = myMdwHelper.getValueFromData(data.colorOneCondition, 0);
                var colorOne = myMdwHelper.getValueFromData(data.colorOne, '');
                var colorTwoCondition = myMdwHelper.getValueFromData(data.colorTwoCondition, 0);
                var colorTwo = myMdwHelper.getValueFromData(data.colorTwo, '');


                if (colorOne === '') colorOne = color;
                if (colorTwo === '') colorTwo = color;

                setProgressState();

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setProgressState();
                });

                function setProgressState() {
                    var val = vis.states.attr(data.oid + '.val');

                    if (val === undefined) {
                        val = data.oid;
                    }

                    // Falls quellen boolean ist
                    if (val === true || val === 'true') val = max;
                    if (val === false || val === 'false') val = min;

                    let valPercent = parseFloat(val);

                    if (isNaN(valPercent)) valPercent = min;
                    if (valPercent < min) valPercent = min;
                    if (valPercent > max) valPercent = max;

                    let simRange = 100;
                    let range = max - min;
                    let factor = simRange / range;
                    valPercent = Math.floor((valPercent - min) * factor);

                    mdcProgress.progress = valPercent / 100;

                    let valueLabel = Math.round(val * Math.pow(10, decimals)) / Math.pow(10, decimals)
                    $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html('&nbsp;' + valueLabel + unit + '&nbsp;');

                    if (valueLabel > colorOneCondition && valueLabel <= colorTwoCondition) {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', colorOne)
                    } else if (valueLabel > colorTwoCondition) {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', colorTwo)
                    } else {
                        $this.find('.mdc-linear-progress__bar-inner').css('border-top-color', color)
                    }
                }
            }, 1);
        } catch (ex) {
            console.error(`[Progress]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };
