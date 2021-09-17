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

                vis.binds.materialdesign.subscribeCssColors();
            });
        });
    },
    addRippleEffect: function (el, data, isIconButton = false) {
        var $this = $(el).parent();

        let btn = $this.get(0) ? $this.get(0) : $this.context;

        if (!isIconButton) {
            mdc.ripple.MDCRipple.attachTo(btn);
        } else {
            const mdcIconButton = new mdc.iconButton.MDCIconButtonToggle(btn);
        }
    },
    subscribeCssColors: async function () {
        try {
            myMdwHelper.waitForVisConnected(async function () {
                myMdwHelper.waitForViews(async function () {
                    myMdwHelper.waitForWidgets(async function () {
                        // subscribe Theme states that needs as listener
                        if (vis.widgets && Object.keys(vis.widgets).length > 0) {
                            let dummyWid = Object.keys(vis.widgets)[0];
                            let oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.lastchange', dummyWid, 'MDW Theme', false, false, false);
                            oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.colors.darkTheme', dummyWid, 'MDW Theme', oidsNeedSubscribe, false, false);

                            let countDefaultColors = 15;

                            for (var i = 0; i <= countDefaultColors - 1; i++) {
                                let colorId = `vis-materialdesign.0.colors.default_${i}`
                                oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(colorId.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.light.'), dummyWid, 'MDW Theme', oidsNeedSubscribe, false, false);
                                oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(colorId.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.dark.'), dummyWid, 'MDW Theme', oidsNeedSubscribe, false, false);
                            }

                            myMdwHelper.subscribeStatesAtRuntime(dummyWid, 'MDW Theme', function () {

                                vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                                    console.log(`vis-materialdesign: ${newVal ? 'dark theme activated' : 'light theme activated'}`);
                                    setCssDefaultColorVars();
                                });

                                vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                                    console.log(`vis-materialdesign: theme changes detected`);
                                    setCssDefaultColorVars();
                                });

                                setCssDefaultColorVars();

                                function setCssDefaultColorVars() {
                                    for (var i = 0; i <= countDefaultColors - 1; i++) {
                                        document.documentElement.style.setProperty(`--materialdesign-default-color-${i}`, myMdwHelper.getValueFromData(`#mdwTheme:vis-materialdesign.0.colors.default_${i}`, null));
                                    }

                                    console.log(`vis-materialdesign: root css default color variables registerd`);
                                }
                            });
                        }
                    });
                });
            });

        } catch (ex) {
            console.error(`[subscribeCssColors] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};