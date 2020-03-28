/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.72"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.button = {
    initializeButton: function (data, isIconButton = false) {
        try {
            let buttonElementsList = [];

            let labelWidth = '';
            if (myMdwHelper.getValueFromData(data.labelWidth, 0) > 0) {
                labelWidth = `style="width: ${data.labelWidth}%;"`
            }

            let lockIcon = '';
            if (!isIconButton) {
                if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                    lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                                style="${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`;
                }
            } else {
                if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                    lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`;
                }
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
            if (myMdwHelper.getValueFromData(data.buttontext, null) != null && !isIconButton) {
                labelElement = `<span 
                                    class="materialdesign-button__label" ${labelWidth}>
                                    ${data.buttontext}
                                </span>`;
            }

            if (data.iconPosition === 'left') {
                buttonElementsList.push(`${imageElement} ${labelElement} ${lockIcon}</div>`);
            } else {
                buttonElementsList.push(`${lockIcon} ${labelElement} ${imageElement}</div>`);
            }

            return { button: buttonElementsList.join(''), style: buttonStyle }

        } catch (ex) {
            console.error(`[Button - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    initializeVerticalButton: function (data) {
        try {
            let buttonElementsList = [];

            let lockIcon = '';
            if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`;
            }

            let buttonStyle = '';
            if (data.buttonStyle !== 'text') {
                buttonStyle = 'materialdesign-button--' + data.buttonStyle;
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%; ">`);

            let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), data.imageColor);

            let labelElement = '';
            if (myMdwHelper.getValueFromData(data.buttontext, null) != null) {
                labelElement = `<span 
                                    class="materialdesign-button__label" style="text-align: center;">
                                    ${data.buttontext}
                                </span>`;
            }

            if (data.iconPosition === 'top') {
                buttonElementsList.push(`${imageElement}${labelElement}${lockIcon}</div>`);
            } else {
                buttonElementsList.push(`${labelElement}${imageElement}${lockIcon}</div>`);
            }

            return { button: buttonElementsList.join(''), style: buttonStyle }

        } catch (ex) {
            console.error(`[Button - ${data.wid}] vertical initialize: error: ${ex.message}, stack: ${ex.stack}`);
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
                if (!data.minmax || val != data.minmax) {
                    vis.setValue(data.oid, parseFloat(val) + parseFloat(data.value));
                }
            });
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleAdition: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleState: function (el, data) {
        try {
            // modified from vis adapter -> https://github.com/ioBroker/ioBroker.vis/blob/2a08ee6da626a65b9d0b42b8679563e74272bfc6/www/widgets/basic.html#L480
            var $this = $(el);
            var val = data.value;

            if (val === 'true') val = true;
            if (val === 'false') val = false;

            if ($this.attr('isLocked') === 'true') {
                $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            if (!vis.editMode) {
                var moved = false;
                $this.on('click touchend', function (e) {
                    // Protect against two events
                    if (vis.detectBounce(this)) return;

                    if (moved) return;

                    if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === undefined) {
                        var oid = data.oid;

                        if (oid) {
                            var val = data.value;
                            if (val === undefined || val === null) val = false;
                            if (val === 'true') val = true;
                            if (val === 'false') val = false;
                            if (parseFloat(val).toString() == val) val = parseFloat(val);

                            if (oid) vis.setValue(oid, val);
                        }
                    } else {
                        unlockButton();
                    }
                }).on('touchmove', function () {
                    moved = true;
                }).on('touchstart', function () {
                    moved = false;
                });

                function unlockButton() {
                    $this.find('.materialdesign-lock-icon').fadeOut();
                    $this.attr('isLocked', false);
                    $this.css('filter', 'grayscale(0%)');

                    setTimeout(function () {
                        $this.attr('isLocked', true);
                        $this.find('.materialdesign-lock-icon').show();
                        $this.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
                }
            }
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleState: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleToggle: function (el, data) {
        try {
            var $this = $(el);

            if ($this.parent().attr('isLocked') === 'true') {
                $this.parent().css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

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
                if (myMdwHelper.getBooleanFromData(data.pushButton, false) === false) {
                    $this.parent().click(function () {
                        if ($this.parent().attr('isLocked') === 'false' || $this.parent().attr('isLocked') === undefined) {
                            if (data.toggleType === 'boolean') {
                                vis.setValue(data.oid, !vis.states.attr(data.oid + '.val'));
                            } else {
                                if ($this.parent().attr('toggled') === true || $this.parent().attr('toggled') === 'true') {
                                    vis.setValue(data.oid, data.valueOff);
                                } else {
                                    vis.setValue(data.oid, data.valueOn);
                                }
                            }
                        } else {
                            unlockButton();
                        }
                    });
                } else {
                    // Button from type push (Taster)                   
                    $this.parent().on('mousedown touchstart', function (e) {
                        if ($this.parent().attr('isLocked') === 'false' || $this.parent().attr('isLocked') === undefined) {
                            if (data.toggleType === 'boolean') {
                                vis.setValue(data.oid, true);
                            } else {
                                vis.setValue(data.oid, data.valueOn);
                            }
                        } else {
                            unlockButton();
                        }
                    });

                    $this.parent().on('mouseup touchend', function (e) {
                        if (data.toggleType === 'boolean') {
                            vis.setValue(data.oid, false);
                        } else {
                            vis.setValue(data.oid, data.valueOff);
                        }
                    });
                }
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

                    myMdwHelper.changeIconElement($this.parent(), myMdwHelper.getValueFromData(data.imageTrue, myMdwHelper.getValueFromData(data.image, '')), 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageTrueColor, myMdwHelper.getValueFromData(data.imageColor, '')));

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

            function unlockButton() {
                $this.parent().find('.materialdesign-lock-icon').fadeOut();
                $this.parent().attr('isLocked', false);
                $this.parent().css('filter', 'grayscale(0%)');

                setTimeout(function () {
                    $this.parent().attr('isLocked', true);
                    $this.parent().find('.materialdesign-lock-icon').show();
                    $this.parent().css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }

        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleToggle: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};