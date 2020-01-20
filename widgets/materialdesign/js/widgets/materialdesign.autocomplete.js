/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.44"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.autocomplete =
    function (el, data) {
        try {
            let $this = $(el);
            let helper = vis.binds.materialdesign.input.helper
            let containerClass = 'materialdesign-vuetify-autoComplete';

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            let itemsList = [];

            for (var i = 0; i <= data.countSelectItems; i++) {
                itemsList.push(
                    {
                        text: myMdwHelper.getValueFromData(data.attr('label' + i)),
                        value: myMdwHelper.getValueFromData(data.attr('value' + i))
                    }
                )
            }

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-${inputMode}
                    ${helper.getConstructor(data)}
                    
                    v-model="value"
                    item-text="text"
                    item-value="value"
                    
                    :items="items"
                    menu-props="${myMdwHelper.getValueFromData(data.listPosition, 'auto')}"
                    :append-icon="collapseIcon"

                    @focus="focus"
                >

                <template v-slot:item="data">
                    <template>
                        <v-list-item-content style="height: 100%">                            
                            <v-icon>home</v-icon></v-icon><v-list-item-title class="materialdesign-v-list-item-title" v-html="data.item.text"></v-list-item-title>
                            <v-list-item-subtitle v-html="data.item.value">fuuu</v-list-item-subtitle>
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

                            dataObj.value = getObjectByValue(vis.states.attr(data.oid + '.val'));
                            dataObj.items = itemsList;
                            dataObj.collapseIcon = myMdwHelper.getValueFromData(data.collapseIcon, undefined, 'mdi-');

                            return dataObj;
                        },
                        methods: {
                            changeEvent(value) {
                                console.log(value);
                                if (value) {
                                    if (value.value) {
                                        vis.setValue(data.oid, value.value);
                                    } else {
                                        // only if combobox (is writeable)
                                        vis.setValue(data.oid, value);
                                    }
                                } else {
                                    this.value = getObjectByValue(vis.states.attr(data.oid + '.val'));
                                }
                            },
                            focus(value) {
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
                    });

                    helper.setStyles($this, data);

                    $this.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.collapseIconSize, 16) + 'px');
                    $this.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.collapseIconColor, ''));
                    $this.context.style.setProperty("--vue-text-icon-append-cursor", 'pointer');

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        vueTextField.value = getObjectByValue(newVal);
                    });

                    function getObjectByValue(val) {
                        var result = itemsList.filter(obj => {
                            return obj.value === val;
                        });

                        if (result.length === 1) {
                            return result[0];
                        } else if (result.length > 1) {
                            console.warn("[Vuetify AutoComplete]: more than one result found!")
                            return result[0];
                        } else {
                            if (inputMode = 'combobox') {
                                // only if combobox (is writeable)
                                return {text: val, value: val};
                            } else {
                                return null;
                            }                            
                        }
                    }
                });
            });
        } catch (ex) {
            console.error(`[Vuetify AutoComplete]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };