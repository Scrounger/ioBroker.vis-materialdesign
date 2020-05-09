/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.3.8"

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
            let widgetName = 'AutoComplete';

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            vueHelper.generateItemList(data, function (itemsList) {
                
                $this.append(`
                    <div class="${containerClass}" style="width: 100%; height: 100%;">
                        <v-${inputMode}
                            ${vueHelper.getConstructor(data)}
                        >

                        ${vueHelper.getTemplates(data)}

                        </v-${inputMode}>
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
                    myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'AutoComplete', function () {
                        myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'AutoComplete', function () {

                            let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                            let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                            let vueAutoComplete = new Vue({
                                el: $this.find(`.${containerClass}`).get(0),
                                vuetify: new Vuetify(),
                                data() {
                                    return vueHelper.getData(data, widgetHeight, itemsList, inputMode);
                                },
                                methods: vueHelper.getMethods(data, $this, itemsList, $vuetifyContainer, inputMode)
                            });

                            vueHelper.setStyles($this, data);
                            vueHelper.setIoBrokerBinding(data, vueAutoComplete, itemsList, inputMode);
                        });
                    });
                }
            });
        } catch (ex) {
            console.error(`[Vuetify AutoComplete ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };