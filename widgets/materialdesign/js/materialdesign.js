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
    mdcSlider: function (el, data) {
        try {
            setTimeout(function () {
                // timeout damit slider funktioniert notwendig
                let $this = $(el);
                let oid = $this.attr('data-oid');
                let wid = $this.attr('data-oid-working');

                const mdcSlider = new mdc.slider.MDCSlider($this.context);

                let min = getValueFromData(data.min, 0);
                let labelMin = getValueFromData(data.valueLabelMin, null);
                let max = getValueFromData(data.max, 1);
                let labelMax = getValueFromData(data.valueLabelMax, null);
                let unit = getValueFromData(data.valueLabelUnit, '');

                // Wert beim intialisieren setzen, sofern nicht working aktiv
                setSliderState();

                // Slider user input -> Wert übergeben
                mdcSlider.listen('MDCSlider:change', function () {
                    vis.setValue(oid, mdcSlider.value);
                });

                vis.states.bind(oid + '.val', function (e, newVal, oldVal) {
                    setSliderState();
                });

                vis.states.bind(wid + '.val', function (e, newVal, oldVal) {
                    if (!newVal) {
                        setSliderState();
                    }
                });

                function setSliderState() {
                    if (!vis.states.attr(wid + '.val')) {
                        let val = vis.states.attr(oid + '.val');
                        mdcSlider.value = val;

                        if (val <= min && labelMin != null) {
                            $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html(labelMin);
                        } else if (val >= max && labelMax != null) {
                            $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html(labelMax);
                        } else {
                            $this.parents('.materialdesign.vis-widget-body').find('.labelValue').html(val + unit);
                        }
                    }
                }
            }, 250);
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

            let colorDrawerSelected = (data.colorDrawerSelected === undefined || data.colorDrawerSelected === null || data.colorDrawerSelected === '') ? '' : data.colorDrawerSelected;
            mdcList.style.setProperty("--color-list-item-selected", colorDrawerSelected);

            let colorDrawerHover = (data.colorDrawerHover === undefined || data.colorDrawerHover === null || data.colorDrawerHover === '') ? '' : data.colorDrawerHover;
            mdcList.style.setProperty("--color-list-item-hover", colorDrawerHover);

            let colorDrawerText = (data.colorDrawerText === undefined || data.colorDrawerText === null || data.colorDrawerText === '') ? '' : data.colorDrawerText;
            mdcList.style.setProperty("--color-list-item-text", colorDrawerText);

            let colorDrawerTextSelected = (data.colorDrawerTextSelected === undefined || data.colorDrawerTextSelected === null || data.colorDrawerTextSelected === '') ? '' : data.colorDrawerTextSelected;
            mdcList.style.setProperty("--color-list-item-text-activated", colorDrawerTextSelected);

            let colorTopAppBarBackground = (data.colorTopAppBarBackground === undefined || data.colorTopAppBarBackground === null || data.colorTopAppBarBackground === '') ? '' : data.colorTopAppBarBackground;
            mdcTopAppBar.style.setProperty("--mdc-theme-primary", colorTopAppBarBackground);


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


            list.style.setProperty("--color-list-item-selected", getValueFromData(data.colorItemSelected, ''));
            list.style.setProperty("--color-list-item-hover", getValueFromData(data.colorItemHover, ''));

            mdcList.listen('MDCList:action', function (item) {
                if (data.listType === 'checkbox' || data.listType === 'switch') {
                    let index = item.detail.index;
                    let selectedValue = mdcListAdapter.isCheckboxCheckedAtIndex(index);

                    vis.setValue(data.attr('oid' + index), selectedValue);

                    setLayout(index, selectedValue);

                    console.log('hier');
                }
            });

            if (data.listType === 'checkbox' || data.listType === 'switch') {
                let itemCount = (data.listType === 'switch') ? $this.find('.mdc-switch').length : mdcList.listElements.length;

                for (var i = 0; i <= itemCount - 1; i++) {
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
                }
            }

            function setLayout(index, val) {

                let curListItem = $this.find(`li[id="listItem_${index}"]`);
                if (val === true) {
                    curListItem.css('background', getValueFromData(data.listItemBackgroundActive, ''));
                } else {
                    curListItem.css('background', getValueFromData(data.listItemBackground, ''));
                }
            }

        } catch (ex) {
            console.exception(`mdcList [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
};

function getValueFromData(dataValue, nullValue) {
    try {
        return (dataValue === undefined || dataValue === null || dataValue === '') ? nullValue : dataValue;
    } catch (err) {
        console.error(err.message);
        return 'Error';
    }
}

vis.binds["materialdesign"].showVersion();