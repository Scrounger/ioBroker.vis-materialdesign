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
                            max="${getNumberFromData(data.max, 100)}" 
                            min="${getNumberFromData(data.min, 0)}"
                            step="${getNumberFromData(data.step, 1)}"
                            startAngle="${getNumberFromData(data.startAngle, 135)}"
                            arcLength="${getNumberFromData(data.arcLength, 270)}"
                            handleSize="${getNumberFromData(data.handleSize, 6)}"
                            handleZoom="${getNumberFromData(data.handleZoom, 1.5)}"
                            ${(data.rtl === true) ? 'rtl = "true"' : ''}
                            ></round-slider>`)

            let slider = $this.find('.materialdesign-round-slider-element');

            slider.get(0).style.setProperty('--round-slider-path-width', getNumberFromData(data.sliderWidth, 3));

            slider.get(0).style.setProperty('background', getValueFromData(data.colorSliderBg, ''));
            slider.get(0).style.setProperty('--round-slider-path-color', getValueFromData(data.pathColor, ''));
            slider.get(0).style.setProperty('--round-slider-bar-color', getValueFromData(data.barColor, '#1e88e5'));
            slider.get(0).style.setProperty('--round-slider-handle-color', getValueFromData(data.handleColor, ''));


            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setSliderState()

            });

            vis.states.bind(data.wid + '.val', function (e, newVal, oldVal) {
                if (!newVal) {
                    setSliderState();
                }
            });

            slider.bind('value-changing', function () {
                console.log('changing');
            });

            slider.bind('value-changed', function (ev) {
                let changedVal = parseFloat(ev.target.__value);
                vis.setValue(data.oid, changedVal);
            });

            function setSliderState() {
                let val = vis.states.attr(data.oid + '.val');

                if (!vis.states.attr(data.wid + '.val')) {
                    slider.attr('value', val);
                }
            }
        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};