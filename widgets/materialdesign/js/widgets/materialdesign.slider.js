/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.50"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.slider = {
    vuetifySlider: function (el, data) {
        try {
            let $this = $(el);
            let workingId = $this.attr('data-oid-working');
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
                        ${(myMdwHelper.getValueFromData(data.prepandText, null) !== null) ? `label="${data.prepandText}"` : ''}
                        ${(data.readOnly) ? 'disabled' : ''}
                        @change="changeEvent"
                        @input="inputEvent"
                    >
                    </v-slider>
                    ${(data.showValueLabel) ? `<span class="slider-value" style="width: ${myMdwHelper.getNumberFromData(data.valueLabelWidth, 0)}px; text-align:right; white-space: nowrap;">0</span>` : ''}
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

            myMdwHelper.waitForElement($this, '.materialdesign-vuetifySlider', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {
                    // wait for Vuetify v-app application container is loaded

                    let vueSlider = new Vue({
                        el: $this.find('.materialdesign-vuetifySlider').get(0),
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
                        myMdwHelper.vibrate(data.vibrateOnMobilDevices);
                    });

                    // calculate width / height of Element
                    if (myMdwHelper.getValueFromData(data.orientation, 'horizontal') === 'vertical') {
                        let height = window.getComputedStyle($this.context, null).height.replace('px', '');

                        let sliderEl = $this.find('.v-slider--vertical');
                        height = height - sliderEl.css('margin-top').replace('px', '') - sliderEl.css('margin-bottom').replace('px', '')
                        sliderEl.css('height', height + 'px');
                    }

                    $this.context.style.setProperty("--vue-slider-thumb-label-font-color", myMdwHelper.getValueFromData(data.thumbFontColor, ''));
                    $this.context.style.setProperty("--vue-slider-thumb-label-font-family", myMdwHelper.getValueFromData(data.thumbFontFamily, ''));
                    $this.context.style.setProperty("--vue-slider-thumb-label-font-size", myMdwHelper.getValueFromData(data.thumbFontSize, '12', '', 'px'));
                    $this.find('.v-slider__thumb-label').css('background-color', myMdwHelper.getValueFromData(data.thumbBackgroundColor, myMdwHelper.getValueFromData(data.colorThumb, defaultColor)));

                    $this.context.style.setProperty("--vue-slider-tick-before-color", myMdwHelper.getValueFromData(data.tickColorBefore, ''));
                    $this.context.style.setProperty("--vue-slider-tick-after-color", myMdwHelper.getValueFromData(data.tickColorAfter, ''));

                    $this.context.style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.prepandTextColor, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.prepandTextFontFamily, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.prepandTextFontSize, '16') + 'px');

                    $this.context.style.setProperty("--vue-text-field-label-width", myMdwHelper.getStringFromNumberData(data.prepandTextWidth, 'inherit', '', 'px'));

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
            console.error(`[Vuetify Slider]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcSlider: function (el, data, discrete = false) {
        try {
            let $this = $(el);

            let min = myMdwHelper.getValueFromData(data.min, 0);
            let labelMin = myMdwHelper.getValueFromData(data.valueLabelMin, null);
            let max = myMdwHelper.getValueFromData(data.max, 1);
            let labelMax = myMdwHelper.getValueFromData(data.valueLabelMax, null);
            let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = myMdwHelper.getValueFromData(data.valueLessThan, min);
            let textForValueLessThan = myMdwHelper.getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = myMdwHelper.getValueFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = myMdwHelper.getValueFromData(data.textForValueGreaterThan, null);

            let showMarker = '';
            if (data.showMarkers === 'true' || data.showMarkers === true) {
                showMarker = 'mdc-slider--display-markers';
            }

            setTimeout(function () {
                let valueOnLoading = vis.states.attr(data.oid + '.val');

                // Slider Attributes für Initialisierung ermitteln
                let pctComplete = (valueOnLoading - data.min) / (data.max - data.min);
                let sliderWidth = window.getComputedStyle($this.context, null).width.replace('px', '');

                let labelWitdh = 0;
                if (data.showValueLabel === true || data.showValueLabel === 'true') {
                    labelWitdh = data.valueLabelWidth;
                }

                let translatePx = (sliderWidth - labelWitdh) * pctComplete;

                // Slider Element dynamisch erzeugen
                let sliderConstructor = '';
                if (!discrete) {
                    sliderConstructor =
                        `<span style="color:red"><b>Will be removed in next Version! Please use the new slider!</b></span>
                        <div class="mdc-slider" tabindex="0" role="slider" style="<%= colorSlider %>" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                            <div class="mdc-slider__track-container">
                                <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            </div>
                            <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                                <svg class="mdc-slider__thumb" width="21" height="21">
                                    <circle cx="10.5" cy="10.5" r="7.875"></circle>
                                </svg>
                                <div class="mdc-slider__focus-ring"></div>
                            </div>
                        </div>`;
                } else {
                    sliderConstructor =
                        `<span style="color:red"><b>Will be removed in next Version! Please use the new slider!</b></span>
                        <div class="mdc-slider mdc-slider--discrete ${showMarker}" tabindex="0" role="slider" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                        <div class="mdc-slider__track-container">
                            <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            <div class="mdc-slider__track-marker-container"></div>
                        </div>
                        <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                            <div class="mdc-slider__pin">
                                <span class="mdc-slider__pin-value-marker"></span>
                            </div>
                            <svg class="mdc-slider__thumb" width="21" height="21">
                                <circle cx="10.5" cy="10.5" r="7.875"></circle>
                            </svg>
                            <div class="mdc-slider__focus-ring"></div>
                        </div>
                    </div>`;
                }

                if (labelWitdh > 0) {
                    sliderConstructor = sliderConstructor +
                        `<span class="labelValue" style="width: ${labelWitdh}px; text-align: right;">${valueOnLoading} ${unit}</span>`;
                }

                // Slider hinzufügen
                $this.html(`<div class="materialdesign vis-widget-body" style="display: flex; justify-content: center; align-items: center;">
                                ${sliderConstructor}
                            </div>`);

                // Slider Control
                let sliderElement = $this.find('.mdc-slider').get(0);

                // Colors
                sliderElement.style.setProperty("--materialdesign-color-slider-before-thumb", myMdwHelper.getValueFromData(data.colorBeforeThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-thumb", myMdwHelper.getValueFromData(data.colorThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-after-thumb", myMdwHelper.getValueFromData(data.colorAfterThumb, ''));
                sliderElement.style.setProperty("--materialdesign-color-slider-track-marker", myMdwHelper.getValueFromData(data.colorTrackMarker, ''));

                if (data.knobSize === 'knobMedium') {
                    $this.find('.mdc-slider__thumb').attr('width', '31').attr('height', '31').css('margin-left', '-5px').css('margin-top', '-5px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-5px');
                    $this.find('circle').attr('cx', '15.5').attr('cy', '15.5').attr('r', '11.8125');
                } else if (data.knobSize === 'knobBig') {
                    $this.find('.mdc-slider__thumb').attr('width', '42').attr('height', '42').css('margin-left', '-10px').css('margin-top', '-10px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-7px');
                    $this.find('circle').attr('cx', '21').attr('cy', '21').attr('r', '15.75');
                }

                if (!vis.editMode) {
                    const mdcSlider = new mdc.slider.MDCSlider(sliderElement);

                    // Slider Initialiserung setzen
                    setSliderState();

                    // Slider user input -> Wert übergeben
                    mdcSlider.listen('MDCSlider:change', function () {
                        vis.setValue(data.oid, mdcSlider.value);
                    });

                    mdcSlider.listen('MDCSlider:input', function () {
                        setSliderState(false, mdcSlider.value);
                    });

                    $this.find('.mdc-slider').on('touchstart mousedown', function (e) {
                        e.preventDefault();
                        vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    vis.states.bind(data.wid + '.val', function (e, newVal, oldVal) {
                        if (!newVal) {
                            setSliderState();
                        }
                    });

                    function setSliderState(setVisValue = true, val = 0) {
                        if (!vis.states.attr(data.wid + '.val')) {
                            if (setVisValue) {
                                val = vis.states.attr(data.oid + '.val');
                                mdcSlider.value = val;
                            }

                            if (val <= min && labelMin != null) {
                                $this.find('.labelValue').html(labelMin);
                            } else if (val > min && val <= valueLessThan && textForValueLessThan != null) {
                                $this.find('.labelValue').html(textForValueLessThan);
                            } else if (val >= valueGreaterThan && val < max && textForValueGreaterThan != null) {
                                $this.find('.labelValue').html(textForValueGreaterThan);
                            } else if (val >= max && labelMax != null) {
                                $this.find('.labelValue').html(labelMax);
                            } else {
                                $this.find('.labelValue').html(`${val} ${unit}`);
                            }
                        }
                    }
                }
            }, data.initDelay);
        } catch (ex) {
            console.error(`[MDC Slider]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};