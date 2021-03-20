/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.slider = {
    vuetifySlider: function (el, data) {
        let widgetName = 'Slider';

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-vuetifySlider';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            let workingId = data["oid-working"];
            let defaultColor = '#44739e'

            let min = myMdwHelper.getValueFromData(data.min, 0);
            let labelMin = myMdwHelper.getValueFromData(data.valueLabelMin, null);
            let max = myMdwHelper.getValueFromData(data.max, 100);
            let labelMax = myMdwHelper.getValueFromData(data.valueLabelMax, null);
            let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = myMdwHelper.getValueFromData(data.valueLessThan, min);
            let textForValueLessThan = myMdwHelper.getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = myMdwHelper.getValueFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = myMdwHelper.getValueFromData(data.textForValueGreaterThan, null);

            $this.append(`
                    <div class="${containerClass}" style="width: 100%; height: 100%;">
                        <div class="v-row">
                            <v-slider
                                v-model="value"
                                :vertical="vertical"
                                :min="min"
                                :max="max"
                                :step="step"
                                :ticks="ticks"
                                :tick-size="tickSize"
                                :tick-labels="tickLabels"
                                :thumb-label="thumbLabel"
                                :thumb-size="thumbSize"
                                :loader-height="loaderHeight"
                                :track-fill-color="trackFillColor"
                                :thumb-color="thumbColor"
                                :track-color="trackColor"                        
                                always-dirty
                                hide-details
                                ${(myMdwHelper.getValueFromData(data.prepandText, null) !== null) ? `label="${data.prepandText}"` : ''}
                                ${(data.readOnly) ? 'disabled' : ''}
                                @change="changeEvent"
                                @input="inputEvent"
                            >
                            </v-slider>
                            ${(data.showValueLabel) ? `<span class="slider-value" style="width: ${myMdwHelper.getNumberFromData(data.valueLabelWidth, 0)}px; color: ${myMdwHelper.getValueFromData(data.valueLabelColor, defaultColor)}; font-family: ${myMdwHelper.getValueFromData(data.valueFontFamily, '')}; font-size: ${myMdwHelper.getStringFromNumberData(data.valueFontSize, 'inherit', '', 'px')}; text-align:right; white-space: nowrap;">0</span>` : ''}
                        </div>
                    </div>`);

            let showTicks = false;
            if (myMdwHelper.getValueFromData(data.showTicks, 'no') === 'yes') {
                showTicks = true;
            }
            if (myMdwHelper.getValueFromData(data.showTicks, 'no') === 'always') {
                showTicks = 'always';
            }

            let showThumbLabel = false;
            if (myMdwHelper.getValueFromData(data.showThumbLabel, 'no') === 'yes') {
                showThumbLabel = true;
            }
            if (myMdwHelper.getValueFromData(data.showThumbLabel, 'no') === 'always') {
                showThumbLabel = 'always';
            }

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, widgetName, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, widgetName, function () {
                    // wait for Vuetify v-app application container is loaded
                    let vueSlider = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify({ rtl: data.reverseSlider }),
                        data() {
                            return {
                                value: vis.states.attr(data.oid + '.val'),
                                vertical: (myMdwHelper.getValueFromData(data.orientation, 'horizontal') === 'horizontal') ? false : true,
                                min: min,
                                max: max,
                                step: myMdwHelper.getNumberFromData(data.step, 1),
                                ticks: showTicks,
                                tickSize: myMdwHelper.getNumberFromData(data.tickSize, 1),
                                tickLabels: (myMdwHelper.getValueFromData(data.tickLabels, null) !== null) ? data.tickLabels.split(',') : [],
                                thumbLabel: showThumbLabel,
                                thumbSize: myMdwHelper.getNumberFromData(data.thumbSize, 32),
                                loaderHeight: '30px',
                                trackFillColor: myMdwHelper.getValueFromData(data.colorBeforeThumb, defaultColor),
                                thumbColor: myMdwHelper.getValueFromData(data.colorThumb, defaultColor),
                                trackColor: myMdwHelper.getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)'),
                            }
                        },
                        mounted: function () {
                            //setSliderState();
                        },
                        methods: {
                            changeEvent(value) {
                                if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {
                                    myMdwHelper.setValue(data.oid, value);
                                }
                                setSliderState();
                            },
                            inputEvent(value) {
                                setSliderState(false, value);
                            },
                        }
                    })

                    $this.find(`.${containerClass}`).on('touchstart mousedown', function () {
                        myMdwHelper.vibrate(data.vibrateOnMobilDevices);
                    });

                    // calculate width / height of Element
                    if (myMdwHelper.getValueFromData(data.orientation, 'horizontal') === 'vertical') {
                        let height = window.getComputedStyle($this.context, null).height.replace('px', '');

                        let sliderEl = $this.find('.v-slider--vertical');
                        height = height - sliderEl.css('margin-top').replace('px', '') - sliderEl.css('margin-bottom').replace('px', '')
                        sliderEl.css('height', height + 'px');
                    }

                    //bug fix wegen 'div.row div'
                    $this.find('.v-slider__thumb-container').css('height', '0px')

                    if (data.knobSize === 'knobMedium') {
                        $this.find('.v-slider__thumb').addClass('medium-size');
                    }

                    if (data.knobSize === 'knobBig') {
                        $this.find('.v-slider__thumb').addClass('big-size');
                    }

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    vis.states.bind(workingId + '.val', function (e, newVal, oldVal) {
                        setSliderState();
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
                        $this.find('.v-slider__thumb').css('background-color', myMdwHelper.getValueFromData(data.colorThumb, defaultColor)).css('border-color', myMdwHelper.getValueFromData(data.colorThumb, defaultColor));
                        $this.find('.v-slider__track-fill').css('background-color', myMdwHelper.getValueFromData(data.colorBeforeThumb, defaultColor)).css('border-color', myMdwHelper.getValueFromData(data.colorBeforeThumb, defaultColor));
                        $this.find('.v-slider__track-background').css('background-color', myMdwHelper.getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)')).css('border-color', myMdwHelper.getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)'));
                        $this.context.style.setProperty("--vue-slider-thumb-before", myMdwHelper.getValueFromData(data.colorThumb, defaultColor));

                        $this.find('.slider-value').css('color', myMdwHelper.getValueFromData(data.valueLabelColor, defaultColor))
                            .css('font-family', myMdwHelper.getValueFromData(data.valueFontFamily, ''))
                            .css('font-size', myMdwHelper.getStringFromNumberData(data.valueFontSize, 'inherit', '', 'px'));

                        $this.context.style.setProperty("--vue-slider-thumb-label-font-color", myMdwHelper.getValueFromData(data.thumbFontColor, ''));
                        $this.context.style.setProperty("--vue-slider-thumb-label-font-family", myMdwHelper.getValueFromData(data.thumbFontFamily, ''));
                        $this.context.style.setProperty("--vue-slider-thumb-label-font-size", myMdwHelper.getNumberFromData(data.thumbFontSize, 12) + 'px');
                        $this.find('.v-slider__thumb-label').css('background-color', myMdwHelper.getValueFromData(data.thumbBackgroundColor, myMdwHelper.getValueFromData(data.colorThumb, defaultColor)));

                        $this.context.style.setProperty("--vue-slider-tick-before-color", myMdwHelper.getValueFromData(data.tickColorBefore, ''));
                        $this.context.style.setProperty("--vue-slider-tick-after-color", myMdwHelper.getValueFromData(data.tickColorAfter, ''));
                        $this.context.style.setProperty("--vue-slider-tick-color", myMdwHelper.getValueFromData(data.tickTextColor, ''));
                        $this.context.style.setProperty("--vue-slider-tick-font-family", myMdwHelper.getValueFromData(data.tickFontFamily, ''));

                        $this.context.style.setProperty("--vue-slider-tick-font-size", myMdwHelper.getStringFromNumberData(data.tickFontSize, 'inherit', '', 'px'));

                        $this.context.style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.prepandTextColor, ''));
                        $this.context.style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.prepandTextFontFamily, 'inherit'));

                        $this.context.style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.prepandTextFontSize, 16) + 'px');

                        $this.context.style.setProperty("--vue-text-field-label-width", myMdwHelper.getStringFromNumberData(data.prepandTextWidth, 'inherit', '', 'px'));

                        // Slider Initialiserung setzen
                        setSliderState();
                    }

                    function setSliderState(setVisValue = true, val = 0) {
                        if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {
                            if (setVisValue) {
                                val = vis.states.attr(data.oid + '.val');
                                vueSlider.value = val;
                            }

                            let valPercent = parseFloat(val);

                            if (isNaN(valPercent)) valPercent = min;
                            if (valPercent < min) valPercent = min;
                            if (valPercent > max) valPercent = max;

                            let simRange = 100;
                            let range = max - min;
                            let factor = simRange / range;
                            valPercent = Math.floor((valPercent - min) * factor);

                            if (val <= min && labelMin != null) {
                                $this.find('.slider-value').html(labelMin);
                                if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(labelMin);
                            } else if (val > min && val <= valueLessThan && textForValueLessThan != null) {
                                $this.find('.slider-value').html(textForValueLessThan);
                                if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(textForValueLessThan);
                            } else if (val >= valueGreaterThan && val < max && textForValueGreaterThan != null) {
                                $this.find('.slider-value').html(textForValueGreaterThan);
                                if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(textForValueGreaterThan);
                            } else if (val >= max && labelMax != null) {
                                $this.find('.slider-value').html(labelMax);
                                if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(labelMax);
                            } else {

                                if (myMdwHelper.getValueFromData(data.valueLabelStyle, "sliderValue") === 'sliderValue') {
                                    $this.find('.slider-value').html(`${val} ${unit}`);
                                    if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(`${val} ${unit}`);
                                } else {
                                    $this.find('.slider-value').html(`${valPercent} %`);
                                    if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(`${valPercent} %`);
                                }
                            }
                        }
                    }
                });
            });
        } catch (ex) {
            console.error(`[${widgetName} ${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Common
            oid: obj.oid,
            "oid-working": obj["oid-working"],
            orientation: obj.orientation,
            reverseSlider: obj.reverseSlider,
            knobSize: obj.knobSize,
            readOnly: obj.readOnly,
            min: obj.min,
            max: obj.max,
            step: obj.step,
            vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
            generateHtmlControl: obj.generateHtmlControl,
            debug: obj.debug,

            // steps Layout
            showTicks: obj.showTicks,
            tickSize: obj.tickSize,
            tickLabels: obj.tickLabels,
            tickTextColor: obj.tickTextColor,
            tickFontFamily: obj.tickFontFamily,
            tickFontSize: obj.tickFontSize,
            tickColorBefore: obj.tickColorBefore,
            tickColorAfter: obj.tickColorAfter,

            // colors
            colorBeforeThumb: obj.colorBeforeThumb,
            colorThumb: obj.colorThumb,
            colorAfterThumb: obj.colorAfterThumb,

            // labeling
            prepandText: obj.prepandText,
            prepandTextWidth: obj.prepandTextWidth,
            prepandTextColor: obj.prepandTextColor,
            prepandTextFontSize: obj.prepandTextFontSize,
            prepandTextFontFamily: obj.prepandTextFontFamily,
            showValueLabel: obj.showValueLabel,
            valueLabelStyle: obj.valueLabelStyle,
            valueLabelUnit: obj.valueLabelUnit,
            valueFontFamily: obj.valueFontFamily,
            valueFontSize: obj.valueFontSize,
            valueLabelColor: obj.valueLabelColor,
            valueLabelMin: obj.valueLabelMin,
            valueLabelMax: obj.valueLabelMax,
            valueLessThan: obj.valueLessThan,
            textForValueLessThan: obj.textForValueLessThan,
            valueGreaterThan: obj.valueGreaterThan,
            textForValueGreaterThan: obj.textForValueGreaterThan,
            valueLabelWidth: obj.valueLabelWidth,

            // layout of the controller label
            showThumbLabel: obj.showThumbLabel,
            thumbSize: obj.thumbSize,
            thumbBackgroundColor: obj.thumbBackgroundColor,
            thumbFontColor: obj.thumbFontColor,
            thumbFontSize: obj.thumbFontSize,
            thumbFontFamily: obj.thumbFontFamily,
            useLabelRules: obj.useLabelRules
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
                vis.binds.materialdesign.slider.getDataFromJson(widgetData, 0));

            html = `<div class='vis-widget materialdesign-widget materialdesign-slider-vertical materialdesign-slider-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative; overflow:visible !important; display: flex; align-items: center;'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Slider getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-slider-html-element", function () {
    let $this = $(this);
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Slider HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `Slider HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Slider HTML Element - ${parentId.replace('w', 'p')}]`;

        if (debug) console.log(`${logPrefix} initialize html element`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.slider.getDataFromJson({}, parentId),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);

            vis.binds.materialdesign.slider.vuetifySlider($this, widgetData);
        }

    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});