/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.31"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.roundslider = {
    handle: function (el, data) {
        try {
            let $this = $(el);
            let workingId = $this.attr('data-oid-working');

            let valueOnLoading = vis.states.attr(data.oid + '.val');


            let min = getNumberFromData(data.min, 0);
            let labelMin = getValueFromData(data.valueLabelMin, null);
            let max = getNumberFromData(data.max, 100);
            let labelMax = getValueFromData(data.valueLabelMax, null);
            let unit = getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = getNumberFromData(data.valueLessThan, min);
            let textForValueLessThan = getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = getNumberFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = getValueFromData(data.textForValueGreaterThan, null);

            let labelWitdh = 0;
            if (data.showValueLabel === true || data.showValueLabel === 'true') {
                labelWitdh = data.valueLabelWidth;
            }

            $this.append(`<round-slider class="materialdesign-round-slider-element"
                            value=${valueOnLoading} 
                            max="${max}" 
                            min="${min}"
                            step="${getNumberFromData(data.step, 1)}"
                            startAngle="${getNumberFromData(data.startAngle, 135)}"
                            arcLength="${getNumberFromData(data.arcLength, 270)}"
                            handleSize="${getNumberFromData(data.handleSize, 6)}"
                            handleZoom="${getNumberFromData(data.handleZoom, 1.5)}"
                            ${(data.rtl === true) ? 'rtl = "true"' : ''}
                            style="position: absolute;"
                            >
                            </round-slider>
                            
                            ${(data.showValueLabel) ?
                    `<label class="labelValue" 
                                    style="position: relative; 
                                    text-align: center;
                                    display: flex;
                                    justify-content: center;
                                    pointer-events: none;
                                    top: ${getNumberFromData(data.valueLabelVerticalPosition, 45)}%; 
                                    color: ${getValueFromData(data.valueLabelColor, '#44739e')};">
                                        ${valueOnLoading} ${unit}
                                </label>`: ''}
                            `)

            let slider = $this.find('.materialdesign-round-slider-element');

            slider.get(0).style.setProperty('--round-slider-path-width', getNumberFromData(data.sliderWidth, 3));

            slider.get(0).style.setProperty('background', getValueFromData(data.colorSliderBg, ''));
            slider.get(0).style.setProperty('--round-slider-path-color', getValueFromData(data.colorAfterThumb, ''));
            slider.get(0).style.setProperty('--round-slider-bar-color', getValueFromData(data.colorBeforeThumb, '#44739e'));
            slider.get(0).style.setProperty('--round-slider-handle-color', getValueFromData(data.colorThumb, ''));


            setSliderState();

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setSliderState()
            });

            vis.states.bind(workingId + '.val', function (e, newVal, oldVal) {
                setSliderState();
            });

            slider.bind('value-changing', function (ev) {
                setSliderState(false, ev.target.__value);
            });

            slider.bind('value-changed', function (ev) {
                let changedVal = parseFloat(ev.target.__value);

                if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {
                    vis.setValue(data.oid, changedVal);
                    setSliderState();
                }
            });

            function setSliderState(setVisValue = true, val = 0) {
                if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {

                    if (setVisValue) {
                        val = vis.states.attr(data.oid + '.val');
                        slider.attr('value', val);
                    }

                    if (val <= min && labelMin != null) {
                        $this.find('.labelValue').html(labelMin);
                    } else if (val > min && val <= valueLessThan && textForValueLessThan != null) {
                        $this.find('.labelValue').html(textForValueLessThan);
                    } else if (val >= valueGreaterThan && val < max && textForValueGreaterThan != null) {
                        $this.find('.labelValue').html(textForValueGreaterThan);
                    } else if (val >= max && labelMax != null) {
                        $this.find('.labelValue').html(labelMax);
                    } else {
                        $this.find('.labelValue').html(`${val} ${unit}`);
                    }
                }
            }
        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};