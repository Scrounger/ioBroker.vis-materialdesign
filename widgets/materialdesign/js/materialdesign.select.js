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


            if (data.layout === 'standard') {
                selectElementList.push(`<div class="mdc-select" style="width: 100%;">
                                        <input type="hidden" name="enhanced-select">
                                        <i class="mdc-select__dropdown-icon"></i>
                                        <div id="filled_enhanced" class="mdc-select__selected-text" role="button" aria-haspopup="listbox" aria-labelledby="filled_enhanced filled_enhanced-label"></div>
                                        <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                                            <ul class="mdc-list">
                                                <li class="mdc-list-item" data-value="false">${data.text_false}</li>
                                                <li class="mdc-list-item" data-value="true">${data.text_true}</li>
                                            </ul>
                                        </div>
                                        <span class="mdc-floating-label mdc-floating-label--float-above">${getValueFromData(data.hintText, '')}</span>
                                        <div class="mdc-line-ripple"></div>
                                        `)
            } else {
                selectElementList.push(`<div class="mdc-select mdc-select--outlined" style="width: 100%;">
                                        <input type="hidden" name="enhanced-select">
                                        <i class="mdc-select__dropdown-icon"></i>
                                        <div id="filled_enhanced" class="mdc-select__selected-text" role="button" aria-haspopup="listbox" aria-labelledby="shaped_filled_enhanced shaped_filled_enhanced-label"></div>
                                        <div class="mdc-select__menu mdc-menu mdc-menu-surface">
                                            <ul class="mdc-list">
                                                <li class="mdc-list-item" data-value="false">${data.text_false}</li>
                                                <li class="mdc-list-item" data-value="true">${data.text_true}</li>
                                            </ul>
                                        </div>
                                        <div class="mdc-line-ripple"></div>
                                        <div class="mdc-notched-outline">
                                            <div class="mdc-notched-outline__leading"></div>
                                            <div class="mdc-notched-outline__notch">
                                                <label class="mdc-floating-label">${getValueFromData(data.hintText, '')}</label>
                                            </div>
                                            <div class="mdc-notched-outline__trailing"></div>
                                        </div>
                                        `)
            }

            return selectElementList.join('');

        } catch (ex) {
            console.exception(`initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleBoolean: function (el, data) {
        try {
            var $this = $(el);
            let select = $this.find('.mdc-select').get(0);
            let list = $this.find('.mdc-list').get(0);

            console.log(select);
            const mdcSelect = new mdc.select.MDCSelect(select);
            const mdcList = new mdc.list.MDCList(list);
            const listItemRipples = mdcList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));


        } catch (ex) {
            console.exception(`handleBoolean: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};