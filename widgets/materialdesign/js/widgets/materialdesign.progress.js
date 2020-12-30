/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.progress = {
    types: {
        linear: 'linear',
        circular: 'circular'
    },
    linear: function (el, data) {
        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-progress';
            let widgetName = 'Progress';

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%; display: flex; justify-content: center;">
                <v-progress-linear
                    :height="height"
                    :rounded="rounded"
                    :striped="striped"
                    :value="value"
                    :indeterminate="indeterminate"
                    :reverse="reverse"
                    :query="query"
                    >

                    <template v-slot="{ value }">
                        ${myMdwHelper.getBooleanFromData(data.showValueLabel, true) ? '<div class="materialdesign-vuetify-progress-value-label" style="width: 100%; margin-left: 10px; margin-right: 10px;"></div>' : ''} 
                    </template>
                </v-progress-linear>
            `);

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, widgetName, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, widgetName, function () {

                    Vue.use(VueTheMask);
                    // @ts-ignore
                    let vueProgress = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = {
                                height: window.getComputedStyle($this.get(0), null).height.replace('px', ''),
                                rounded: myMdwHelper.getBooleanFromData(data.progressRounded, true),
                                striped: myMdwHelper.getBooleanFromData(data.progressStriped, false),
                                indeterminate: myMdwHelper.getBooleanFromData(data.progressIndeterminate, false),
                                reverse: !myMdwHelper.getBooleanFromData(data.progressIndeterminate, false) ? myMdwHelper.getBooleanFromData(data.reverse, false) : false,
                                query: myMdwHelper.getBooleanFromData(data.progressIndeterminate, false) ? myMdwHelper.getBooleanFromData(data.reverse, false) : false
                            };

                            if (!myMdwHelper.getBooleanFromData(data.progressIndeterminate, false)) {
                                let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                                dataObj.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');
                            }

                            return dataObj;
                        },
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, newVal, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');
                    });

                    $this.get(0).style.setProperty("--vue-progress-progress-color-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                    $this.get(0).style.setProperty("--vue-progress-progress-color-striped", myMdwHelper.getValueFromData(data.progressStripedColor, ''));
                    $this.get(0).style.setProperty("--vue-progress-progress-color-text", myMdwHelper.getValueFromData(data.textColor, ''));
                    $this.get(0).style.setProperty("--vue-progress-progress-color-text-size", myMdwHelper.getNumberFromData(data.textFontSize, 12) + 'px');
                    $this.get(0).style.setProperty("--vue-progress-progress-color-text-font-family", myMdwHelper.getValueFromData(data.textFontFamily, 'inherit'));
                    $this.get(0).style.setProperty("--vue-progress-progress-color-text-align", myMdwHelper.getValueFromData(data.textAlign, 'end'));


                    let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                    vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');
                });
            });

        } catch (ex) {
            console.error(`[Progress - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
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
                    width="${myMdwHelper.getNumberFromData(data.progressCircularWidth, 4)}"
                    rotate="${myMdwHelper.getNumberFromData(data.progressCircularRotate, 0)}"
                    >
                    ${myMdwHelper.getBooleanFromData(data.showValueLabel, true) ? '<div class="materialdesign-vuetify-progress-circular-value-label"></div>' : ''} 
                </v-progress-circular>
            `);

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, widgetName, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, widgetName, function () {

                    Vue.use(VueTheMask);
                    let vueProgressCircular = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = {};

                            let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                            dataObj.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-circular-progress-color", '.materialdesign-vuetify-progress-circular-value-label');

                            return dataObj;
                        },
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgressCircular.value = vis.binds.materialdesign.progress.getProgressState($this, data, newVal, "--vue-progress-circular-progress-color", '.materialdesign-vuetify-progress-circular-value-label');
                    });

                    $this.get(0).style.setProperty("--vue-progress-circular-progress-color-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                    $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text", myMdwHelper.getValueFromData(data.textColor, ''));
                    $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text-size", myMdwHelper.getNumberFromData(data.textFontSize, 12) + 'px');
                    $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text-font-family", myMdwHelper.getValueFromData(data.textFontFamily, 'inherit'));

                    $this.find(`.v-progress-circular__underlay`).attr('fill', myMdwHelper.getValueFromData(data.innerColor, 'transparent'))
                });
            });

        } catch (ex) {
            console.error(`[Progress Circular - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getProgressState: function ($this, data, val, colorProperty, labelClass) {
        let min = myMdwHelper.getNumberFromData(data.min, 0);
        let max = myMdwHelper.getNumberFromData(data.max, 100);

        let color = myMdwHelper.getValueFromData(data.colorProgress, '');
        let colorOneCondition = myMdwHelper.getNumberFromData(data.colorOneCondition, 1000);
        let colorOne = myMdwHelper.getValueFromData(data.colorOne, color);
        let colorTwoCondition = myMdwHelper.getNumberFromData(data.colorTwoCondition, 1000);
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
            $this.get(0).style.setProperty(colorProperty, colorOne);
        } else if (valPercent > colorTwoCondition) {
            $this.get(0).style.setProperty(colorProperty, colorTwo);
        } else {
            $this.get(0).style.setProperty(colorProperty, color);
        }

        if (myMdwHelper.getValueFromData(data.valueLabelStyle, "progressPercent") === 'progressPercent') {
            $this.find(labelClass).html(`${myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))} %`);
        } else if (myMdwHelper.getValueFromData(data.valueLabelStyle, "progressPercent") === 'progressValue') {
            $this.find(labelClass).html(`${myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))}${myMdwHelper.getValueFromData(data.valueLabelUnit, '')}`);
        } else {
            $this.find(labelClass).html(`${myMdwHelper.getValueFromData(data.valueLabelCustom, '').replace('[#value]', myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))).replace('[#percent]', myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0)))}`);
        }
        if (!myMdwHelper.getBooleanFromData(data.progressIndeterminate, false)) {
            return valPercent;
        } else {
            return 0;
        }
    },
    getDataFromJson(obj, widgetId, type) {
        if (type === this.types.linear) {
            return {
                wid: widgetId,

                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                reverse: obj.reverse,
                progressRounded: obj.progressRounded,
                progressStriped: obj.progressStriped,
                progressStripedColor: obj.progressStripedColor,
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustom: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily,
                textAlign: obj.textAlign,
                progressIndeterminate: obj.indeterminate
            }
        } else {
            return {
                wid: widgetId,

                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                progressCircularSize: obj.progressCircularSize,
                progressCircularWidth: obj.progressCircularWidth,
                progressCircularRotate: obj.progressCircularRotate,
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                innerColor: obj.innerColor,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustom: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily
            }
        }
    }
}