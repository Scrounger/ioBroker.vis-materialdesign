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
vis.binds["materialdesign"] = {
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
                        console.log(mdcSlider.value);
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

            var reverse = getValueFromData(data.reverse, false);
            mdcProgress.reverse = reverse;

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
    initializeTopAppBar: function (data) {
        try {
            let headerLayout = '';
            let headerStyle = '';
            let headerButtonShow = '';
            let contentLayout = '';

            if (data.topAppBarLayout === 'standard') {
                contentLayout = 'mdc-top-app-bar--fixed-adjust';
            } else if (data.topAppBarLayout === 'dense') {
                headerLayout = 'mdc-top-app-bar--dense';
                contentLayout = 'mdc-top-app-bar--dense-fixed-adjust';
            } else if (data.topAppBarLayout === 'short') {
                headerLayout = 'mdc-top-app-bar--short mdc-top-app-bar--short-collapsed';
                contentLayout = 'mdc-top-app-bar--short-fixed-adjust';
            }

            if (vis.editMode) {
                headerStyle = 'style="position: absolute;"';
            } else {
                headerStyle = 'style="position: fixed;"';
            }

            if (data.drawerLayout === 'modal' || data.drawerLayout === 'dismissible') {
                headerButtonShow = `<button 
                                        class="mdc-icon-button material-icons mdc-top-app-bar__navigation-icon mdc-ripple-upgraded--unbounded mdc-ripple-upgraded" 
                                        style="--mdc-ripple-fg-size:28px; --mdc-ripple-fg-scale:1.7142857142857142; --mdc-ripple-left:10px; --mdc-ripple-top:10px;${getValueFromData(data.colorTopAppBarTitle, '', 'color: ', ';')}">
                                            menu
                                        </button>`;
            }

            return { headerLayout: headerLayout, headerStyle: headerStyle, contentLayout: contentLayout, headerButtonShow: headerButtonShow }

        } catch (ex) {
            console.exception(`initializeTopAppBar [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    initializeDrawer: function (data) {
        try {
            let viewsList = [];
            let navItemList = [];
            let drawerHeader = '';
            let drawerLayout = '';
            let drawerStyle = '';
            let drawerModalScrim = '';

            initLayoutAndStyle();
            initHeader();
            initistItems();

            return { viewsList: viewsList, drawerItemList: navItemList.join(''), drawerHeader: drawerHeader, drawerLayout: drawerLayout, drawerStyle: drawerStyle, drawerModalScrim: drawerModalScrim };

            function initLayoutAndStyle() {
                let width = getValueFromData(data.drawerWidth, '', 'width: ', 'px;');
                let backgroundColor = getValueFromData(data.colorDrawerBackground, '', 'background: ', ';');

                let drawerZIndex = '';
                let drawerScrimZIndex = '';
                if (data.z_index !== undefined && data.z_index !== null && data.z_index !== '') {
                    drawerZIndex = `z-index: ${data.z_index};`;
                    drawerScrimZIndex = `z-index: ${data.z_index - 1};`;
                }

                let position = '';
                if (data.drawerLayout === 'modal') {
                    drawerLayout = 'mdc-drawer--modal';

                    if (vis.editMode) {
                        position = 'position: absolute;'
                    } else {
                        drawerModalScrim = `<div class="mdc-drawer-scrim" style="${drawerScrimZIndex}"></div>`;
                    }
                } else {
                    // Layout dismissible & permanent
                    if (!vis.editMode) {
                        drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                        position = 'position: fixed;'
                    } else {
                        drawerLayout = 'mdc-drawer--dismissible mdc-drawer--open';
                        position = 'position: absolute;'
                    }
                }

                drawerStyle = `style="${width}${backgroundColor}${drawerZIndex}${position}"`;
            }

            function initHeader() {
                if (data.attr('showHeader') === true || data.attr('showHeader') === 'true') {
                    drawerHeader = `<div 
                                        class="mdc-drawer__header" 
                                        ${getValueFromData(data.colorDrawerHeaderBackground, '', 'style="background: ', '"')}>
                                            ${data.headerLabel}
                                    </div>`;
                }
            }

            function initistItems() {
                let drawerIconHeight = getValueFromData(data.drawerIconHeight, '', 'height: ', 'px;');

                let dawerLabelFontSize = getFontSize(data.listItemTextSize);
                let dawerLabelShow = (data.showLabels) ? '' : 'display: none;';

                // only for Layout Backdrop
                let backdropLabelBackgroundHeight = getValueFromData(data.backdropLabelBackgroundHeight, 'height: auto;', 'height: ', '%;');
                let backdropLabelBackgroundColor = getValueFromData(data.colorDrawerbackdropLabelBackground, '', 'background: ');

                for (var i = 0; i <= data.count; i++) {
                    viewsList.push(data.attr('contains_view_' + i));

                    // generate Header
                    if (getValueFromData(data.attr('headers' + i), null) !== null) {
                        navItemList.push(`<h6 class="mdc-list-group__subheader">${data.attr('headers' + i)}</h6>`);
                    }

                    // generate Item -> mdc-list-item
                    let navItem = '';
                    if (data.drawerItemLayout === 'standard') {
                        // Layout: Standard
                        navItem = `<div 
                                    class="mdc-list-item${(i === 0) ? ' mdc-list-item--activated' : ''}" 
                                    tabindex="${(i === 0) ? '0' : '-1'}" 
                                    id="drawerItem_${i}" 
                                    style="min-height: 40px; height: auto">`
                    } else {
                        // Layout: Backdrop
                        navItem = `<div 
                                    class="mdc-list-item${(i === 0) ? ' mdc-list-item--activated' : ''} mdc-card__media" 
                                    tabindex="${(i === 0) ? '0' : '-1'}" 
                                    style="background-image: url(${data.attr('iconDrawer' + i)}); align-items: flex-end; padding: 0px;${drawerIconHeight}"
                                    >`
                    }

                    // generate Item Image for Layout Standard
                    let navItemImage = ''
                    if (data.drawerItemLayout === 'standard') {
                        if (getValueFromData(data.attr('iconDrawer' + i), null) !== null) {
                            navItemImage = `<img 
                                                class="mdc-list-item__graphic" src="${data.attr('iconDrawer' + i)}" 
                                                style="width: auto; padding-top: 8px; padding-bottom: 8px;${drawerIconHeight}"
                                            >`
                        }
                    }

                    // generate Item Label
                    let navItemLabel = '';
                    let labelText = getValueFromData(data.attr('labels' + i), data.attr('contains_view_' + i));  // Fallback is View Name
                    if (data.drawerItemLayout === 'standard') {
                        // Layout: Standard
                        navItemLabel = `<label 
                                            class="mdc-list-item__text ${dawerLabelFontSize.class}"
                                            id="drawerItem_${i}"
                                            style="${dawerLabelFontSize.style}${dawerLabelShow}">
                                                ${labelText}
                                        </label>`;
                    } else {
                        // Layout: Backdrop
                        navItemLabel =
                            `<div 
                                class="materialdesign-topAppBar-with-Drawer-backdrop-label-container" 
                                id="drawerItemBackdropLabelContainer_${i}" 
                                style="${backdropLabelBackgroundHeight}${backdropLabelBackgroundColor}">
                                    <label 
                                        class="mdc-list-item__text ${dawerLabelFontSize.class}"
                                        id="drawerItem_${i}"
                                        style="${dawerLabelFontSize.style}${dawerLabelShow}">
                                            ${labelText}
                                    </label>
                            </div>`;
                    }

                    navItemList.push(`${navItem}${navItemImage}${navItemLabel}</div>`);

                    // generate Divider
                    if (data.attr('dividers' + i) === true || data.attr('dividers' + i) === 'true') {
                        let divider = '';
                        if (data.listItemDividerStyle === 'standard') {
                            divider = '<hr class="mdc-list-divider">'
                        } else {
                            divider = '<hr class="mdc-list-divider mdc-list-divider--' + data.listItemDividerStyle + '">'
                        }
                        navItemList.push(divider);
                    }
                }
            }
        } catch (ex) {
            console.exception(`initializeDrawer [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcTopAppBarWithDrawer: function (el, data) {
        try {
            let $this = $(el);

            let widget = $this.parent().parent().get(0);
            let mdcDrawer = $this.context;
            let mdcTopAppBar = $this.parent().find('.mdc-top-app-bar').get(0);
            let mdcList = $this.parent().find('.mdc-list').get(0);

            setTimeout(function () {
                // Bug fix für TopAppBar, da position: fixed sein muss, deshlab zur Laufzeit width anpassen -> wird von widget genommen
                $this.parent().parent().css('left', '0px');
                $this.parent().parent().css('top', '0px');


                if (data.drawerLayout === 'modal') {
                    let width = window.getComputedStyle(widget, null).width;

                    if (data.topAppBarLayout !== 'short') {
                        $this.parent().find('.mdc-top-app-bar').css('width', width);
                    }
                } else {
                    let width = window.getComputedStyle(widget, null).width;
                    let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                    let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                    if (data.topAppBarLayout !== 'short') {
                        $this.parent().find('.mdc-top-app-bar').css('width', barWidth);
                    } else {
                        if (!vis.editMode) {
                            $this.parent().find('.mdc-top-app-bar').css('left', widthDrawer);
                        }
                    }
                    $this.parent().find('.drawer-frame-app-content').css('left', widthDrawer);
                }

            }, 1);

            mdcList.style.setProperty("--materialdesign-color-list-item-selected", getValueFromData(data.colorListItemSelected, ''));
            mdcList.style.setProperty("--materialdesign-color-list-item-hover", getValueFromData(data.colorListItemHover, ''));
            mdcList.style.setProperty("--materialdesign-color-list-item-text", getValueFromData(data.colorListItemText, ''));
            mdcList.style.setProperty("--materialdesign-color-list-item-text-activated", getValueFromData(data.colorListItemTextSelected, ''));
            mdcList.style.setProperty("--materialdesign-color-list-item-header", getValueFromData(data.colorListItemHeaders, ''));
            mdcList.style.setProperty("--materialdesign-color-list-item-divider", getValueFromData(data.colorListItemDivider, ''));

            mdcTopAppBar.style.setProperty("--mdc-theme-primary", getValueFromData(data.colorTopAppBarBackground, ''));

            const drawer = new mdc.drawer.MDCDrawer(mdcDrawer);
            const topAppBar = new mdc.topAppBar.MDCTopAppBar(mdcTopAppBar);
            const navList = new mdc.list.MDCList(mdcList);

            topAppBar.setScrollTarget($this.parent().find('.mdc-top-app-bar-content').get(0));

            topAppBar.listen('MDCTopAppBar:nav', () => {

                if (data.drawerLayout === 'dismissible') {
                    if (drawer.open) {
                        let width = window.getComputedStyle(widget, null).width;
                        let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;

                        if (data.topAppBarLayout !== 'short') {
                            $this.parent().find('.mdc-top-app-bar').css('width', width);
                        } else {
                            if (!vis.editMode) {
                                $this.parent().find('.mdc-top-app-bar').css('left', '0px');
                            }
                        }
                        $this.parent().find('.drawer-frame-app-content').css('left', '0px');

                        drawer.open = !drawer.open;
                    } else {
                        let width = window.getComputedStyle(widget, null).width;
                        let widthDrawer = window.getComputedStyle(mdcDrawer, null).width;
                        let barWidth = width.replace('px', '') - widthDrawer.replace('px', '');

                        drawer.open = !drawer.open;

                        setTimeout(function () {
                            if (data.topAppBarLayout !== 'short') {
                                $this.parent().find('.mdc-top-app-bar').css('width', barWidth);
                            } else {
                                if (!vis.editMode) {
                                    $this.parent().find('.mdc-top-app-bar').css('left', widthDrawer);
                                }
                            }
                            $this.parent().find('.drawer-frame-app-content').css('left', widthDrawer);
                        }, 250);
                    }
                } else {
                    drawer.open = !drawer.open;
                }
            });

            var val = vis.states.attr(data.oid + '.val');
            navList.selectedIndex = val;
            setTopAppBarWithDrawerLayout();

            navList.listen('MDCList:action', (event) => {
                val = vis.states.attr(data.oid + '.val');

                if (val != navList.selectedIndex) {
                    vis.setValue(data.oid, navList.selectedIndex);

                    setTopAppBarWithDrawerLayout();

                    setTimeout(function () {
                        window.scrollTo({ top: 0, left: 0, });
                    }, 50);
                } else {
                    if (data.drawerItemLayout === 'backdrop') {
                        let backdropItemContainer = $this.parent().find(`div[id="drawerItemBackdropLabelContainer_${navList.selectedIndex}"]`);
                        backdropItemContainer.css('background', getValueFromData(data.colorDrawerbackdropLabelBackground, ''));
                    }
                }

                if (data.drawerLayout === 'modal') {
                    drawer.open = false;
                }
            });

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                navList.selectedIndex = newVal;
                setTopAppBarWithDrawerLayout();

                let backdropItemContainer = $this.parent().find(`div[id="drawerItemBackdropLabelContainer_${oldVal}"]`);
                backdropItemContainer.css('background', getValueFromData(data.colorDrawerbackdropLabelBackground, ''));
            });

            function setTopAppBarWithDrawerLayout() {
                if (data.showSelectedItemAsTitle) {
                    let selectedName = $this.parent().find(`label[id="drawerItem_${navList.selectedIndex}"]`).text();
                    $this.parent().find('.mdc-top-app-bar__title').text(selectedName)
                }

                if (data.drawerItemLayout === 'backdrop') {
                    let backdropItemContainer = $this.parent().find(`div[id="drawerItemBackdropLabelContainer_${navList.selectedIndex}"]`);
                    backdropItemContainer.css('background', getValueFromData(data.colorDrawerbackdropLabelBackgroundActive, ''));
                }
            }
        } catch (ex) {
            console.exception(`mdcTopAppBarWithDrawer [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
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

vis.binds["materialdesign"].showVersion();