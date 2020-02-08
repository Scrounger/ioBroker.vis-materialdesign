/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.51"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.list = {
    initialize: function (data) {
        try {

            let listItemStyle = myMdwHelper.getValueFromData(data.listItemHeight, '', 'height: ', 'px !important;');

            if (data.listType === 'buttonToggle_readonly' || data.listType === 'checkbox_readonly' || data.listType === 'switch_readonly') {
                // remove pointer und clickable 
                listItemStyle = listItemStyle + 'cursor: default; pointer-events: none;';
            }

            let headerFontSize = myMdwHelper.getFontSize(data.listItemHeaderTextSize);
            let labelFontSize = myMdwHelper.getFontSize(data.listItemTextSize);
            let subLabelFontSize = myMdwHelper.getFontSize(data.listItemSubTextSize);

            let rightLabelFontSize = myMdwHelper.getFontSize(data.listItemTextRightSize);
            let rightSubLabelFontSize = myMdwHelper.getFontSize(data.listItemSubTextRightSize);

            let spaceBetweenImageAndLabel = myMdwHelper.getValueFromData(data.distanceBetweenTextAndImage, '', 'margin-right: ', 'px;');

            let rightTextWidth = myMdwHelper.getValueFromData(data.rightTextWidth, '', '', 'px');

            let nonInteractive = '';
            let itemRole = '';
            if (data.listType === 'text') {
                nonInteractive = ' mdc-list--non-interactive';
            } else if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly' || data.listType === 'switch' || data.listType === 'switch_readonly') {
                itemRole = 'role="checkbox"';
            }

            let itemList = [];

            let listLayout = '';
            if (data.listLayout === 'card') {
                listLayout = 'materialdesign-list-card';
            } else if (data.listLayout === 'cardOutlined') {
                listLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            for (var i = 0; i <= data.count; i++) {
                let itemHeaderText = myMdwHelper.getValueFromData(data.attr('groupHeader' + i), null);
                let itemLabelText = myMdwHelper.getValueFromData(data.attr('label' + i), `Item ${i}`);
                let itemSubLabelText = myMdwHelper.getValueFromData(data.attr('subLabel' + i), '');

                let itemRightLabelText = myMdwHelper.getValueFromData(data.attr('rightLabel' + i), '');
                let itemRightSubLabelText = myMdwHelper.getValueFromData(data.attr('rightSubLabel' + i), '');


                // generate Header
                itemList.push(myMdwHelper.getListItemHeader(itemHeaderText, headerFontSize));

                // generate Item -> mdc-list-item
                let listItem = myMdwHelper.getListItem('standard', i, '', false, false, listItemStyle, `data-oid="${data.attr('oid' + i)}"`, itemRole)
                    .replace(' mdc-list-item--activated', '');   // selected object not needed in list

                // generate Item Label
                let itemLabel = '';
                if (itemSubLabelText === '') {
                    itemLabel = myMdwHelper.getListItemLabel('standard', i, itemLabelText, false, labelFontSize, '', '', '', false, data.listItemAlignment);
                } else {
                    itemLabel = myMdwHelper.getListItemTextElement(itemLabelText, itemSubLabelText, labelFontSize, subLabelFontSize, data.listItemAlignment);
                }

                // generate right Item Label
                let rightItemLabel = '';
                if (itemRightSubLabelText === '') {
                    rightItemLabel = myMdwHelper.getListItemLabel('standard', i, itemRightLabelText, false, rightLabelFontSize, '', '', '');

                    rightItemLabel = $($.parseHTML(rightItemLabel));
                    rightItemLabel.addClass('materialdesign-list-item-text-right').addClass('mdc-list-item__meta');
                } else {
                    rightItemLabel = myMdwHelper.getListItemTextElement(itemRightLabelText, itemRightSubLabelText, rightLabelFontSize, rightSubLabelFontSize);

                    rightItemLabel = $($.parseHTML(rightItemLabel));
                    rightItemLabel.addClass('mdc-list-item__meta');
                    rightItemLabel.find('.mdc-list-item__primary-text').css('justify-content', 'flex-end').css('width', 'auto').addClass('materialdesign-list-item-text-right');
                    rightItemLabel.find('.mdc-list-item__secondary-text').addClass('materialdesign-list-item-text-right');
                }

                // add needed styles to right label
                rightItemLabel.css('text-align', 'right').css('width', rightTextWidth);


                // generate Item Image for Layout Standard
                let listItemImage = myMdwHelper.getListIcon(data.attr('listImage' + i), 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), data.attr('listImageColor' + i) , spaceBetweenImageAndLabel);

                // generate Item Control Element
                let itemControl = '';
                if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly') {
                    itemControl = `<div class="mdc-checkbox ${(data.listType === 'checkbox_readonly') ? 'mdc-checkbox--disabled' : ''} mdc-list-item__meta">
                                        <input type="checkbox" class="mdc-checkbox__native-control" tabindex="-1" data-oid="${data.attr('oid' + i)}" itemindex="${i}" />
                                        <div class="mdc-checkbox__background">
                                            <svg class="mdc-checkbox__checkmark" viewBox="0 0 24 24">
                                                <path class="mdc-checkbox__checkmark-path" fill="none" stroke="white" d="M1.73,12.91 8.1,19.28 22.79,4.59"></path>
                                            </svg>
                                        </div>
                                    </div>`;
                } else if (data.listType === 'switch' || data.listType === 'switch_readonly') {
                    itemControl = `<div class="mdc-switch ${(data.listType === 'switch_readonly') ? 'mdc-switch--disabled' : ''} mdc-list-item__meta">
                                        <div class="mdc-switch__track"></div>
                                        <div class="mdc-switch__thumb-underlay">
                                            <div class="mdc-switch__thumb">
                                                <input type="checkbox" id="basic-switch" class="mdc-switch__native-control" role="switch" data-oid="${data.attr('oid' + i)}" itemindex="${i}">
                                            </div>
                                        </div>
                                    </div>`
                }

                // generate Item
                itemList.push(`${listItem}${listItemImage}${itemLabel}${itemControl}${rightItemLabel.get(0).outerHTML}</div>`);

                // generate Divider
                itemList.push(myMdwHelper.getListItemDivider(data.attr('dividers' + i), data.listItemDividerStyle));
            }

            return { itemList: itemList.join(''), listLayout: listLayout, nonInteractive: nonInteractive }
        } catch (ex) {
            console.error(`[List] initialize: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handler: function (el, data) {
        try {
            let $this = $(el);

            let list = $this.context;

            let spaceBetweenImageAndLabel = myMdwHelper.getValueFromData(data.distanceBetweenTextAndImage, '', 'margin-right: ', 'px;');

            const mdcList = new mdc.list.MDCList(list);
            const mdcListAdapter = mdcList.getDefaultFoundation().adapter_;
            const listItemRipples = mdcList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));

            list.style.setProperty("--materialdesign-color-list-item-background", myMdwHelper.getValueFromData(data.listItemBackground, ''));
            list.style.setProperty("--materialdesign-color-list-item-hover", myMdwHelper.getValueFromData(data.colorListItemHover, ''));
            list.style.setProperty("--materialdesign-color-list-item-selected", myMdwHelper.getValueFromData(data.colorListItemSelected, ''));
            list.style.setProperty("--materialdesign-color-list-item-text", myMdwHelper.getValueFromData(data.colorListItemText, ''));
            list.style.setProperty("--materialdesign-color-list-item-text-activated", myMdwHelper.getValueFromData(data.colorListItemText, ''));
            list.style.setProperty("--materialdesign-color-list-item-text-secondary", myMdwHelper.getValueFromData(data.colorListItemTextSecondary, ''));

            list.style.setProperty("--materialdesign-color-list-item-text-right", myMdwHelper.getValueFromData(data.colorListItemTextRight, ''));
            list.style.setProperty("--materialdesign-color-list-item-text-secondary-right", myMdwHelper.getValueFromData(data.colorListItemTextSecondaryRight, ''));

            list.style.setProperty("--materialdesign-color-list-item-header", myMdwHelper.getValueFromData(data.colorListItemHeaders, ''));
            list.style.setProperty("--materialdesign-color-list-item-divider", myMdwHelper.getValueFromData(data.colorListItemDivider, ''));

            list.style.setProperty("--mdc-theme-secondary", myMdwHelper.getValueFromData(data.colorCheckBox, ''));

            if (!vis.editMode) {
                mdcList.listen('MDCList:action', function (item) {
                    let index = item.detail.index;

                    if (data.listType !== 'text') {
                        vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                    }

                    if (data.listType === 'checkbox' || data.listType === 'switch') {
                        let selectedValue = mdcListAdapter.isCheckboxCheckedAtIndex(index);

                        vis.setValue(data.attr('oid' + index), selectedValue);

                        setLayout(index, selectedValue);

                    } else if (data.listType === 'buttonToggle') {
                        let selectedValue = vis.states.attr(data.attr('oid' + index) + '.val');

                        vis.setValue(data.attr('oid' + index), !selectedValue);

                        setLayout(index, !selectedValue);

                    } else if (data.listType === 'buttonState') {
                        let valueToSet = data.attr('listTypeButtonStateValue' + index);

                        vis.setValue(data.attr('oid' + index), valueToSet);

                    } else if (data.listType === 'buttonNav') {
                        vis.changeView(data.attr('listTypeButtonNav' + index));

                    } else if (data.listType === 'buttonLink') {
                        window.open(data.attr('listTypeButtonLink' + index));
                    }
                });
            }

            let itemCount = (data.listType === 'switch' || data.listType === 'switch_readonly') ? $this.find('.mdc-switch').length : mdcList.listElements.length;

            for (var i = 0; i <= itemCount - 1; i++) {
                if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly' || data.listType === 'switch' || data.listType === 'switch_readonly') {
                    if (data.listType === 'switch' || data.listType === 'switch_readonly') new mdc.switchControl.MDCSwitch($this.find('.mdc-switch').get(i));
                    if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly') {
                        let mdcCheckBox = new mdc.checkbox.MDCCheckbox($this.find('.mdc-checkbox').get(i));

                        if (data.listType === 'checkbox_readonly') {
                            mdcCheckBox.disabled = true;
                        }
                    }

                    let valOnLoading = vis.states.attr(data.attr('oid' + i) + '.val');
                    mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(i, valOnLoading);
                    setLayout(i, valOnLoading);

                    vis.states.bind(data.attr('oid' + i) + '.val', function (e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen
                        let input = $this.find('input[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                        input.each(function (d) {
                            // kann mit mehreren oid verknüpft sein
                            let index = input.eq(d).attr('itemindex');
                            mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(index, newVal);
                            setLayout(index, newVal);
                        });
                    });

                } else if (data.listType === 'buttonToggle' || data.listType === 'buttonToggle_readonly') {
                    let valOnLoading = vis.states.attr(data.attr('oid' + i) + '.val');
                    setLayout(i, valOnLoading);

                    vis.states.bind(data.attr('oid' + i) + '.val', function (e, newVal, oldVal) {
                        // i wird nicht gespeichert -> umweg über oid gehen
                        let input = $this.parent().find('div[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                        input.each(function (d) {
                            // kann mit mehreren oid verknüpft sein
                            let index = parseInt(input.eq(d).attr('id').replace('listItem_', ''));
                            setLayout(index, newVal);
                        });
                    });
                }
            }

            function setLayout(index, val) {
                let curListItem = $this.find(`div[id="listItem_${index}"]`);

                if (val === true) {
                    curListItem.css('background', myMdwHelper.getValueFromData(data.listItemBackgroundActive, ''));
                    myMdwHelper.changeListIconElement(curListItem, data.attr('listImageActive' + index), 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), data.attr('listImageActiveColor' + index), spaceBetweenImageAndLabel);

                } else {
                    curListItem.css('background', myMdwHelper.getValueFromData(data.listItemBackground, ''));
                    myMdwHelper.changeListIconElement(curListItem, data.attr('listImage' + index), 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), data.attr('listImageColor' + index), spaceBetweenImageAndLabel);
                }
            }

        } catch (ex) {
            console.error(`[List] handler: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};