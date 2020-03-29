/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.74"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.switch =
    function (el, data) {
        try {
            var $this = $(el);
            var oid = $this.data('oid');

            let switchElement = $this.find('.mdc-switch').get(0);

            const mdcFormField = new mdc.formField.MDCFormField($this.context);
            const mdcSwitch = new mdc.switchControl.MDCSwitch(switchElement);
            mdcFormField.input = mdcSwitch;

            mdcSwitch.disabled = data.readOnly, false;

            switchElement.style.setProperty("--materialdesign-color-switch-on", myMdwHelper.getValueFromData(data.colorSwitchTrue, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-off", myMdwHelper.getValueFromData(data.colorSwitchThumb, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-track", myMdwHelper.getValueFromData(data.colorSwitchTrack, ''));
            switchElement.style.setProperty("--materialdesign-color-switch-off-hover", myMdwHelper.getValueFromData(data.colorSwitchHover, ''));

            setSwitchState();

            if (!vis.editMode) {
                $this.find('.mdc-switch').click(function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, mdcSwitch.checked);
                    } else {
                        if (!mdcSwitch.checked === true) {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }

                    setSwitchState();
                });
            }

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                setSwitchState();
            });

            function setSwitchState() {
                var val = vis.states.attr(oid + '.val');

                let buttonState = false;

                if (data.toggleType === 'boolean') {
                    buttonState = val;
                } else {
                    if (val === parseInt(data.valueOn) || val === data.valueOn) {
                        buttonState = true;
                    } else if (val !== parseInt(data.valueOn) && val !== data.valueOn && val !== parseInt(data.valueOff) && val !== data.valueOff && data.stateIfNotTrueValue === 'on') {
                        buttonState = true;
                    }
                }

                mdcSwitch.checked = buttonState;

                let label = $this.find('label[id="label"]');
                if (buttonState) {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorTrue, ''));
                    label.text(myMdwHelper.getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorFalse, ''));
                    label.text(myMdwHelper.getValueFromData(data.labelFalse, ''));
                }
            }
        } catch (ex) {
            console.error(`[Switch]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    };
