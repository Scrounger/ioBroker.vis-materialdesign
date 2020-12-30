/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.roundslider = {
    initialize: function (el, data) {
        try {
            let $this = $(el);
            let workingId = $this.attr('data-oid-working');
            let myHelper = vis.binds.materialdesign.helper;

            let valueOnLoading = vis.states.attr(data.oid + '.val');


            let min = myMdwHelper.getNumberFromData(data.min, 0);
            let labelMin = myMdwHelper.getValueFromData(data.valueLabelMin, null);
            let max = myMdwHelper.getNumberFromData(data.max, 100);
            let labelMax = myMdwHelper.getValueFromData(data.valueLabelMax, null);
            let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

            let valueLessThan = myMdwHelper.getNumberFromData(data.valueLessThan, min);
            let textForValueLessThan = myMdwHelper.getValueFromData(data.textForValueLessThan, null);
            let valueGreaterThan = myMdwHelper.getNumberFromData(data.valueGreaterThan, max);
            let textForValueGreaterThan = myMdwHelper.getValueFromData(data.textForValueGreaterThan, null);

            let labelWitdh = 0;
            if (data.showValueLabel === true || data.showValueLabel === 'true') {
                labelWitdh = data.valueLabelWidth;
            }

            $this.append(`<round-slider class="materialdesign-round-slider-element"
                            value=${valueOnLoading} 
                            max="${max}" 
                            min="${min}"
                            step="${myMdwHelper.getNumberFromData(data.step, 1)}"
                            startAngle="${myMdwHelper.getNumberFromData(data.startAngle, 135)}"
                            arcLength="${myMdwHelper.getNumberFromData(data.arcLength, 270)}"
                            handleSize="${myMdwHelper.getNumberFromData(data.handleSize, 6)}"
                            handleZoom="${myMdwHelper.getNumberFromData(data.handleZoom, 1.5)}"
                            ${(data.rtl === true) ? 'rtl = "true"' : ''} 
                            ${myMdwHelper.getBooleanFromData(data.readOnly, false) === true ? 'readonly' : ''}                           
                            >
                            </round-slider>
                            
                            ${(data.showValueLabel) ?
                    `<label class="labelValue" 
                                    style="position: absolute; 
                                    width: 100%;
                                    text-align: center;
                                    display: flex;
                                    justify-content: center;
                                    pointer-events: none;
                                    top: ${myMdwHelper.getNumberFromData(data.valueLabelVerticalPosition, 45)}%; 
                                    color: ${myMdwHelper.getValueFromData(data.valueLabelColor, '#44739e')};
                                    font-family: ${myMdwHelper.getValueFromData(data.valueFontFamily, '')};
                                    font-size: ${myMdwHelper.getStringFromNumberData(data.valueFontSize, 'inherit', '', 'px')};">
                                        ${valueOnLoading} ${unit}
                                </label>`: ''}
                            `)

            let slider = $this.find('.materialdesign-round-slider-element');

            if (slider) {
                slider.get(0).style.setProperty('--round-slider-path-width', myMdwHelper.getNumberFromData(data.sliderWidth, 3));

                slider.get(0).style.setProperty('background', myMdwHelper.getValueFromData(data.colorSliderBg, ''));
                slider.get(0).style.setProperty('--round-slider-path-color', myMdwHelper.getValueFromData(data.colorAfterThumb, ''));
                slider.get(0).style.setProperty('--round-slider-bar-color', myMdwHelper.getValueFromData(data.colorBeforeThumb, '#44739e'));
                slider.get(0).style.setProperty('--round-slider-handle-color', myMdwHelper.getValueFromData(data.colorThumb, ''));


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
                        myMdwHelper.setValue(data.oid, changedVal);
                        setSliderState();
                    }
                });

                $this.find('.materialdesign-round-slider-element').on('touchstart mousedown', function (e) {
                    myHelper.vibrate(data.vibrateOnMobilDevices);
                });

                function setSliderState(setVisValue = true, val = 0) {
                    if (vis.states.attr(workingId + '.val') === false || vis.states.attr(workingId + '.val') === 'false' || !vis.states.attr(workingId + '.val')) {

                        if (setVisValue) {
                            val = vis.states.attr(data.oid + '.val');
                            slider.attr('value', val);
                        }

                        let valPercent = parseFloat(val);

                        if (isNaN(valPercent)) valPercent = min;
                        if (valPercent < min) valPercent = min;
                        if (valPercent > max) valPercent = max;

                        let simRange = 100;
                        let range = max - min;
                        let factor = simRange / range;
                        valPercent = Math.floor((valPercent - min) * factor);

                        if (val <= min && labelMin != null) {
                            $this.find('.labelValue').html(labelMin);
                        } else if (val > min && val <= valueLessThan && textForValueLessThan != null) {
                            $this.find('.labelValue').html(textForValueLessThan);
                        } else if (val >= valueGreaterThan && val < max && textForValueGreaterThan != null) {
                            $this.find('.labelValue').html(textForValueGreaterThan);
                        } else if (val >= max && labelMax != null) {
                            $this.find('.labelValue').html(labelMax);
                        } else {
                            if (myMdwHelper.getValueFromData(data.valueLabelStyle, "sliderValue") === 'sliderValue') {
                                $this.find('.labelValue').html(`${val} ${unit}`);
                            } else {
                                $this.find('.labelValue').html(`${valPercent} %`);
                            }
                        }
                    }
                }
            }
        } catch (ex) {
            console.error(`[Round Slider - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            oid: obj.oid,
            "oid-working": obj["oid-working"],
            min: obj.min,
            max: obj.max,
            step: obj.step,
            readOnly: obj.readOnly,
            startAngle: obj.startAngle,
            arcLength: obj.arcLength,
            sliderWidth: obj.sliderWidth,
            handleSize: obj.handleSize,
            handleZoom: obj.handleZoom,
            rtl: obj.rtl,
            vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
            colorSliderBg: obj.colorSliderBg,
            colorBeforeThumb: obj.colorBeforeThumb,
            colorThumb: obj.colorThumb,
            colorAfterThumb: obj.colorAfterThumb,
            valueLabelColor: obj.valueLabelColor,
            showValueLabel: obj.showValueLabel,
            valueLabelVerticalPosition: obj.valueLabelVerticalPosition,
            valueLabelStyle: obj.valueLabelStyle,
            valueLabelUnit: obj.valueLabelUnit,
            valueLabelMin: obj.valueLabelMin,
            valueLabelMax: obj.valueLabelMax,
            valueLessThan: obj.valueLessThan,
            textForValueLessThan: obj.textForValueLessThan,
            valueGreaterThan: obj.valueGreaterThan,
            textForValueGreaterThan: obj.textForValueGreaterThan
        }
    }
}