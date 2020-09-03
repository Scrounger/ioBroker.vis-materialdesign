/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.checkbox = {
    initialize: function (data) {
        try {

            let labelClickActive = '';
            if (data.labelClickActive === 'false' || data.labelClickActive === false) {
                labelClickActive = 'pointer-events:none;'
            }

            let labelPosition = '';
            if (data.labelPosition === 'left') {
                labelPosition = 'mdc-form-field--align-end'
            }

            let element = `
            <div class="mdc-checkbox">
                <input type="checkbox" class="mdc-checkbox__native-control" id="materialdesign-checkbox-${data.wid}"/>
                <div class="mdc-checkbox__background">
                    <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                        <path class="mdc-checkbox__checkmark-path" fill="none" d="M1.73,12.91 8.1,19.28 22.79,4.59"/>
                    </svg>
                    <div class="mdc-checkbox__mixedmark"></div>
                </div>
                <div class="mdc-checkbox__ripple"></div>
            </div>
            <label id="label" for="materialdesign-checkbox-${data.wid}" style="width: 100%; cursor: pointer; ${labelClickActive}">Checkbox 1</label>
            `

            return { checkbox: element, style: labelPosition };

        } catch (ex) {
            console.error(`[Checkbox - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handle: function (el, data) {
        try {
            let $this = $(el);

            if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                // Append lock icon if activated
                $this.append(`<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`);

                $this.attr('isLocked', true);
                $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            let checkboxElement = $this.find('.mdc-checkbox').get(0);

            const mdcFormField = new mdc.formField.MDCFormField($this.get(0));
            const mdcCheckbox = new mdc.checkbox.MDCCheckbox(checkboxElement);
            
            mdcFormField.input = mdcCheckbox;

            mdcCheckbox.disabled = myMdwHelper.getBooleanFromData(data.readOnly, false);

            checkboxElement.style.setProperty("--materialdesign-color-checkbox", myMdwHelper.getValueFromData(data.colorCheckBox, ''));
            checkboxElement.style.setProperty("--materialdesign-color-checkbox-border", myMdwHelper.getValueFromData(data.colorCheckBoxBorder, ''));
            checkboxElement.style.setProperty("--materialdesign-color-checkbox-hover", myMdwHelper.getValueFromData(data.colorCheckBoxHover, ''));

            setCheckboxState();
            
            if (!vis.editMode) {
                $this.find('.mdc-checkbox').click(function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === undefined) {
                        if (data.toggleType === 'boolean') {
                            myMdwHelper.setValue(data.oid, mdcCheckbox.checked);
                        } else {
                            if (!mdcCheckbox.checked === true) {
                                myMdwHelper.setValue(data.oid, data.valueOff);
                            } else {
                                myMdwHelper.setValue(data.oid, data.valueOn);
                            }
                        }
                    } else {
                        mdcCheckbox.checked = !mdcCheckbox.checked;
                        unlockCheckbox();
                    }

                    setCheckboxState();
                });
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setCheckboxState();
            });

            function setCheckboxState() {
                var val = vis.states.attr(data.oid + '.val');

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

                mdcCheckbox.checked = buttonState;

                let label = $this.find('label[id="label"]');
                if (buttonState) {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorTrue, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', myMdwHelper.getValueFromData(data.labelColorFalse, ''));
                    label.html(myMdwHelper.getValueFromData(data.labelFalse, ''));
                }
            }

            function unlockCheckbox() {
                $this.find('.materialdesign-lock-icon').fadeOut();
                $this.attr('isLocked', false);
                $this.css('filter', 'grayscale(0%)');

                setTimeout(function () {
                    $this.attr('isLocked', true);
                    $this.find('.materialdesign-lock-icon').show();
                    $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }
        } catch (ex) {
            console.error(`[Checkbox - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
}