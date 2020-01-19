/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.44"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.autocomplete =
    function (el, data, isAutoComplete = false) {
        try {
            let $this = $(el);
            let helper = vis.binds.materialdesign.input.helper
            let containerClass = 'materialdesign-vuetify-autoComplete';

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-${inputMode}
                    ${helper.getConstructor(data)}
                        
                    :items="autoCompleteItems"
                    menu-props="${myMdwHelper.getValueFromData(data.listPosition, 'auto')}"
                    :append-icon="collapseIcon"

                    @focus="focus"
                >

                <template v-slot:item="data">
                    <template>
                        <v-list-item-content style="height: 100%">
                            <v-list-item-title class="materialdesign-v-list-item-title" v-html="data.item"></v-list-item-title>
                            <v-list-item-subtitle>fuuu</v-list-item-subtitle>
                     </v-list-item-content>
                    </template>
                </template>

                </v-${inputMode}>
            </div>`);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    let vueTextField = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            let dataObj = helper.getData(data, widgetHeight);

                            dataObj.autoCompleteItems = myMdwHelper.getValueFromData(data.autoCompleteItems, []).split(',');
                            dataObj.collapseIcon = myMdwHelper.getValueFromData(data.collapseIcon, undefined, 'mdi-');

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
                            focus(value) {
                                if (isAutoComplete) {
                                    // select object will first time created after item is focused. select object is created under vue app container
                                    let selectId = $this.find('.v-input__slot').attr('aria-owns');

                                    myMdwHelper.waitForElement($vuetifyContainer, '#' + selectId, function () {
                                        // corresponding select object create -> set style options
                                        let selectList = $vuetifyContainer.find(`#${selectId} .v-list`).get(0);

                                        selectList.style.setProperty('--vue-list-item-height', myMdwHelper.getStringFromNumberData(data.listItemHeight, 'auto', '', 'px'));
                                        selectList.style.setProperty('--vue-list-item-font-size', myMdwHelper.getStringFromNumberData(data.listItemFontSize, 'inherit', '', 'px'));
                                        selectList.style.setProperty('--vue-list-item-font-family', myMdwHelper.getValueFromData(data.listItemFont, 'inherit'));
                                        selectList.style.setProperty('--vue-list-item-font-color', myMdwHelper.getValueFromData(data.listItemFontColor, 'inherit'));

                                        selectList.style.setProperty('--vue-list-item-background-color', myMdwHelper.getValueFromData(data.listItemBackgroundColor, 'inherit'));

                                        selectList.style.setProperty('--vue-list-item-background-hover-color', myMdwHelper.getValueFromData(data.listItemBackgroundHoverColor, ''));
                                        selectList.style.setProperty('--vue-list-item-background-selected-color', myMdwHelper.getValueFromData(data.listItemBackgroundSelectedColor, ''));
                                        selectList.style.setProperty('--vue-ripple-effect-color', myMdwHelper.getValueFromData(data.listItemRippleEffectColor, ''));
                                    });
                                }
                            }
                        }
                    });

                    helper.setStyles($this, data);

                    $this.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.collapseIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.collapseIconColor, ''));
                    $this.context.style.setProperty("--vue-text-icon-append-cursor", 'pointer');

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = newVal;
                    });
                });
            });

        } catch (ex) {
            console.error(`[Vuetify AutoComplete]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };