/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.34"

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
    version: "0.2.34",
    showVersion: function () {
        if (vis.binds["materialdesign"].version) {
            console.log('Version vis-materialdesign: ' + vis.binds["materialdesign"].version);
            vis.binds["materialdesign"].version = null;
        }
    },
    // initVuetfiyApp: function () {
    //     $(window).on('load', function () {
    //         let myHelper = vis.binds.materialdesign.helper;
    //         myHelper.waitForElement($("body"), '#vis_container', function () {
    //             if ($("#materialdesign-vuetify-container").length === 0) {
    //                 // intitialize Vuetify v-app application container, if not exist
    //                 $('body').wrapInner('<v-app id="materialdesign-vuetify-container" data-app="true">');
    //                 console.log('initialize vuetify v-app application container');
    //             }
    //         });
    //     });
    // },
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

        $(el).click(function () {
            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
        });
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
            console.exception(`toggle [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    mdcIconButtonToggle: function (el, data) {
        try {
            let $this = $(el);

            var colorBgFalse = (data.colorBgFalse === undefined || data.colorBgFalse === null || data.colorBgFalse === '') ? '' : data.colorBgFalse;
            var colorBgTrue = (data.colorBgTrue === undefined || data.colorBgTrue === null || data.colorBgTrue === '') ? '' : data.colorBgTrue;

            var colorPress = (data.colorPress === undefined || data.colorPress === null || data.colorPress === '') ? '' : data.colorPress;
            $this.context.style.setProperty("--mdc-theme-primary", colorPress);

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle($this.context);

            if (data.readOnly && !vis.editMode) {
                $this.css('pointer-events', 'none');
            }

            setIconButtonState();

            if (!vis.editMode) {
                mdcIconButton.listen('MDCIconButtonToggle:change', function () {
                    vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);

                    if (data.toggleType === 'boolean') {
                        vis.setValue(data.oid, mdcIconButton.on);
                    } else {
                        if (!mdcIconButton.on) {
                            vis.setValue(data.oid, data.valueOff);
                        } else {
                            vis.setValue(data.oid, data.valueOn);
                        }
                    }

                    setIconButtonState();
                });
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setIconButtonState();
            });

            function setIconButtonState() {
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
                    mdcIconButton.on = true;

                    $this.find('.imgToggleFalse').hide();
                    $this.find('.imgToggleTrue').show();
                    $this.css('background', colorBgTrue);
                } else {
                    mdcIconButton.on = false;

                    $this.find('.imgToggleFalse').show();
                    $this.find('.imgToggleTrue').hide();
                    $this.css('background', colorBgFalse);
                }
            };
        } catch (ex) {
            console.exception(`mdcIconButton [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    editorManualLink: function (widAttr, data) {
        let url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#iobrokervis-materialdesign';

        if (data) {

            if (data[1] === 'card') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#card'
            }

            if (data[1] === 'drawer') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#top-app-bar-with-navigation-drawer'
            }

            if (data[1] === 'drawerSubMenuViews') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#submenu'
            }

            if (data[1] === 'lineHistoryChart') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#line-history-chart'
            }

            if (data[1] === 'list') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#list'
            }

            if (data[1] === 'progress') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#progress'
            }

            if (data[1] === 'slider') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#slider'
            }

            if (data[1] === 'switch') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#switch'
            }

            if (data[1] === 'table') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#table'
            }

            if (data[1] === 'columnViews') {
                url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#column-views'
            }
        }

        return { input: `<a target="_blank" href="${url}">${_('readme')}</a>` }
    },
    editorBmc: function (widAttr) {
        return { input: `<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VWAXSTS634G88&source=url">${_('buymeacoffee')}</a>` }
    },
    editorOnlineExample: function (widAttr) {
        return { input: `<a target="_blank" href="https://github.com/Scrounger/ioBroker.vis-materialdesign#online-example-project">${_('linkOnlineExampleProject')}</a>` }
    }
};

vis.binds["materialdesign"].showVersion();
// vis.binds["materialdesign"].initVuetfiyApp();