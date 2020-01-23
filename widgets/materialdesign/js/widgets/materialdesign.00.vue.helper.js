/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.45"

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

            if (data.inputLayout.includes('filled')) {
                //TODO: background color data hinzufügen
                $el.context.style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, ''));
                $el.context.style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
                $el.context.style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, '')));
            } else {
                $el.context.style.setProperty("--vue-text-field-background-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent'));
                $el.context.style.setProperty("--vue-text-field-background-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorHover, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
                $el.context.style.setProperty("--vue-text-field-background-after-color", myMdwHelper.getValueFromData(data.inputLayoutBackgroundColorSelected, myMdwHelper.getValueFromData(data.inputLayoutBackgroundColor, 'transparent')));
            }

            // Input Border Colors
            $el.context.style.setProperty("--vue-text-field-before-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColor, ''));
            $el.context.style.setProperty("--vue-text-field-hover-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColorHover, ''));
            $el.context.style.setProperty("--vue-text-field-after-color", myMdwHelper.getValueFromData(data.inputLayoutBorderColorSelected, ''));

            // Input Label style
            $el.context.style.setProperty("--vue-text-field-label-before-color", myMdwHelper.getValueFromData(data.inputLabelColor, ''));
            $el.context.style.setProperty("--vue-text-field-label-after-color", myMdwHelper.getValueFromData(data.inputLabelColorSelected, ''));
            $el.context.style.setProperty("--vue-text-field-label-font-family", myMdwHelper.getValueFromData(data.inputLabelFontFamily, ''));
            $el.context.style.setProperty("--vue-text-field-label-font-size", myMdwHelper.getNumberFromData(data.inputLabelFontSize, '16') + 'px');

            // Input style
            $el.context.style.setProperty("--vue-text-field-input-text-color", myMdwHelper.getValueFromData(data.inputTextColor, ''));
            $el.context.style.setProperty("--vue-text-field-input-text-font-size", myMdwHelper.getNumberFromData(data.inputTextFontSize, '16') + 'px');
            $el.context.style.setProperty("--vue-text-field-input-text-font-family", myMdwHelper.getValueFromData(data.inputTextFontFamily, ''));

            // Appendix style
            $el.context.style.setProperty("--vue-text-field-appendix-color", myMdwHelper.getValueFromData(data.inputAppendixColor, myMdwHelper.getValueFromData(data.inputTextColor, '')));
            $el.context.style.setProperty("--vue-text-field-appendix-font-size", myMdwHelper.getNumberFromData(data.inputAppendixFontSize, myMdwHelper.getNumberFromData(data.inputTextFontSize, '16')) + 'px');
            $el.context.style.setProperty("--vue-text-field-appendix-font-family", myMdwHelper.getValueFromData(data.inputAppendixFontFamily, myMdwHelper.getValueFromData(data.inputTextFontFamily, '')));

            // Message style
            $el.context.style.setProperty("--vue-text-field-message-color", myMdwHelper.getValueFromData(data.inputMessageColor, ''));
            $el.context.style.setProperty("--vue-text-field-message-font-size", myMdwHelper.getNumberFromData(data.inputMessageFontSize, '12') + 'px');
            $el.context.style.setProperty("--vue-text-field-message-font-family", myMdwHelper.getValueFromData(data.inputMessageFontFamily, ''));

            // Counter style
            $el.context.style.setProperty("--vue-text-field-counter-color", myMdwHelper.getValueFromData(data.inputCounterColor, ''));
            $el.context.style.setProperty("--vue-text-field-counter-font-size", myMdwHelper.getNumberFromData(data.inputCounterFontSize, '12') + 'px');
            $el.context.style.setProperty("--vue-text-field-counter-font-family", myMdwHelper.getValueFromData(data.inputCounterFontFamily, ''));

            // Transform options
            $el.context.style.setProperty("--vue-text-field-translate-x", myMdwHelper.getNumberFromData(data.inputTranslateX, 0) + 'px');
            $el.context.style.setProperty("--vue-text-field-translate-y", myMdwHelper.getNumberFromData(data.inputTranslateY, -16) + 'px');

            // Icon: clear options
            $el.context.style.setProperty("--vue-text-icon-clear-size", myMdwHelper.getNumberFromData(data.clearIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-clear-color", myMdwHelper.getValueFromData(data.clearIconColor, ''));


            // Icon: append-outer options
            $el.context.style.setProperty("--vue-text-icon-append-outer-size", myMdwHelper.getNumberFromData(data.appendOuterIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-append-outer-color", myMdwHelper.getValueFromData(data.appendOuterIconColor, ''));

            // Icon: prepand options
            $el.context.style.setProperty("--vue-text-icon-prepand-size", myMdwHelper.getNumberFromData(data.prepandIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-prepand-color", myMdwHelper.getValueFromData(data.prepandIconColor, ''));

            // Icon: prepand-inner options
            $el.context.style.setProperty("--vue-text-icon-prepand-inner-size", myMdwHelper.getNumberFromData(data.prepandInnerIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-prepand-inner-color", myMdwHelper.getValueFromData(data.prepandInnerIconColor, ''));
        }
    },
    select: {
        getConstructor: function (data) {
            let position = myMdwHelper.getValueFromData(data.listPosition, 'auto');
            let menuProps = `{offsetY: ${myMdwHelper.getValueFromData(data.listPositionOffset, 'false')}}`

            if (position === 'top') {
                menuProps = `{top: true, offsetY: ${myMdwHelper.getValueFromData(data.listPositionOffset, 'false')}}`;
            } else if (position === 'bottom') {
                menuProps = `{bottom: true, offsetY: ${myMdwHelper.getValueFromData(data.listPositionOffset, 'false')}}`;
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
            `
        },
        getTemplates: function (data) {
            return `
                ${vis.binds.materialdesign.vueHelper.input.getTemplates(data)}

                ${(data.showSelectedIcon !== 'no') ? `
                    <template v-slot:${data.showSelectedIcon}>
                        <div  class="v-input__icon v-input__icon--${data.showSelectedIcon}">                            
                            <v-icon v-if="icon !== ''">{{ icon }}</v-icon>
                            <img v-if="image !== ''" :src="image" />
                        </div>
                    </template>
                ` : ''}
                 
                <template v-slot:item="data">
                    <div class="materialdesign-v-list-item-image-container">
                        <v-icon v-if="data.item.icon !== ''" class="materialdesign-v-list-item-icon">{{data.item.icon}}</v-icon>
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

            dataObj.item = item;
            dataObj.items = itemsList;
            dataObj.icon = item.icon;
            dataObj.image = item.image;
            dataObj.collapseIcon = myMdwHelper.getValueFromData(data.collapseIcon, undefined, 'mdi-');

            return dataObj;
        },
        setStyles: function ($el, data) {
            vis.binds.materialdesign.vueHelper.input.setStyles($el, data);

            $el.context.style.setProperty("--vue-text-icon-append-size", myMdwHelper.getNumberFromData(data.collapseIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-append-color", myMdwHelper.getValueFromData(data.collapseIconColor, ''));
            $el.context.style.setProperty("--vue-text-icon-append-cursor", 'pointer');
        },
        setMenuStyles: function ($el, data, itemsList, $vuetifyContainer) {
            let selectId = $el.find('.v-input__slot').attr('aria-owns');

            if (itemsList.length > 0) {
                myMdwHelper.waitForElement($vuetifyContainer, '#' + selectId, function () {

                    // corresponding select object create -> set style options
                    let selectList = $vuetifyContainer.find(`#${selectId} .v-list`).get(0);

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
                });
            }
        },
        generateItemList(data) {
            let itemsList = [];

            if (data.listDataMethod === 'inputPerEditor') {
                for (var i = 0; i <= data.countSelectItems; i++) {
                    let value = myMdwHelper.getValueFromData(data.attr('value' + i), null)

                    if (value !== null) {
                        let imgObj = vis.binds.materialdesign.vueHelper.getIconOrImage(myMdwHelper.getValueFromData(data.attr('listIcon' + i), null));

                        itemsList.push(
                            {
                                text: myMdwHelper.getValueFromData(data.attr('label' + i), value),
                                subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                                value: myMdwHelper.getValueFromData(data.attr('value' + i), ''),
                                icon: imgObj.icon,
                                image: imgObj.image
                            }
                        )
                    }
                }
            } else if (data.listDataMethod === 'jsonStringObject') {
                let jsonData = null;

                try {
                    jsonData = JSON.parse(data.jsonStringObject);
                } catch (err) {
                    console.error(`[jsonStringObject] cannot parse json string! Error: ${err.message}`);
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
                                    image: imgObj.image
                                }
                            )
                        }
                    }
                }
            } else if (data.listDataMethod === 'valueList') {
                if (data.valueList) {
                    let valueList = data.valueList.split(',');
                    let valueListLabels = data.valueListLabels.split(',');
                    let valueListIcons = data.valueListIcons.split(',');

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
                                    image: imgObj.image
                                }
                            )
                        }
                    }
                }
            }
            return itemsList;
        },
        setIoBrokerBinding(data, vueInput, itemsList, inputMode = '') {
            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                let item = vis.binds.materialdesign.vueHelper.getObjectByValue(newVal, itemsList, inputMode);
                vueInput.item = item;
                vueInput.icon = item.icon;
                vueInput.image = item.image;
            });
        },
        getMethods: function (data, $el, itemsList, $vuetifyContainer, inputMode = '') {
            return {
                changeEvent(item) {
                    if (item) {
                        if (item.value) {
                            vis.setValue(data.oid, item.value);
                        } else {
                            // only if combobox (is writeable)
                            vis.setValue(data.oid, item);
                        }
                    } else {
                        let item = vis.binds.materialdesign.vueHelper.getObjectByValue(vis.states.attr(data.oid + '.val'), itemsList, inputMode);
                        this.item = item;
                        this.icon = item.icon;
                        this.image = item.image;
                    }
                },
                focusEvent(value) {
                    // select object will first time created after item is focused. select object is created under vue app container
                    vis.binds.materialdesign.vueHelper.select.setMenuStyles($el, data, itemsList, $vuetifyContainer);
                }
            }
        }
    },
    getObjectByValue: function (val, itemsList, inputMode = '') {
        var result = itemsList.filter(obj => {
            return obj.value === val;
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