/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.47"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.button = {
    initializeButton: function (data) {
        try {
            let buttonElementsList = [];

            let labelWidth = '';
            if (myMdwHelper.getValueFromData(data.labelWidth, 0) > 0) {
                labelWidth = `style="width: ${data.labelWidth}%;"`
            }

            let buttonStyle = '';
            if (data.buttonStyle !== 'text') {
                buttonStyle = 'materialdesign-button--' + data.buttonStyle;
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">`);

            let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), data.imageColor);

            let labelElement = '';
            if (myMdwHelper.getValueFromData(data.buttontext, null) != null) {
                labelElement = `<span 
                                    class="materialdesign-button__label" ${labelWidth}>
                                    ${data.buttontext}
                                </span>`;
            }

            if (data.iconPosition === 'left') {
                buttonElementsList.push(`${imageElement}${labelElement}</div>`);
            } else {
                buttonElementsList.push(`${labelElement}${imageElement}</div>`);
            }

            return { button: buttonElementsList.join(''), style: buttonStyle }

        } catch (ex) {
            console.error(`[Button] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleLink: function (el, data) {
        $(el).click(function () {
            if (!vis.editMode && data.href) {
                if (data.openNewWindow) {
                    window.open(data.href);
                } else {
                    window.location.href = data.href;
                }
            }
        });
    },
    handleNavigation: function (el, data) {
        if (!vis.editMode && data.nav_view) {
            var $this = $(el);
            var moved = false;
            $this.on('click touchend', function (e) {
                // Protect against two events
                if (vis.detectBounce(this)) return;
                if (moved) return;
                vis.changeView(data.nav_view, data.nav_view);
                //e.preventDefault();
                //return false;
            }).on('touchmove', function () {
                moved = true;
            }).on('touchstart', function () {
                moved = false;
            });
        }
    },
    handleAdition: function (el, data) {
        try {
            let $this = $(el);

            $this.on('click touchend', function (e) {
                let val = vis.states.attr(data.oid + '.val');
                vis.setValue(data.oid, parseFloat(val) + parseFloat(data.value));
            });
        } catch (ex) {
            console.error(`handleAdition [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleToggle: function (el, data) {
        try {
            var $this = $(el);

            let bgColor = myMdwHelper.getValueFromData(data.colorBgFalse, '');
            let bgColorTrue = myMdwHelper.getValueFromData(data.colorBgTrue, bgColor);

            let labelBgColor = myMdwHelper.getValueFromData(data.labelColorBgFalse, '');
            let labelBgColorTrue = myMdwHelper.getValueFromData(data.labelColorBgTrue, labelBgColor);

            let textFalse = myMdwHelper.getValueFromData(data.buttontext, '');
            let textTrue = myMdwHelper.getValueFromData(data.labelTrue, textFalse);

            let textColorFalse = myMdwHelper.getValueFromData(data.labelColorFalse, '');
            let textColorTrue = myMdwHelper.getValueFromData(data.labelColorTrue, textColorFalse);

            setButtonState();

            if (data.readOnly && !vis.editMode) {
                $this.parent().css('pointer-events', 'none');
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setButtonState();
            });

            if (!vis.editMode) {
                $this.parent().click(function () {
                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, !vis.states.attr(data.oid + '.val'));
                    } else {
                        if ($this.parent().attr('toggled') === true || $this.parent().attr('toggled') === 'true') {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }
                });
            }

            function setButtonState() {
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

                if (buttonState) {
                    $this.parent().attr('toggled', true);
                    $this.parent().css('background', bgColorTrue);

                    myMdwHelper.changeIconElement($this.parent(), data.imageTrue, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), data.imageTrueColor);

                    $this.parent().find('.materialdesign-button__label').html(textTrue).css('color', textColorTrue);
                    $this.find('.labelRowContainer').css('background', labelBgColorTrue);
                } else {
                    $this.parent().attr('toggled', false);
                    $this.parent().css('background', bgColor);

                    myMdwHelper.changeIconElement($this.parent(), data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), data.imageColor);

                    $this.parent().find('.materialdesign-button__label').html(textFalse).css('color', textColorFalse);
                    $this.find('.labelRowContainer').css('background', labelBgColor);
                }
            }

        } catch (ex) {
            console.error(`[Button] handleToggle: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    buttonToggle: function (el, data) {
        try {
            var $this = $(el).parent();

            let bgColor = myMdwHelper.getValueFromData(data.colorBgFalse, '');
            let bgColorTrue = myMdwHelper.getValueFromData(data.colorBgTrue, bgColor);

            let labelBgColor = myMdwHelper.getValueFromData(data.labelColorBgFalse, '');
            let labelBgColorTrue = myMdwHelper.getValueFromData(data.labelColorBgTrue, labelBgColor);

            setButtonState();

            if (data.readOnly && !vis.editMode) {
                $this.parent().css('pointer-events', 'none');
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setButtonState();
            });

            if (!vis.editMode) {
                $this.click(function () {
                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, !vis.states.attr(data.oid + '.val'));
                    } else {
                        if ($this.attr('toggled') === true || $this.attr('toggled') === 'true') {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }
                });
            }

            function setButtonState() {
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

                if (buttonState) {
                    $this.attr('toggled', true);

                    $this.find('.imgToggleTrue').show();
                    $this.find('.imgToggleFalse').hide();

                    $this.find('.labelToggleTrue').show();
                    $this.find('.labelToggleFalse').hide();

                    $this.parent().css('background', bgColorTrue);
                    $this.find('.labelRowContainer').css('background', labelBgColorTrue);
                } else {
                    $this.attr('toggled', false);

                    $this.find('.imgToggleTrue').hide();
                    $this.find('.imgToggleFalse').show();

                    $this.find('.labelToggleTrue').hide();
                    $this.find('.labelToggleFalse').show();

                    $this.parent().css('background', bgColor);
                    $this.find('.labelRowContainer').css('background', labelBgColor);
                }
            }

        } catch (ex) {
            console.error(`[Button Toggle]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};