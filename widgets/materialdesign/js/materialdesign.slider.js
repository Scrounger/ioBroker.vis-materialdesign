/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.12"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.slider = {
    vertical: function (el, data) {
        try {
            let $this = $(el);

            $this.html(`
            <div class="slider" id="blaaaa" style="height: 100%;">
                <v-app id="inspire" style="height: 100%;">
                    <v-slider id="slider"
                        v-model="value"
                        vertical
                        track-fill-color="${getValueFromData(data.colorBeforeThumb, '#44739e')}"
                        thumb-color="${getValueFromData(data.colorThumb, '#44739e')}"
                        track-color="${getValueFromData(data.colorAfterThumb, 'rgba(161, 161, 161, 0.26)')}"
                        thumb-label                        
                        @change="changeEvent"
                    >
                    </v-slider>
                </v-app>
          </div>`);

            setTimeout(function () {
                let vueSlider = new Vue({
                    el: $this.find('#blaaaa').get(0),
                    vuetify: new Vuetify(),
                    data() {
                        return {
                            value: vis.states.attr(data.oid + '.val'),
                        }
                    },
                    methods: {
                        changeEvent(a) {
                            vis.setValue(data.oid, this.value);
                        }
                    }
                })

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