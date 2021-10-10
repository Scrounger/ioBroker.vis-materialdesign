/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.button = {
    types: {
        navigation: {
            default: 'navigation_default',
            vertical: 'navigation_vertical',
            icon: 'navigation_icon'
        },
        link: {
            default: 'link_default',
            vertical: 'link_vertical',
            icon: 'link_icon'
        },
        state: {
            default: 'state_default',
            vertical: 'state_vertical',
            icon: 'state_icon'
        },
        multiState: {
            default: 'multiState_default',
            vertical: 'multiState_vertical',
            icon: 'multiState_icon'
        },
        addition: {
            default: 'addition_default',
            vertical: 'addition_vertical',
            icon: 'addition_icon'
        },
        toggle: {
            default: 'toggle_default',
            vertical: 'toggle_vertical',
            icon: 'toggle_icon'
        },
        slider: {
            icon: 'slider_icon'
        }
    },
    initialize: function (el, data, type) {
        let widgetName = 'Button';

        if (type.includes('icon')) {
            widgetName = 'Icon Button';
        }

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-button-body';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            vis.binds.materialdesign.button.useTheme(el, data, type, widgetName);

            $this.addClass(data.buttonStyle !== 'text' ? 'materialdesign-button--' + data.buttonStyle : '');

            if (type.includes('vertical')) {
                $this.append(vis.binds.materialdesign.button.initializeVerticalButton($this, data, type));
            } else if (type.includes('default')) {
                $this.append(vis.binds.materialdesign.button.initializeButton($this, data, type));
            } else if (type.includes('icon')) {
                $this.append(vis.binds.materialdesign.button.initializeButton($this, data, type, true));
            }

            myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, widgetName, function () {
                if (type.includes('navigation')) {
                    vis.binds.materialdesign.button.handleNavigation(el, data, type.includes('icon'));
                } else if (type.includes('link')) {
                    vis.binds.materialdesign.button.handleLink(el, data, type.includes('icon'));
                } else if (type.includes('state')) {
                    vis.binds.materialdesign.button.handleState(el, data, false, type.includes('icon'));
                } else if (type.includes('multiState')) {
                    vis.binds.materialdesign.button.handleState(el, data, true, type.includes('icon'));
                } else if (type.includes('addition')) {
                    vis.binds.materialdesign.button.handleAddition(el, data, type.includes('icon'));
                } else if (type.includes('toggle')) {
                    vis.binds.materialdesign.button.handleToggle(el, data, type.includes('icon'));
                } else if (type.includes('slider')) {
                    vis.binds.materialdesign.button.handleToggle(el, data, type.includes('icon'), true);
                }
            });

        } catch (ex) {
            console.error(`[${widgetName} ${type} - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    initializeButton: function ($this, data, type, isIconButton = false) {
        try {
            let buttonElementsList = [];

            $this.attr('isLocked', myMdwHelper.getBooleanFromData(data.lockEnabled, false));

            let lockIcon = '';
            if (!isIconButton) {
                if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                    lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                                style="${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''};"></span>`;
                }
            } else {
                if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                    let iconSize = myMdwHelper.getNumberFromData(data.lockIconSize, 16);
                    let elementSize = iconSize * myMdwHelper.getNumberFromData(data.lockBackgroundSizeFactor, 1);

                    lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; width: ${elementSize}px; height: ${elementSize}px; line-height: ${elementSize}px; text-align: center; font-size: ${iconSize}px; color: ${myMdwHelper.getValueFromData(data.lockIconColor, '#B22222')}; background: ${myMdwHelper.getValueFromData(data.lockIconBackground, '')}; border-radius: ${elementSize}px;"></span>`;
                }
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">`);

            let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageColor, ''));

            let labelElement = '';
            if (myMdwHelper.getValueFromData(data.buttontext, null) != null && !isIconButton) {
                labelElement = `<span 
                                    class="materialdesign-button__label" style="${myMdwHelper.getValueFromData(data.labelWidth, 0) > 0 ? `width: ${data.labelWidth}%;` : ''} color: ${myMdwHelper.getValueFromData(data.labelColorFalse, '')};">
                                    ${data.buttontext}
                                </span>`;
            }

            if (type.includes('toggle')) {
                var val = vis.states.attr(data.oid + '.val');

                if (vis.binds.materialdesign.button.getToggleState(val, data)) {
                    imageElement = myMdwHelper.getIconElement(myMdwHelper.getValueFromData(data.imageTrue, myMdwHelper.getValueFromData(data.image, '')), 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageTrueColor, myMdwHelper.getValueFromData(data.imageColor, '')));
                    $this.css('background', myMdwHelper.getValueFromData(data.colorBgTrue, myMdwHelper.getValueFromData(data.colorBgFalse, '')));

                    if (myMdwHelper.getValueFromData(data.buttontext, null) != null && !isIconButton) {
                        labelElement = `<span 
                                            class="materialdesign-button__label" style="${myMdwHelper.getValueFromData(data.labelWidth, 0) > 0 ? `width: ${data.labelWidth}%;` : ''} color: ${myMdwHelper.getValueFromData(data.labelColorTrue, myMdwHelper.getValueFromData(data.labelColorFalse, ''))};">
                                            ${data.buttontext}
                                        </span>`;
                    }
                }
            }

            if (data.iconPosition === 'left') {
                buttonElementsList.push(`${imageElement} ${labelElement} ${lockIcon}</div>`);
            } else {
                buttonElementsList.push(`${lockIcon} ${labelElement} ${imageElement}</div>`);
            }

            return buttonElementsList.join('');
        } catch (ex) {
            console.error(`[Button - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    initializeVerticalButton: function ($this, data, type) {
        try {
            let buttonElementsList = [];

            $this.attr('isLocked', myMdwHelper.getBooleanFromData(data.lockEnabled, false));

            let lockIcon = '';
            if (myMdwHelper.getBooleanFromData(data.lockEnabled) === true) {
                lockIcon = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''}"></span>`;
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; flex-direction: column; justify-content: center; align-items: ${myMdwHelper.getValueFromData(data.alignment, 'center')}; width: 100%; height: 100%; ">`);

            let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageColor, ''));

            let labelElement = '';
            if (myMdwHelper.getValueFromData(data.buttontext, null) != null) {
                labelElement = `<span 
                                    class="materialdesign-button__label" style="text-align: center; color: ${myMdwHelper.getValueFromData(data.labelColorFalse, '')};">
                                    ${data.buttontext}
                                </span>`;
            }

            if (type.includes('toggle')) {
                var val = vis.states.attr(data.oid + '.val');

                if (vis.binds.materialdesign.button.getToggleState(val, data)) {
                    imageElement = myMdwHelper.getIconElement(myMdwHelper.getValueFromData(data.imageTrue, myMdwHelper.getValueFromData(data.image, '')), 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageTrueColor, myMdwHelper.getValueFromData(data.imageColor, '')));
                    $this.css('background', myMdwHelper.getValueFromData(data.colorBgTrue, myMdwHelper.getValueFromData(data.colorBgFalse, '')));
                    labelElement = `<span 
                                        class="materialdesign-button__label" style="text-align: center; color: ${myMdwHelper.getValueFromData(data.labelColorTrue, myMdwHelper.getValueFromData(data.labelColorFalse, ''))};">
                                        ${data.buttontext}
                                    </span>`;
                }
            }

            if (data.iconPosition === 'top') {
                buttonElementsList.push(`${imageElement}${labelElement}</div>`);
            } else {
                buttonElementsList.push(`${labelElement}${imageElement}</div>`);
            }

            buttonElementsList.push(lockIcon);

            return buttonElementsList.join('')
        } catch (ex) {
            console.error(`[Button - ${data.wid}] vertical initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleLink: function (el, data, isIconButton = false) {
        try {
            let $this = $(el);

            $this.on('click', function (e) {
                // Protect against two events
                event.preventDefault();

                if (!vis.editMode && data.href) {
                    if (data.openNewWindow) {
                        window.open(data.href);
                    } else {
                        window.location.href = data.href;
                    }
                }
            });

            $this.on('tapstart', function (e) {
                myMdwHelper.hapticFeedback(data);
            });
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleLink: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleNavigation: function (el, data, isIconButton = false) {
        try {
            let $this = $(el);

            if (!vis.editMode && data.nav_view) {
                let moved = false;
                $this.on('click', function (e) {
                    // Protect against two events
                    event.preventDefault();

                    if (moved) return;
                    vis.changeView(data.nav_view, data.nav_view);
                    //e.preventDefault();
                    //return false;
                }).on('touchmove', function (e) {
                    moved = true;
                }).on('touchstart', function (e) {
                    moved = false;
                });

                $this.on('tapstart', function (e) {
                    myMdwHelper.hapticFeedback(data);
                });
            }
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleNavigation: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleAddition: function (el, data, isIconButton = false) {
        try {
            let $this = $(el);

            $this.on('click', function (e) {
                // Protect against two events
                event.preventDefault();

                let val = vis.states.attr(data.oid + '.val');
                if (!data.minmax || val != data.minmax) {
                    myMdwHelper.setValue(data.oid, parseFloat(val) + parseFloat(data.value));
                }
            });

            $this.on('tapstart', function (e) {
                myMdwHelper.hapticFeedback(data);
            });
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleAddition: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleState: function (el, data, isMulti = false, isIconButton = false) {
        try {
            // modified from vis adapter -> https://github.com/ioBroker/ioBroker.vis/blob/2a08ee6da626a65b9d0b42b8679563e74272bfc6/www/widgets/basic.html#L480
            var $this = $(el);
            var val = data.value;

            if (val === 'true') val = true;
            if (val === 'false') val = false;

            if ($this.attr('isLocked') === 'true') {
                $this.find('.materialdesign-button-body').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            if (!isMulti) {
                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setLayout(newVal);
                });

                $(document).on("mdwSubscribe", function (e, oids) {
                    if (myMdwHelper.isLayoutRefreshNeeded('Button', data, oids, data.debug)) {
                        setLayout(vis.states.attr(data.oid + '.val'));
                    }
                });
            }

            if (!vis.editMode) {
                var moved = false;
                $this.on('click', function (e) {
                    // Protect against two events
                    event.preventDefault();

                    if (moved) return;

                    if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === undefined) {
                        if (!isMulti) {
                            setValue(data.oid, data.value);
                            setLayout(formatInputValue(data.value));
                        } else {
                            for (var i = 0; i <= data.countOids; i++) {
                                let oid = data['oid' + i]
                                let value = data['value' + i];

                                setTimeout(function () {
                                    setValue(oid, value);
                                }, myMdwHelper.getNumberFromData(data['delayInMs' + i], 0));
                            }
                        }
                    } else {
                        unlockButton();
                    }
                }).on('touchmove', function (e) {
                    moved = true;
                }).on('touchstart', function (e) {
                    moved = false;
                });

                $this.on('tapstart', function (e) {
                    myMdwHelper.hapticFeedback(data);
                });

                function unlockButton() {
                    $this.find('.materialdesign-lock-icon').fadeOut();
                    $this.attr('isLocked', false);
                    $this.find('.materialdesign-button-body').css('filter', 'grayscale(0%)');

                    setTimeout(function () {
                        $this.attr('isLocked', true);
                        $this.find('.materialdesign-lock-icon').show();
                        $this.find('.materialdesign-button-body').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
                }

                function setValue(oid, value) {
                    if (oid) {
                        let val = formatInputValue(value);
                        if (oid) myMdwHelper.setValue(oid, val);
                    }
                }
            }

            if (!isMulti) {
                setLayout(vis.states.attr(data.oid + '.val'));
            }

            function setLayout(val) {
                var formatVal = formatInputValue(data.value);

                if (val === formatVal) {
                    if (!isIconButton) {
                        $this.find('.materialdesign-button-body').css('background', myMdwHelper.getValueFromData(data.colorBgTrue, ''));
                    } else {
                        $this.css('background', myMdwHelper.getValueFromData(data.colorBgTrue, ''));
                    }
                } else {
                    if (!isIconButton) {
                        $this.find('.materialdesign-button-body').css('background', '');
                    } else {
                        $this.css('background', myMdwHelper.getValueFromData(data.colorBgFalse, ''));
                    }
                }
            }

            function formatInputValue(value) {
                // format data.value to correct format
                var val = value;
                if (val === undefined || val === null) val = false;
                if (val === 'true') val = true;
                if (val === 'false') val = false;
                if (parseFloat(val).toString() == val) val = parseFloat(val);

                return val;
            }

        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleState: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleToggle: function (el, data, isIconButton = false, hasSlider = false) {
        try {
            var $this = $(el);

            let $scalaInput;
            let $knobDiv;
            let $linkedValueWidget;

            if ($this.attr('isLocked') === 'true') {
                $this.find('.materialdesign-button-body').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
            }

            let bgColor = myMdwHelper.getValueFromData(data.colorBgFalse, '');
            let bgColorTrue = myMdwHelper.getValueFromData(data.colorBgTrue, bgColor);

            let textFalse = myMdwHelper.getValueFromData(data.buttontext, '');
            let textTrue = myMdwHelper.getValueFromData(data.labelTrue, textFalse);

            let textColorFalse = myMdwHelper.getValueFromData(data.labelColorFalse, '');
            let textColorTrue = myMdwHelper.getValueFromData(data.labelColorTrue, textColorFalse);

            if (hasSlider) {
                data.toggleType = "value";
                intializeSlider();
            }

            setButtonState();

            if (data.readOnly && !vis.editMode) {
                $this.css('pointer-events', 'none');
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setButtonState(newVal);
            });

            if (!vis.editMode) {
                if (myMdwHelper.getBooleanFromData(data.pushButton, false) === false) {

                    if (!hasSlider) {
                        $this.on('click', function (e) {
                            // Protect against two events
                            e.preventDefault();

                            if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined) {
                                if (myMdwHelper.getValueFromData(data.toggleType, 'boolean') === 'boolean') {
                                    myMdwHelper.setValue(data.oid, !vis.states.attr(data.oid + '.val'));
                                } else {
                                    if ($this.attr('toggled') === true || $this.attr('toggled') === 'true') {
                                        myMdwHelper.setValue(data.oid, data.valueOff);
                                    } else {
                                        myMdwHelper.setValue(data.oid, data.valueOn);
                                    }
                                }
                            } else {
                                unlockButton();
                            }
                        });

                        $this.on('tapstart', function (e) {
                            myMdwHelper.hapticFeedback(data);
                        });
                    } else {
                        sliderEvents();
                    }
                } else {
                    // Button from type push (Taster)                   
                    $this.on('mousedown touchstart', function (e) {
                        myMdwHelper.hapticFeedback(data);

                        if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined) {
                            if (data.toggleType === 'boolean') {
                                myMdwHelper.setValue(data.oid, true);
                            } else {
                                myMdwHelper.setValue(data.oid, data.valueOn);
                            }
                        } else {
                            unlockButton();
                        }
                    });

                    $this.on('mouseup touchend', function (e) {
                        if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined) {
                            if (data.toggleType === 'boolean') {
                                myMdwHelper.setValue(data.oid, false);
                            } else {
                                myMdwHelper.setValue(data.oid, data.valueOff);
                            }
                        } else {
                            unlockButton();
                        }
                    });
                }
            }

            function setButtonState(val) {
                if (!val || val === null) {
                    val = vis.states.attr(data.oid + '.val');
                }

                let buttonState = vis.binds.materialdesign.button.getToggleState(val, data);

                if (buttonState) {
                    $this.attr('toggled', true);

                    if (isIconButton) {
                        $this.css('background', bgColorTrue);
                    } else {
                        $this.find('.materialdesign-button-body').css('background', bgColorTrue);
                    }

                    myMdwHelper.changeIconElement($this, myMdwHelper.getValueFromData(data.imageTrue, myMdwHelper.getValueFromData(data.image, '')), 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageTrueColor, myMdwHelper.getValueFromData(data.imageColor, '')));

                    $this.find('.materialdesign-button__label').html(textTrue).css('color', textColorTrue);
                } else {
                    $this.attr('toggled', false);

                    if (isIconButton) {
                        $this.css('background', bgColor);
                    } else {
                        $this.find('.materialdesign-button-body').css('background', bgColor);
                    }

                    myMdwHelper.changeIconElement($this, data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, 'auto', '', 'px'), myMdwHelper.getValueFromData(data.imageColor, ''));

                    $this.find('.materialdesign-button__label').html(textFalse).css('color', textColorFalse);
                }

                if (hasSlider) {
                    sliderSetValue(val, false);
                    setLinkedValueWidgetState(val);
                }
            }

            function unlockButton() {
                $this.find('.materialdesign-lock-icon').fadeOut();
                $this.attr('isLocked', false);
                $this.find('.materialdesign-button-body').css('filter', 'grayscale(0%)');

                setTimeout(function () {
                    $this.attr('isLocked', true);
                    $this.find('.materialdesign-lock-icon').show();
                    $this.find('.materialdesign-button-body').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }

            function intializeSlider() {
                $this.css('overflow', 'visible');
                // $this.css('padding', 0);
                $this.find('.materialdesign-button-body').css('position', 'relative');

                var divW = parseInt(window.getComputedStyle($this.get(0), null).width.replace('px', ''));
                var divH = parseInt(window.getComputedStyle($this.get(0), null).height.replace('px', ''));
                var divMax = ((divW > divH) ? divW : divH);

                // calculate thickness
                let sliderwith = Math.round(divMax + myMdwHelper.getNumberFromData(data.sliderWidth, 20)) + '';
                let optThickness = 1 - (divMax / sliderwith);

                if (data.showInFront) {
                    sliderwith = Math.round(divMax - myMdwHelper.getNumberFromData(data.sliderWidth, 0)) + '';
                    optThickness = 0.15;

                    if (sliderwith <= 0) {
                        sliderwith = 1;
                    }
                }

                let thickness = myMdwHelper.getNumberFromData(data.sliderThikness, undefined) ? data.sliderThikness : optThickness;

                let sliderElement = `
                <div class="materialdesign-icon-button-slider-container" style="position: absolute; left: calc(50% - ${sliderwith}px / 2); top: calc(50% - ${sliderwith}px / 2);">
                    <input type="text" class="scalaInput" value="66" data-width="${sliderwith}" data-height="${sliderwith}" data-thickness="${thickness}" 
                        style="width: 0px;
                        height: 0px;
                        display: hidden;
                        background: rgba(0, 0, 0, 0) none repeat scroll 0% 0%;">
                </div>`

                if (!data.showInFront) {
                    $this.prepend(sliderElement);
                    $this.find('.materialdesign-button-body').css('pointer-events', 'none !important');
                } else {
                    $this.find('.materialdesign-button-body').append(sliderElement);
                }

                $scalaInput = $this.find('.scalaInput');
                let dataMax = myMdwHelper.getNumberFromData(data.valueOn, 100);
                let dataMin = myMdwHelper.getNumberFromData(data.valueOff, 0);

                let knobObj = {
                    displayInput: false,
                    min: dataMin,
                    max: dataMax,
                    step: 1,
                    fgColor: myMdwHelper.getValueFromData(data.foregroundColor, "#44739e"),
                    bgColor: myMdwHelper.getValueFromData(data.backgroundColor, "#eeeeee"),
                    relative: true,
                    angleOffset: myMdwHelper.getNumberFromData(data.angleOffset, 0),
                    angleArc: myMdwHelper.getNumberFromData(data.angleArc, 360),
                    change: function (value) {
                        if (vis.editMode) {
                            return false;
                        }

                        if (!($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined)) {
                            return false;
                        }

                        setLinkedValueWidgetState(value);
                    }
                }

                if (data.colorize) {
                    knobObj.colorize = function (color, value) {
                        return getColors(color, value, dataMin, dataMax, myMdwHelper.getNumberFromData(data.colorizeFactor, 0.5));
                    }
                }

                $knobDiv = $scalaInput.knobHQ(knobObj);

                if (myMdwHelper.getBooleanFromData(data.enable, false) && myMdwHelper.getValueFromData(data.widgetId)) {
                    myMdwHelper.waitForElement($('#vis_container'), `#${data.widgetId}`, data.widgetId, 'Value - Linked', function (element) {
                        $linkedValueWidget = element;
                    }, 0, data.debug);
                }
            }

            function sliderEvents() {
                if (!vis.editMode) {
                    $knobDiv._click = false;
                    $knobDiv._mousedown = false;

                    $this.on('mouseenter', function (e) {
                        e.preventDefault();

                        if (!$knobDiv._mousedown) {
                            sliderShow();
                        }
                    });

                    $this.on('mouseleave', function (e) {
                        e.preventDefault();

                        if (!$knobDiv._mousedown) {
                            sliderHide();
                        }
                    });

                    $this.on('tap', function (e) {
                        e.preventDefault();

                        $knobDiv._click = true;
                        $knobDiv._mousedown = false;
                    });

                    $this.on('tapstart', function (e) {
                        e.preventDefault();

                        myMdwHelper.hapticFeedback(data);

                        $knobDiv._mousedown = true;
                        $knobDiv._click = false;

                        sliderShow();
                        linkedValueWidgetShow();
                    });

                    $this.on('touchstart', function (e) {
                        if ($knobDiv._mousedown) {
                            if (e.simulated) {
                                e.preventDefault();
                                return;
                            }

                            e.simulated = true;
                            $knobDiv.find('canvas').trigger(e);
                            e.preventDefault();
                        }
                    }).on('mousedown', function (e) {
                        if ($knobDiv._mousedown) {
                            if (e.simulated) {
                                e.preventDefault();
                                return;
                            }

                            e.simulated = true;
                            $knobDiv.find('canvas').trigger(e);
                            e.preventDefault();
                        }
                    });

                    $('body').on('tapend', function (e) {
                        if ($knobDiv._click) {
                            if (!data.sliderOnly) {
                                if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined) {
                                    if ($this.attr('toggled') === true || $this.attr('toggled') === 'true') {
                                        let dataVal = myMdwHelper.getNumberFromData(data.valueOff, 100);
                                        myMdwHelper.setValue(data.oid, dataVal);
                                        sliderSetValue(dataVal);
                                    } else {
                                        let dataVal = myMdwHelper.getNumberFromData(data.valueOn, 100);
                                        myMdwHelper.setValue(data.oid, dataVal);
                                        sliderSetValue(dataVal);
                                    }
                                } else {
                                    unlockButton();
                                }
                                sliderHide();
                                linkedValueWidgetHide();
                            }
                        } else {
                            if ($knobDiv._mousedown) {
                                myMdwHelper.hapticFeedback(data);

                                if ($this.attr('isLocked') === 'false' || $this.attr('isLocked') === false || $this.attr('isLocked') === undefined) {
                                    myMdwHelper.setValue(data.oid, $scalaInput.val());
                                }
                                sliderHide();
                                linkedValueWidgetHide();
                            }
                        }

                        $knobDiv._click = false;
                        $knobDiv._mousedown = false;
                    });

                    sliderHide();
                }
            }

            function sliderSetValue(val, setByUser = true) {
                if (val || val === 0) {
                    $scalaInput.data('setByUser', setByUser);
                    $scalaInput.val(val).trigger('change');
                }
            }

            function sliderShow() {
                if (!data.showAlways) {
                    $knobDiv.show();
                }
            }

            function sliderHide() {
                if (!data.showAlways) {
                    setTimeout(function () {
                        $knobDiv.hide();
                    }, 150);
                }
            }

            function linkedValueWidgetShow() {
                if ($linkedValueWidget && $linkedValueWidget.length === 1) {

                    if (myMdwHelper.getValueFromData(data.prepandText, undefined)) {
                        $linkedValueWidget.find('.prepand-text').html(data.prepandText);
                    }

                    if (myMdwHelper.getValueFromData(data.appendText, undefined)) {
                        $linkedValueWidget.find('.append-text').html(data.appendText);
                    }

                    if (myMdwHelper.getValueFromData(data.imageValueWidgetLink, undefined)) {
                        let iconElement = $linkedValueWidget.find('.materialdesign-value-icon .mdi')

                        iconElement.attr('class', function (i, c) {
                            return c.replace(/(^|\s)mdi-\S+/, ` mdi-${data.imageValueWidgetLink}`);
                        });

                        if (myMdwHelper.getValueFromData(data.imageColorValueWidgetLink, undefined)) {
                            iconElement.css('color', data.imageColorValueWidgetLink);
                        }
                    }

                    $linkedValueWidget.show();
                }
            }

            function linkedValueWidgetHide() {
                if ($linkedValueWidget && $linkedValueWidget.length === 1) {
                    setTimeout(function () {
                        $linkedValueWidget.hide();
                    }, 300);
                }
            }

            function setLinkedValueWidgetState(val) {
                if ($linkedValueWidget && $linkedValueWidget.length === 1) {
                    let formatedValue = myMdwHelper.formatNumber(val, 0, 0);
                    let dataMax = myMdwHelper.getNumberFromData(data.valueOn, 100);
                    let dataMin = myMdwHelper.getNumberFromData(data.valueOff, 0);

                    if (formatedValue <= dataMin && myMdwHelper.getValueFromData(data.valueLabelMin, undefined)) {
                        $linkedValueWidget.find('.value-text').html(data.valueLabelMin);
                    } else if (formatedValue >= dataMax && myMdwHelper.getValueFromData(data.valueLabelMax, undefined)) {
                        $linkedValueWidget.find('.value-text').html(data.valueLabelMax);
                    } else {
                        $linkedValueWidget.find('.value-text').html(`${formatedValue}${myMdwHelper.getValueFromData(data.unit, '')}`);
                    }
                }
            }

            function getColors(color, value, min, max, alpha) {
                let myColors;
                let ratio = (value - min) / (max - min);
                alpha = ratio + alpha;

                if (color.includes(';')) {
                    myColors = chroma.scale(color.split(';'))

                    return myColors(ratio).alpha(alpha).css();
                } else {
                    myColors = chroma(color);
                    return myColors.alpha(alpha).css();
                }
            }
        } catch (ex) {
            console.error(`[Button - ${data.wid}] handleToggle: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getToggleState(val, data) {
        let buttonState = false;

        if (data.toggleType === 'boolean') {
            buttonState = val;
        } else {
            if (!isNaN(val) && !isNaN(data.valueOn)) {
                if (parseFloat(val) === parseFloat(data.valueOn)) {
                    buttonState = true;
                } else if (parseFloat(val) !== parseFloat(data.valueOn) && parseFloat(val) !== parseFloat(data.valueOff) && data.stateIfNotTrueValue === 'on') {
                    buttonState = true;
                }
            } else if (val === parseInt(data.valueOn) || val === data.valueOn) {
                buttonState = true;
            } else if (val !== parseInt(data.valueOn) && val !== data.valueOn && val !== parseInt(data.valueOff) && val !== data.valueOff && data.stateIfNotTrueValue === 'on') {
                buttonState = true;
            }
        }

        return buttonState;
    },
    useTheme: function (el, data, type, widgetName) {
        var $this = $(el);
        let btn = $this.parent().get(0) ? $this.parent().get(0) : $this.parent().context;

        $(document).on("mdwSubscribe", function (e, oids) {
            if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                setLayout();
            }
        });

        vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
            setLayout();
        });

        vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
            setLayout();
        });

        setLayout();
        function setLayout() {
            btn.style.setProperty("--materialdesign-color-primary", myMdwHelper.getValueFromData(data.mdwButtonPrimaryColor, '#44739e'));
            btn.style.setProperty("--materialdesign-color-secondary", myMdwHelper.getValueFromData(data.mdwButtonSecondaryColor, '#fff'));
            btn.style.setProperty("--materialdesign-font-button", myMdwHelper.getValueFromData(data.textFontFamily, ''));
            btn.style.setProperty("--materialdesign-font-size-button", myMdwHelper.getStringFromNumberData(data.textFontSize, 'inherit', '', 'px'));
            btn.style.setProperty("--materialdesign-font-button-vertical-text-distance-image", myMdwHelper.getNumberFromData(data.distanceBetweenTextAndImage, 2) + 'px');
            btn.style.setProperty("--materialdesign-button-lockicon-color", myMdwHelper.getValueFromData(data.lockIconColor, '#B22222'));

            if (!type.includes('icon')) {
                btn.style.setProperty("--materialdesign-color-button-pressed", myMdwHelper.getValueFromData(data.mdwButtonColorPress, ''));
            } else {
                // icon Buttons
                $this.css('background', myMdwHelper.getValueFromData(data.colorBgFalse, ''));

                if ($this.attr('toggled') && ($this.attr('toggled') === true || $this.attr('toggled') === 'true')) {
                    $this.css('background', myMdwHelper.getValueFromData(data.colorBgTrue, myMdwHelper.getValueFromData(data.colorBgFalse, '')));
                    $this.find('.materialdesign-icon-image').css('color', myMdwHelper.getValueFromData(data.imageTrueColor, myMdwHelper.getValueFromData(data.imageColor, '')));
                } else {
                    $this.find('.materialdesign-icon-image').css('color', myMdwHelper.getValueFromData(data.imageColor, '#44739e'));
                    $this.css('background', myMdwHelper.getValueFromData(data.colorBgFalse, ''));
                }

                $this.find('.materialdesign-lock-icon').css('background', myMdwHelper.getValueFromData(data.lockIconBackground, '')).css('color', myMdwHelper.getValueFromData(data.lockIconColor, '#B22222'));

                btn.style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.colorPress, ''));

                if (type.includes('slider')) {
                    $this.find('.scalaInput').trigger(
                        'configure',
                        {
                            fgColor: myMdwHelper.getValueFromData(data.foregroundColor, "#44739e"),
                            bgColor: myMdwHelper.getValueFromData(data.backgroundColor, "#eeeeee"),
                        }
                    );
                }
            }
        }
    },
    getDataFromJson(obj, widgetId, type, itemCounter = 0) {
        if (type === this.types.toggle.default) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // labeling
                buttontext: obj.buttontext,
                labelTrue: obj.labelTrue,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            };
        } else if (type === this.types.toggle.vertical) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // labeling
                buttontext: obj.buttontext,
                labelTrue: obj.labelTrue,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (type === this.types.toggle.icon) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                oid: obj.oid,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,
                colorPress: obj.colorPress,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockIconBackground: obj.lockIconBackground,
                lockBackgroundSizeFactor: obj.lockBackgroundSizeFactor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (type === this.types.state.default) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,
                colorBgTrue: obj.colorBgTrue,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale

            }
        } else if (type === this.types.state.vertical) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,
                colorBgTrue: obj.colorBgTrue,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (type === this.types.state.icon) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                oid: obj.oid,
                value: obj.value,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorPress: obj.colorPress,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockIconBackground: obj.lockIconBackground,
                lockBackgroundSizeFactor: obj.lockBackgroundSizeFactor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (type === this.types.link.default) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                buttonStyle: obj.buttonStyle,
                href: obj.href,
                openNewWindow: obj.openNewWindow,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                generateHtmlControl: obj.generateHtmlControl,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
            }
        } else if (type === this.types.link.vertical) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                buttonStyle: obj.buttonStyle,
                href: obj.href,
                openNewWindow: obj.openNewWindow,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight
            }
        } else if (type === this.types.link.icon) {
            return {
                wid: widgetId,
                debug: obj.debug,

                // Common
                href: obj.href,
                openNewWindow: obj.openNewWindow,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorPress: obj.colorPress
            }
        } else if (type === this.types.navigation.vertical) {
            return {
                wid: widgetId,

                // Common
                buttonStyle: obj.buttonStyle,
                nav_view: obj.nav_view,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
            }
        } else if (type === this.types.navigation.default) {
            return {
                wid: widgetId,

                // Common
                buttonStyle: obj.buttonStyle,
                nav_view: obj.nav_view,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight
            }
        } else if (type === this.types.navigation.icon) {
            return {
                wid: widgetId,

                // Common
                nav_view: obj.nav_view,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorPress: obj.colorPress
            }
        } else if (type === this.types.multiState.vertical) {
            let data = {
                wid: widgetId,

                // Common
                countOids: obj.countOids,
                buttonStyle: obj.buttonStyle,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }

            let counter = itemCounter === 0 ? obj.countOids : itemCounter;
            for (var i = 0; i <= counter; i++) {
                data['oid' + i] = obj['oid' + i];
                data['value' + i] = obj['value' + i];
                data['delayInMs' + i] = obj['delayInMs' + i];
            }

            return data;
        } else if (type === this.types.multiState.default) {
            let data = {
                wid: widgetId,

                // Common
                countOids: obj.countOids,
                buttonStyle: obj.buttonStyle,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }

            let counter = itemCounter === 0 ? obj.countOids : itemCounter;
            for (var i = 0; i <= counter; i++) {
                data['oid' + i] = obj['oid' + i];
                data['value' + i] = obj['value' + i];
                data['delayInMs' + i] = obj['delayInMs' + i];
            }

            return data;
        } else if (type === this.types.multiState.icon) {
            let data = {
                wid: widgetId,

                // Common
                countOids: obj.countOids,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorPress: obj.colorPress,

                // Locking
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockIconBackground: obj.lockIconBackground,
                lockBackgroundSizeFactor: obj.lockBackgroundSizeFactor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }

            let counter = itemCounter === 0 ? obj.countOids : itemCounter;
            for (var i = 0; i <= counter; i++) {
                data['oid' + i] = obj['oid' + i];
                data['value' + i] = obj['value' + i];
                data['delayInMs' + i] = obj['delayInMs' + i];
            }

            return data;
        } else if (type === this.types.addition.vertical) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                minmax: obj.minmax,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                alignment: obj.alignment,
                distanceBetweenTextAndImage: obj.distanceBetweenTextAndImage,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,

            }
        } else if (type === this.types.addition.default) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                minmax: obj.minmax,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // labeling
                buttontext: obj.buttontext,
                textFontFamily: obj.textFontFamily,
                textFontSize: obj.textFontSize,
                labelWidth: obj.labelWidth,

                // colors
                mdwButtonPrimaryColor: obj.mdwButtonPrimaryColor,
                mdwButtonSecondaryColor: obj.mdwButtonSecondaryColor,
                mdwButtonColorPress: obj.mdwButtonColorPress,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight
            }
        } else if (type === this.types.addition.icon) {
            return {
                wid: widgetId,

                // Common
                oid: obj.oid,
                value: obj.value,
                minmax: obj.minmax,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                clickSoundPlay: obj.clickSoundPlay,
                clickSoundVolume: obj.clickSoundVolume,
                debug: obj.debug,

                // icon
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,

                // colors
                colorBgFalse: obj.colorBgFalse,
                colorPress: obj.colorPress
            }
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;

            let mdwData = myMdwHelper.getHtmlmdwData(`mdw-type='${type}'` + '\n',
                vis.binds.materialdesign.button.getDataFromJson(widgetData, 0, type));

            if (type.includes('default') || type.includes('vertical')) {
                let width = widgetData.width ? widgetData.width : '100%';
                let height = widgetData.height ? widgetData.height : '100%';

                delete widgetData.width;
                delete widgetData.height;

                html = `<div class='vis-widget materialdesign-widget materialdesign-button materialdesign-button-html-element'` + '\n' +
                    '\t' + `style='width: ${width}; height: ${height}; position: relative; padding: 0px;'` + '\n' +
                    '\t' + mdwData + ">";
            }

            if (type.includes('icon')) {
                let width = widgetData.width ? widgetData.width : '48px';
                let height = widgetData.height ? widgetData.height : '48px';

                delete widgetData.width;
                delete widgetData.height;

                html = `<div class='vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-html-element'` + '\n' +
                    '\t' + `style='width: ${width}; height: ${height}; position: relative; padding: 0px;'` + '\n' +
                    '\t' + mdwData + ">";
            }

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Button: getHtmlConstructor - ${type}] error: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-button-html-element", function () {
    let $this = $(this);
    let type = $this.attr('mdw-type');
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Button HTML Element - ${parentId.replace('w', 'p')} - ${type}]`;

    try {
        let typeSplitted = type.split("_")
        let widgetName = `Button HTML Element '${type}'`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Button HTML Element - ${parentId.replace('w', 'p')} - ${type}]`;

        if (debug) console.log(`${logPrefix} initialize html element from type '${type}'`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.button.getDataFromJson({}, `${parentId}`, vis.binds.materialdesign.button.types[typeSplitted[0]][typeSplitted[1]], $this.attr('mdw-countOids')),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            vis.binds.materialdesign.addRippleEffect($this.children(), widgetData, type.includes('_icon'));
            vis.binds.materialdesign.button.initialize($this, widgetData, type);
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});