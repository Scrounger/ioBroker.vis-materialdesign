/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.5"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.button = {
    initializeButton: function (data, isToggle = false) {
        try {
            let buttonElementsList = [];

            let image = getValueFromData(data.image, null);

            let iconHeight = 'width: auto;';
            if (getValueFromData(data.iconHeight, 0) > 0) {
                iconHeight = `width: ${data.iconHeight}%;`
            }

            let labelWidth = '';
            if (getValueFromData(data.labelWidth, 0) > 0) {
                labelWidth = `style="width: ${data.labelWidth}%;"`
            }

            let invertImage = '';
            if (data.invertImage === 'true' || data.invertImage === true) {
                invertImage = "filter: invert(1); -webkit-filter: invert(1); -moz-filter: invert(1); -o-filter: invert(1); -ms-filter: invert(1);";
            }

            let buttonStyle = '';
            if (data.buttonStyle !== 'text') {
                buttonStyle = 'materialdesign-button--' + data.buttonStyle;
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">`);

            let imageElement = '';
            if (image !== null) {
                imageElement = `<img 
                                    class="imgButton" src="${image}" 
                                    style="${iconHeight}${invertImage}" />`;
            }

            let labelElement = '';
            if (getValueFromData(data.buttontext, null) != null) {
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
            console.exception(`handler: error: ${ex.message}, stack: ${ex.stack}`);
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
    handleToggle: function (el, data) {
        try {
            var $this = $(el);

            let bgColor = getValueFromData(data.colorBgFalse, '');
            let bgColorTrue = getValueFromData(data.colorBgTrue, bgColor);

            let labelBgColor = getValueFromData(data.labelColorBgFalse, '');
            let labelBgColorTrue = getValueFromData(data.labelColorBgTrue, labelBgColor);

            let imageFalse = getValueFromData(data.image, '');
            let imageTrue = getValueFromData(data.imageTrue, imageFalse);

            let invertImageFalse = { 'filter': '', '-webkit-filter': '', '-moz-filter': '', '-o-filter': '', '-ms-filter': '' };
            if (data.invertImage === 'true' || data.invertImage === true) {
                invertImageFalse = { 'filter': 'invert(1)', '-webkit-filter': 'invert(1)', '-moz-filter': 'invert(1)', '-o-filter': 'invert(1)', '-ms-filter': 'invert(1)' };
            }

            let invertImageTrue = { 'filter': '', '-webkit-filter': '', '-moz-filter': '', '-o-filter': '', '-ms-filter': '' };
            if (data.invertImageTrue === 'true' || data.invertImageTrue === true) {
                invertImageTrue = { 'filter': 'invert(1)', '-webkit-filter': 'invert(1)', '-moz-filter': 'invert(1)', '-o-filter': 'invert(1)', '-ms-filter': 'invert(1)' };
            }

            let textFalse = getValueFromData(data.buttontext, '');
            let textTrue = getValueFromData(data.labelTrue, textFalse);

            let textColorFalse = getValueFromData(data.labelColorFalse, '');
            let textColorTrue = getValueFromData(data.labelColorTrue, textColorFalse);

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

                    console.log('true:' + invertImageTrue);

                    $this.parent().css('background', bgColorTrue);
                    $this.parent().find('.imgButton').attr('src', imageTrue).css(invertImageTrue);
                    $this.parent().find('.materialdesign-button__label').html(textTrue).css('color', textColorTrue);



                    $this.find('.labelRowContainer').css('background', labelBgColorTrue);
                } else {
                    $this.parent().attr('toggled', false);

                    console.log('false:' + invertImageFalse);

                    $this.parent().css('background', bgColor);
                    $this.parent().find('.imgButton').attr('src', imageFalse).css(invertImageFalse);
                    $this.parent().find('.materialdesign-button__label').html(textFalse).css('color', textColorFalse);



                    $this.find('.labelRowContainer').css('background', labelBgColor);
                }
            }

        } catch (ex) {
            console.exception(`toggle [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};