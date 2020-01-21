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
            let vueHelper = vis.binds.materialdesign.vueHelper.select
            let containerClass = 'materialdesign-vuetify-autoComplete';

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            let itemsList = vueHelper.generateItemList(data);

            //     <template v-slot:selection="data">
            //     <v-icon v-html="data.item.icon"></v-icon>
            // </template>

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-${inputMode}
                    ${vueHelper.getConstructor(data)}
                >

                ${vueHelper.getTemplates(data)}

                </v-${inputMode}>
            </div>`);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    let vueAutoComplete = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return vueHelper.getData(data, widgetHeight, itemsList, inputMode);
                        },
                        methods: {
                            changeEvent(item) {
                                if (item) {
                                    if (item.value) {
                                        vis.setValue(data.oid, item.value);
                                    } else {
                                        // only if combobox (is writeable)
                                        vis.setValue(data.oid, item);
                                    }
                                } else {
                                    let item = vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList, inputMode);
                                    this.item = item;
                                    this.icon = item.icon;
                                    this.image = item.image;
                                }
                            },
                            focus(value) {
                                // select object will first time created after item is focused. select object is created under vue app container
                                vueHelper.setMenuStyles($this, data, itemsList, $vuetifyContainer);
                            }
                        }
                    });

                    vueHelper.setStyles($this, data);
                    vueHelper.setIoBrokerBinding(data, vueAutoComplete, itemsList, inputMode);
                });
            });
        } catch (ex) {
            console.error(`[Vuetify AutoComplete]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };