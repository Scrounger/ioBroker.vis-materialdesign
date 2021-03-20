/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.autocomplete = {
    initialize: function (el, data) {
        let widgetName = 'AutoComplete';

        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.select
            let containerClass = 'materialdesign-vuetify-autoComplete';


            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            let inputMode = 'combobox'
            if (data.inputMode === 'select') {
                inputMode = 'autocomplete';
            }

            vueHelper.generateItemList(data, `AutoComplete - ${data.wid}`, function (itemsList) {

                $this.append(`
                    <div class="${containerClass}" style="width: 100%; height: 100%;">
                        <v-${inputMode}
                            ${vueHelper.getConstructor(data)}
                        >

                        ${vueHelper.getTemplates(data)}

                        </v-${inputMode}>
                    </div>`);

                if (myMdwHelper.oidNeedSubscribe(data.oid, data.wid, widgetName, false)) {
                    // ggf subscribing notwendig, wenn z.B. Binding als ObjektId verwendet wird und eine oid übergeben wird
                    myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                        handler();
                    });
                } else {
                    handler();
                }

                function handler() {
                    myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'AutoComplete', function () {
                        myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'AutoComplete', function () {

                            let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                            let widgetHeight = window.getComputedStyle($this.get(0), null).height.replace('px', '');

                            let vueAutoComplete = new Vue({
                                el: $this.find(`.${containerClass}`).get(0),
                                vuetify: new Vuetify(),
                                data() {
                                    return vueHelper.getData(data, widgetHeight, itemsList, inputMode);
                                },
                                methods: vueHelper.getMethods(data, $this, itemsList, $vuetifyContainer, inputMode)
                            });

                            $(document).on("mdwSubscribe", function (e, oids) {
                                if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                                    vueHelper.setStyles($this, data);
                                }
                            });

                            vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                                vueHelper.setStyles($this, data);
                            });

                            vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                                vueHelper.setStyles($this, data);
                            });

                            vueHelper.setStyles($this, data);
                            vueHelper.setIoBrokerBinding(data, vueAutoComplete, itemsList, inputMode);
                        });
                    });
                }
            });
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    },
    getDataFromJson(obj, widgetId, itemCounter = 0) {
        let data = {
            wid: widgetId,
            debug: obj.debug,

            // Common
            oid: obj.oid,
            inputMode: obj.inputMode,
            inputType: obj.inputType,
            vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
            generateHtmlControl: obj.generateHtmlControl,

            // layout input 
            inputLayout: obj.inputLayout,
            inputAlignment: obj.inputAlignment,
            inputLayoutBackgroundColor: obj.inputLayoutBackgroundColor,
            inputLayoutBackgroundColorHover: obj.inputLayoutBackgroundColorHover,
            inputLayoutBackgroundColorSelected: obj.inputLayoutBackgroundColorSelected,
            inputLayoutBorderColor: obj.inputLayoutBorderColor,
            inputLayoutBorderColorHover: obj.inputLayoutBorderColorHover,
            inputLayoutBorderColorSelected: obj.inputLayoutBorderColorSelected,
            inputTextFontFamily: obj.inputTextFontFamily,
            inputTextFontSize: obj.inputTextFontSize,
            inputTextColor: obj.inputTextColor,

            // label of input 
            inputLabelText: obj.inputLabelText,
            inputLabelColor: obj.inputLabelColor,
            inputLabelColorSelected: obj.inputLabelColorSelected,
            inputLabelFontFamily: obj.inputLabelFontFamily,
            inputLabelFontSize: obj.inputLabelFontSize,
            inputTranslateX: obj.inputTranslateX,
            inputTranslateY: obj.inputTranslateY,

            // appendixs of the input
            inputPrefix: obj.inputPrefix,
            inputSuffix: obj.inputSuffix,
            inputAppendixColor: obj.inputAppendixColor,
            inputAppendixFontSize: obj.inputAppendixFontSize,
            inputAppendixFontFamily: obj.inputAppendixFontFamily,

            // sub text of input
            showInputMessageAlways: obj.showInputMessageAlways,
            inputMessage: obj.inputMessage,
            inputMessageFontFamily: obj.inputMessageFontFamily,
            inputMessageFontSize: obj.inputMessageFontSize,
            inputMessageColor: obj.inputMessageColor,

            // counter layout
            showInputCounter: obj.showInputCounter,
            inputCounterColor: obj.inputCounterColor,
            inputCounterFontSize: obj.inputCounterFontSize,
            inputCounterFontFamily: obj.inputCounterFontFamily,

            // Icons
            clearIconShow: obj.clearIconShow,
            clearIcon: obj.clearIcon,
            clearIconSize: obj.clearIconSize,
            clearIconColor: obj.clearIconColor,
            collapseIcon: obj.collapseIcon,
            collapseIconSize: obj.collapseIconSize,
            collapseIconColor: obj.collapseIconColor,
            prepandIcon: obj.prepandIcon,
            prepandIconSize: obj.prepandIconSize,
            prepandIconColor: obj.prepandIconColor,
            prepandInnerIcon: obj.prepandInnerIcon,
            prepandInnerIconSize: obj.prepandInnerIconSize,
            prepandInnerIconColor: obj.prepandInnerIconColor,
            appendOuterIcon: obj.appendOuterIcon,
            appendOuterIconSize: obj.appendOuterIconSize,
            appendOuterIconColor: obj.appendOuterIconColor,

            // data of menu
            listDataMethod: obj.listDataMethod,
            countSelectItems: obj.countSelectItems,
            jsonStringObject: obj.jsonStringObject,
            valueList: obj.valueList,
            valueListLabels: obj.valueListLabels,
            valueListIcons: obj.valueListIcons,

            // menu layout
            listPosition: obj.listPosition,
            listPositionOffset: obj.listPositionOffset,
            openOnClear: obj.openOnClear,
            listItemHeight: obj.listItemHeight,
            listItemBackgroundColor: obj.listItemBackgroundColor,
            listItemBackgroundHoverColor: obj.listItemBackgroundHoverColor,
            listItemBackgroundSelectedColor: obj.listItemBackgroundSelectedColor,
            listItemRippleEffectColor: obj.listItemRippleEffectColor,
            showSelectedIcon: obj.showSelectedIcon,
            listIconSize: obj.listIconSize,
            listIconColor: obj.listIconColor,
            listIconHoverColor: obj.listIconHoverColor,
            listIconSelectedColor: obj.listIconSelectedColor,
            listItemFontSize: obj.listItemFontSize,
            listItemFont: obj.listItemFont,
            listItemFontColor: obj.listItemFontColor,
            listItemFontHoverColor: obj.listItemFontHoverColor,
            listItemFontSelectedColor: obj.listItemFontSelectedColor,
            listItemSubFontSize: obj.listItemSubFontSize,
            listItemSubFont: obj.listItemSubFont,
            listItemSubFontColor: obj.listItemSubFontColor,
            listItemSubFontHoverColor: obj.listItemSubFontHoverColor,
            listItemSubFontSelectedColor: obj.listItemSubFontSelectedColor,
            showValue: obj.showValue,
            listItemValueFontSize: obj.listItemValueFontSize,
            listItemValueFont: obj.listItemValueFont,
            listItemValueFontColor: obj.listItemValueFontColor,
            listItemValueFontHoverColor: obj.listItemValueFontHoverColor,
            listItemValueFontSelectedColor: obj.listItemValueFontSelectedColor
        }

        let counter = itemCounter === 0 ? obj.countSelectItems : itemCounter;
        for (var i = 0; i <= itemCounter; i++) {
            data['value' + i] = obj['value' + i];
            data['label' + i] = obj['label' + i];
            data['subLabel' + i] = obj['subLabel' + i];
            data['listIcon' + i] = obj['listIcon' + i];
            data['listIconColor' + i] = obj['listIconColor' + i];
            data['imageColorSelectedTextField' + i] = obj['imageColorSelectedTextField' + i];
        }

        return data;
    },
    getHtmlConstructor(widgetData, type) {
        try {
            let html;
            let width = widgetData.width ? widgetData.width : '100%';
            let height = widgetData.height ? widgetData.height : '38px';

            delete widgetData.width;
            delete widgetData.height;

            let mdwData = myMdwHelper.getHtmlmdwData('',
                vis.binds.materialdesign.autocomplete.getDataFromJson(widgetData, 0));

            html = `<div class='vis-widget materialdesign-widget materialdesign-autocomplete materialdesign-autocomplete-html-element'` + '\n' +
                '\t' + `style='width: ${width}; height: ${height}; position: relative; overflow: visible; display: flex; align-items: center;'` + '\n' +
                '\t' + mdwData + ">";

            return html + `</div>`;
        } catch (ex) {
            console.error(`[AutoComplete getHtmlConstructor]: ${ex.message}, stack: ${ex.stack} `);
        }
    }
}

$.initialize(".materialdesign-autocomplete-html-element", function () {
    let $this = $(this);
    let debug = myMdwHelper.getBooleanFromData($this.attr('mdw-debug'), false);
    let parentId = 'unknown';
    let logPrefix = `[AutoComplete HTML Element - ${parentId.replace('w', 'p')}]`;

    try {
        let widgetName = `AutoComplete HTML Element`;

        parentId = myMdwHelper.getHtmlParentId($this);
        logPrefix = `[AutoComplete HTML Element - ${parentId.replace('w', 'p')}]`;

        if (debug) console.log(`${logPrefix} initialize html element`);

        myMdwHelper.extractHtmlWidgetData($this,
            vis.binds.materialdesign.autocomplete.getDataFromJson({}, parentId, $this.attr('mdw-countSelectItems')),
            parentId, widgetName, logPrefix, initializeHtml);

        function initializeHtml(widgetData) {
            if (widgetData.debug) console.log(`${logPrefix} initialize widget`);
            vis.binds.materialdesign.autocomplete.initialize($this, widgetData);
        }
    } catch (ex) {
        console.error(`${logPrefix} $.initialize: error: ${ex.message}, stack: ${ex.stack} `);
        $this.append(`<div style = "background: FireBrick; color: white;">Error ${ex.message}</div >`);
    }
});