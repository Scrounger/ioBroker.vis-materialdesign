/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.42"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input =
    function (el, data, isAutoComplete = false) {
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

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            $this.append(`
            <div class="materialdesign-vuetifyTextField" style="width: 100%; height: 100%;">
                    ${(isAutoComplete) ? `<v-${inputMode}` : '<v-text-field'}
                        ${layout}
                        ${(!isAutoComplete) ? inputMask : ''} 
                        :value="value"
                        :height="height"
                        :label="label"
                        :type="type"
                        ${(!isAutoComplete) ? ':maxlength="maxlength"' : ''} 
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
                        ${(data.clearIconShow) ? 'clearable' : ''}
                        :clear-icon="clearIcon"

                        ${(myMdwHelper.getValueFromData(data.appendIcon, null) !== null) ? ':append-icon="appendIcon"' : ''}                        
                        ${(myMdwHelper.getValueFromData(data.appendOuterIcon, null) !== null) ? ':append-outer-icon="appendOuterIcon"' : ''}

                        ${(myMdwHelper.getValueFromData(data.prepandIcon, null) !== null) ? ':prepend-inner-icon="prepandIcon"' : ''}
                        ${(myMdwHelper.getValueFromData(data.prepandOuterIcon, null) !== null) ? ':prepend-icon="prepandOuterIcon"' : ''}
                        
                        ${(isAutoComplete) ? ':items="autoCompleteItems"' : ''}
                        ${(myMdwHelper.getValueFromData(data.collapseIcon, null) !== null) ? ':append-icon="collapseIcon"' : ''}

                        @change="changeEvent"
                        @focus="focus"

                        ${(isAutoComplete) ? `menu-props="${myMdwHelper.getValueFromData(data.listPosition, 'auto')}"` : ''}
                    >
                    ${(isAutoComplete) ? `</v-${inputMode}>` : '</v-text-field>'}
            </div > `);

            myMdwHelper.waitForElement($this, '.materialdesign-vuetifyTextField', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');
                    let message = myMdwHelper.getValueFromData(data.inputMessage, '');

                    Vue.use(VueTheMask);

                    let vueTextField = new Vue({
                        el: $this.find('.materialdesign-vuetifyTextField').get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = {
                                value: vis.states.attr(data.oid + '.val'),
                                height: widgetHeight,
                                label: myMdwHelper.getValueFromData(data.inputLabelText, ''),
                                type: inputType,
                                messages: message,
                                counter: data.showInputCounter,
                                prefix: myMdwHelper.getValueFromData(data.inputPrefix, ''),
                                suffix: myMdwHelper.getValueFromData(data.inputSuffix, ''),
                                placeholder: placeholder,
                                clearIcon: 'mdi-' + myMdwHelper.getValueFromData(data.clearIcon, 'close'),
                                appendIcon: 'mdi-' + myMdwHelper.getValueFromData(data.appendIcon, undefined),
                                appendOuterIcon: 'mdi-' + myMdwHelper.getValueFromData(data.appendOuterIcon, undefined),
                                prepandIcon: 'mdi-' + myMdwHelper.getValueFromData(data.prepandIcon, undefined),
                                prepandOuterIcon: 'mdi-' + myMdwHelper.getValueFromData(data.prepandOuterIcon, undefined),
                            }

                            if (!isAutoComplete) {
                                dataObj.maxlength = myMdwHelper.getNumberFromData(data.inputMaxLength, '');
                            } else {
                                dataObj.autoCompleteItems = myMdwHelper.getValueFromData(data.autoCompleteItems, []).split(',');
                                dataObj.collapseIcon = 'mdi-' + myMdwHelper.getValueFromData(data.collapseIcon, '');
                            }

                            return dataObj;

                        },
                        methods: {
                            changeEvent(value) {
                                vis.setValue(data.oid, value);
                            },
                            focus(value) {

                                if (isAutoComplete) {
                                    // select object will first time created after item is focused. select object is created under vue app container
                                    let selectId = $this.find('.v-input__slot').attr('aria-owns');

                                    myMdwHelper.waitForElement($vuetifyContainer, '#' + selectId, function () {
                                        // corresponding select object create -> set style options
                                        let selectList = $vuetifyContainer.find(`#${selectId} .v-list`).get(0);

                                        selectList.style.setProperty('--vue-list-item-height', myMdwHelper.getNumberFromData(data.listItemHeight, 'auto', '', 'px'));
                                        selectList.style.setProperty('--vue-list-item-font-size', myMdwHelper.getNumberFromData(data.listItemFontSize, 'inherit', '', 'px'));
                                        selectList.style.setProperty('--vue-list-item-font-family', myMdwHelper.getValueFromData(data.listItemFont, 'inherit'));
                                        selectList.style.setProperty('--vue-list-item-font-color', myMdwHelper.getValueFromData(data.listItemFontColor, 'inherit'));
                                    });
                                }
                            }
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

                    // Transform options
                    $this.context.style.setProperty("--vue-text-field-translate-x", myMdwHelper.getNumberFromData(data.inputTranslateX, 0) + 'px');
                    $this.context.style.setProperty("--vue-text-field-translate-y", myMdwHelper.getNumberFromData(data.inputTranslateY, -16) + 'px');

                    // Icon: clear options
                    $this.context.style.setProperty("--vue-text-icon-clear-size", myMdwHelper.getNumberFromData(data.clearIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-clear-color", myMdwHelper.getValueFromData(data.clearIconColor, ''));

                    // Icon: append options
                    if (!isAutoComplete) {
                        $this.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.appendIconSize, 16) + 'px');
                        $this.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.appendIconColor, ''));
                    } else {
                        $this.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.collapseIconSize, 16) + 'px');
                        $this.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.collapseIconColor, ''));
                        $this.context.style.setProperty("--vue-text-icon-append-cursor", 'pointer');
                    }


                    // Icon: append-outer options
                    $this.context.style.setProperty("--vue-text-icon-append-outer-size", myMdwHelper.getNumberFromData(data.appendOuterIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-append-outer-color", myMdwHelper.getValueFromData(data.appendOuterIconColor, ''));

                    // Icon: prepand options
                    $this.context.style.setProperty("--vue-text-icon-prepand-size", myMdwHelper.getNumberFromData(data.prepandIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-prepand-color", myMdwHelper.getValueFromData(data.prepandIconColor, ''));

                    // Icon: prepand-outer options
                    $this.context.style.setProperty("--vue-text-icon-prepand-outer-size", myMdwHelper.getNumberFromData(data.prepandOuterIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-prepand-outer-color", myMdwHelper.getValueFromData(data.prepandOuterIconColor, ''));

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = newVal;
                    });
                });
            });

        } catch (ex) {
            console.error(`[Vuetify Input]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };