/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.19"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.helper = {
    vibrate: function (duration) {
        try {
            if ("vibrate" in navigator) {
                window.navigator.vibrate(duration);
            }
        } catch (ex) {
            console.exception(`vibrate [${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    waitForElement: function (parent, elementPath, callBack) {
        window.setTimeout(function () {
            if (parent.find(elementPath).length) {
                callBack(elementPath, $(elementPath));
            } else {
                console.log('wait');
                vis.binds.materialdesign.helper.waitForElement(parent, elementPath, callBack);
            }
        }, 50)
    }
};