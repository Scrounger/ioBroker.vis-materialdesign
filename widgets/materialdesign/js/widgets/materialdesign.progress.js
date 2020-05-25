/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.progress = {
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
                            };

                            let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                            dataObj.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');

                            return dataObj;
                        },
                    });

                    
                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, newVal, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');
                    });

                    $this.get(0).style.setProperty("--vue-progress-progress-color-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                    $this.get(0).style.setProperty("--vue-progress-progress-color-striped", myMdwHelper.getValueFromData(data.progressStripedColor, ''));

                    let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                    vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label');
                });
            });

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

                    $this.find(`.v-progress-circular__underlay`).attr('fill', myMdwHelper.getValueFromData(data.innerColor, 'transparent'))
                });
            });

        } catch (ex) {
            console.error(`[Progress Circular ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getProgressState: function ($this, data, val, colorProperty, labelClass) {
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
            $this.get(0).style.setProperty(colorProperty, colorOne);
        } else if (valPercent > colorTwoCondition) {
            $this.get(0).style.setProperty(colorProperty, colorTwo);
        } else {
            $this.get(0).style.setProperty(colorProperty, color);
        }

        if (data.valueLabelStyle === 'progressPercent') {
            $this.find(labelClass).html(`${myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))} %`);
        } else if (data.valueLabelStyle === 'progressValue') {
            $this.find(labelClass).html(`${myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))}${myMdwHelper.getValueFromData(data.valueLabelUnit, '')}`);
        } else {
            $this.find(labelClass).html(`${myMdwHelper.getValueFromData(data.valueLabelCustom, '').replace('[#value]', myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))).replace('[#percent]', myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0)))}`);
        }

        return valPercent;
    }
}