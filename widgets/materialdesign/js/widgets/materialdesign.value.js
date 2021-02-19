/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.value = {
    initialize: async function (el, data) {
        let widgetName = 'Value';
        let themeTriggerClass = '.materialdesign-widget.materialdesign-value'
        let logPrefix = `[Value - ${data.wid}] initialize:`;

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntimee(data, widgetName, themeTriggerClass, function () {
                init();
            });

            function init() {
                let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, '24px', '', 'px'), myMdwHelper.getValueFromData(data.imageColor, '#44739e'));

                $this.html(`
                    ${data.iconPosition === 'left' ? imageElement : ''}
                    <div class="materialdesign-value prepand-text"></div>
                    <div class="materialdesign-value value-text" style="margin: 0 4px 0 4px; flex: 1;text-align: ${myMdwHelper.getValueFromData(data.textAlign, 'start')}"></div>
                    <div class="materialdesign-value append-text"></div>
                    ${data.iconPosition === 'right' ? imageElement : ''}
                `);

                let $prepandText = $this.find('.prepand-text');
                let $valueText = $this.find('.value-text');
                let $appendText = $this.find('.append-text');

                let val = vis.states.attr(data.oid + '.val');
                let targetType = myMdwHelper.getValueFromData(data.targetType, 'auto');
                let type = targetType === 'auto' ? typeof (val) : targetType;

                if (data.debug) console.log(`${logPrefix} type: '${type}', targetType: '${targetType}'`);

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setValue(newVal, type, oldVal);
                });

                vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                    setLayout();
                });

                vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                    setLayout();
                });

                $(themeTriggerClass).on(`mdwTheme_subscribe_${widgetName.replace(/ /g, '_')}`, function () {
                    if (data.debug) console.log(`[${widgetName} - ${data.wid}] event received: 'mdwTheme_subscribe_${widgetName.replace(/ /g, '_')}'`);
                    $(themeTriggerClass).off(`mdwTheme_subscribe_${widgetName.replace(/ /g, '_')}`);
                    setLayout();
                });

                setLayout();
                setValue(val, type, val);

                function setLayout() {
                    $this.get(0).style.setProperty("--value-color-text", myMdwHelper.getValueFromData(data.valuesFontColor, ''));
                    $this.get(0).style.setProperty("--value-font-text", myMdwHelper.getValueFromData(data.valuesFontFamily, ''));
                    $this.get(0).style.setProperty("--value-font-size-text", myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px'));

                    $this.get(0).style.setProperty("--value-color-prepand", myMdwHelper.getValueFromData(data.prepandTextColor, ''));
                    $this.get(0).style.setProperty("--value-font-prepand", myMdwHelper.getValueFromData(data.prepandTextFontFamily, ''));
                    $this.get(0).style.setProperty("--value-font-size-prepand", myMdwHelper.getStringFromNumberData(data.prepandTextFontSize, 14, '', 'px'));

                    $this.get(0).style.setProperty("--value-color-append", myMdwHelper.getValueFromData(data.appendTextColor, ''));
                    $this.get(0).style.setProperty("--value-font-append", myMdwHelper.getValueFromData(data.appendTextFontFamily, ''));
                    $this.get(0).style.setProperty("--value-font-size-append", myMdwHelper.getStringFromNumberData(data.appendTextFontSize, 14, '', 'px'));

                    $this.find('.materialdesign-icon-image').css('color', myMdwHelper.getValueFromData(data.imageColor, '#44739e'));
                }

                function setValue(value, type, oldVal) {
                    let changed = false;

                    $prepandText.html(myMdwHelper.getValueFromData(data.prepandText, ''));
                    $appendText.html(myMdwHelper.getValueFromData(data.appendText, ''));

                    let result = '';
                    if (value !== undefined && value !== null) {
                        if (type === 'number') {
                            try {
                                if (myMdwHelper.getValueFromData(data.calculate, undefined) && data.calculate.includes('#value')) {
                                    let calc = replaceValue(data.calculate, value);
                                    value = math.evaluate(calc);
                                    oldVal = math.evaluate(replaceValue(data.calculate, oldVal));

                                    if (data.debug) console.log(`${logPrefix} type: '${type}', evaluate: '${calc}', result: '${value}'`);
                                }

                                if (myMdwHelper.getValueFromData(data.convertToDuration, undefined)) {
                                    if (data.convertToDuration === 'humanize') {
                                        result = moment.duration(value, "seconds").humanize();
                                    } else {
                                        let duration = moment.duration(value, "seconds")
                                        result = duration.format(data.convertToDuration)
                                    }

                                    if (data.debug) console.log(`${logPrefix} type: '${type}' convert to duration, evaluate: '${data.convertToDuration}', result: '${result}'`);
                                } else if (myMdwHelper.getValueFromData(data.convertToTimestamp, undefined)) {
                                    result = moment.unix(value).format(data.convertToTimestamp);
                                } else {
                                    value = myMdwHelper.formatNumber(value, data.minDecimals, data.maxDecimals);
                                    oldVal = myMdwHelper.formatNumber(oldVal, data.minDecimals, data.maxDecimals);

                                    let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

                                    result = `${value} ${unit}`;
                                }
                            } catch (e) {
                                result = `Error: type: '${type}' - ${e.message}`;
                            }
                        } else if (type === 'boolean') {
                            try {
                                if (myMdwHelper.getValueFromData(data.condition, undefined) && data.condition.includes('#value')) {
                                    let cond = replaceValue(data.condition, value);
                                    value = math.evaluate(cond);
                                    oldVal = math.evaluate(replaceValue(data.condition, oldVal));

                                    if (data.debug) console.log(`${logPrefix} type: '${type}', evaluate: '${cond}', result: '${value}'`);
                                }

                                if (value === true || value === 'true') {
                                    result = myMdwHelper.getValueFromData(data.textOnTrue, value);
                                } else {
                                    result = myMdwHelper.getValueFromData(data.textOnFalse, value.toString());
                                }
                            } catch (e) {
                                result = `Error: type: '${type}' - ${e.message}`;
                            }
                        } else if (type === 'string') {
                            result = value
                        }
                    } else {
                        if (data.debug) console.warn(`${logPrefix} value is '${value}' oid: ${data.oid}`);
                    }

                    if (myMdwHelper.getBooleanFromData(data.changeEffectEnabled, false)) {
                        if (value !== oldVal) {
                            changed = true;

                            $valueText.animate({
                                color: myMdwHelper.getValueFromData(data.effectFontColor, myMdwHelper.getValueFromData(data.valuesFontColor, '')),
                                fontSize: myMdwHelper.getStringFromNumberData(data.effectFontSize, myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px'), '', 'px')
                            }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3 * 2);

                            setTimeout(function () {
                                if (myMdwHelper.getValueFromData(data.overrideText, undefined)) {
                                    $valueText.html(data.overrideText.replace('#value', result));
                                } else {
                                    $valueText.html(result);
                                }
                            }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3);

                            $valueText.animate({
                                color: myMdwHelper.getValueFromData(myMdwHelper.getValueFromData(data.valuesFontColor, '')),
                                fontSize: myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px')
                            }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3);
                        }
                    }

                    if (!changed) {
                        if (myMdwHelper.getValueFromData(data.overrideText, undefined)) {
                            $valueText.html(data.overrideText.replace('#value', result));
                        } else {
                            $valueText.html(result);
                        }
                    }

                    function replaceValue(str, data) {
                        return str.replace(/#value/g, data);
                    }
                }
            }
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Common
            oid: obj.oid,
            targetType: obj.targetType,
            overrideText: obj.overrideText,
            debug: obj.debug,

            // layout
            textAlign: obj.textAlign,
            valuesFontColor: obj.valuesFontColor,
            valuesFontFamily: obj.valuesFontFamily,
            valuesFontSize: obj.valuesFontSize,
            prepandText: obj.prepandText,
            prepandTextColor: obj.prepandTextColor,
            prepandTextFontFamily: obj.prepandTextFontFamily,
            prepandTextFontSize: obj.prepandTextFontSize,
            appendText: obj.appendText,
            appendTextColor: obj.appendTextColor,
            appendTextFontFamily: obj.appendTextFontFamily,
            appendTextFontSize: obj.appendTextFontSize,

            // number formatting
            valueLabelUnit: obj.valueLabelUnit,
            minDecimals: obj.minDecimals,
            maxDecimals: obj.maxDecimals,
            calculate: obj.calculate,
            convertToDuration: obj.convertToDuration,

            // boolean formatting
            textOnTrue: obj.textOnTrue,
            textOnFalse: obj.textOnFalse,
            condition: obj.condition,

            // icon
            image: obj.image,
            imageColor: obj.imageColor,
            iconPosition: obj.iconPosition,
            iconHeight: obj.iconHeight,

            // value change effect
            changeEffectEnabled: obj.changeEffectEnabled,
            effectFontColor: obj.effectFontColor,
            effectFontSize: obj.effectFontSize,
            effectDuration: obj.effectDuration
        }
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '100%';

            delete widgetData.width;
            delete widgetData.height;

            let mdwData = myMdwHelper.getHtmlmdwData(`mdw-debug='false'` + '\n',
                vis.binds.materialdesign.value.getDataFromJson(widgetData, 0));

            html = `<div class='vis-widget materialdesign-widget materialdesign-value materialdesign-value-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative; display: flex; align-items: center;'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;

        } catch (ex) {
            console.error(`[Value getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-value-html-element", function () {
    let $this = $(this);
    let parentId = 'unknown';
    let logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `Value HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

        console.log(`${logPrefix} initialize html element`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.value.getDataFromJson({}, parentId),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);

            vis.binds.materialdesign.value.initialize($this, widgetData);
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});