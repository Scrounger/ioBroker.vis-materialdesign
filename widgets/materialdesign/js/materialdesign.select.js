/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.6"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.select = {
    initialize: function (data) {
        try {
            let selectElementList = [];

            let image = getValueFromData(data.image, null);
            let imageTrue = getValueFromData(data.imageTrue, null);


            let selectElement = '';
            let labelledbyAttribute = '';
            let labelElement = '';

            if (data.layout === 'standard') {
                selectElement = '<div class="mdc-select" style="width: 100%;">'
                labelledbyAttribute = 'filled_enhanced filled_enhanced-label';

                labelElement = `<span class="mdc-floating-label mdc-floating-label--float-above">${getValueFromData(data.hintText, '')}</span>
                                <div class="mdc-line-ripple"></div>`
            } else {
                selectElement = '<div class="mdc-select mdc-select--outlined" style="width: 100%;">'
                labelledbyAttribute = 'shaped_filled_enhanced shaped_filled_enhanced-label';

                labelElement = `<div class="mdc-line-ripple"></div>
                                <div class="mdc-notched-outline">
                                    <div class="mdc-notched-outline__leading"></div>
                                    <div class="mdc-notched-outline__notch">
                                        <label class="mdc-floating-label">${getValueFromData(data.hintText, '')}</label>
                                    </div>
                                    <div class="mdc-notched-outline__trailing"></div>
                                </div>`
            }

            let imageElement = '';
            if (image != null || imageTrue != null) {
                selectElement = $($.parseHTML(selectElement)).addClass('mdc-select--with-leading-icon').get(0).outerHTML.replace('</div>', '');
                imageElement = `<img class="material-icons mdc-select__icon" tabindex="0" role="button" src="${image}" />`;
            }

            let listElements = `<ul class="mdc-list">
                                    <li class="mdc-list-item" data-value="false" aria-selected="true">${data.text_false}</li>
                                    <li class="mdc-list-item" data-value="true">${data.text_true}</li>
                                </ul>`

            selectElementList.push(`${selectElement}
                                        ${imageElement}
                                        <input type="hidden" name="enhanced-select">
                                        <i class="mdc-select__dropdown-icon"></i>
                                        <div id="filled_enhanced" class="mdc-select__selected-text" role="button" aria-haspopup="listbox" aria-labelledby="${labelledbyAttribute}"></div>
                                        <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                                            ${listElements}
                                        </div>
                                        ${labelElement}
                                    </div>`);

            return selectElementList.join('');

        } catch (ex) {
            console.exception(`initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleBoolean: function (el, data) {
        try {
            setTimeout(function () {
                var $this = $(el);
                let select = $this.find('.mdc-select').get(0);
                let list = $this.find('.mdc-list').get(0);

                const mdcSelect = new mdc.select.MDCSelect(select);
                const mdcList = new mdc.list.MDCList(list);
                const listItemRipples = mdcList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

                select.style.setProperty("--materialdesign-color-select-background", getValueFromData(data.selectBackground, ''));
                select.style.setProperty("--materialdesign-color-select-background-hover", getValueFromData(data.selectBackgroundHover, ''));
                select.style.setProperty("--materialdesign-color-select-hint", getValueFromData(data.selectHintTextColor, ''));
                select.style.setProperty("--materialdesign-color-select-hint_selected", getValueFromData(data.selectHintTextColorSelected, ''));
                select.style.setProperty("--materialdesign-color-select-border", getValueFromData(data.selectBorderColor, ''));
                select.style.setProperty("--materialdesign-color-select-border-selected", getValueFromData(data.selectBorderColorSelected, ''));

                setSelectState(vis.states.attr(data.oid + '.val'));

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    setSelectState(newVal);
                });

                mdcSelect.listen('MDCSelect:change', function () {
                    vis.setValue(data.oid, (mdcSelect.value === 'true') ? true : false);
                });

                function setSelectState(val) {
                    if (val) {
                        mdcSelect.selectedIndex = 1;
                        $this.find('.material-icons').attr('src', getValueFromData(data.imageTrue, ''))
                    } else {
                        mdcSelect.selectedIndex = 0;
                        $this.find('.material-icons').attr('src', getValueFromData(data.image, ''))
                    }
                };
            }, 1);

        } catch (ex) {
            console.exception(`handleBoolean: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};