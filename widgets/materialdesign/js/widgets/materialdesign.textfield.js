/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.45"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.textfield =
    function (el, data, isAutoComplete = false) {
        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.input
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
                    v-model="value"
                    ${vueHelper.getConstructor(data)}

                    ${inputMask}
                    :maxlength="maxlength"
                >
                ${vueHelper.getTemplates(data)}

                ${(myMdwHelper.getValueFromData(data.appendIcon, null) !== null) ?
                    `<template v-slot:append>
                        <div  class="v-input__icon v-input__icon--append">                            
                            <v-icon v-if="appendIcon !== ''">{{ appendIcon }}</v-icon>
                            <img v-if="appendImage !== ''" :src="appendImage" />
                        </div>
                    </template>`
                    : ''}                

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
                            let dataObj = vueHelper.getData(data, widgetHeight, placeholder);

                            dataObj.value = vis.states.attr(data.oid + '.val');
                            dataObj.type = inputType;
                            dataObj.maxlength = myMdwHelper.getNumberFromData(data.inputMaxLength, '');

                            dataObj.appendIcon = (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.appendIcon, '').includes(el))) ? undefined : myMdwHelper.getValueFromData(data.appendIcon, undefined, 'mdi-');
                            dataObj.appendImage = (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.appendIcon, '').includes(el))) ? myMdwHelper.getValueFromData(data.appendIcon, undefined) : undefined;

                            return dataObj;
                        },
                        methods: {
                            changeEvent(value) {
                                if (inputType !== 'number') {
                                    vis.setValue(data.oid, value);
                                } else {
                                    if (value) {
                                        vis.setValue(data.oid, value);
                                    } else {
                                        this.value = vis.states.attr(data.oid + '.val');
                                    }
                                }
                            }
                        }
                    });

                    vueHelper.setStyles($this, data);

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