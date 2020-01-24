/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.47"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.alerts =
    function (el, data) {
        try {

            //[{ 		"text": "gedfsdfndert kommt eine nachricht", 		"borderColor": "darkred", 		"icon": "information-outline", 		"iconColor": "darkred" 	},{ 		"text": "hier kommt eine nachricht", 		"borderColor": "", 		"icon": "chat-alert-outline", 		"iconColor": "yellow" 	},{ 		"text": "hier kommt eine nachricht", 		"borderColor": "yellow", 		"icon": "/vis/img/bulb_on.png", 		"iconColor": "yellow" 	} ,{ 		"text": "hier kommt eine nachricht", 		"borderColor": "yellow", 		"icon": "home", 		"iconColor": "yellow" 	}]
            let $this = $(el);
            let idPrefix = "alerts_";
            let vueHelper = vis.binds.materialdesign.vueHelper.alerts;

            let jsonData = null;
            try {
                jsonData = JSON.parse(vis.states.attr(data.oid + '.val'));
            } catch (err) {
                console.error(`[Vuetify Alerts] cannot parse json string! Error: ${err.message}`);
            }

            if (jsonData !== null) {
                for (var i = 0; i <= jsonData.length - 1; i++) {
                    vueHelper.generateElement(data, $this, idPrefix, i);
                }

                myMdwHelper.waitForElement($this, `#${idPrefix}${jsonData.length - 1}`, function () {
                    myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', function () {
                        let vueAlertElements = [];

                        for (var i = 0; i <= jsonData.length - 1; i++) {
                            let item = jsonData[i];
                            vueAlertElements.push(vueHelper.getVuetifyElement($this, item, idPrefix, i));
                        }

                        let iconButtons = $this.find('.materialdesign-icon-button');
                        for (var b = 0; b <= iconButtons.length - 1; b++) {
                            // set ripple effect to icon buttons
                            new mdc.iconButton.MDCIconButtonToggle($this.find('.materialdesign-icon-button').get(b));
                        }

                        vueHelper.initializeClearButtonEvent($this, vueAlertElements);

                        vis.states.bind(data.oid + '.lc', function (e, newVal, oldVal) {
                            // $this.find(`.v-alert`).show();
                            // vueAlertElements[3].showAlert = true;

                            let jsonData = null;
                            try {
                                jsonData = JSON.parse(vis.states.attr(data.oid + '.val'));
                            } catch (err) {
                                console.error(`[Vuetify Alerts] cannot parse json string! Error: ${err.message}`);
                            }

                            if (jsonData !== null) {
                                // first clear all
                                $this.find('.v-alert').remove();
                                vueAlertElements = [];

                                for (var i = 0; i <= jsonData.length - 1; i++) {
                                    let item = jsonData[i];
                                    vueHelper.generateElement(data, $this, idPrefix, i);
                                    vueAlertElements.push(vueHelper.getVuetifyElement($this, item, idPrefix, i));
                                }

                                vueHelper.initializeClearButtonEvent($this, vueAlertElements);
                            }
                        });

                        $this.context.style.setProperty("--vue-alerts-button-close-color", myMdwHelper.getValueFromData(data.closeIconColor, ''));
                        $this.context.style.setProperty("--mdc-theme-primary", myMdwHelper.getValueFromData(data.closeIconPressColor, ''));

                        $this.context.style.setProperty("--vue-alerts-text-font-family", myMdwHelper.getValueFromData(data.alertFontFamily, 'inherit'));
                        $this.context.style.setProperty("--vue-alerts-text-size", myMdwHelper.getNumberFromData(data.alertFontSize, '16') + 'px');

                        $this.context.style.setProperty("--vue-alerts-icon-size", myMdwHelper.getNumberFromData(data.alertIconSize, '24') + 'px');

                        $this.context.style.setProperty("--vue-alerts-bottom-margin", myMdwHelper.getNumberFromData(data.alertMarginBottom, '16') + 'px');

                    });
                });
            }
        } catch (ex) {
            console.error(`[Vuetify Alerts]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    };