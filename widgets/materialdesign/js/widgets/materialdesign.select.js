/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.44"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.select =
    function (el, data) {
        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.select
            let containerClass = 'materialdesign-vuetify-select';

            let itemsList = vueHelper.generateItemList(data);

            //     <template v-slot:selection="data">
            //     <v-icon v-html="data.item.icon"></v-icon>
            // </template>

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-select
                    ${vueHelper.getConstructor(data)}
                >
                
                ${vueHelper.getTemplates(data)}

                </v-select>
            </div>`);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    let vueSelect = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return vueHelper.getData(data, widgetHeight, itemsList);
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
                                    let item = vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList);
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
                    vueHelper.setIoBrokerBinding(data, vueSelect, itemsList);
                });
            });
        } catch (ex) {
            console.error(`[Vuetify Select]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };