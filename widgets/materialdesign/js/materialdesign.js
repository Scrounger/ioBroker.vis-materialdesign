/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.76"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

let iobSystemDic = systemDictionary;
$.get("../vis-materialdesign.admin/words.js", function (script) {
    let translation = script.substring(script.indexOf('{'), script.length);
    translation = translation.substring(0, translation.lastIndexOf(';'));
    $.extend(systemDictionary, JSON.parse(translation));
    $.extend(systemDictionary, iobSystemDic);
});


// TODO: move widgets to own file -> using minify

vis.binds.materialdesign = {
    version: "0.2.76",
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

};

vis.binds["materialdesign"].showVersion();
// vis.binds["materialdesign"].initVuetfiyApp();