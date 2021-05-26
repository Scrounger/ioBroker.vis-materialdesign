/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.list =
    function (el, data) {
        let widgetName = 'List';

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            myMdwHelper.waitForOid(data.json_string_oid, data.wid, widgetName, function () {
                let itemList = [];
                let nonInteractive = '';
                let jsonData = null;
                let countOfItems = 0;
                let containerClass = 'materialdesign-list-container';
                let oidsNeedSubscribe = false;
                let bindingTokenList = [];

                generateContent();

                if (oidsNeedSubscribe) {
                    myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                        appendContent();
                        eventListener();
                    });
                } else {
                    // json: hat keine objectIds / bindings bzw. bereits subscribed
                    appendContent();
                    eventListener();
                }

                vis.states.bind(data.json_string_oid + '.val', function (e, newVal, oldVal) {
                    // json Object changed
                    let scrollTop = $this.scrollTop();
                    let scrollLeft = $this.scrollLeft();
                    generateContent();

                    if (oidsNeedSubscribe) {
                        myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                            appendContent(true, scrollTop, scrollLeft);
                            eventListener();
                        });
                    } else {
                        // json: hat keine objectIds / bindings bzw. bereits subscribed
                        appendContent(true, scrollTop, scrollLeft);
                        eventListener();
                    }
                });

                function generateContent() {
                    itemList = [];
                    nonInteractive = '';
                    bindingTokenList = [];
                    oidsNeedSubscribe = false;

                    if (data.listItemDataMethod === 'jsonStringObject') {
                        let val = vis.states.attr(data.json_string_oid + '.val');
                        if (val && val !== null && val !== 'null') {
                            try {
                                jsonData = JSON.parse(val);
                            } catch (err) {
                                jsonData = [
                                    {
                                        text: `<font color=\"red\"><b>${_("Error in JSON string")}</b></font>`,
                                        subText: `<label style="word-wrap: break-word; white-space: normal;">${err.message}</label>`
                                    }
                                ];
                                console.error(`[IconList - ${data.wid}] cannot parse json string! value: '${val}' Error: ${err.message}`);
                            }

                            countOfItems = jsonData.length - 1;
                        } else {
                            jsonData = [
                                {
                                    text: `<font color=\"red\"><b>${_("datapoint '{0}' not exist!").replace('{0}', data.json_string_oid)}</b></font>`,
                                }
                            ];
                            countOfItems = jsonData.length - 1;
                            console.warn(`[IconList - ${data.wid}] ${_("datapoint '{0}' not exist!").replace('{0}', data.json_string_oid)}`);
                        }
                    } else {
                        countOfItems = data.countListItems;
                    }

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


                    let itemRole = '';
                    if (data.listType === 'text') {
                        nonInteractive = ' mdc-list--non-interactive';
                    } else if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly' || data.listType === 'switch' || data.listType === 'switch_readonly') {
                        itemRole = 'role="checkbox"';
                    }

                    if ((data.listItemDataMethod === 'jsonStringObject' && jsonData !== null) || data.listItemDataMethod === 'inputPerEditor') {
                        for (var i = 0; i <= countOfItems; i++) {
                            let listItemObj = getListItemObj(i, data, jsonData);

                            let itemStyle = listItemObj.listOverflow ? listItemStyle + 'overflow: visible;' : listItemStyle

                            // generate Header
                            itemList.push(myMdwHelper.getListItemHeader(listItemObj.header, headerFontSize));

                            // generate Item -> mdc-list-item
                            let listItem = myMdwHelper.getListItem('standard', i, '', false, false, itemStyle, `data-oid="${listItemObj.objectId}"`, itemRole)
                                .replace(' mdc-list-item--activated', '');   // selected object not needed in list

                            // generate Item Label
                            let itemLabel = '';
                            if (listItemObj.subText === '') {
                                itemLabel = myMdwHelper.getListItemLabel('standard', i, listItemObj.text, false, labelFontSize, '', '', '', false, data.listItemAlignment, listItemObj.listOverflow);
                            } else {
                                itemLabel = myMdwHelper.getListItemTextElement(listItemObj.text, listItemObj.subText, labelFontSize, subLabelFontSize, data.listItemAlignment);
                            }

                            // generate right Item Label
                            let rightItemLabel = '';
                            if (listItemObj.rightSubText === '') {
                                rightItemLabel = myMdwHelper.getListItemLabel('standard', i, listItemObj.rightText, false, rightLabelFontSize, '', '', '', false, 'left', listItemObj.listOverflow);

                                rightItemLabel = $($.parseHTML(rightItemLabel));
                                rightItemLabel.addClass('materialdesign-list-item-text-right').addClass('mdc-list-item__meta');
                            } else {
                                rightItemLabel = myMdwHelper.getListItemTextElement(listItemObj.rightText, listItemObj.rightSubText, rightLabelFontSize, rightSubLabelFontSize, 'right');

                                rightItemLabel = $($.parseHTML(rightItemLabel));
                                rightItemLabel.addClass('mdc-list-item__meta');
                                rightItemLabel.find('.mdc-list-item__primary-text').css('justify-content', 'flex-end').css('width', 'auto').addClass('materialdesign-list-item-text-right');
                                rightItemLabel.find('.mdc-list-item__secondary-text').addClass('materialdesign-list-item-text-right');
                            }

                            // add needed styles to right label
                            rightItemLabel.css('text-align', 'right').css('width', rightTextWidth);


                            // generate Item Image for Layout Standard
                            let listItemImage = myMdwHelper.getListIcon(listItemObj.image, 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), listItemObj.imageColor, spaceBetweenImageAndLabel);

                            // generate Item Control Element
                            let itemControl = '';
                            if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly') {
                                itemControl = `<div class="mdc-checkbox ${(data.listType === 'checkbox_readonly') ? 'mdc-checkbox--disabled' : ''} mdc-list-item__meta">
                                        <input type="checkbox" class="mdc-checkbox__native-control" tabindex="-1" data-oid="${listItemObj.objectId}" itemindex="${i}" />
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
                                                <input type="checkbox" id="basic-switch" class="mdc-switch__native-control" role="switch" data-oid="${listItemObj.objectId}" itemindex="${i}">
                                            </div>
                                        </div>
                                    </div>`
                            }

                            // generate Item
                            let element = `${listItem}${listItemImage}${itemLabel}${itemControl}${rightItemLabel.get(0).outerHTML}</div>`
                            itemList.push(element);

                            // generate Divider
                            itemList.push(myMdwHelper.getListItemDivider(listItemObj.showDivider, data.listItemDividerStyle));

                            // Check if Oid is subscribed and put to vis subscribing object
                            oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(listItemObj.objectId, data.wid, widgetName, oidsNeedSubscribe);

                            // Check if Bindings is subscribed and put to vis subcribing and bindings object 
                            let bindingResult = myMdwHelper.bindingNeedSubscribe(element, data.wid, widgetName, oidsNeedSubscribe);
                            oidsNeedSubscribe = bindingResult.oidNeedSubscribe;
                            bindingTokenList = bindingTokenList.concat(bindingResult.bindingTokenList);
                        }
                    }
                }

                function appendContent(replace = false, scrollTop = 0, scrollLeft = 0) {
                    let widgetElement = itemList.join("");

                    if (bindingTokenList.length > 0) {
                        for (var b = 0; b <= bindingTokenList.length - 1; b++) {
                            widgetElement = widgetElement.replace(bindingTokenList[b], vis.formatBinding(bindingTokenList[b]))
                        }
                    }

                    if (!replace) {
                        if (data.listLayout === 'card' || data.listLayout === 'cardOutlined') {
                            let listLayout = data.listLayout === 'card' ? 'materialdesign-list-card' : 'materialdesign-list-card materialdesign-list-card--outlined';

                            $this.append(`
                            <div class="${listLayout}">
                                <ul class="mdc-list ${nonInteractive} ${containerClass}" ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'style="overflow-y: auto; overflow-x: hidden;"' : ''}>   
                                    ${widgetElement}
                                </ul>
                            </div>`);
                        } else {
                            $this.append(`
                                <ul class="mdc-list ${nonInteractive} ${containerClass}" ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'style="overflow-y: auto; overflow-x: hidden;"' : ''}>   
                                    ${widgetElement}
                                </ul>`);
                        }
                    } else {
                        $this.find(`.${containerClass}`).replaceWith(`
                        <ul class="mdc-list ${nonInteractive} ${containerClass}" ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'style="overflow-y: auto; overflow-x: hidden;"' : ''}>   
                            ${widgetElement}
                        </ul>`);
                    }

                    $this.scrollTop(scrollTop);
                    $this.scrollLeft(scrollLeft);
                }

                function eventListener() {
                    let list = $this.context;

                    let spaceBetweenImageAndLabel = myMdwHelper.getValueFromData(data.distanceBetweenTextAndImage, '', 'margin-right: ', 'px;');

                    const mdcList = new mdc.list.MDCList(list);
                    if (mdcList) {
                        const mdcListAdapter = mdcList.getDefaultFoundation().adapter_;
                        const listItemRipples = mdcList.listElements.map((listItemEl) => new mdc.ripple.MDCRipple(listItemEl));


                        $(document).on("mdwSubscribe", function (e, oids) {
                            if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                                setStyle();
                            }
                        });

                        vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                            setStyle();
                        });

                        vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                            setStyle();
                        });

                        setStyle();
                        function setStyle() {

                            if (data.listLayout === 'card' || data.listLayout === 'cardOutlined') {
                                list.style.setProperty("--materialdesign-color-card-background", myMdwHelper.getValueFromData(data.listBackground, ''));
                            } else {
                                list.style.setProperty("--materialdesign-color-list-background", myMdwHelper.getValueFromData(data.listBackground, ''));
                            }

                            list.style.setProperty("--materialdesign-color-list-item-background", myMdwHelper.getValueFromData(data.listItemBackground, ''));
                            list.style.setProperty("--materialdesign-color-list-item-hover", myMdwHelper.getValueFromData(data.colorListItemHover, ''));
                            list.style.setProperty("--materialdesign-color-list-item-selected", myMdwHelper.getValueFromData(data.colorListItemSelected, ''));

                            list.style.setProperty("--materialdesign-color-list-item-text", myMdwHelper.getValueFromData(data.colorListItemText, ''));
                            list.style.setProperty("--materialdesign-font-list-item-text", myMdwHelper.getValueFromData(data.listItemFont, ''));


                            list.style.setProperty("--materialdesign-color-list-item-text-activated", myMdwHelper.getValueFromData(data.colorListItemText, ''));

                            list.style.setProperty("--materialdesign-color-list-item-text-secondary", myMdwHelper.getValueFromData(data.colorListItemTextSecondary, ''));
                            list.style.setProperty("--materialdesign-font-list-item-text-secondary", myMdwHelper.getValueFromData(data.listItemSubFont, ''));

                            list.style.setProperty("--materialdesign-color-list-item-text-right", myMdwHelper.getValueFromData(data.colorListItemTextRight, ''));
                            list.style.setProperty("--materialdesign-font-list-item-text-right", myMdwHelper.getValueFromData(data.listItemRightFont, ''));


                            list.style.setProperty("--materialdesign-color-list-item-text-secondary-right", myMdwHelper.getValueFromData(data.colorListItemTextSecondaryRight, ''));
                            list.style.setProperty("--materialdesign-font-list-item-text-secondary-right", myMdwHelper.getValueFromData(data.listItemSubRightFont, ''));

                            list.style.setProperty("--materialdesign-color-list-item-header", myMdwHelper.getValueFromData(data.colorListItemHeaders, ''));
                            list.style.setProperty("--materialdesign-font-list-item-header", myMdwHelper.getValueFromData(data.headerFontFamily, ''));

                            list.style.setProperty("--materialdesign-color-list-item-divider", myMdwHelper.getValueFromData(data.colorListItemDivider, ''));

                            list.style.setProperty("--materialdesign-color-switch-on", myMdwHelper.getValueFromData(data.colorSwitchTrue, ''));
                            list.style.setProperty("--materialdesign-color-switch-off", myMdwHelper.getValueFromData(data.colorSwitchThumb, ''));
                            list.style.setProperty("--materialdesign-color-switch-track", myMdwHelper.getValueFromData(data.colorSwitchTrack, ''));
                            list.style.setProperty("--materialdesign-color-switch-off-hover", myMdwHelper.getValueFromData(data.colorSwitchHover, ''));

                            let itemCount = (data.listType === 'switch' || data.listType === 'switch_readonly') ? $this.find('.mdc-switch').length : mdcList.listElements.length;
                            for (var i = 0; i <= itemCount - 1; i++) {
                                setItemStyle(i, data, jsonData);
                            }
                        }

                        if (mdcListAdapter) {
                            if (!vis.editMode) {
                                mdcList.listen('MDCList:action', function (item) {
                                    let index = item.detail.index;
                                    let listItemObj = getListItemObj(index, data, jsonData);

                                    if (data.listType !== 'text') {
                                        myMdwHelper.vibrate(data.vibrateOnMobilDevices);
                                    }

                                    if (data.listType === 'checkbox' || data.listType === 'switch') {
                                        let selectedValue = mdcListAdapter.isCheckboxCheckedAtIndex(index);

                                        myMdwHelper.setValue(listItemObj.objectId, selectedValue);

                                        setLayout(index, selectedValue, listItemObj);

                                    } else if (data.listType === 'buttonToggle') {
                                        let selectedValue = vis.states.attr(listItemObj.objectId + '.val');

                                        myMdwHelper.setValue(listItemObj.objectId, !selectedValue);

                                        setLayout(index, !selectedValue, listItemObj);

                                    } else if (data.listType === 'buttonState') {
                                        let valueToSet = listItemObj.buttonStateValue;

                                        myMdwHelper.setValue(listItemObj.objectId, valueToSet);

                                    } else if (data.listType === 'buttonNav') {
                                        vis.changeView(listItemObj.buttonNavView);

                                    } else if (data.listType === 'buttonLink') {
                                        window.open(listItemObj.buttonLink);
                                    }
                                });
                            }

                            let itemCount = (data.listType === 'switch' || data.listType === 'switch_readonly') ? $this.find('.mdc-switch').length : mdcList.listElements.length;
                            for (var i = 0; i <= itemCount - 1; i++) {
                                setItemStyle(i, data, jsonData);
                            }
                        }

                        function setItemStyle(i, data, jsonData) {
                            try {
                                let listItemObj = getListItemObj(i, data, jsonData);

                                if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly' || data.listType === 'switch' || data.listType === 'switch_readonly') {
                                    if (data.listType === 'switch' || data.listType === 'switch_readonly') new mdc.switchControl.MDCSwitch($this.find('.mdc-switch').get(i));
                                    if (data.listType === 'checkbox' || data.listType === 'checkbox_readonly') {
                                        let mdcCheckBox = new mdc.checkbox.MDCCheckbox($this.find('.mdc-checkbox').get(i));

                                        $this.find('.mdc-checkbox').get(i).style.setProperty("--mdc-theme-secondary", myMdwHelper.getValueFromData(data.colorCheckBox, ''));

                                        if (data.listType === 'checkbox_readonly') {
                                            mdcCheckBox.disabled = true;
                                        }
                                    }

                                    let valOnLoading = vis.states.attr(listItemObj.objectId + '.val');
                                    mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(i, valOnLoading);
                                    setLayout(i, valOnLoading, listItemObj);

                                    vis.states.bind(listItemObj.objectId + '.val', function (e, newVal, oldVal) {
                                        // i wird nicht gespeichert -> umweg über oid gehen
                                        let input = $this.find('input[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                                        input.each(function (d) {
                                            // kann mit mehreren oid verknüpft sein
                                            let index = input.eq(d).attr('itemindex');
                                            listItemObj = getListItemObj(index, data, jsonData);
                                            mdcListAdapter.setCheckedCheckboxOrRadioAtIndex(index, newVal);
                                            setLayout(index, newVal, listItemObj);
                                        });
                                    });

                                } else if (data.listType === 'buttonToggle' || data.listType === 'buttonToggle_readonly') {
                                    let valOnLoading = vis.states.attr(listItemObj.objectId + '.val');
                                    setLayout(i, valOnLoading, listItemObj);

                                    vis.states.bind(listItemObj.objectId + '.val', function (e, newVal, oldVal) {
                                        // i wird nicht gespeichert -> umweg über oid gehen
                                        let input = $this.parent().find('div[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                                        input.each(function (d) {
                                            // kann mit mehreren oid verknüpft sein
                                            let index = parseInt(input.eq(d).attr('id').replace('listItem_', ''));
                                            listItemObj = getListItemObj(index, data, jsonData);
                                            setLayout(index, newVal, listItemObj);
                                        });
                                    });
                                } else {
                                    setLayout(i, false, listItemObj);
                                }
                            } catch (ex) {
                                console.error(`[${widgetName} - ${data.wid}] setItemStyle - item ${i}, error: ${ex.message}, stack: ${ex.stack}`);
                            }
                        }

                        function setLayout(index, val, listItemObj) {
                            console.warn(i);
                            let curListItem = $this.find(`div[id="listItem_${index}"]`);

                            $this.find(`.mdc-list-group__subheader`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemHeaderTextSize, 'inherit', '', 'px'));
                            $this.find(`.mdc-list-item__text`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemTextSize, 'inherit', '', 'px'));
                            $this.find(`.mdc-list-item__primary-text`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemTextSize, 'inherit', '', 'px'));
                            $this.find(`.mdc-list-item__secondary-text`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemSubTextSize, 'inherit', '', 'px'));
                            $this.find(`.mdc-list-item__primary-text.materialdesign-list-item-text-right`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemTextRightSize, 'inherit', '', 'px'));
                            $this.find(`.mdc-list-item__secondary-text.materialdesign-list-item-text-right`).css('font-size', myMdwHelper.getStringFromNumberData(data.listItemSubTextRightSize, 'inherit', '', 'px'));

                            if (val === true) {
                                curListItem.css('background', myMdwHelper.getValueFromData(data.listItemBackgroundActive, ''));
                                myMdwHelper.changeListIconElement(curListItem, listItemObj.imageActive, 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), listItemObj.imageActiveColor, spaceBetweenImageAndLabel);
                            } else {
                                curListItem.css('background', myMdwHelper.getValueFromData(data.listItemBackground, ''));
                                myMdwHelper.changeListIconElement(curListItem, listItemObj.image, 'auto', myMdwHelper.getValueFromData(data.listImageHeight, '', '', 'px !important;'), listItemObj.imageColor, spaceBetweenImageAndLabel);
                            }
                        }
                    }
                }

                function getListItemObj(i, data, jsonData) {
                    if (data.listItemDataMethod === 'inputPerEditor') {
                        // Data from Editor
                        return {
                            text: myMdwHelper.getValueFromData(data.attr('label' + i), `Item ${i}`),
                            subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                            rightText: myMdwHelper.getValueFromData(data.attr('rightLabel' + i), ''),
                            rightSubText: myMdwHelper.getValueFromData(data.attr('rightSubLabel' + i), ''),
                            image: myMdwHelper.getValueFromData(data.attr('listImage' + i), ""),
                            imageColor: myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e"),
                            imageActive: myMdwHelper.getValueFromData(data.attr('listImageActive' + i), myMdwHelper.getValueFromData(data.attr('listImage' + i), "")),
                            imageActiveColor: myMdwHelper.getValueFromData(data.attr('listImageActiveColor' + i), myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e")),
                            header: myMdwHelper.getValueFromData(data.attr('groupHeader' + i), ""),
                            showDivider: data.attr('dividers' + i),
                            objectId: data.attr('oid' + i),
                            buttonStateValue: data.attr('listTypeButtonStateValue' + i),
                            buttonNavView: data.attr('listTypeButtonNav' + i),
                            buttonLink: data.attr('listTypeButtonLink' + i),
                            listOverflow: data.attr('listOverflow' + i),
                        };
                    } else {
                        // Data from json
                        return {
                            text: myMdwHelper.getValueFromData(jsonData[i].text, ''),
                            subText: myMdwHelper.getValueFromData(jsonData[i].subText, ''),
                            rightText: myMdwHelper.getValueFromData(jsonData[i].rightText, ''),
                            rightSubText: myMdwHelper.getValueFromData(jsonData[i].rightSubText, ''),
                            image: myMdwHelper.getValueFromData(jsonData[i].image, ""),
                            imageColor: myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e"),
                            imageActive: myMdwHelper.getValueFromData(jsonData[i].imageActive, myMdwHelper.getValueFromData(jsonData[i].image, "")),
                            imageActiveColor: myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e")),
                            header: myMdwHelper.getValueFromData(jsonData[i].header, ""),
                            showDivider: jsonData[i].showDivider,
                            objectId: jsonData[i].objectId,
                            buttonStateValue: jsonData[i].buttonStateValue,
                            buttonNavView: jsonData[i].buttonNavView,
                            buttonLink: jsonData[i].buttonLink,
                            listOverflow: jsonData[i].listOverflow,
                        };
                    }
                }
            }, 100, data.debug);
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }