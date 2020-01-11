/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.37"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input =
    function (el, data) {
        try {
            let $this = $(el);

            console.log('Vuetify Input');



            $this.append(`
            <div class="materialdesign-vuetifyTextField" style="width: 100%; height: 100%;">
                    <v-text-field
                        label="Regular"
                    >
                    </v-text-field>
            </div>`);


            myMdwHelper.waitForElement($this, '.materialdesign-vuetifyTextField', function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {

                    let vueTextField = new Vue({
                        el: $this.find('.materialdesign-vuetifyTextField').get(0),
                        vuetify: new Vuetify({ rtl: data.reverseSlider }),
                    });


                    // setTextInputState();

                    // vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    //     setTextInputState();
                    // });

                    // textInput.keypress(function (e) {
                    //     if (e.which == 13) {
                    //         vis.setValue(data.oid, mdcTextField.value);
                    //     }
                    // });

                    // textInput.focusout(function () {
                    //     vis.setValue(data.oid, mdcTextField.value);
                    // });

                    // function setTextInputState() {
                    //     var val = vis.states.attr(data.oid + '.val');
                    //     mdcTextField.value = val;
                    // }
                });
            });

        } catch (ex) {
            console.exception(`[Input]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };