/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.78"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.roundslider =
    function (el, data) {
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
                                    top: ${myMdwHelper.getNumberFromData(data.valueLabelVerticalPosition, 45)}%; 
                                    color: ${myMdwHelper.getValueFromData(data.valueLabelColor, '#44739e')};">
                                        ${valueOnLoading} ${unit}
                                </label>`: ''}
                            `)

            let slider = $this.find('.materialdesign-round-slider-element');

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
                    vis.setValue(data.oid, changedVal);
                    setSliderState();
                }
            });

            $this.find('.materialdesign-round-slider-element').on('touchstart mousedown', function (e) {
                myHelper.vibrate(data.vibrateOnMobilDevices);

                // let posX = e.offsetX;
                // let posY = e.offsetY;
                // let width = window.getComputedStyle($this.context, null).width.replace('px', '') / 2;
                // let height = window.getComputedStyle($this.context, null).height.replace('px', '') / 2;
                // let deltaY = height - posY;
                // let deltaX = width - posX;
                // let deg = (Math.atan2(deltaY, deltaX) * 180) / Math.PI;
                // deg = deg + (360 - myMdwHelper.getNumberFromData(data.startAngle, 135));
                // console.log(deg);
                // // deg = deg + myMdwHelper.getNumberFromData(data.startAngle, 135);


                // // if (deg < 0 && deg >= -270) {
                // //     deg = deg + 360;
                // // }
                // // console.log(deg);
                // // this.value = deg;
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
            console.error(`[Round Slider] error: ${ex.message}, stack: ${ex.stack}`);
        }
    };