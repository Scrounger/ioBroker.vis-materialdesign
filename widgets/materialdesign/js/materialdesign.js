/*
    ioBroker.vis vis-materialdesign Widget-Set
    
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

// Workaround suppress vue warning
const ignoreWarnMessage = 'The .native modifier for v-on is only valid on components but it was used on <div>.';
Vue.config.warnHandler = function (msg, vm, trace) {
    // `trace` is the component hierarchy trace
    if (msg === ignoreWarnMessage) {
        msg = null;
        vm = null;
        trace = null;
    }
}

// TODO: move widgets to own file -> using minify

vis.binds.materialdesign = {
    showVersion: function () {
        myMdwHelper.waitForVisConnected(function () {
            myMdwHelper.getVersion(function (version) {
                console.log('Version vis-materialdesign: ' + version);

                myMdwHelper.initializeSentry(version);
            });
        });
    },
    addRippleEffect: function (el, data, isIconButton = false) {
        var $this = $(el).parent();

        let btn = $this.get(0) ? $this.get(0) : $this.context;

        btn.style.setProperty("--materialdesign-color-primary", myMdwHelper.getValueFromData(data.mdwButtonPrimaryColor, ''));
        btn.style.setProperty("--materialdesign-color-secondary", myMdwHelper.getValueFromData(data.mdwButtonSecondaryColor, ''));
        btn.style.setProperty("--materialdesign-font-button", myMdwHelper.getValueFromData(data.textFontFamily, ''));
        btn.style.setProperty("--materialdesign-font-size-button", myMdwHelper.getStringFromNumberData(data.textFontSize, 'inherit', '', 'px'));
        btn.style.setProperty("--materialdesign-font-button-vertical-text-distance-image", myMdwHelper.getNumberFromData(data.distanceBetweenTextAndImage, 2) + 'px');

        if (!isIconButton) {
            mdc.ripple.MDCRipple.attachTo(btn);
            btn.style.setProperty("--materialdesign-color-button-pressed", myMdwHelper.getValueFromData(data.mdwButtonColorPress, ''));
        } else {
            btn.style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.colorPress, ''));

            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle(btn);
        }

        $(el).click(function () {
            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
        });
    },
};