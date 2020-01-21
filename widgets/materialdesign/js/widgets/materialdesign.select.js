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
            let vueHelper = vis.binds.materialdesign.vueHelper
            let containerClass = 'materialdesign-vuetify-select';

            let itemsList = [];

            for (var i = 0; i <= data.countSelectItems; i++) {
                let value = myMdwHelper.getValueFromData(data.attr('value' + i), null)

                let imageTmp = myMdwHelper.getValueFromData(data.attr('listIcon' + i), null);
                let icon = '';
                let image = '';

                if (imageTmp !== null && myMdwHelper.getAllowedImageFileExtensions().some(el => imageTmp.includes(el))) {
                    image = imageTmp;
                } else {
                    icon = 'mdi-' + imageTmp;
                }

                if (value !== null) {
                    itemsList.push(
                        {
                            text: myMdwHelper.getValueFromData(data.attr('label' + i), value),
                            subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                            value: myMdwHelper.getValueFromData(data.attr('value' + i), ''),
                            icon: icon,
                            image: image
                        }
                    )
                }
            }

            //     <template v-slot:selection="data">
            //     <v-icon v-html="data.item.icon"></v-icon>
            // </template>

            $this.append(`
            <div class="${containerClass}" style="width: 100%; height: 100%;">
                <v-select
                    ${vueHelper.select.getConstructor(data)}
                >
                
                ${vueHelper.select.getTemplates(data)}

                </v-select>
            </div>`);

            myMdwHelper.waitForElement($this, `.${containerClass}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                    let widgetHeight = window.getComputedStyle($this.context, null).height.replace('px', '');

                    let vueTextField = new Vue({
                        el: $this.find(`.${containerClass}`).get(0),
                        vuetify: new Vuetify(),
                        data() {
                            return vueHelper.select.getData(data, widgetHeight, itemsList);
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
                                vueHelper.select.setMenuStyles($this, data, itemsList, $vuetifyContainer);
                            }
                        }
                    });

                    vueHelper.select.setStyles($this, data);

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        let item = vueHelper.getObjectByValue(newVal, itemsList);
                        vueTextField.item = item;
                        vueTextField.icon = item.icon;
                        vueTextField.image = item.image;
                    });
                });
            });
        } catch (ex) {
            console.error(`[Vuetify Select]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };