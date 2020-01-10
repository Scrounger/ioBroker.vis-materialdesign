/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.36"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input =
    function (el, data) {
        try {
            let $this = $(el);

            console.log('Vuetify Input');


            if (myMdwHelper.getValueFromData(data.inputLayout, 'filled') === 'filled') {
                $this.append(`
                <div class="mdc-text-field ${(data.showInputLabel) ? 'mdc-text-field--no-label' : ''}" style="width: 100%; height: 100%; min-height: 36px;">
                    <input type="text" id="my-text-field" class="mdc-text-field__input">
                    ${(data.showInputLabel) ? '<label class="mdc-floating-label" for="my-text-field">Hint text</label>' : ''}
                    <div class="mdc-line-ripple"></div>
                </div>`);
            } else {

            }


            myMdwHelper.waitForElement($this, '.mdc-text-field', function () {
                let textInput = $this.find('.mdc-text-field');

                const mdcTextField = new mdc.textField.MDCTextField(textInput.get(0));

                setTextInputState();

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setTextInputState();
                });

                textInput.keypress(function (e) {
                    if (e.which == 13) {
                        vis.setValue(data.oid, mdcTextField.value);
                    }
                });

                textInput.focusout(function () {
                    vis.setValue(data.oid, mdcTextField.value);
                });

                function setTextInputState() {
                    var val = vis.states.attr(data.oid + '.val');
                    mdcTextField.value = val;
                }
            });

        } catch (ex) {
            console.exception(`[Input]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };