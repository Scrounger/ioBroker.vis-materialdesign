/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.37"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input =
    function (el, data) {
        try {
            let $this = $(el);

            let layout = (myMdwHelper.getValueFromData(data.inputLayout, 'regular') === 'regular') ? '' : data.inputLayout;

            $this.append(`
            <div class="materialdesign-vuetifyTextField" style="width: 100%; height: 100%;">
                    <v-text-field
                        ${layout}
                        :value="value"
                        :height="height"
                        label="${myMdwHelper.getValueFromData(data.inputLabelText, '')}"

                        prefix="$"
                        suffix="lbs"
                        @change="changeEvent"
                        messages="Hallo"
                        :rules="[rules.required, rules.counter]"
                        counter
                        maxlength="20"
  
                    >
                    </v-text-field>
            </div>`);

            //type: date, time, number

            myMdwHelper.waitForElement($this, '.materialdesign-vuetifyTextField', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    let vueTextField = new Vue({
                        el: $this.find('.materialdesign-vuetifyTextField').get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return {
                                value: vis.states.attr(data.oid + '.val'),
                                height: widgetHeight,
                                rules: {
                                    required: value => !!value || 'Required.',
                                    counter: value => value.length <= 20 || 'Max 20 characters',
                                }
                            }
                        },
                        methods: {
                            changeEvent(value) {
                                vis.setValue(data.oid, value);
                            },
                        }
                    });

                    if (layout !== 'filled') {
                        //TODO: background color data hinzufügen
                        $this.context.style.setProperty("--vue-text-field-background-color", 'transparent');
                        $this.context.style.setProperty("--vue-text-field-background-hover-color", 'transparent');
                    }

                    // Input Label style
                    $this.context.style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.inputLabelColor, ''));
                    $this.context.style.setProperty("--vue-text-field-label-after-color", myMdwHelper.getValueFromData(data.inputLabelColorSelected, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.inputLabelFontFamily, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.inputLabelFontSize, '16') + 'px');

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = newVal;
                    });
                });
            });

        } catch (ex) {
            console.exception(`[Vuetify Input]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };