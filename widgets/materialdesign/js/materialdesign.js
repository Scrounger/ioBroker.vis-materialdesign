/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.0.1"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

if (vis.editMode) {
    let iobSystemDic = systemDictionary;
    $.get("../vis-materialdesign.admin/words.js", function (script) {
        let translation = script.substring(script.indexOf('{'), script.length);
        translation = translation.substring(0, translation.lastIndexOf(';'));
        $.extend(systemDictionary, JSON.parse(translation));
        $.extend(systemDictionary, iobSystemDic);
    });
}

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign = {
    version: "0.0.1",
    showVersion: function () {
        if (vis.binds["materialdesign"].version) {
            console.log('Version vis-materialdesign: ' + vis.binds["materialdesign"].version);
            vis.binds["materialdesign"].version = null;
        }
    },
    createWidget: function (widgetID, view, data, style) {
        var $div = $('#' + widgetID);
        // if nothing found => wait
        if (!$div.length) {
            return setTimeout(function () {
                vis.binds["materialdesign"].createWidget(widgetID, view, data, style);
            }, 100);
        }

        var text = '';
        text += 'OID: ' + data.oid + '</div><br>';
        text += 'OID value: <span class="myset-value">' + vis.states[data.oid + '.val'] + '</span><br>';
        text += 'Color: <span style="color: ' + data.myColor + '">' + data.myColor + '</span><br>';
        text += 'extraAttr: ' + data.extraAttr + '<br>';
        text += 'Browser instance: ' + vis.instance + '<br>';
        text += 'htmlText: <textarea readonly style="width:100%">' + (data.htmlText || '') + '</textarea><br>';

        $('#' + widgetID).html(text);

        // subscribe on updates of value
        if (data.oid) {
            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                $div.find('.materialdesign-value').html(newVal);
            });
        }
    },
    addRippleEffect: function (el, data, isIconButton = false) {
        var $this = $(el).parent();
        if (!isIconButton) {
            mdc.ripple.MDCRipple.attachTo($this.context);
            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;

            if (data.buttonStyle === 'text' || data.buttonStyle === 'outlined') {
                $this.context.style.setProperty("--mdc-theme-primary", colorPress);
            } else {
                $this.context.style.setProperty("--mdc-theme-on-primary", colorPress);
            }
        } else {
            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;
            $this.context.style.setProperty("--mdc-theme-primary", colorPress);

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle($this.context);
        }
    },
    buttonLink: function (el, data) {
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
    buttonNavigation: function (el, data) {
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
    itoggle: function (el, data) {
        try {
            var $this = $(el).parent();
            var oid = $this.parent().attr('data-oid');
            if (oid) {
                oid += '.val';
            }
            var val = vis.states.attr(oid);
            var activeVal = $this.parent().data('val');
            if (activeVal === '' || activeVal === undefined) activeVal = null;
            if (activeVal !== null) {
                if (val === null || val === undefined) val = '';
                if (activeVal.toString() === val.toString()) {

                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();

                    $this.find('.labelToggleFalse').hide();
                    $this.find('.labelToggleTrue').show();

                    // True -> colorBgTrue color nehmen
                    (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                }
            } else {
                if (val === 'false') val = false;
                if (val === 'true') val = true;
                if (typeof val === 'string') {
                    var f = parseFloat(val);
                    if (f == val) {
                        val = f;
                    } else {
                        val = val !== '';
                    }
                }
                if (val > 0) {
                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();

                    $this.find('.labelToggleFalse').hide();
                    $this.find('.labelToggleTrue').show();

                    // True -> colorBgTrue color nehmen
                    (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                    (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                }
            }
            function onChange(e, val) {
                if (activeVal !== null) {
                    if (activeVal.toString() === val.toString()) {
                        $this.find('.imgToggleFalse').hide();
                        $this.find('.imgToggleTrue').show();

                        $this.find('.labelToggleFalse').hide();
                        $this.find('.labelToggleTrue').show();

                        // True -> colorBgTrue color nehmen
                        (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                        (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                    } else {
                        $this.find('.imgToggleTrue').hide();
                        $this.find('.imgToggleFalse').show();

                        $this.find('.labelToggleTrue').hide();
                        $this.find('.labelToggleFalse').show();

                        // False -> css color nehmen
                        (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                        (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                    }
                } else {
                    if (val === true || val === 'true' || parseFloat(val) > 0) {
                        $this.find('.imgToggleFalse').hide();
                        $this.find('.imgToggleTrue').show();

                        $this.find('.labelToggleFalse').hide();
                        $this.find('.labelToggleTrue').show();

                        // True -> colorBgTrue color nehmen
                        (data.colorBgTrue !== '') ? $this.css('background', data.colorBgTrue) : (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                        (data.labelColorBgTrue !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgTrue) : (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                    } else {
                        $this.find('.imgToggleTrue').hide();
                        $this.find('.imgToggleFalse').show();

                        $this.find('.labelToggleTrue').hide();
                        $this.find('.labelToggleFalse').show();

                        // False -> css color nehmen
                        (data.colorBgFalse !== '') ? $this.css('background', data.colorBgFalse) : $this.css('background', $this.parent().css("background"));

                        (data.labelColorBgFalse !== '') ? $this.find('.labelRowContainer').css('background', data.labelColorBgFalse) : $this.find('.labelRowContainer').css('background', $this.parent().css("background"));
                    }
                }
            }
            if (oid) {
                vis.states.bind(oid, onChange);
                // remember all ids, that bound
                $this.parent()
                    .data('bound', [oid])
                    // remember bind handler
                    .data('bindHandler', onChange);
            }
        } catch (ex) {
            console.exception(`itoggle [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcSwitch: function (el, data) {
        try {
            var $this = $(el);
            var oid = $this.data('oid');

            const mdcFormField = new mdc.formField.MDCFormField($this.context);
            const mdcSwitch = new mdc.switchControl.MDCSwitch($this.find('.mdc-switch').get(0));
            mdcFormField.input = mdcSwitch;

            mdcSwitch.disabled = getValueFromData(data.readOnly, false);

            setSwitchState();

            $this.find('.mdc-switch').click(function () {
                vis.setValue(oid, mdcSwitch.checked);
                setSwitchState();
            });

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                setSwitchState();
            });

            function setSwitchState() {
                var val = vis.states.attr(oid + '.val');
                mdcSwitch.checked = val;

                let label = $this.find('label[id="label"]');
                if (val) {
                    label.css('color', getValueFromData(data.labelColorTrue, ''));
                    label.text(getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', getValueFromData(data.labelColorFalse, ''));
                    label.text(getValueFromData(data.labelFalse, ''));
                }
            }
        } catch (ex) {
            console.exception(`mdcSwitch: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcCheckbox: function (el, data) {
        try {
            let $this = $(el);

            const mdcFormField = new mdc.formField.MDCFormField($this.context);
            const mdcCheckbox = new mdc.checkbox.MDCCheckbox($this.find('.mdc-checkbox').get(0));
            mdcFormField.input = mdcCheckbox;

            mdcCheckbox.disabled = getValueFromData(data.readOnly, false);

            setCheckboxState();

            $this.find('.mdc-checkbox').click(function () {
                vis.setValue(data.oid, mdcCheckbox.checked);
                setCheckboxState();
            });

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setCheckboxState();
            });

            function setCheckboxState() {
                var val = vis.states.attr(data.oid + '.val');
                mdcCheckbox.checked = val;

                let label = $this.find('label[id="label"]');
                if (val) {
                    label.css('color', getValueFromData(data.labelColorTrue, ''));
                    label.text(getValueFromData(data.labelTrue, ''));
                } else {
                    label.css('color', getValueFromData(data.labelColorFalse, ''));
                    label.text(getValueFromData(data.labelFalse, ''));
                }
            }
        } catch (ex) {
            console.exception(`mdcCheckbox [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcSlider: function (el, data, discrete = false) {
        try {
            let $this = $(el);

            let min = getValueFromData(data.min, 0);
            let labelMin = getValueFromData(data.valueLabelMin, null);
            let max = getValueFromData(data.max, 1);
            let labelMax = getValueFromData(data.valueLabelMax, null);
            let unit = getValueFromData(data.valueLabelUnit, '');

            let showMarker = '';
            if (data.showMarkers === 'true' || data.showMarkers === true) {
                showMarker = 'mdc-slider--display-markers';
            }

            setTimeout(function () {
                let valueOnLoading = vis.states.attr(data.oid + '.val');

                // Slider Attributes für Initialisierung ermitteln
                let pctComplete = (valueOnLoading - data.min) / (data.max - data.min);
                let sliderWidth = window.getComputedStyle($this.context, null).width.replace('px', '');

                let labelWitdh = 0;
                if (data.showValueLabel === true || data.showValueLabel === 'true') {
                    labelWitdh = data.valueLabelWidth;
                }

                let translatePx = (sliderWidth - labelWitdh) * pctComplete;

                // Slider Element dynamisch erzeugen
                let sliderConstructor = '';
                if (!discrete) {
                    sliderConstructor =
                        `<div class="mdc-slider" tabindex="0" role="slider" style="<%= colorSlider %>" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                            <div class="mdc-slider__track-container">
                                <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            </div>
                            <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                                <svg class="mdc-slider__thumb" width="21" height="21">
                                    <circle cx="10.5" cy="10.5" r="7.875"></circle>
                                </svg>
                                <div class="mdc-slider__focus-ring"></div>
                            </div>
                        </div>`;
                } else {
                    sliderConstructor =
                        `<div class="mdc-slider mdc-slider--discrete ${showMarker}" tabindex="0" role="slider" aria-valuemin="${data.min}" aria-valuemax="${data.max}" aria-valuenow="${valueOnLoading}" data-step="${data.step}">
                        <div class="mdc-slider__track-container">
                            <div class="mdc-slider__track" style="transform: scaleX(${pctComplete});"></div>
                            <div class="mdc-slider__track-marker-container"></div>
                        </div>
                        <div class="mdc-slider__thumb-container" style="transform: translateX(${translatePx}px) translateX(-50%);">
                            <div class="mdc-slider__pin">
                                <span class="mdc-slider__pin-value-marker"></span>
                            </div>
                            <svg class="mdc-slider__thumb" width="21" height="21">
                                <circle cx="10.5" cy="10.5" r="7.875"></circle>
                            </svg>
                            <div class="mdc-slider__focus-ring"></div>
                        </div>
                    </div>`;
                }

                if (labelWitdh > 0) {
                    sliderConstructor = sliderConstructor +
                        `<span class="labelValue" style="width: ${labelWitdh}px; text-align: right;">${valueOnLoading} ${unit}</span>`;
                }

                // Slider hinzufügen
                $this.html(`<div class="materialdesign vis-widget-body" style="display: flex; justify-content: center; align-items: center;">
                                ${sliderConstructor}
                            </div>`);

                // Slider Control
                let sliderElement = $this.find('.mdc-slider').get(0);

                // Colors
                sliderElement.style.setProperty("--mdc-theme-secondary", getValueFromData(data.colorSlider, ''));
                $this.find('.mdc-slider__track-container').css('background-color', getValueFromData(data.colorSliderBg, ''));

                if (data.knobSize === 'knobMedium') {
                    $this.find('.mdc-slider__thumb').attr('width', '31').attr('height', '31').css('margin-left', '-5px').css('margin-top', '-5px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-5px');
                    $this.find('circle').attr('cx', '15.5').attr('cy', '15.5').attr('r', '11.8125');
                } else if (data.knobSize === 'knobBig') {
                    $this.find('.mdc-slider__thumb').attr('width', '42').attr('height', '42').css('margin-left', '-10px').css('margin-top', '-10px');
                    $this.find('.mdc-slider__pin').css('margin-top', '-7px');
                    $this.find('circle').attr('cx', '21').attr('cy', '21').attr('r', '15.75');
                }

                if (!vis.editMode) {
                    const mdcSlider = new mdc.slider.MDCSlider(sliderElement);

                    // Slider Initialiserung setzen
                    setSliderState();

                    // Slider user input -> Wert übergeben
                    mdcSlider.listen('MDCSlider:change', function () {
                        vis.setValue(data.oid, mdcSlider.value);
                    });

                    mdcSlider.listen('MDCSlider:input', function () {
                        setSliderState(false, mdcSlider.value);
                    });

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        setSliderState();
                    });

                    vis.states.bind(data.wid + '.val', function (e, newVal, oldVal) {
                        if (!newVal) {
                            setSliderState();
                        }
                    });

                    function setSliderState(setVisValue = true, val = 0) {
                        if (!vis.states.attr(data.wid + '.val')) {
                            if (setVisValue) {
                                val = vis.states.attr(data.oid + '.val');
                                mdcSlider.value = val;
                            }

                            if (val <= min && labelMin != null) {
                                $this.find('.labelValue').html(labelMin);
                            } else if (val >= max && labelMax != null) {
                                $this.find('.labelValue').html(labelMax);
                            } else {
                                $this.find('.labelValue').html(`${val} ${unit}`);
                            }
                        }
                    }
                }
            }, data.initDelay);
        } catch (ex) {
            console.exception(`mdcSlider [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcProgress: function (el, data) {
        try {
            let $this = $(el);
            var oid = $this.attr('data-oid');

            const mdcProgress = new mdc.linearProgress.MDCLinearProgress($this.context);

            var min = getValueFromData(data.min, 0);
            var max = getValueFromData(data.max, 1);
            var unit = getValueFromData(data.valueLabelUnit, '');
            var decimals = getValueFromData(data.valueMaxDecimals, 0);

            mdcProgress.reverse = data.reverse;

            var color = getValueFromData(data.color, '');
            var colorOneCondition = getValueFromData(data.colorOneCondition, 0);
            var colorOne = getValueFromData(data.colorOne, '');
            var colorTwoCondition = getValueFromData(data.colorTwoCondition, 0);
            var colorTwo = getValueFromData(data.colorTwo, '');

            if (colorOne === '') colorOne = color;
            if (colorTwo === '') colorTwo = color;

            setProgressState();

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                setProgressState();
            });

            function setProgressState() {
                var val = vis.states.attr(oid + '.val');

                // Falls quellen boolean ist
                if (val === true || val === 'true') val = max;
                if (val === false || val === 'false') val = min;

                val = parseFloat(val);

                if (isNaN(val)) val = min;
                if (val < min) val = min;
                if (val > max) val = max;

                let simRange = 100;
                let range = max - min;
                let factor = simRange / range;
                val = Math.floor((val - min) * factor);

                mdcProgress.progress = val / 100;

                let valueLabel = Math.round(vis.states.attr(oid + '.val') * Math.pow(10, decimals)) / Math.pow(10, decimals)
                $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html('&nbsp;' + valueLabel + unit + '&nbsp;');

                if (valueLabel > colorOneCondition && valueLabel <= colorTwoCondition) {
                    $this.find('.mdc-linear-progress__bar.mdc-linear-progress__primary-bar').find('.mdc-linear-progress__bar-inner').css('background-color', colorOne)
                } else if (valueLabel > colorTwoCondition) {
                    $this.find('.mdc-linear-progress__bar.mdc-linear-progress__primary-bar').find('.mdc-linear-progress__bar-inner').css('background-color', colorTwo)
                } else {
                    $this.find('.mdc-linear-progress__bar.mdc-linear-progress__primary-bar').find('.mdc-linear-progress__bar-inner').css('background-color', color)
                }
            }
        } catch (ex) {
            console.exception(`mdcProgress [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcIconButtonToggle: function (el, data) {
        try {
            let $this = $(el);
            var oid = $this.attr('data-oid');

            var colorBgFalse = (data.colorBgFalse === undefined || data.colorBgFalse === null || data.colorBgFalse === '') ? '' : data.colorBgFalse;
            var colorBgTrue = (data.colorBgTrue === undefined || data.colorBgTrue === null || data.colorBgTrue === '') ? '' : data.colorBgTrue;

            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;
            $this.context.style.setProperty("--mdc-theme-primary", colorPress);

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle($this.context);

            setIconButtonState();

            mdcIconButton.listen('MDCIconButtonToggle:change', function () {
                vis.setValue(oid, mdcIconButton.on);
                setIconButtonState();
            });

            vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                setIconButtonState();
            });

            function setIconButtonState() {
                var val = vis.states.attr(oid + '.val');
                mdcIconButton.on = val;

                if (val) {
                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();
                    $this.css('background', colorBgTrue);
                } else {
                    $this.find('.imgToggleFalse').show();
                    $this.find('.imgToggleTrue').hide();
                    $this.css('background', colorBgFalse);
                }
            };
        } catch (ex) {
            console.exception(`mdcIconButton [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcList: function (el, data) {
        try {
            let $this = $(el);

            let list = $this.context;

            const mdcList = new mdc.list.MDCList(list);
            const mdcListAdapter = mdcList.getDefaultFoundation().adapter_;
            const listItemRipples = mdcList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

            list.style.setProperty("--materialdesign-color-list-item-selected", getValueFromData(data.colorListItemSelected, ''));
            list.style.setProperty("--materialdesign-color-list-item-hover", getValueFromData(data.colorListItemHover, ''));
            list.style.setProperty("--materialdesign-color-list-item-text", getValueFromData(data.colorListItemText, ''));
            list.style.setProperty("--materialdesign-color-list-item-header", getValueFromData(data.colorListItemHeaders, ''));
            list.style.setProperty("--materialdesign-color-list-item-divider", getValueFromData(data.colorListItemDivider, ''));

            mdcList.listen('MDCList:action', function (item) {
                let index = item.detail.index;

                if (data.listType === 'checkbox' || data.listType === 'switch') {
                    let selectedValue = mdcListAdapter.isCheckboxCheckedAtIndex(index);

                    vis.setValue(data.attr('oid' + index), selectedValue);

                    setLayout(index, selectedValue);

                    console.log('hier');
                } else if (data.listType === 'buttonToggle') {
                    let selectedValue = vis.states.attr(data.attr('oid' + index) + '.val');

                    vis.setValue(data.attr('oid' + index), !selectedValue);

                    setLayout(index, !selectedValue);
                } else if (data.listType === 'buttonState') {
                    let valueToSet = data.attr('listTypeButtonStateValue' + index);

                    vis.setValue(data.attr('oid' + index), valueToSet);
                } else if (data.listType === 'buttonNav') {
                    vis.changeView(data.attr('listTypeButtonNav' + index));
                } else if (data.listType === 'buttonLink') {
                    window.open(data.attr('listTypeButtonLink' + index));
                }
            });

            let itemCount = (data.listType === 'switch') ? $this.find('.mdc-switch').length : mdcList.listElements.length;

            for (var i = 0; i <= itemCount - 1; i++) {
                if (data.listType === 'checkbox' || data.listType === 'switch') {
                    if (data.listType === 'switch') new mdc.switchControl.MDCSwitch($this.find('.mdc-switch').get(i));

                    let valOnLoading = vis.states.attr(data.attr('oid' + i) + '.val');
                    mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(i, valOnLoading);
                    setLayout(i, valOnLoading);

                    vis.states.bind(data.attr('oid' + i) + '.val', function (e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen
                        let input = $this.find('input[data-oid="' + e.type.replace('.val', '') + '"]');

                        input.each(function (d) {
                            // kann mit mehreren oid verknüpft sein
                            let index = input.eq(d).attr('itemindex');
                            mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(index, newVal);
                            setLayout(index, newVal);
                        });
                    });

                } else if (data.listType === 'buttonToggle') {
                    let valOnLoading = vis.states.attr(data.attr('oid' + i) + '.val');
                    setLayout(i, valOnLoading);

                    vis.states.bind(data.attr('oid' + i) + '.val', function (e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen
                        let input = $this.parent().find('li[data-oid="' + e.type.replace('.val', '') + '"]');

                        input.each(function (d) {
                            // kann mit mehreren oid verknüpft sein
                            let index = input.eq(d).attr('listitemindex');
                            setLayout(index, newVal);
                        });
                    });
                }
            }

            function setLayout(index, val) {

                let curListItem = $this.find(`li[id="listItem_${index}"]`);
                let curListItemImage = $this.find(`img[id="itemImage_${index}"]`);
                if (val === true) {
                    curListItem.css('background', getValueFromData(data.listItemBackgroundActive, ''));
                    curListItemImage.attr('src', getValueFromData(data.attr('listImageActive' + index), getValueFromData(data.attr('listImage' + index), '')))
                } else {
                    curListItem.css('background', getValueFromData(data.listItemBackground, ''));
                    curListItemImage.attr('src', getValueFromData(data.attr('listImage' + index), ''))
                }
            }

        } catch (ex) {
            console.exception(`mdcList [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
};

function getValueFromData(dataValue, nullValue, prepand = '', append = '') {
    try {
        return (dataValue === undefined || dataValue === null || dataValue === '') ? nullValue : prepand + dataValue + append;
    } catch (err) {
        console.error(err.message);
        return 'Error';
    }
}

function getFontSize(fontSizeValue) {
    let fontSize = getValueFromData(fontSizeValue, null);

    if (fontSize !== null) {
        if (fontSize.includes('headline') || fontSize.includes('subtitle')) {
            // font size is a mdc-typography style
            return { class: `mdc-typography--${fontSize}`, style: '' };
        } else if (!isNaN(fontSize)) {
            // number only
            return { class: ``, style: `font-size: ${fontSize}px;` };
        } else {
            return { class: ``, style: `font-size: ${fontSize};` };
        }
    } else {
        return { class: '', style: '' };
    }
}

function getListItemHeader(text, fontSize) {
    if (text !== null) {
        return `<h3 class="mdc-list-group__subheader ${fontSize.class}" 
                    style="${fontSize.style}">
                        ${text}
                </h3>`;
    }
    return '';
}

function getListItemTextElement(text, subText, fontSize, subFontSize) {
    return `<span class="mdc-list-item__text">     
                <span class="mdc-list-item__primary-text ${fontSize.class}" style="${fontSize.style}">${text}</span>
                <span class="mdc-list-item__secondary-text ${subFontSize.class}" style="${subFontSize.style}">${subText}</span>
            </span>`;
}

function getListItemImage(image, style) {
    if (image != '') {
        return `<img 
                class="mdc-list-item__graphic" src="${image}" 
                style="width: auto; padding-top: 8px; padding-bottom: 8px;${style}"
            >`
    }
    return '';
}

function getListItem(layout, itemIndex, backdropImage, backdropImageHeight, hasSubItems, isSubItem = false) {

    if (layout === 'standard') {
        // Layout: Standard
        return `<div 
                    class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''} ${(hasSubItems) ? 'hasSubItems' : ''}" 
                    tabindex="${(itemIndex === 0) ? '0' : '-1'}" 
                    id="itemIndex_${itemIndex}"
                >`
    } else {
        // Layout: Backdrop
        return `<div 
                    class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''} mdc-card__media ${(hasSubItems) ? 'hasSubItems' : ''}" 
                    tabindex="${(itemIndex === 0) ? '0' : '-1'}"
                    id="itemIndex_${itemIndex}"
                    style="background-image: url(${backdropImage}); align-items: flex-end; padding: 0px;${backdropImageHeight}"
                >`
    }
}

function getListItemLabel(layout, itemIndex, text, hasSubItems, fontSize, showLabel, toggleIconColor, backdropLabelHeight, isSubItem = false) {

    let subItemToggleIcon = '';
    if (hasSubItems) {
        subItemToggleIcon = `<span 
                                class="mdc-list-item__meta material-icons toggleIcon" aria-hidden="true" ${getValueFromData(toggleIconColor, '', 'style="color: ', ';"')}>
                                    keyboard_arrow_down
                            </span>`;
    }

    if (layout === 'standard') {
        // Layout: Standard
        let listItemLabel = `<span 
                                class="mdc-list-item__text ${fontSize.class}"
                                id="itemIndex_${itemIndex}"
                                style="${fontSize.style}${showLabel}">
                                    ${text}
                            </span>`;

        return listItemLabel + subItemToggleIcon;

    } else {
        // Layout: Backdrop

        // generate SubItems toggle Icon
        return `<div 
                    class="materialdesign-list-item-backdrop-container${(isSubItem) ? ' isSubItem' : ''}" 
                    id="backdropContainer_${itemIndex}" 
                    style="${backdropLabelHeight}">
                        <span 
                            class="mdc-list-item__text ${fontSize.class}"
                            id="itemIndex_${itemIndex}"
                            style="position: absolute; ${fontSize.style}${showLabel}">
                                ${text}
                        </span>
                        ${subItemToggleIcon}
                </div>`;
    }
}

vis.binds["materialdesign"].showVersion();