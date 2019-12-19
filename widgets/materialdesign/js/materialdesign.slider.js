/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.15"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.slider = {
    vertical: function (el, data) {
        try {
            let $this = $(el);
            let defaultColor = '#44739e'

            $this.append(`
            <div class="vuetifySlider">
                <v-app id="vuetifyContainer">
                    <v-slider
                        v-model="value"
                        :vertical="vertical"
                        :min="min"
                        :max="max"
                        :step="step"
                        :ticks="ticks"
                        :tick-size="tickSize"
                        :thumb-label="thumbLabel"
                        :thumb-size="thumbSize"
                        :loader-height="loaderHeight"
                        :track-fill-color="trackFillColor"
                        :thumb-color="thumbColor"
                        :track-color="trackColor"                        
                        always-dirty
                        @change="changeEvent"
                    >
                    </v-slider>
                </v-app>
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

            setTimeout(function () {
                let vueSlider = new Vue({
                    el: $this.find('.vuetifySlider').get(0),
                    vuetify: new Vuetify(),
                    data() {
                        return {
                            value: vis.states.attr(data.oid + '.val'),
                            vertical: (getValueFromData(data.orientation, 'horizontal') === 'horizontal') ? false : true,
                            min: getNumberFromData(data.min, 0),
                            max: getNumberFromData(data.max, 100),
                            step: getNumberFromData(data.step, 1),
                            ticks: showTicks,
                            tickSize: getNumberFromData(data.tickSize, 1),
                            thumbLabel: showThumbLabel,
                            thumbSize: getNumberFromData(data.thumbSize, 32),
                            loaderHeight: '30px',
                            trackFillColor: getValueFromData(data.colorBeforeThumb, defaultColor),
                            thumbColor: getValueFromData(data.colorThumb, defaultColor),
                            trackColor: getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)'),
                        }
                    },
                    methods: {
                        changeEvent(a) {
                            vis.setValue(data.oid, this.value);
                        }
                    }
                })

                // calculate height of Element
                if (getValueFromData(data.orientation, 'horizontal') === 'vertical') {
                    let height = window.getComputedStyle($this.context, null).height.replace('px', '');
                    let sliderEl = $this.find('.v-slider--vertical');

                    height = height - sliderEl.css('margin-top').replace('px', '') - sliderEl.css('margin-bottom').replace('px', '')
                    sliderEl.css('height', height + 'px');
                }


                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setSliderState();
                });

                vis.states.bind(data.wid + '.val', function (e, newVal, oldVal) {
                    setSliderState();
                });

                function setSliderState(setVisValue = true, val = 0) {
                    if (!vis.states.attr(data.wid + '.val')) {
                        if (setVisValue) {
                            val = vis.states.attr(data.oid + '.val');
                            vueSlider.value = val;
                        }
                    }
                }
            }, 1)
        } catch (ex) {
            console.exception(`vertical: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};