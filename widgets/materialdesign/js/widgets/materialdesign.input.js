/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.40"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input =
    function (el, data) {
        try {
            let $this = $(el);

            let layout = myMdwHelper.getValueFromData(data.inputLayout, 'regular');
            let shaped = false;
            let rounded = false;

            if (layout === 'regular') {
                layout = '';
            } else if (layout.includes('shaped')) {
                layout = layout.replace('-shaped', '');
                shaped = true;
            } else if (layout.includes('rounded')) {
                layout = layout.replace('-rounded', '');
                rounded = true;
            }

            let inputType = myMdwHelper.getValueFromData(data.inputType, 'text');
            let inputMask = '';
            let placeholder = ''

            if (inputType === 'mask') {
                // mask needs text as input type
                inputType = 'text';
                inputMask = `v-mask="'${myMdwHelper.getValueFromData(data.inputMask, '')}'"`
                placeholder = myMdwHelper.getValueFromData(data.inputMask, '');
            }

            $this.append(`
            <div class="materialdesign-vuetifyTextField" style="width: 100%; height: 100%;">
                    <v-text-field
                        ${layout}
                        ${inputMask}
                        :value="value"
                        :height="height"
                        :label="label"
                        :type="type"
                        :maxlength="maxlength"
                        :hint="messages"
                        :counter="counter"
                        hide-details="auto"
                        :prefix="prefix"
                        :suffix="suffix"
                        :placeholder="placeholder"
                        ${(data.showInputMessageAlways) ? 'persistent-hint' : ''}
                        ${(shaped) ? 'shaped' : ''}
                        ${(rounded) ? 'rounded' : ''}
                        dense
                        
                        @change="changeEvent"
                    >
                    </v-text-field>
            </div>`);

            myMdwHelper.waitForElement($this, '.materialdesign-vuetifyTextField', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');
                    let message = myMdwHelper.getValueFromData(data.inputMessage, '');

                    Vue.use(VueTheMask)

                    let vueTextField = new Vue({
                        el: $this.find('.materialdesign-vuetifyTextField').get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return {
                                value: vis.states.attr(data.oid + '.val'),
                                height: widgetHeight,
                                label: myMdwHelper.getValueFromData(data.inputLabelText, ''),
                                type: inputType,
                                maxlength: myMdwHelper.getNumberFromData(data.inputMaxLength, ''),
                                messages: message,
                                counter: data.showInputCounter,
                                prefix: myMdwHelper.getValueFromData(data.inputPrefix, ''),
                                suffix: myMdwHelper.getValueFromData(data.inputSuffix, ''),
                                placeholder: placeholder,
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
                        $this.context.style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent'));
                        $this.context.style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
                        $this.context.style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
                    } else {
                        $this.context.style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, ''));
                        $this.context.style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
                        $this.context.style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
                    }

                    // Input Label style
                    $this.context.style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.inputLabelColor, ''));
                    $this.context.style.setProperty("--vue-text-field-label-after-color", myMdwHelper.getValueFromData(data.inputLabelColorSelected, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.inputLabelFontFamily, ''));
                    $this.context.style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.inputLabelFontSize, '16') + 'px');

                    // Input style
                    $this.context.style.setProperty("--vue-text-field-input-text-color", myMdwHelper.getValueFromData(data.inputTextColor, ''));
                    $this.context.style.setProperty("--vue-text-field-input-text-font-size", myMdwHelper.getNumberFromData(data.inputTextFontSize, '16') + 'px');
                    $this.context.style.setProperty("--vue-text-field-input-text-font-family", myMdwHelper.getValueFromData(data.inputTextFontFamily, ''));

                    // Appendix style
                    $this.context.style.setProperty("--vue-text-field-appendix-color", myMdwHelper.getValueFromData(data.inputAppendixColor, myMdwHelper.getValueFromData(data.inputTextColor, '')));
                    $this.context.style.setProperty("--vue-text-field-appendix-font-size", myMdwHelper.getNumberFromData(data.inputAppendixFontSize, myMdwHelper.getNumberFromData(data.inputTextFontSize, '16')) + 'px');
                    $this.context.style.setProperty("--vue-text-field-appendix-font-family", myMdwHelper.getValueFromData(data.inputAppendixFontFamily, myMdwHelper.getValueFromData(data.inputTextFontFamily, '')));

                    // Message style
                    $this.context.style.setProperty("--vue-text-field-message-color", myMdwHelper.getValueFromData(data.inputMessageColor, ''));
                    $this.context.style.setProperty("--vue-text-field-message-font-size", myMdwHelper.getNumberFromData(data.inputMessageFontSize, '12') + 'px');
                    $this.context.style.setProperty("--vue-text-field-message-font-family", myMdwHelper.getValueFromData(data.inputMessageFontFamily, ''));

                    // Counter style
                    $this.context.style.setProperty("--vue-text-field-counter-color", myMdwHelper.getValueFromData(data.inputCounterColor, ''));
                    $this.context.style.setProperty("--vue-text-field-counter-font-size", myMdwHelper.getNumberFromData(data.inputCounterFontSize, '12') + 'px');
                    $this.context.style.setProperty("--vue-text-field-counter-font-family", myMdwHelper.getValueFromData(data.inputCounterFontFamily, ''));

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = newVal;
                    });
                });
            });

        } catch (ex) {
            console.error(`[Vuetify Input]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };