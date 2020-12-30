/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.textfield = {
    initialize: function (el, data) {
        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.input
            let containerClass = 'materialdesign-vuetify-textField';
            let widgetName = 'TextField';

            let inputType = myMdwHelper.getValueFromData(data.inputType, 'text');
            let inputMask = '';
            let placeholder = ''

            if (inputType === 'mask') {
                // mask needs text as input type
                inputType = 'text';

                if (data.inputMask) {
                    if (data.inputMask.startsWith('[') && data.inputMask.endsWith(']')) {
                        inputMask = `v-mask="${data.inputMask}"`
                        placeholder = data.inputMask.replace('[', '').replace(']', '').replace("'", '');
                    } else {
                        inputMask = `v-mask="'${myMdwHelper.getValueFromData(data.inputMask, '')}'"`
                        placeholder = data.inputMask;
                    }
                }
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

            if (myMdwHelper.oidNeedSubscribe(data.oid, data.wid, widgetName, false)) {
                // ggf subscribing notwendig, wenn z.B. Binding als ObjektId verwendet wird und eine oid übergeben wird
                myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                    handler();
                });
            } else {
                handler();
            }

            function handler() {
                myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'TextField', function () {
                    myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'TextField', function () {

                        let widgetHeight = window.getComputedStyle($this.get(0), null).height.replace('px', '');

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
                                        myMdwHelper.setValue(data.oid, value);
                                    } else {
                                        if (value) {
                                            myMdwHelper.setValue(data.oid, value);
                                        } else {
                                            this.value = vis.states.attr(data.oid + '.val');
                                        }
                                    }
                                }
                            }
                        });

                        vueHelper.setStyles($this, data);

                        // Append Icon
                        $this.get(0).style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.appendIconSize, 16) + 'px');
                        $this.get(0).style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.appendIconColor, ''));

                        vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                            vueTextField.value = newVal;
                        });
                    });
                });
            }
        } catch (ex) {
            console.error(`[TextField - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            oid: obj.oid,
            inputType: obj.inputType,
            inputMask: obj.inputMask,
            inputMaxLength: obj.inputMaxLength,
            inputLayout: obj.inputLayout,
            inputAlignment: obj.inputAlignment,
            inputLayoutBackgroundColor: obj.inputLayoutBackgroundColor,
            inputLayoutBackgroundColorHover: obj.inputLayoutBackgroundColorHover,
            inputLayoutBackgroundColorSelected: obj.inputLayoutBackgroundColorSelected,
            inputLayoutBorderColor: obj.inputLayoutBorderColor,
            inputLayoutBorderColorHover: obj.inputLayoutBorderColorHover,
            inputLayoutBorderColorSelected: obj.inputLayoutBorderColorSelected,
            inputTextFontFamily: obj.inputTextFontFamily,
            inputTextFontSize: obj.inputTextFontSize,
            inputTextColor: obj.inputTextColor,
            inputLabelText: obj.inputLabelText,
            inputLabelColor: obj.inputLabelColor,
            inputLabelColorSelected: obj.inputLabelColorSelected,
            inputLabelFontFamily: obj.inputLabelFontFamily,
            inputLabelFontSize: obj.inputLabelFontSize,
            inputTranslateX: obj.inputTranslateX,
            inputTranslateY: obj.inputTranslateY,
            inputPrefix: obj.inputPrefix,
            inputSuffix: obj.inputSuffix,
            inputAppendixColor: obj.inputAppendixColor,
            inputAppendixFontSize: obj.inputAppendixFontSize,
            inputAppendixFontFamily: obj.inputAppendixFontFamily,
            showInputMessageAlways: obj.showInputMessageAlways,
            inputMessage: obj.inputMessage,
            inputMessageFontFamily: obj.inputMessageFontFamily,
            inputMessageFontSize: obj.inputMessageFontSize,
            inputMessageColor: obj.inputMessageColor,
            showInputCounter: obj.showInputCounter,
            inputCounterColor: obj.inputCounterColor,
            inputCounterFontSize: obj.inputCounterFontSize,
            inputCounterFontFamily: obj.inputCounterFontFamily,
            clearIconShow: obj.clearIconShow,
            clearIcon: obj.clearIcon,
            clearIconSize: obj.clearIconSize,
            clearIconColor: obj.clearIconColor,
            prepandIcon: obj.prepandIcon,
            prepandIconSize: obj.prepandIconSize,
            prepandIconColor: obj.prepandIconColor,
            prepandInnerIcon: obj.prepandInnerIcon,
            prepandInnerIconSize: obj.prepandInnerIconSize,
            prepandInnerIconColor: obj.prepandInnerIconColor,
            appendIcon: obj.appendIcon,
            appendIconSize: obj.appendIconSize,
            appendIconColor: obj.appendIconColor,
            appendOuterIcon: obj.appendOuterIcon,
            appendOuterIconSize: obj.appendOuterIconSize,
            appendOuterIconColor: obj.appendOuterIconColor
        }
    }
}