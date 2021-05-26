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
        let widgetName = 'Progress';

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-progress';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            $this.append(`
                <div class="${containerClass}" style="width: 100%;">
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

                                rounded: myMdwHelper.getBooleanFromData(data.progressRounded, true),
                                striped: myMdwHelper.getBooleanFromData(data.progressStriped, false),
                                indeterminate: myMdwHelper.getBooleanFromData(data.progressIndeterminate, false),
                                reverse: !myMdwHelper.getBooleanFromData(data.progressIndeterminate, false) ? myMdwHelper.getBooleanFromData(data.reverse, false) : false,
                                query: myMdwHelper.getBooleanFromData(data.progressIndeterminate, false) ? myMdwHelper.getBooleanFromData(data.reverse, false) : false
                            };

                            if (!myMdwHelper.getBooleanFromData(data.progressIndeterminate, false)) {
                                let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                                dataObj.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label', widgetName);
                            }

                            if (myMdwHelper.getValueFromData(data.progressRotate, 'noRotate') === 'noRotate') {
                                dataObj.height = window.getComputedStyle($this.get(0), null).height.replace('px', '');
                            } else {
                                dataObj.height = window.getComputedStyle($this.get(0), null).width.replace('px', '');
                            }

                            return dataObj;
                        },
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, newVal, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label', widgetName);
                    });

                    $(document).on("mdwSubscribe", function (e, oids) {
                        if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                            setLayout();
                        }
                    });

                    vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                        setLayout();
                    });

                    vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                        setLayout();
                    });

                    setLayout();
                    function setLayout() {
                        $this.get(0).style.setProperty("--vue-progress-progress-color-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                        $this.get(0).style.setProperty("--vue-progress-progress-color-striped", myMdwHelper.getValueFromData(data.progressStripedColor, ''));
                        $this.get(0).style.setProperty("--vue-progress-progress-color-text", myMdwHelper.getValueFromData(data.textColor, ''));
                        $this.get(0).style.setProperty("--vue-progress-progress-color-text-size", myMdwHelper.getNumberFromData(data.textFontSize, 12) + 'px');
                        $this.get(0).style.setProperty("--vue-progress-progress-color-text-font-family", myMdwHelper.getValueFromData(data.textFontFamily, 'inherit'));
                        $this.get(0).style.setProperty("--vue-progress-progress-color-text-align", myMdwHelper.getValueFromData(data.textAlign, 'end'));

                        $this.get(0).style.setProperty("--vue-progress-progress-striped-angle", myMdwHelper.getNumberFromData(data.stripAngle, 135) + 'deg');

                        $this.get(0).style.setProperty("--vue-progress-progress-striped-width1", myMdwHelper.getNumberFromData(data.stipWidth1, 25) + '%');
                        $this.get(0).style.setProperty("--vue-progress-progress-striped-width2", myMdwHelper.getNumberFromData(data.stipWidth2, 50) + '%');
                        $this.get(0).style.setProperty("--vue-progress-progress-striped-width3", myMdwHelper.getNumberFromData(data.stipWidth3, 75) + '%');

                        let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                        vueProgress.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-progress-color", '.materialdesign-vuetify-progress-value-label', widgetName);

                        if (myMdwHelper.getValueFromData(data.progressRotate, 'noRotate') !== 'noRotate') {
                            $this.find(`.${containerClass}`).css('transform', 'rotate(90deg)');
                            $this.find('.v-progress-linear').css('width', window.getComputedStyle($this.get(0), null).height.replace('px', ''));
                        }
                    }
                });
            });
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    circular: function (el, data) {
        let widgetName = 'Progress Circular';

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetify-progress-circular';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%; display: flex; justify-content: center;">
                <v-progress-circular
                    :value="value"
                    :size="size"                    
                    width="${myMdwHelper.getNumberFromData(data.progressCircularWidth, 4)}"
                    rotate="${myMdwHelper.getNumberFromData(data.progressCircularRotate, 0)}"
                    :indeterminate="indeterminate"
                    >
                    ${myMdwHelper.getBooleanFromData(data.showValueLabel, true) ? '<div class="materialdesign-vuetify-progress-circular-value-label"></div>' : ''}                    
                </v-progress-circular>
            `);

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, widgetName, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, widgetName, function () {
                    let width = window.getComputedStyle($this.get(0), null).width.replace('px', '');
                    let height = window.getComputedStyle($this.get(0), null).height.replace('px', '');

                    let size = width;
                    if (parseInt(height) < parseInt(width)) {
                        size = height;
                    }

                    Vue.use(VueTheMask);
                    let vueProgressCircular = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = {
                                indeterminate: myMdwHelper.getBooleanFromData(data.progressIndeterminate, false),
                            };

                            let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                            dataObj.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-circular-progress-color", '.materialdesign-vuetify-progress-circular-value-label');
                            dataObj.size = myMdwHelper.getNumberFromData(data.progressCircularSize, size);

                            return dataObj;
                        },
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueProgressCircular.value = vis.binds.materialdesign.progress.getProgressState($this, data, newVal, "--vue-progress-circular-progress-color", '.materialdesign-vuetify-progress-circular-value-label');
                    });

                    $(document).on("mdwSubscribe", function (e, oids) {
                        if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                            setLayout();
                        }
                    });

                    vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                        setLayout();
                    });

                    vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                        setLayout();
                    });

                    setLayout();
                    function setLayout() {
                        $this.get(0).style.setProperty("--vue-progress-circular-progress-color-background", myMdwHelper.getValueFromData(data.colorProgressBackground, ''));
                        $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text", myMdwHelper.getValueFromData(data.textColor, ''));
                        $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text-size", myMdwHelper.getNumberFromData(data.textFontSize, 12) + 'px');
                        $this.get(0).style.setProperty("--vue-progress-circular-progress-color-text-font-family", myMdwHelper.getValueFromData(data.textFontFamily, 'inherit'));

                        $this.find(`.v-progress-circular__underlay`).attr('fill', myMdwHelper.getValueFromData(data.innerColor, 'transparent'))

                        let val = myMdwHelper.getNumberFromData(vis.states.attr(data.oid + '.val'), 0);
                        vueProgressCircular.value = vis.binds.materialdesign.progress.getProgressState($this, data, val, "--vue-progress-circular-progress-color", '.materialdesign-vuetify-progress-circular-value-label');
                    }
                });
            });
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getProgressState: function ($this, data, val, colorProperty, labelClass, widgetName) {
        try {
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

            if (myMdwHelper.getBooleanFromData(data.showValueLabel, true)) {
                if (myMdwHelper.getValueFromData(data.valueLabelStyle, "progressPercent") === 'progressPercent') {
                    $this.find(labelClass).html(`${myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))} %`);
                } else if (myMdwHelper.getValueFromData(data.valueLabelStyle, "progressPercent") === 'progressValue') {
                    $this.find(labelClass).html(`${myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))}${myMdwHelper.getValueFromData(data.valueLabelUnit, '')}`);
                } else {
                    $this.find(labelClass).html(`${myMdwHelper.getValueFromData(data.valueLabelCustom, '').replace('[#value]', myMdwHelper.formatNumber(val, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0))).replace('[#percent]', myMdwHelper.formatNumber(valPercent, 0, myMdwHelper.getNumberFromData(data.valueMaxDecimals, 0)))}`);
                }
            }

            if (!myMdwHelper.getBooleanFromData(data.progressIndeterminate, false)) {
                if (myMdwHelper.getBooleanFromData(data.invertValue, false)) {
                    return simRange - valPercent;
                } else {
                    return valPercent;
                }
            } else {
                return 0;
            }

        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] getProgressState: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId, type) {
        if (type === this.types.linear) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                reverse: obj.reverse,
                invertValue: obj.invertValue,
                debug: obj.debug,

                // layout
                progressRounded: obj.progressRounded,
                progressIndeterminate: obj.progressIndeterminate,
                progressRotate: obj.progressRotate,

                // group_layoutStriped
                progressStriped: obj.progressStriped,
                progressStripedColor: obj.progressStripedColor,
                stripAngle: obj.stripAngle,
                stipWidth1: obj.stipWidth1,
                stipWidth2: obj.stipWidth2,
                stipWidth3: obj.stipWidth3,

                // colors
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,

                // labeling
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustom: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily,
                textAlign: obj.textAlign,
            }
        } else {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                progressIndeterminate: obj.progressIndeterminate,
                generateHtmlControl: obj.generateHtmlControl,
                debug: obj.debug,

                // layout
                progressCircularSize: obj.progressCircularSize,
                progressCircularWidth: obj.progressCircularWidth,
                progressCircularRotate: obj.progressCircularRotate,

                // colors
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                innerColor: obj.innerColor,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,

                // labeling
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
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '100%';

            delete widgetData.width;
            delete widgetData.height;

            let mdwData = myMdwHelper.getHtmlmdwData('',
                vis.binds.materialdesign.progress.getDataFromJson(widgetData, 0, vis.binds.materialdesign.progress.types[type]))

            html = `<div class='vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative; padding: 0px;'` + '\n' +
                '\t' + `mdw-type='${type}'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Progress: getHtmlConstructor - ${type}] error: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-progress-html-element", function () {
    let $this = $(this);
    let type = $this.attr('mdw-type');
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Progress HTML Element - ${parentId.replace('w', 'p')} - ${type}]`;

    try {
        let widgetName = `Progress HTML Element '${type}'`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Progress HTML Element - ${parentId.replace('w', 'p')} - ${type}]`;

        if (debug) console.log(`${logPrefix} initialize html element from type '${type}'`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.progress.getDataFromJson({}, parentId, vis.binds.materialdesign.progress.types[type]),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);

            if (type === vis.binds.materialdesign.progress.types.linear) {
                vis.binds.materialdesign.progress.linear($this, widgetData);
            }

            if (type === vis.binds.materialdesign.progress.types.circular) {
                vis.binds.materialdesign.progress.circular($this, widgetData);
            }
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});