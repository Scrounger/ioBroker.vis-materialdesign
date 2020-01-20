/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.44"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.input = {
    helper: {
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

                    ${(myMdwHelper.getValueFromData(data.appendIcon, null) !== null) ? ':append-icon="appendIcon"' : ''}                        
                    ${(myMdwHelper.getValueFromData(data.appendOuterIcon, null) !== null) ? ':append-outer-icon="appendOuterIcon"' : ''}

                    ${(myMdwHelper.getValueFromData(data.prepandIcon, null) !== null) ? ':prepend-inner-icon="prepandIcon"' : ''}
                    ${(myMdwHelper.getValueFromData(data.prepandOuterIcon, null) !== null) ? ':prepend-icon="prepandOuterIcon"' : ''}
                    
                    @change="changeEvent"
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
                appendIcon: myMdwHelper.getValueFromData(data.appendIcon, undefined, 'mdi-'),
                appendOuterIcon: myMdwHelper.getValueFromData(data.appendOuterIcon, undefined, 'mdi-'),
                prepandIcon: myMdwHelper.getValueFromData(data.prepandIcon, undefined, 'mdi-'),
                prepandOuterIcon: myMdwHelper.getValueFromData(data.prepandOuterIcon, undefined, 'mdi-'),
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

            // Icon: prepand-outer options
            $el.context.style.setProperty("--vue-text-icon-prepand-outer-size", myMdwHelper.getNumberFromData(data.prepandOuterIconSize, 16) + 'px');
            $el.context.style.setProperty("--vue-text-icon-prepand-outer-color", myMdwHelper.getValueFromData(data.prepandOuterIconColor, ''));
        }
    }
};