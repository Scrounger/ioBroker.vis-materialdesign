/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.value = {
    initialize: async function (el, data) {
        let widgetName = 'Value';
        let logPrefix = `[Value - ${data.wid}] initialize:`;

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            let val = vis.states.attr(data.oid + '.val');
            let imageElement = myMdwHelper.getIconElement(getValueWithCondition(data.image, val), 'auto', myMdwHelper.getValueFromData(data.iconHeight, '24px', '', 'px'), myMdwHelper.getValueFromData(getValueWithCondition(data.imageColor, val), '#44739e'));
            let valueLabelWidth = myMdwHelper.getNumberFromData(data.valueLabelWidth, 4)

            $this.html(`
                    ${data.iconPosition === 'left' ? `<div class="materialdesign-value-icon">${imageElement}</div>` : ''}
                    <div class="materialdesign-value prepand-text"></div>
                    <div class="materialdesign-value value-text" style="margin: 0 ${valueLabelWidth}px 0 ${valueLabelWidth}px; flex: 1;text-align: ${myMdwHelper.getValueFromData(data.textAlign, 'start')}"></div>
                    <div class="materialdesign-value append-text"></div>
                    ${data.iconPosition === 'right' ? `<div class="materialdesign-value-icon">${imageElement}</div>` : ''}
                `);

            let $prepandText = $this.find('.prepand-text');
            let $valueText = $this.find('.value-text');
            let $appendText = $this.find('.append-text');

            let targetType = myMdwHelper.getValueFromData(data.targetType, 'auto');

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                setLayout(newVal, oldVal);
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

            setLayout();
            function setLayout(val = undefined, oldVal = undefined) {
                if (!val) {
                    val = vis.states.attr(data.oid + '.val');
                }

                $this.get(0).style.setProperty("--value-color-text", myMdwHelper.getValueFromData(getValueWithCondition(data.valuesFontColor, val), ''));
                $this.get(0).style.setProperty("--value-font-text", myMdwHelper.getValueFromData(data.valuesFontFamily, ''));
                $this.get(0).style.setProperty("--value-font-size-text", myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px'));

                $this.get(0).style.setProperty("--value-color-prepand", myMdwHelper.getValueFromData(getValueWithCondition(data.prepandTextColor, val), ''));
                $this.get(0).style.setProperty("--value-font-prepand", myMdwHelper.getValueFromData(data.prepandTextFontFamily, ''));
                $this.get(0).style.setProperty("--value-font-size-prepand", myMdwHelper.getStringFromNumberData(data.prepandTextFontSize, 14, '', 'px'));

                $this.get(0).style.setProperty("--value-color-append", myMdwHelper.getValueFromData(getValueWithCondition(data.appendTextColor, val), ''));
                $this.get(0).style.setProperty("--value-font-append", myMdwHelper.getValueFromData(data.appendTextFontFamily, ''));
                $this.get(0).style.setProperty("--value-font-size-append", myMdwHelper.getStringFromNumberData(data.appendTextFontSize, 14, '', 'px'));

                $this.find('.materialdesign-value-icon').html(myMdwHelper.getIconElement(getValueWithCondition(data.image, val), 'auto', myMdwHelper.getValueFromData(data.iconHeight, '24px', '', 'px'), myMdwHelper.getValueFromData(getValueWithCondition(data.imageColor, val), '#44739e')))

                setValue(val, oldVal);
            }

            function setValue(value, oldVal = undefined) {
                let type = targetType === 'auto' ? typeof (value) : targetType;
                let changed = false;

                if (data.debug) console.log(`${logPrefix} - setValue, type: '${type}', targetType: '${targetType}'`);

                $prepandText.html(myMdwHelper.getValueFromData(data.prepandText, ''));
                $appendText.html(myMdwHelper.getValueFromData(data.appendText, ''));

                let result = '';
                if (value !== undefined && value !== null) {
                    let valTmp = value;
                    if (type === 'number') {
                        try {
                            if (myMdwHelper.getValueFromData(data.calculate, undefined) && data.calculate.includes('#value')) {
                                let calc = replaceValue(data.calculate, valTmp);
                                valTmp = math.evaluate(calc);
                                // if (oldVal !== undefined && oldVal !== null) oldVal = math.evaluate(replaceValue(data.calculate, oldVal));

                                if (data.debug) console.log(`${logPrefix} type: '${type}', evaluate: '${calc}', result: '${valTmp}'`);
                            }

                            if (myMdwHelper.getValueFromData(data.convertToDuration, undefined)) {
                                if (data.convertToDuration === 'humanize') {
                                    result = moment.duration(valTmp, "seconds").humanize();
                                } else {
                                    let duration = moment.duration(valTmp, "seconds")
                                    result = duration.format(data.convertToDuration)
                                }

                                if (data.debug) console.log(`${logPrefix} type: '${type}' convert to duration, evaluate: '${data.convertToDuration}', result: '${result}'`);
                            } else if (myMdwHelper.getValueFromData(data.convertToTimestamp, undefined)) {
                                result = moment.unix(valTmp).format(data.convertToTimestamp);
                            } else {
                                // valTmp = myMdwHelper.formatNumber(valTmp, data.minDecimals, data.maxDecimals);
                                // if (oldVal !== undefined && oldVal !== null) oldVal = myMdwHelper.formatNumber(oldVal, data.minDecimals, data.maxDecimals);

                                let unit = myMdwHelper.getValueFromData(data.valueLabelUnit, '');

                                result = `${myMdwHelper.formatNumber(valTmp, data.minDecimals, data.maxDecimals)} ${unit}`;
                            }
                        } catch (ex) {
                            console.error(`[${widgetName} - ${data.wid}] initialize - number: value: ${valTmp}, error: ${ex.message}, stack: ${ex.stack}`);
                            $valueText.html(`<div style="color: FireBrick;">Error: type: '${type}' - ${ex.message}</div>`);

                            result = undefined;
                        }
                    } else if (type === 'boolean') {
                        try {
                            if (myMdwHelper.getValueFromData(data.condition, undefined) && data.condition.includes('#value')) {
                                let cond = replaceValue(data.condition, valTmp);
                                valTmp = math.evaluate(cond);
                                // if (oldVal !== undefined && oldVal !== null) oldVal = math.evaluate(replaceValue(data.condition, oldVal));

                                if (data.debug) console.log(`${logPrefix} type: '${type}', evaluate: '${cond}', result: '${valTmp}'`);
                            }

                            if (valTmp === true || valTmp === 'true') {
                                result = myMdwHelper.getValueFromData(data.textOnTrue, valTmp);
                            } else {
                                result = myMdwHelper.getValueFromData(data.textOnFalse, valTmp.toString());
                            }
                        } catch (ex) {
                            console.error(`[${widgetName} - ${data.wid}] initialize - boolean: value: ${valTmp}, error: ${ex.message}, stack: ${ex.stack}`);
                            $valueText.html(`<div style="color: FireBrick;">Error: type: '${type}' - ${ex.message}</div>`);

                            result = undefined;
                        }
                    } else if (type === 'string') {
                        result = valTmp
                    }
                } else {
                    if (data.debug) console.warn(`${logPrefix} value is '${value}' oid: ${data.oid}`);
                }

                if (myMdwHelper.getBooleanFromData(data.changeEffectEnabled, false)) {
                    if (value !== oldVal && oldVal !== undefined) {
                        changed = true;

                        $valueText.animate({
                            color: myMdwHelper.getValueFromData(data.effectFontColor, myMdwHelper.getValueFromData(getValueWithCondition(data.valuesFontColor, value), '')),
                            fontSize: myMdwHelper.getStringFromNumberData(data.effectFontSize, myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px'), '', 'px')
                        }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3 * 2);

                        setTimeout(function () {
                            changeValue();
                        }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3);

                        $valueText.animate({
                            color: myMdwHelper.getValueFromData(myMdwHelper.getValueFromData(getValueWithCondition(data.valuesFontColor, value), '')),
                            fontSize: myMdwHelper.getStringFromNumberData(data.valuesFontSize, 14, '', 'px')
                        }, myMdwHelper.getNumberFromData(data.effectDuration, 750) / 3);
                    }
                }

                if (!changed) {
                    changeValue();
                }

                function changeValue() {
                    if (result) {
                        if (myMdwHelper.getValueFromData(data.overrideText, undefined)) {
                            if (result.toString().includes('|')) {
                                result = result.split('|');
                                let text = data.overrideText;
                                for (var i = 0; i <= result.length - 1; i++) {
                                    text = text.replace(`#value[${i}]`, result[i]);
                                }
                                $valueText.html(text);
                            } else {
                                $valueText.html(data.overrideText.replace(/#value/g, result));
                            }
                        } else {
                            $valueText.html(result);
                        }
                    }
                }
            }

            function replaceValue(str, value) {
                let val = parseFloat(value);

                if (isNaN(val)) {
                    return str.replace(/#value/g, value);
                } else {
                    return str.replace(/#value/g, val);
                }
            }

            function getValueWithCondition(prop, value) {
                if (prop && prop !== null && prop.includes('#value') && ((value && value !== null && value !== 'null') || value === 0 || value === false)) {
                    try {
                        let cond = replaceValue(prop, value);
                        let evaluate = math.evaluate(cond);

                        if (data.debug) console.log(`${logPrefix} - cond: '${cond}', result: '${evaluate}'`);

                        return evaluate;
                    } catch (ex) {
                        console.error(`[${widgetName} - ${prop.wid}] getValueWithCondition: error: ${ex.message}, stack: ${ex.stack}`);
                        return `[${widgetName} - ${prop.wid}] getValueWithCondition: error: ${ex.message}, stack: ${ex.stack}`;
                    }
                } else {
                    return prop;
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
            valueLabelWidth: obj.valueLabelWidth,
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
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `Value HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[Value HTML Element - ${parentId.replace('w', 'p')}]`;

        if (debug) console.log(`${logPrefix} initialize html element`);

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