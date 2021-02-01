/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.value = {
    initialize: async function (el, data) {
        let widgetName = 'Value';
        let themeTriggerClass = '.materialdesign-widget.materialdesign-value'

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntimee(data, widgetName, themeTriggerClass, function () {
                init();
            });

            function init() {
                let imageElement = myMdwHelper.getIconElement(data.image, 'auto', myMdwHelper.getValueFromData(data.iconHeight, '24px', '', 'px'), myMdwHelper.getValueFromData(data.imageColor, '#44739e'));

                $this.html(`
                    ${data.iconPosition === 'left' ? imageElement : ''}
                    <div class="materialdesign-value prepand-text" style="margin: 0 2px 0 2px;"></div>
                    <div class="materialdesign-value value-text" style="margin: 0 2px 0 2px; flex: 1;text-align: ${myMdwHelper.getValueFromData(data.textAlign, 'start')}"></div>
                    <div class="materialdesign-value append-text" style="margin: 0 2px 0 2px;"></div>
                    ${data.iconPosition === 'right' ? imageElement : ''}
                `);

                let $prepandText = $this.find('.prepand-text');
                let $valueText = $this.find('.value-text');
                let $appendText = $this.find('.append-text');

                myMdwHelper.getObject(data.oid, function (obj) {
                    if (obj && obj.common && obj.common['type']) {
                        let val = vis.states.attr(data.oid + '.val');

                        let type = obj.common['type'];
                        let unit = obj.common.unit ? obj.common.unit : '';

                        setValue(val, type);

                        vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                            setValue(newVal, type);
                        });

                        vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                            setLayout();
                        });

                        vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                            setLayout();
                        });

                        $(themeTriggerClass).on(`mdwTheme_subscribe_${widgetName.replace(/ /g, '_')}`, function () {
                            if (data.debug) console.log(`[${widgetName} - ${data.wid}] event received: 'mdwTheme_subscribe_${widgetName.replace(/ /g, '_')}'`);
                            setLayout();
                        });

                        setLayout();
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

                        function setValue(value, type) {
                            $prepandText.html(myMdwHelper.getValueFromData(data.prepandText, ''));
                            $appendText.html(myMdwHelper.getValueFromData(data.appendText, ''));

                            let result = '';
                            if (type === 'number') {
                                value = myMdwHelper.formatNumber(value, data.minDecimals, data.maxDecimals)
                                unit = myMdwHelper.getValueFromData(data.customUnit, unit);

                                result = `${value} ${unit}`;
                            } else if (type === 'boolean') {
                                if (value === true || value === 'true') {
                                    result = myMdwHelper.getValueFromData(data.textOnTrue, value);
                                } else {
                                    result = myMdwHelper.getValueFromData(data.textOnFalse, value);
                                }
                            } else if (type === 'string') {
                                result = value
                            }

                            if (myMdwHelper.getValueFromData(data.overrideText, undefined)) {
                                $valueText.html(data.overrideText.replace('#value', result));
                            } else {
                                $valueText.html(result);
                            }
                        }
                    } else {
                        if (data.oid !== 'nothing_selected') {
                            $valueText.html(`Error '${data.oid}' not exist!`);
                            $this.css('color', 'FireBrick');
                        }
                    }
                });
            }
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getDataFromJson(obj, widgetId) {
        return {
            wid: widgetId,

            // Allgemein
            oid: obj.oid,
            overrideText: obj.overrideText,
            debug: obj.debug,
            
            // Layout
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
            
            // Zahlenformatierung
            customUnit: obj.customUnit,
            minDecimals: obj.minDecimals,
            maxDecimals: obj.maxDecimals,
            
            // Logikwert Formatierung
            textOnTrue: obj.textOnTrue,
            textOnFalse: obj.textOnFalse,
            
            // Symbol
            image: obj.image,
            imageColor: obj.imageColor,
            iconPosition: obj.iconPosition,
            iconHeight: obj.iconHeight            
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
