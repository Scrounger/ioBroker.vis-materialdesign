/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.textfield = {
    initialize: function (el, data) {
        let widgetName = 'TextField';

        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.input
            let containerClass = 'materialdesign-vuetify-textField';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

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

                        $(document).on("mdwSubscribe", function (e, oids) {
                            if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                                vueHelper.setStyles($this, data);
                            }
                        });

                        vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                            vueHelper.setStyles($this, data);
                        });

                        vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                            vueHelper.setStyles($this, data);
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
            console.error(`[${widgetName} - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,
            debug: obj.debug,

            // Common
            oid: obj.oid,
            inputType: obj.inputType,
            inputMask: obj.inputMask,
            inputMaxLength: obj.inputMaxLength,
            generateHtmlControl: obj.generateHtmlControl,

            // layout input 
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

            // label of input 
            inputLabelText: obj.inputLabelText,
            inputLabelColor: obj.inputLabelColor,
            inputLabelColorSelected: obj.inputLabelColorSelected,
            inputLabelFontFamily: obj.inputLabelFontFamily,
            inputLabelFontSize: obj.inputLabelFontSize,
            inputTranslateX: obj.inputTranslateX,
            inputTranslateY: obj.inputTranslateY,

            // appendixs of the input
            inputPrefix: obj.inputPrefix,
            inputSuffix: obj.inputSuffix,
            inputAppendixColor: obj.inputAppendixColor,
            inputAppendixFontSize: obj.inputAppendixFontSize,
            inputAppendixFontFamily: obj.inputAppendixFontFamily,

            // sub text of input
            showInputMessageAlways: obj.showInputMessageAlways,
            inputMessage: obj.inputMessage,
            inputMessageFontFamily: obj.inputMessageFontFamily,
            inputMessageFontSize: obj.inputMessageFontSize,
            inputMessageColor: obj.inputMessageColor,

            // counter layout
            showInputCounter: obj.showInputCounter,
            inputCounterColor: obj.inputCounterColor,
            inputCounterFontSize: obj.inputCounterFontSize,
            inputCounterFontFamily: obj.inputCounterFontFamily,

            // Icons
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
            appendOuterIconColor: obj.appendOuterIconColor,
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '38px';

            delete widgetData.width;
            delete widgetData.height;

            let mdwData = myMdwHelper.getHtmlmdwData('',
                vis.binds.materialdesign.textfield.getDataFromJson(widgetData, 0));

            html = `<div class='vis-widget materialdesign-widget materialdesign-input materialdesign-input-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative; overflow: visible; display: flex; align-items: center;'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;
        } catch (ex) {
            console.error(`[Input getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-input-html-element", function () {
    let $this = $(this);
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Input HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `Input HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Input HTML Element - ${parentId.replace('w', 'p')}]`;

        if (debug) console.log(`${logPrefix} initialize html element`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.textfield.getDataFromJson({}, parentId),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);
            vis.binds.materialdesign.textfield.initialize($this, widgetData);
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});