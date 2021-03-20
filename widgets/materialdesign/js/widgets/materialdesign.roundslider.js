/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.roundslider = {
    initialize: function (el, data) {
        let widgetName = 'Round Slider';

        try {
            let $this = $(el);
            let containerClass = 'materialdesign-round-slider-element';

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            let workingId = data["oid-working"];
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

            $this.append(`<round-slider class="${containerClass}"
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

            let slider = $this.find(`.${containerClass}`);

            if (slider) {
                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setSliderState()
                });

                vis.states.bind(workingId + '.val', function (e, newVal, oldVal) {
                    setSliderState();
                });

                $(document).on("mdwSubscribe", function (e, oids) {
                    if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                        setLayout();
                    }
                });

                vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                    setLayout();
                });

                vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                    setLayout();
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

                $this.find(`.${containerClass}`).on('touchstart mousedown', function (e) {
                    myHelper.vibrate(data.vibrateOnMobilDevices);
                });

                setLayout();
                function setLayout() {
                    slider.get(0).style.setProperty('--round-slider-path-width', myMdwHelper.getNumberFromData(data.sliderWidth, 3));

                    slider.get(0).style.setProperty('background', myMdwHelper.getValueFromData(data.colorSliderBg, ''));
                    slider.get(0).style.setProperty('--round-slider-path-color', myMdwHelper.getValueFromData(data.colorAfterThumb, ''));
                    slider.get(0).style.setProperty('--round-slider-bar-color', myMdwHelper.getValueFromData(data.colorBeforeThumb, '#44739e'));
                    slider.get(0).style.setProperty('--round-slider-handle-color', myMdwHelper.getValueFromData(data.colorThumb, ''));

                    $this.find('.labelValue').css('color', myMdwHelper.getValueFromData(data.valueLabelColor, '#44739e'))
                        .css('font-family', myMdwHelper.getValueFromData(data.valueFontFamily, ''))
                        .css('font-size', myMdwHelper.getStringFromNumberData(data.valueFontSize, 'inherit', '', 'px'));

                    setSliderState();
                }

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
            console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Common
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
            generateHtmlControl: obj.generateHtmlControl,
            debug: obj.debug,

            // colors
            colorSliderBg: obj.colorSliderBg,
            colorBeforeThumb: obj.colorBeforeThumb,
            colorThumb: obj.colorThumb,
            colorAfterThumb: obj.colorAfterThumb,
            valueLabelColor: obj.valueLabelColor,

            // labeling
            showValueLabel: obj.showValueLabel,
            valueLabelVerticalPosition: obj.valueLabelVerticalPosition,
            valueLabelStyle: obj.valueLabelStyle,
            valueLabelUnit: obj.valueLabelUnit,
            valueFontFamily: obj.valueFontFamily,
            valueFontSize: obj.valueFontSize,
            valueLabelMin: obj.valueLabelMin,
            valueLabelMax: obj.valueLabelMax,
            valueLessThan: obj.valueLessThan,
            textForValueLessThan: obj.textForValueLessThan,
            valueGreaterThan: obj.valueGreaterThan,
            textForValueGreaterThan: obj.textForValueGreaterThan
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100px';
            let height = widgetData.height ? widgetData.height : '100px';

            delete widgetData.width;
            delete widgetData.height;

            let mdwData = myMdwHelper.getHtmlmdwData('',
                vis.binds.materialdesign.roundslider.getDataFromJson(widgetData, 0));

            html = `<div class='vis-widget materialdesign-widget materialdesign-slider-round materialdesign-roundslider-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative;'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Round Slider getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-roundslider-html-element", function () {
    let $this = $(this);
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Round Slider HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `Round Slider HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Round Slider HTML Element - ${parentId.replace('w', 'p')}]`;

        if (debug) console.log(`${logPrefix} initialize html element`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.roundslider.getDataFromJson({}, parentId),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);

            vis.binds.materialdesign.roundslider.initialize($this, widgetData);
        }

    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});