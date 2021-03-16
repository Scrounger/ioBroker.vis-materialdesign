/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

var myMdwAlertClearButtonClicked = false;

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.alerts =
    function (el, data) {
        let widgetName = 'Alerts';

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            let idPrefix = "alerts_";
            let vueHelper = vis.binds.materialdesign.vueHelper.alerts;
            let vueAlertElements = [];

            let jsonData = null;
            try {
                let jsonString = vis.states.attr(data.oid + '.val');

                if (jsonString && jsonString.length > 0) {
                    jsonData = JSON.parse(jsonString);
                }

                if (vis.editMode && jsonData.length === 0) {
                    jsonData = jsonHasNoAlerts();
                    // Dummy alerts im Editor anzeigen, falls keine vorhanden
                }
            } catch (err) {
                jsonData = jsonHasErrorAlert();
                console.error(`[Vuetify Alerts 1 - ${data.wid}] cannot parse json string! Error: ${err.message}`);
            }

            if (jsonData !== null) {
                for (var i = 0; i <= jsonData.length - 1; i++) {
                    vueHelper.generateElement(data, $this, idPrefix, i);
                }

                // myMdwHelper.waitForElement($this, `#${idPrefix}${jsonData.length - 1}`, function () {
                myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'Alerts', function () {

                    for (var i = 0; i <= jsonData.length - 1; i++) {
                        let item = jsonData[i];
                        item.id = `${idPrefix}${i}`

                        vueAlertElements.push(vueHelper.getVuetifyElement($this, item, idPrefix, i, data));
                    }

                    let iconButtons = $this.find('.materialdesign-icon-button');
                    for (var b = 0; b <= iconButtons.length - 1; b++) {
                        // set ripple effect to icon buttons
                        new mdc.iconButton.MDCIconButtonToggle($this.find('.materialdesign-icon-button').get(b));
                    }


                    vueHelper.initializeClearButtonEvent($this, vueAlertElements, data, jsonData, idPrefix);
                });
                // });
            }

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                if (!myMdwAlertClearButtonClicked) {
                    // first clear all
                    jsonData === null;
                    $this.find('.v-alert').remove();
                    vueAlertElements = [];

                    try {
                        let jsonString = vis.states.attr(data.oid + '.val');

                        if (jsonString && jsonString.length > 0) {
                            jsonData = JSON.parse(jsonString);
                        }
                    } catch (err) {
                        jsonData = jsonHasErrorAlert();
                        console.error(`[Vuetify Alerts 2 - ${data.wid}] cannot parse json string! Error: ${err.message}`);
                    }

                    if (jsonData !== null) {
                        for (var i = 0; i <= jsonData.length - 1; i++) {
                            let item = jsonData[i];
                            item.id = `${idPrefix}${i}`

                            vueHelper.generateElement(data, $this, idPrefix, i);
                            vueAlertElements.push(vueHelper.getVuetifyElement($this, item, idPrefix, i, data));
                        }

                        let iconButtons = $this.find('.materialdesign-icon-button');
                        for (var b = 0; b <= iconButtons.length - 1; b++) {
                            // set ripple effect to icon buttons
                            new mdc.iconButton.MDCIconButtonToggle($this.find('.materialdesign-icon-button').get(b));
                        }

                        vueHelper.initializeClearButtonEvent($this, vueAlertElements, data, jsonData, idPrefix);
                    }
                }

                myMdwAlertClearButtonClicked = false;
            });

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
                $this.context.style.setProperty("--vue-alerts-button-close-color", myMdwHelper.getValueFromData(data.closeIconColor, ''));
                $this.context.style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.closeIconPressColor, ''));

                $this.context.style.setProperty("--vue-alerts-text-font-family", myMdwHelper.getValueFromData(data.alertFontFamily, 'inherit'));
                $this.context.style.setProperty("--vue-alerts-text-size", myMdwHelper.getNumberFromData(data.alertFontSize, '16') + 'px');

                $this.context.style.setProperty("--vue-alerts-icon-size", myMdwHelper.getNumberFromData(data.alertIconSize, '24') + 'px');

                $this.context.style.setProperty("--vue-alerts-bottom-margin", myMdwHelper.getNumberFromData(data.alertMarginBottom, '16') + 'px');
            }

            if ($(window).width() < data.minScreenResolution) {
                $this.hide();
            }

            $(window).resize(function () {
                if ($(window).width() < data.minScreenResolution) {
                    $this.hide();
                } else {
                    $this.show();
                }
            });

            function jsonHasErrorAlert() {
                return [
                    {
                        "text": _("Error in JSON string"),
                        "borderColor": "red",
                        "icon": "alert-box",
                        "iconColor": "red"
                    }
                ]
            }

            function jsonHasNoAlerts() {
                return [
                    {
                        "text": _("example that is only displayed in the editor"),
                        "borderColor": "blue",
                        "icon": "home",
                        "iconColor": "blue"
                    },
                    {
                        "text": _("no alert messages currently available"),
                        "borderColor": "orange",
                        "icon": "information",
                        "iconColor": "orange"
                    }
                ]
            }
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };