/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.3.9"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.progress = {
    linear: function (el, data) {
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
            console.error(`[Progress ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    circular: function (el, data) {
        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-progress-circular';
            let widgetName = 'Progress Circular';

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%; display: flex; justify-content: center;">
                <v-progress-circular
                    :value="value"
                    size="${myMdwHelper.getNumberFromData(data.progressCircularSize, 60)}"                    
                    :width="${myMdwHelper.getNumberFromData(data.progressCircularWidth, 4)}"
                    :rotate="${myMdwHelper.getNumberFromData(data.progressCircularRotate, 0)}"
                    >
                    ${myMdwHelper.getBooleanFromData(data.showValueLabel, true) ? '<div class="materialdesign-vuetify-progress-circular-value-label"></div>' : ''} 
                </v-progress-circular>

            `);


            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'TextField', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'TextField', function () {

                    Vue.use(VueTheMask);
                    let vueProgressCircular = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = {};

                            let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                            dataObj.value = getProgressState(val);

                            return dataObj;
                        },
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgressCircular.value = getProgressState(newVal);
                    });

                    $this.context.style.setProperty("--vue-progress-circular-progress-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                    $this.context.style.setProperty("--vue-progress-circular-progress-text", myMdwHelper.getValueFromData(data.textColor, ''));

                    $this.find(`.v-progress-circular__underlay`).attr('fill', myMdwHelper.getValueFromData(data.innerColor, 'transparent'))

                    // $this.find(`.${containerClass}`).show();
                    // $this.find(`.${containerClass}`).css('display', 'flex');

                    function getProgressState(val) {
                        let min = myMdwHelper.getNumberFromData(data.min, 0);
                        let max = myMdwHelper.getNumberFromData(data.max, 100);

                        let color = myMdwHelper.getValueFromData(data.colorProgress, '');
                        let colorOneCondition = myMdwHelper.getValueFromData(data.colorOneCondition, 0);
                        let colorOne = myMdwHelper.getValueFromData(data.colorOne, color);
                        let colorTwoCondition = myMdwHelper.getValueFromData(data.colorTwoCondition, 0);
                        let colorTwo = myMdwHelper.getValueFromData(data.colorTwo, color);

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

                        if (valPercent > colorOneCondition && valPercent <= colorTwoCondition) {
                            $this.context.style.setProperty("--vue-progress-circular-progress", colorOne);
                        } else if (valPercent > colorTwoCondition) {
                            $this.context.style.setProperty("--vue-progress-circular-progress", colorTwo);
                        } else {
                            $this.context.style.setProperty("--vue-progress-circular-progress", color);
                        }

                        if (data.valueLabelStyle === 'percent') {
                            $this.find('.materialdesign-vuetify-progress-circular-value-label').html(`${myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))} %`);
                        } else if (data.valueLabelStyle === 'value') {
                            $this.find('.materialdesign-vuetify-progress-circular-value-label').html(`${myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))}${myMdwHelper.getValueFromData(data.valueLabelUnit, '')}`);
                        } else{
                            $this.find('.materialdesign-vuetify-progress-circular-value-label').html(`${myMdwHelper.getValueFromData(data.valueLabelCustum, '').replace('[#value]', myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))).replace('[#percent]', myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0)))}`);
                        }

                        return valPercent;
                    }
                });
            });

        } catch (ex) {
            console.error(`[Progress Circular ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
}
