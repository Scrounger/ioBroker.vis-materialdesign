/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.vueHelper = {
    input: {
        getConstructor: function (data) {

            let layout = myMdwHelper.getValueFromData(data.inputLayout, 'regular');
            let shaped = false;
            let rounded = false;

            if (layout === 'regular') {
                layout = '';
            } else if (layout.includes('shaped')) {
                layout = layout.replace('-shaped', '');
                shaped = true;
            } else if (layout.includes('rounded')) {
                layout = layout.replace('-rounded', '');
                rounded = true;
            }

            return `
                    ${layout}
                    :height="height"
                    :label="label"
                    :type="type"                         
                    :hint="messages"
                    :counter="counter"
                    hide-details="auto"
                    :prefix="prefix"
                    :suffix="suffix"
                    :placeholder="placeholder"
                    :autofocus="autofocus"
                    ${(data.showInputMessageAlways) ? 'persistent-hint' : ''}
                    ${(shaped) ? 'shaped' : ''}
                    ${(rounded) ? 'rounded' : ''}
                    dense
                    ${(data.clearIconShow) ? 'clearable' : ''}
                    :clear-icon="clearIcon"
                    
                    @change="changeEvent"
                `
        },
        getTemplates: function (data) {
            return `
                ${(myMdwHelper.getValueFromData(data.prepandIcon, null) !== null) ?
                    `<template v-slot:prepend>
                        <div  class="v-input__icon v-input__icon--prepend">                            
                            <v-icon v-if="prepandIcon !== ''">{{ prepandIcon }}</v-icon>
                            <img v-if="prepandImage !== ''" :src="prepandImage" />
                        </div>
                    </template>`
                    : ''}

                ${(myMdwHelper.getValueFromData(data.prepandInnerIcon, null) !== null) ?
                    `<template v-slot:prepend-inner>
                        <div  class="v-input__icon v-input__icon--prepend-inner">                            
                            <v-icon v-if="prepandInnerIcon !== ''">{{ prepandInnerIcon }}</v-icon>
                            <img v-if="prepandInnerImage !== ''" :src="prepandInnerImage" />
                        </div>
                    </template>`
                    : ''}

                ${(myMdwHelper.getValueFromData(data.appendOuterIcon, null) !== null) ?
                    `<template v-slot:append-outer>
                        <div  class="v-input__icon v-input__icon--append-outer">                            
                            <v-icon v-if="appendOuterIcon !== ''">{{ appendOuterIcon }}</v-icon>
                            <img v-if="appendOuterImage !== ''" :src="appendOuterImage" />
                        </div>
                    </template>`
                    : ''}                        
            `
        },
        getData: function (data, widgetHeight, placeholder = '') {
            return {
                height: widgetHeight,
                label: myMdwHelper.getValueFromData(data.inputLabelText, ''),
                type: myMdwHelper.getValueFromData(data.inputType, 'text'),
                messages: myMdwHelper.getValueFromData(data.inputMessage, ''),
                counter: data.showInputCounter,
                prefix: myMdwHelper.getValueFromData(data.inputPrefix, ''),
                suffix: myMdwHelper.getValueFromData(data.inputSuffix, ''),
                placeholder: placeholder,
                autofocus: myMdwHelper.getBooleanFromData(data.autoFocus, false),
                clearIcon: myMdwHelper.getValueFromData(data.clearIcon, 'mdi-close', 'mdi-'),
                prepandIcon: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.prepandIcon, '').includes(el))) ? undefined : myMdwHelper.getValueFromData(data.prepandIcon, undefined, 'mdi-'),
                prepandImage: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.prepandIcon, '').includes(el))) ? myMdwHelper.getValueFromData(data.prepandIcon, undefined) : undefined,
                prepandInnerIcon: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.prepandInnerIcon, '').includes(el))) ? undefined : myMdwHelper.getValueFromData(data.prepandInnerIcon, undefined, 'mdi-'),
                prepandInnerImage: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.prepandInnerIcon, '').includes(el))) ? myMdwHelper.getValueFromData(data.prepandInnerIcon, undefined) : undefined,
                appendOuterIcon: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.appendOuterIcon, '').includes(el))) ? undefined : myMdwHelper.getValueFromData(data.appendOuterIcon, undefined, 'mdi-'),
                appendOuterImage: (myMdwHelper.getAllowedImageFileExtensions().some(el => myMdwHelper.getValueFromData(data.appendOuterIcon, '').includes(el))) ? myMdwHelper.getValueFromData(data.appendOuterIcon, undefined) : undefined,
            }
        },
        setStyles: function ($el, data) {

            if (data.inputType === 'date' || data.inputType === 'time' || data.inputType === 'number') {
                // Remove input default button for clear
                $el.find('input').attr('required', 'required');
            }

            if (myMdwHelper.getValueFromData(data.inputLayout, 'regular').includes('filled')) {
                //TODO: background color data hinzufügen
                $el.get(0).style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, ''));
                $el.get(0).style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
                $el.get(0).style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
            } else {
                $el.get(0).style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent'));
                $el.get(0).style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
                $el.get(0).style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
            }

            // Input Border Colors
            $el.get(0).style.setProperty("--vue-text-field-before-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColor, ''));
            $el.get(0).style.setProperty("--vue-text-field-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColorHover, ''));
            $el.get(0).style.setProperty("--vue-text-field-after-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColorSelected, ''));

            // Input Label style
            $el.get(0).style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.inputLabelColor, ''));
            $el.get(0).style.setProperty("--vue-text-field-label-after-color", myMdwHelper.getValueFromData(data.inputLabelColorSelected, ''));
            $el.get(0).style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.inputLabelFontFamily, ''));
            $el.get(0).style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.inputLabelFontSize, '16') + 'px');

            // Input style
            $el.get(0).style.setProperty("--vue-text-field-input-text-color", myMdwHelper.getValueFromData(data.inputTextColor, ''));
            $el.get(0).style.setProperty("--vue-text-field-input-text-font-size", myMdwHelper.getNumberFromData(data.inputTextFontSize, '16') + 'px');
            $el.get(0).style.setProperty("--vue-text-field-input-text-font-family", myMdwHelper.getValueFromData(data.inputTextFontFamily, ''));

            // Appendix style
            $el.get(0).style.setProperty("--vue-text-field-appendix-color", myMdwHelper.getValueFromData(data.inputAppendixColor, myMdwHelper.getValueFromData(data.inputTextColor, '')));
            $el.get(0).style.setProperty("--vue-text-field-appendix-font-size", myMdwHelper.getNumberFromData(data.inputAppendixFontSize, myMdwHelper.getNumberFromData(data.inputTextFontSize, '16')) + 'px');
            $el.get(0).style.setProperty("--vue-text-field-appendix-font-family", myMdwHelper.getValueFromData(data.inputAppendixFontFamily, myMdwHelper.getValueFromData(data.inputTextFontFamily, '')));

            // Message style
            $el.get(0).style.setProperty("--vue-text-field-message-color", myMdwHelper.getValueFromData(data.inputMessageColor, ''));
            $el.get(0).style.setProperty("--vue-text-field-message-font-size", myMdwHelper.getNumberFromData(data.inputMessageFontSize, '12') + 'px');
            $el.get(0).style.setProperty("--vue-text-field-message-font-family", myMdwHelper.getValueFromData(data.inputMessageFontFamily, ''));

            // Counter style
            $el.get(0).style.setProperty("--vue-text-field-counter-color", myMdwHelper.getValueFromData(data.inputCounterColor, ''));
            $el.get(0).style.setProperty("--vue-text-field-counter-font-size", myMdwHelper.getNumberFromData(data.inputCounterFontSize, '12') + 'px');
            $el.get(0).style.setProperty("--vue-text-field-counter-font-family", myMdwHelper.getValueFromData(data.inputCounterFontFamily, ''));

            // Transform options
            $el.get(0).style.setProperty("--vue-text-field-translate-x", myMdwHelper.getNumberFromData(data.inputTranslateX, 0) + 'px');
            $el.get(0).style.setProperty("--vue-text-field-translate-y", myMdwHelper.getNumberFromData(data.inputTranslateY, -16) + 'px');

            // Icon: clear options
            $el.get(0).style.setProperty("--vue-text-icon-clear-size", myMdwHelper.getNumberFromData(data.clearIconSize, 16) + 'px');
            $el.get(0).style.setProperty("--vue-text-icon-clear-color", myMdwHelper.getValueFromData(data.clearIconColor, ''));


            // Icon: append-outer options
            $el.get(0).style.setProperty("--vue-text-icon-append-outer-size", myMdwHelper.getNumberFromData(data.appendOuterIconSize, 16) + 'px');
            $el.get(0).style.setProperty("--vue-text-icon-append-outer-color", myMdwHelper.getValueFromData(data.appendOuterIconColor, ''));

            // Icon: prepand options
            $el.get(0).style.setProperty("--vue-text-icon-prepand-size", myMdwHelper.getNumberFromData(data.prepandIconSize, 16) + 'px');
            $el.get(0).style.setProperty("--vue-text-icon-prepand-color", myMdwHelper.getValueFromData(data.prepandIconColor, ''));

            // Icon: prepand-inner options
            $el.get(0).style.setProperty("--vue-text-icon-prepand-inner-size", myMdwHelper.getNumberFromData(data.prepandInnerIconSize, 16) + 'px');
            $el.get(0).style.setProperty("--vue-text-icon-prepand-inner-color", myMdwHelper.getValueFromData(data.prepandInnerIconColor, ''));

            // Alignment
            $el.get(0).style.setProperty("--vue-text-field-alignment", myMdwHelper.getValueFromData(data.inputAlignment, 'left'));
        }
    },
    select: {
        getConstructor: function (data) {
            let position = myMdwHelper.getValueFromData(data.listPosition, 'auto');
            let menuProps = `{auto: true, offsetY: ${myMdwHelper.getBooleanFromData(data.listPositionOffset, false)}}`

            if (position === 'top') {
                menuProps = `{auto: true, top: true, offsetY: ${myMdwHelper.getBooleanFromData(data.listPositionOffset, false)}}`;
            } else if (position === 'bottom') {
                menuProps = `{auto: true, bottom: true, offsetY: ${myMdwHelper.getBooleanFromData(data.listPositionOffset, false)}}`;
            }

            return `
                ${vis.binds.materialdesign.vueHelper.input.getConstructor(data)}

                v-model="item"
                item-text="text"
                item-value="value"
                
                :items="items"
                :menu-props="${menuProps}"
                
                :append-icon="collapseIcon"

                no-data-text="nur der smarte ioBrokler wird bestehen"

                @focus="focusEvent"
                @click:clear="clearEvent"
                @click="click"
                @input="menuClick"
                :open-on-clear="openOnClear"
            `
        },
        getTemplates: function (data) {
            return `
                ${vis.binds.materialdesign.vueHelper.input.getTemplates(data)}

                ${(data.showSelectedIcon !== 'no') ? `
                    <template v-slot:${data.showSelectedIcon}>
                        <div  class="v-input__icon v-input__icon--${data.showSelectedIcon}">                            
                            <v-icon v-if="icon !== ''" :style="{color: iconColorTextField}">{{ icon }}</v-icon>
                            <img v-if="image !== ''" :src="image" />
                        </div>
                    </template>
                ` : ''}
                 
                <template v-slot:item="data">
                    <div class="materialdesign-v-list-item-image-container">
                        <v-icon v-if="data.item.icon !== ''" class="materialdesign-v-list-item-icon" :style="{color: data.item.imageColor}">{{data.item.icon}}</v-icon>
                        <img v-if="data.item.image !== ''" class="materialdesign-v-list-item-image" :src="data.item.image" />
                    </div>
                    <v-list-item-content style="height: 100%">
                        <v-list-item-title class="materialdesign-v-list-item-title" v-html="data.item.text"></v-list-item-title>
                        <v-list-item-subtitle class="materialdesign-v-list-item-subtitle">{{data.item.subText}}</v-list-item-subtitle>
                    </v-list-item-content>
                    ${(data.showValue) ? `<label class="materialdesign-v-list-item-value">{{data.item.value}}</label>` : ''}
                </template>                
            `
        },
        getData: function (data, widgetHeight, itemsList, inputMode = '', placeholder = '') {
            let dataObj = vis.binds.materialdesign.vueHelper.input.getData(data, widgetHeight);

            let item = vis.binds.materialdesign.vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList, inputMode);
            let objImg = this.getIconTextField(data, item.icon, item.image);

            dataObj.item = item;
            dataObj.items = itemsList;
            dataObj.icon = objImg.icon;
            dataObj.image = objImg.image;
            dataObj.imageColor = item.imageColor;
            dataObj.iconColorTextField = this.getIconColorTextField(data, myMdwHelper.getValueFromData(item.imageColorSelectedTextField, item.imageColor));
            dataObj.collapseIcon = myMdwHelper.getValueFromData(data.collapseIcon, undefined, 'mdi-');
            dataObj.openOnClear = myMdwHelper.getBooleanFromData(data.clearIconShow, false) ? myMdwHelper.getBooleanFromData(data.openOnClear, false) : false;

            return dataObj;
        },
        setStyles: function ($el, data) {
            vis.binds.materialdesign.vueHelper.input.setStyles($el, data);

            $el.get(0).style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.collapseIconSize, 16) + 'px');
            $el.get(0).style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.collapseIconColor, ''));
            $el.get(0).style.setProperty("--vue-text-icon-append-cursor", 'pointer');
        },
        setMenuStyles: function ($el, data, itemsList, $vuetifyContainer) {
            let selectId = $el.find('.v-input__slot').attr('aria-owns');

            if (itemsList.length > 0) {
                myMdwHelper.waitForElement($vuetifyContainer, '#' + selectId, data.wid, 'Select', function () {

                    // corresponding select object create -> set style options
                    let selectList = $vuetifyContainer.find(`.v-select-list#${selectId}`).get(0);

                    if (selectList) {
                        // list item style
                        selectList.style.setProperty('--vue-list-item-height', myMdwHelper.getStringFromNumberData(data.listItemHeight, 'auto', '', 'px'));

                        selectList.style.setProperty('--vue-list-item-background-color', myMdwHelper.getValueFromData(data.listItemBackgroundColor, 'inherit'));
                        selectList.style.setProperty('--vue-list-item-background-hover-color', myMdwHelper.getValueFromData(data.listItemBackgroundHoverColor, ''));
                        selectList.style.setProperty('--vue-list-item-background-selected-color', myMdwHelper.getValueFromData(data.listItemBackgroundSelectedColor, ''));

                        // list item ripple effect color
                        selectList.style.setProperty('--vue-ripple-effect-color', myMdwHelper.getValueFromData(data.listItemRippleEffectColor, ''));

                        // list item font style                                        
                        selectList.style.setProperty('--vue-list-item-font-size', myMdwHelper.getStringFromNumberData(data.listItemFontSize, 'inherit', '', 'px'));
                        selectList.style.setProperty('--vue-list-item-font-family', myMdwHelper.getValueFromData(data.listItemFont, 'inherit'));

                        let listItemFontColor = myMdwHelper.getValueFromData(data.listItemFontColor, 'inherit');

                        selectList.style.setProperty('--vue-list-item-font-color', listItemFontColor);
                        selectList.style.setProperty('--vue-list-item-font-color-hover', myMdwHelper.getValueFromData(data.listItemFontHoverColor, listItemFontColor));
                        selectList.style.setProperty('--vue-list-item-font-color-selected', myMdwHelper.getValueFromData(data.listItemFontSelectedColor, listItemFontColor));

                        // list item subTitle font style
                        selectList.style.setProperty('--vue-list-item-subtitle-font-size', myMdwHelper.getStringFromNumberData(data.listItemSubFontSize, 'inherit', '', 'px'));
                        selectList.style.setProperty('--vue-list-item-subtitle-font-family', myMdwHelper.getValueFromData(data.listItemSubFont, 'inherit'));

                        let listItemSubFontColor = myMdwHelper.getValueFromData(data.listItemSubFontColor, '');

                        selectList.style.setProperty('--vue-list-item-subtitle-font-color', listItemSubFontColor);
                        selectList.style.setProperty('--vue-list-item-subtitle-font-color-hover', myMdwHelper.getValueFromData(data.listItemSubFontHoverColor, listItemSubFontColor));
                        selectList.style.setProperty('--vue-list-item-subtitle-font-color-selected', myMdwHelper.getValueFromData(data.listItemSubFontSelectedColor, listItemSubFontColor));

                        // list item value font style
                        selectList.style.setProperty('--vue-list-item-value-font-size', myMdwHelper.getStringFromNumberData(data.listItemValueFontSize, 'inherit', '', 'px'));
                        selectList.style.setProperty('--vue-list-item-value-font-family', myMdwHelper.getValueFromData(data.listItemValueFont, 'inherit'));

                        let listItemValueFontColor = myMdwHelper.getValueFromData(data.listItemValueFontColor, '');

                        selectList.style.setProperty('--vue-list-item-value-font-color', listItemValueFontColor);
                        selectList.style.setProperty('--vue-list-item-value-font-color-hover', myMdwHelper.getValueFromData(data.listItemValueFontHoverColor, listItemValueFontColor));
                        selectList.style.setProperty('--vue-list-item-value-font-color-selected', myMdwHelper.getValueFromData(data.listItemValueFontSelectedColor, listItemValueFontColor));

                        // list item icon style
                        let listItemColor = myMdwHelper.getValueFromData(data.listIconColor, '#44739e');

                        selectList.style.setProperty('--vue-list-item-icon-size', myMdwHelper.getStringFromNumberData(data.listIconSize, '20px', '', 'px'));
                        selectList.style.setProperty('--vue-list-item-icon-color', listItemColor);
                        selectList.style.setProperty('--vue-list-item-icon-color-hover', myMdwHelper.getValueFromData(data.listIconHoverColor, listItemColor));
                        selectList.style.setProperty('--vue-list-item-icon-color-selected', myMdwHelper.getValueFromData(data.listIconSelectedColor, listItemColor));
                    }
                });
            }
        },
        generateItemList(data, logPrefix, callback) {
            let itemsList = [];

            if (data.listDataMethod === 'jsonStringObject') {
                let jsonData = null;

                try {
                    if (typeof (data.jsonStringObject) === 'object') {
                        jsonData = data.jsonStringObject;
                    } else {
                        if (vis.editMode && data.jsonStringObject && data.jsonStringObject.startsWith('{') && data.jsonStringObject.endsWith("}")) {
                            // show in Editor if json is Binding
                            jsonData = JSON.parse(vis.states.attr(data.jsonStringObject.substring(1, data.jsonStringObject.length - 1) + '.val'));
                        } else {
                            jsonData = JSON.parse(data.jsonStringObject);
                        }
                    }
                } catch (err) {
                    console.error(`[${logPrefix}] generateItemList: cannot parse json string! json: ${jsonData}, Error: ${err.message}`);
                }

                if (jsonData) {
                    for (var i = 0; i <= jsonData.length - 1; i++) {
                        let jsonObj = jsonData[i];

                        if (jsonObj.value !== null) {
                            let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(jsonObj.icon);

                            itemsList.push(
                                {
                                    text: myMdwHelper.getValueFromData(jsonObj.text, jsonObj.value),
                                    subText: jsonObj.subText,
                                    value: jsonObj.value,
                                    icon: imgObj.icon,
                                    image: imgObj.image,
                                    imageColor: jsonObj.iconColor,
                                    imageColorSelectedTextField: jsonObj.iconColorSelectedTextField
                                }
                            )
                        }
                    }
                }
                callback(itemsList);

            } else if (data.listDataMethod === 'valueList') {
                if (data.valueList) {
                    let valueList = myMdwHelper.getValueFromData(data.valueList, '').replace(/(\r\n|\n|\r)/gm, "").split(';');
                    let valueListLabels = myMdwHelper.getValueFromData(data.valueListLabels, '').split(';');
                    let valueListIcons = myMdwHelper.getValueFromData(data.valueListIcons, '').split(';');

                    for (var i = 0; i <= valueList.length - 1; i++) {
                        let value = valueList[i];

                        if (value) {
                            let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(valueListIcons[i]);

                            itemsList.push(
                                {
                                    text: myMdwHelper.getValueFromData(valueListLabels[i], value),
                                    subText: '',
                                    value: value,
                                    icon: imgObj.icon,
                                    image: imgObj.image,
                                    imageColor: myMdwHelper.getValueFromData(data['listIconColor' + i], ''),
                                    imageColorSelectedTextField: myMdwHelper.getValueFromData(data['imageColorSelectedTextField' + i], '')
                                }
                            )
                        }
                    }
                }
                callback(itemsList);

            } else if (data.listDataMethod === 'multistatesObject') {
                myMdwHelper.getObject(data.oid, function (obj) {

                    if (obj && obj.common && obj.common.states) {
                        let states = obj.common.states;

                        if (typeof (states) === 'object') {
                            for (var i = 0; i <= Object.keys(states).length - 1; i++) {
                                let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(myMdwHelper.getValueFromData(data['listIcon' + i]));

                                itemsList.push(
                                    {
                                        text: myMdwHelper.getValueFromData(data['label' + i], Object.keys(states)[i].replace(/_/g, ' ')),
                                        subText: myMdwHelper.getValueFromData(data['subLabel' + i], ''),
                                        value: Object.values(states)[i],
                                        icon: imgObj.icon,
                                        image: imgObj.image,
                                        imageColor: myMdwHelper.getValueFromData(data['listIconColor' + i], ''),
                                        imageColorSelectedTextField: myMdwHelper.getValueFromData(data['imageColorSelectedTextField' + i], '')
                                    }
                                )
                            }
                        } else if (typeof (states) === 'string') {
                            let list = states.split(';');

                            for (var i = 0; i <= list.length - 1; i++) {
                                let itemSplitted = list[i].split(':');

                                let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(myMdwHelper.getValueFromData(data['listIcon' + i]));

                                itemsList.push(
                                    {
                                        text: myMdwHelper.getValueFromData(data['label' + i], itemSplitted[1]),
                                        subText: myMdwHelper.getValueFromData(data['subLabel' + i], ''),
                                        value: itemSplitted[0],
                                        icon: imgObj.icon,
                                        image: imgObj.image,
                                        imageColor: myMdwHelper.getValueFromData(data['listIconColor' + i], ''),
                                        imageColorSelectedTextField: myMdwHelper.getValueFromData(data['imageColorSelectedTextField' + i], '')
                                    }
                                )
                            }
                        }

                        callback(itemsList);
                    }
                });
            } else {
                // inputPerEditor (Default)
                for (var i = 0; i <= data.countSelectItems; i++) {
                    let value = myMdwHelper.getValueFromData(data['value' + i], null)

                    if (value !== null) {
                        let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(myMdwHelper.getValueFromData(data['listIcon' + i]));

                        itemsList.push(
                            {
                                text: myMdwHelper.getValueFromData(data['label' + i], value),
                                subText: myMdwHelper.getValueFromData(data['subLabel' + i], ''),
                                value: myMdwHelper.getValueFromData(data['value' + i], ''),
                                icon: imgObj.icon,
                                image: imgObj.image,
                                imageColor: myMdwHelper.getValueFromData(data['listIconColor' + i], ''),
                                imageColorSelectedTextField: myMdwHelper.getValueFromData(data['imageColorSelectedTextField' + i], '')
                            }
                        )
                    }
                }
                callback(itemsList);
            }
        },
        setIoBrokerBinding(data, vueInput, itemsList, inputMode = '') {
            let that = this;
            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                let item = vis.binds.materialdesign.vueHelper.getObjectByValue(newVal, itemsList, inputMode);
                let objImg = that.getIconTextField(data, item.icon, item.image);

                vueInput.item = item;
                vueInput.icon = objImg.icon;
                vueInput.image = objImg.image;
                vueInput.imageColor = item.imageColor;
                vueInput.iconColorTextField = that.getIconColorTextField(data, myMdwHelper.getValueFromData(item.imageColorSelectedTextField, item.imageColor));
            });
        },
        getIconTextField(data, icon, image) {
            if (data.showSelectedIcon === 'prepend' && myMdwHelper.getValueFromData(data.prepandIcon, undefined)) {
                return vis.binds.materialdesign.vueHelper.getIconOrImage(data.prepandIcon);
            } else if (data.showSelectedIcon === 'prepend-inner' && myMdwHelper.getValueFromData(data.prepandInnerIcon, undefined)) {
                return vis.binds.materialdesign.vueHelper.getIconOrImage(data.prepandInnerIcon);
            } else if (data.showSelectedIcon === 'append-outer' && myMdwHelper.getValueFromData(data.appendOuterIcon, undefined)) {
                return vis.binds.materialdesign.vueHelper.getIconOrImage(data.appendOuterIcon);
            } else {
                return { icon: icon, image: image };
            }
        },
        getIconColorTextField(data, imageColor) {
            if (data.showSelectedIcon === 'prepend' && myMdwHelper.getValueFromData(data.prepandIconColor, undefined)) {
                return data.prepandIconColor;
            } else if (data.showSelectedIcon === 'prepend-inner' && myMdwHelper.getValueFromData(data.prepandInnerIconColor, undefined)) {
                return data.prepandInnerIconColor;
            } else if (data.showSelectedIcon === 'append-outer' && myMdwHelper.getValueFromData(data.appendOuterIconColor, undefined)) {
                return data.appendOuterIconColor;
            } else {
                return imageColor;
            }
        },
        getMethods: function (data, $el, itemsList, $vuetifyContainer, inputMode = '') {
            return {
                click(item) {
                    myMdwHelper.vibrate(data.vibrateOnMobilDevices);
                },
                menuClick(item) {
                    myMdwHelper.vibrate(data.vibrateOnMobilDevices);
                    if (item || item === 0) {
                        if (item.value || item.value === 0) {
                            myMdwHelper.setValue(data.oid, item.value);
                        } else {
                            // only if combobox (is writeable)
                            myMdwHelper.setValue(data.oid, item);
                        }
                    } else {
                        let obj = vis.binds.materialdesign.vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList, inputMode);
                        this.item = obj;
                        this.icon = obj.icon;
                        this.image = obj.image;
                        this.imageColor = obj.imageColor;
                    }
                },
                changeEvent(item) {
                    // if (item) {
                    //     if (item.value) {
                    //         myMdwHelper.setValue(data.oid, item.value);
                    //     } else {
                    //         // only if combobox (is writeable)
                    //         myMdwHelper.setValue(data.oid, item);
                    //     }
                    // } else {
                    //     let obj = vis.binds.materialdesign.vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList, inputMode);
                    //     this.item = obj;
                    //     this.icon = obj.icon;
                    //     this.image = obj.image;
                    //     this.imageColor = obj.imageColor;
                    // }
                },
                focusEvent(value) {
                    // select object will first time created after item is focused. select object is created under vue app container
                    vis.binds.materialdesign.vueHelper.select.setMenuStyles($el, data, itemsList, $vuetifyContainer);
                },
                clearEvent(value) {
                    myMdwHelper.vibrate(data.vibrateOnMobilDevices);

                    vis.conn._socket.emit('getObject', data.oid, function (error, obj) {
                        if (obj && obj.common && obj.common.type) {
                            if (obj.common.type === 'string') {
                                if (obj.common.def) {
                                    vis.setValue(data.oid, obj.common.def);
                                } else {
                                    vis.setValue(data.oid, '');
                                }
                            } else if (obj.common.type === 'number') {
                                if (obj.common.def) {
                                    vis.setValue(data.oid, obj.common.def);
                                } else {
                                    vis.setValue(data.oid, 0);
                                }
                            } else {
                                console.warn(`[Vue Helper Select] no clear value for ${obj.common.type} defined!`)
                                vis.setValue(data.oid, undefined);
                            }
                        } else {
                            vis.setValue(data.oid, undefined);
                        }
                    });
                }
            }
        }
    },
    alerts: {
        generateElement: function (data, $container, idPrefix, elNum) {
            let id = `${idPrefix}${elNum}`

            let borderLayout = '';
            if (myMdwHelper.getValueFromData(data.alertBorderLayout, 'none') !== 'none') {
                borderLayout = `border="${data.alertBorderLayout}"`;
            }

            $container.append(`
                <v-alert 
                    id="${id}"
                    :value="showAlert"
                    elevation="${myMdwHelper.getNumberFromData(data.alertElevation, 0)}"
                    ${data.alertLayouts}
                    ${borderLayout}
                    ${(myMdwHelper.getValueFromData(data.alertDense, 'false') === 'true') ? 'dense' : ''}
                    transition="scroll-x-transition"
                >
                    <template v-slot:default>
                        <label v-if="text !== ''" class="materialdesign-v-alert-text" v-html="text"></label>
                    </template>

                    <template v-slot:append>
                        <div class="materialdesign-icon-button v-alert-materialdesign-icon-button" index="${elNum}" style="position: relative; width: 30px; height: 30px;">
                            <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                <span class="mdi mdi-${myMdwHelper.getValueFromData(data.closeIcon, 'close-circle-outline')} materialdesign-icon-image " style="font-size: 20px; color: var(--vue-alerts-button-close-color);"></span>                    
                            </div>
                        </div>
                    </template>

                    <template v-slot:prepend>
                        <v-icon v-if="icon !== ''" class="materialdesign-v-alerts-icon-prepand">{{ icon }}</v-icon>
                        <img v-if="image !== ''" class="materialdesign-v-alerts-image-prepand" :src="image" />
                    </template>
                </v-alert>
            `);
        },
        getVuetifyElement: function ($container, item, idPrefix, elNum, data) {
            let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(item.icon);
            let maxAlerts = myMdwHelper.getNumberFromData(data.showMaxAlerts, 0);

            let alert = new Vue({
                el: $container.find(`#${idPrefix}${elNum}`).get(0),
                vuetify: new Vuetify(),
                data() {
                    return {
                        showAlert: false,
                        icon: imgObj.icon,
                        image: imgObj.image,
                        text: item.text,
                    }
                }
            });

            if (maxAlerts > 0) {
                if (elNum < maxAlerts) {
                    alert.showAlert = true;         //show here to use animation
                }
            } else {
                alert.showAlert = true;
            }

            let el = $container.find(`#${idPrefix}${elNum}`).get(0);

            el.style.setProperty("--vue-alerts-background-color", myMdwHelper.getValueFromData(item.backgroundColor, ''))

            el.style.setProperty("--vue-alerts-border-color", myMdwHelper.getValueFromData(item.borderColor, ''));
            el.style.setProperty("--vue-alerts-border-outlined-color", myMdwHelper.getValueFromData(item.borderColor, ''));

            el.style.setProperty("--vue-alerts-icon-color", myMdwHelper.getValueFromData(item.iconColor, ''));

            el.style.setProperty("--vue-alerts-text-font-color", myMdwHelper.getValueFromData(item.fontColor, ''));

            return alert;
        },
        initializeClearButtonEvent: function ($container, vueAlertElements, data, jsonData, idPrefix) {
            $container.find('.v-alert-materialdesign-icon-button').click(function () {
                let index = parseInt($(this).attr('index'));

                vueAlertElements[index].showAlert = false;

                myMdwAlertClearButtonClicked = true;

                for (var i = 0; i <= jsonData.length - 1; i++) {
                    if (jsonData[i].id === `${idPrefix}${index}`) {
                        jsonData.splice(i, 1);
                        break;
                    }
                }

                myMdwHelper.setValue(data.oid, JSON.stringify(jsonData));

                setTimeout(function () {
                    $container.find(`#${idPrefix}${index}`).remove();

                    let nextHiddenEl = $container.find('.v-alert-materialdesign-icon-button').not(":visible");
                    if (nextHiddenEl.length > 0) {
                        vueAlertElements[parseInt(nextHiddenEl.attr('index'))].showAlert = true;
                    }
                }, 300)
            });
        }
    },
    getObjectByValue: function (val, itemsList, inputMode = '') {
        if (val !== undefined && val !== null) {
            var result = itemsList.filter(obj => {
                return obj.value.toString() === val.toString() || (!isNaN(val) && !isNaN(obj.value) && parseFloat(obj.value) === parseFloat(val));
            });

            if (result.length === 1) {
                return result[0];
            } else if (result.length > 1) {
                console.warn("[Vuetify AutoComplete]: more than one result found!")
                return result[0];
            } else {
                if (inputMode = 'combobox') {
                    // only if combobox (is writeable)
                    return { text: val, value: val };
                } else {
                    return null;
                }
            }
        } else {
            return { text: '', value: '' };
        }
    },
    getIconOrImage: function (imageOrIcon) {
        let imgObj = { icon: '', image: '' }

        if (imageOrIcon) {
            if (imageOrIcon !== null && myMdwHelper.getAllowedImageFileExtensions().some(el => imageOrIcon.includes(el))) {
                imgObj.image = imageOrIcon;
            } else {
                imgObj.icon = 'mdi-' + imageOrIcon;
            }
        }

        return imgObj;
    }
};