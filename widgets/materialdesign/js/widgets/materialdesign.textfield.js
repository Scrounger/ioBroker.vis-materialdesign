/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.44"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.textfield =
    function (el, data, isAutoComplete = false) {
        try {
            let $this = $(el);
            let helper = vis.binds.materialdesign.input.helper
            let containerClass = 'materialdesign-vuetify-textField';

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
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-text-field
                    ${helper.getConstructor(data)}

                    ${inputMask}
                    :maxlength="maxlength"
                >
                </v-text-field>
            </div>`);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    Vue.use(VueTheMask);
                    let vueTextField = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = helper.getData(data, widgetHeight, placeholder);

                            dataObj.type = inputType;
                            dataObj.maxlength = myMdwHelper.getNumberFromData(data.inputMaxLength, '');

                            return dataObj;
                        },
                        methods: {
                            changeEvent(value) {
                                if (value) {
                                    vis.setValue(data.oid, value);
                                } else {
                                    this.value = vis.states.attr(data.oid + '.val');
                                }
                            },
                        }
                    });

                    helper.setStyles($this, data);

                    // Append Icon
                    $this.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.appendIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.appendIconColor, ''));

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = newVal;
                    });
                });
            });

        } catch (ex) {
            console.error(`[Vuetify TextField]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };