/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.23"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.roundslider = {
    handle: function (el, data) {
        try {
            let $this = $(el);

            $this.append(`<round-slider class="materialdesign-round-slider-element"
                            value=${vis.states.attr(data.oid + '.val')}
                            ></round-slider>`)

            let slider = $this.find('.materialdesign-round-slider-element');


            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                slider.attr('value', newVal);
            });

            slider.bind('value-changing', function () {
                console.log('changing');
            });

            slider.bind('value-changed', function (ev) {
                let changedVal = parseFloat(ev.target.__value);
                vis.setValue(data.oid, changedVal);
            });

        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }

};