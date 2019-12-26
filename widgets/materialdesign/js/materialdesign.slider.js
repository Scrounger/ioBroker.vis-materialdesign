/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.21"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.slider =
    function (el, data) {
        try {
            let $this = $(el);
            let workingId = $this.attr('data-oid-working');
            let myHelper = vis.binds.materialdesign.helper;
            let defaultColor = '#44739e'

            let min = getValueFromData(data.min, 0);
            let labelMin = getValueFromData(data.valueLabelMin, null);
            let max = getValueFromData(data.max, 100);
            let labelMax = getValueFromData(data.valueLabelMax, null);
            let unit = getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = getValueFromData(data.valueLessThan, min);
            let textForValueLessThan = getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = getValueFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = getValueFromData(data.textForValueGreaterThan, null);

            $this.append(`
            <div class="materialdesign-vuetifySlider" style="width: 100%; height: 100%;">
                <div class="v-row" style="align-items: center">
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
                        ${(getValueFromData(data.prepandText, null) !== null) ? `label="${data.prepandText}"` : ''}
                        ${(data.readOnly) ? 'disabled' : ''}
                        @change="changeEvent"
                        @input="inputEvent"
                    >
                    </v-slider>
                    ${(data.showValueLabel) ? `<span class="slider-value" style="width: ${getNumberFromData(data.valueLabelWidth, 0)}px; text-align:right; white-space: nowrap;">0</span>` : ''}
                </div>
            </div>`);

            let showTicks = false;
            if (getValueFromData(data.showTicks, 'no') === 'yes') {
                showTicks = true;
            }
            if (getValueFromData(data.showTicks, 'no') === 'always') {
                showTicks = 'always';
            }

            let showThumbLabel = false;
            if (getValueFromData(data.showThumbLabel, 'no') === 'yes') {
                showThumbLabel = true;
            }
            if (getValueFromData(data.showThumbLabel, 'no') === 'always') {
                showThumbLabel = 'always';
            }

            myHelper.waitForElement($this, '.materialdesign-vuetifySlider', function () {
                // Wait until element is loaded
                if ($("#materialdesign-vuetify-container").length === 0) {
                    // intitialize Vuetify v-app application container, if not exist
                    $("#vis_container").wrapInner('<v-app id="materialdesign-vuetify-container" data-app="true" />');
                    console.log('initialize vuetify v-app application container');
                }

                myHelper.waitForElement($("#vis_container"), '#materialdesign-vuetify-container', function () {
                    // wait for Vuetify v-app application container is loaded

                    let vueSlider = new Vue({
                        el: $this.find('.materialdesign-vuetifySlider').get(0),
                        vuetify: new Vuetify({rtl: data.reverseSlider}),
                        data() {
                            return {
                                value: vis.states.attr(data.oid + '.val'),
                                vertical: (getValueFromData(data.orientation, 'horizontal') === 'horizontal') ? false : true,
                                min: min,
                                max: max,
                                step: getNumberFromData(data.step, 1),
                                ticks: showTicks,
                                tickSize: getNumberFromData(data.tickSize, 1),
                                tickLabels: (getValueFromData(data.tickLabels, null) !== null) ? data.tickLabels.split(',') : [],
                                thumbLabel: showThumbLabel,
                                thumbSize: getNumberFromData(data.thumbSize, 32),
                                loaderHeight: '30px',
                                trackFillColor: getValueFromData(data.colorBeforeThumb, defaultColor),
                                thumbColor: getValueFromData(data.colorThumb, defaultColor),
                                trackColor: getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)'),
                            }
                        },
                        mounted: function () {
                            //setSliderState();
                        },
                        methods: {
                            changeEvent(value) {
                                if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {
                                    vis.setValue(data.oid, value);
                                }
                                setSliderState();
                            },
                            inputEvent(value) {
                                setSliderState(false, value);
                            },
                        }
                    })

                    $this.find('.materialdesign-vuetifySlider').on('touchstart mousedown', function () {
                        myHelper.vibrate(data.vibrateOnMobilDevices);
                    });

                    // calculate width / height of Element
                    if (getValueFromData(data.orientation, 'horizontal') === 'vertical') {
                        let height = window.getComputedStyle($this.context, null).height.replace('px', '');

                        let sliderEl = $this.find('.v-slider--vertical');
                        height = height - sliderEl.css('margin-top').replace('px', '') - sliderEl.css('margin-bottom').replace('px', '')
                        sliderEl.css('height', height + 'px');
                    }

                    $this.context.style.setProperty("--vue-slider-thumb-label-font-color", getValueFromData(data.thumbFontColor, ''));
                    $this.context.style.setProperty("--vue-slider-thumb-label-font-family", getValueFromData(data.thumbFontFamily, ''));
                    $this.context.style.setProperty("--vue-slider-thumb-label-font-size", getValueFromData(data.thumbFontSize, '12', '', 'px'));
                    $this.find('.v-slider__thumb-label').css('background-color', getValueFromData(data.thumbBackgroundColor, getValueFromData(data.colorThumb, defaultColor)));

                    $this.context.style.setProperty("--vue-slider-tick-before-color", getValueFromData(data.tickColorBefore, ''));
                    $this.context.style.setProperty("--vue-slider-tick-after-color", getValueFromData(data.tickColorAfter, ''));


                    //bug fix wegen 'div.row div'
                    $this.find('.v-slider__thumb-container').css('height', '0px')

                    if (data.knobSize === 'knobMedium') {
                        $this.find('.v-slider__thumb').addClass('medium-size');
                    }

                    if (data.knobSize === 'knobBig') {
                        $this.find('.v-slider__thumb').addClass('big-size');
                    }

                    // Slider Initialiserung setzen
                    setSliderState();

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    vis.states.bind(workingId + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    function setSliderState(setVisValue = true, val = 0) {
                        if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {
                            if (setVisValue) {
                                val = vis.states.attr(data.oid + '.val');
                                vueSlider.value = val;
                            }

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
                                $this.find('.slider-value').html(`${val} ${unit}`);
                                if (data.useLabelRules) $this.find('.v-slider__thumb-label').find('span').html(`${val} ${unit}`);
                            }
                        }
                    }
                });
            });
        } catch (ex) {
            console.exception(`vertical: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };