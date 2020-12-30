/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.select = {
    initialize: function (el, data) {
        try {
            let $this = $(el);
            let vueHelper = vis.binds.materialdesign.vueHelper.select
            let containerClass = 'materialdesign-vuetify-select';

            vueHelper.generateItemList(data, `Select - ${data.wid}`, function (itemsList) {

                $this.append(`
                    <div class="${containerClass}" style="width: 100%; height: 100%;">
                        <v-select
                            ${vueHelper.getConstructor(data)}
                        >
                        
                        ${vueHelper.getTemplates(data)}

                        </v-select>
                    </div>`);

                myMdwHelper.waitForElement($this, `.${containerClass}`, data.wid, 'Select', function () {
                    myMdwHelper.waitForElement($("body"), '#materialdesign-vuetify-container', data.wid, 'Select', function () {

                        let $vuetifyContainer = $("body").find('#materialdesign-vuetify-container');
                        let widgetHeight = window.getComputedStyle($this.get(0), null).height.replace('px', '');

                        let vueSelect = new Vue({
                            el: $this.find(`.${containerClass}`).get(0),
                            vuetify: new Vuetify(),
                            data() {
                                return vueHelper.getData(data, widgetHeight, itemsList);
                            },
                            methods: vueHelper.getMethods(data, $this, itemsList, $vuetifyContainer)
                        });

                        vueHelper.setStyles($this, data);
                        vueHelper.setIoBrokerBinding(data, vueSelect, itemsList);
                    });
                });
            });
        } catch (ex) {
            console.error(`[Select - ${data.wid}]: error: ${ex.message}, stack: ${ex.stack} `);
        }
    },
    getDataFromJson(obj, widgetId) {
        let data = {
            wid: widgetId,

            oid: obj.oid,
            inputType: obj.inputType,
            vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
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
            inputLabelText: obj.inputLabelText,
            inputLabelColor: obj.inputLabelColor,
            inputLabelColorSelected: obj.inputLabelColorSelected,
            inputLabelFontFamily: obj.inputLabelFontFamily,
            inputLabelFontSize: obj.inputLabelFontSize,
            inputTranslateX: obj.inputTranslateX,
            inputTranslateY: obj.inputTranslateY,
            inputPrefix: obj.inputPrefix,
            inputSuffix: obj.inputSuffix,
            inputAppendixColor: obj.inputAppendixColor,
            inputAppendixFontSize: obj.inputAppendixFontSize,
            inputAppendixFontFamily: obj.inputAppendixFontFamily,
            showInputMessageAlways: obj.showInputMessageAlways,
            inputMessage: obj.inputMessage,
            inputMessageFontFamily: obj.inputMessageFontFamily,
            inputMessageFontSize: obj.inputMessageFontSize,
            inputMessageColor: obj.inputMessageColor,
            showInputCounter: obj.showInputCounter,
            inputCounterColor: obj.inputCounterColor,
            inputCounterFontSize: obj.inputCounterFontSize,
            inputCounterFontFamily: obj.inputCounterFontFamily,
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
            listDataMethod: obj.listDataMethod,
            countSelectItems: obj.countSelectItems,
            jsonStringObject: obj.jsonStringObject,
            valueList: obj.valueList,
            valueListLabels: obj.valueListLabels,
            valueListIcons: obj.valueListIcons,
            listPosition: obj.listPosition,
            listPositionOffset: obj.listPositionOffset,
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
            listItemValueFontSelectedColor: obj.listItemValueFontSelectedColor,
        }

        for (var i = 0; i <= obj.countSelectItems; i++) {
            data['value' + i] = obj['value' + i];
            data['label' + i] = obj['label' + i];
            data['subLabel' + i] = obj['subLabel' + i];
            data['listIcon' + i] = obj['listIcon' + i];
            data['listIconColor' + i] = obj['listIconColor' + i];
        }

        return data;
    }
}