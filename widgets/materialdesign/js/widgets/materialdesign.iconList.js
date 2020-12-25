/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.iconlist =
    function (el, data) {
        try {
            let $this = $(el);
            let widgetName = 'IconList';

            let itemList = [];
            let jsonData = null;
            let countOfItems = 0;
            let containerClass = 'materialdesign-icon-list-container';
            let oidsNeedSubscribe = false;
            let bindingTokenList = [];
            let eventBind = {};

            $this.context.style.setProperty("--materialdesign-icon-list-background", myMdwHelper.getValueFromData(data.containerBackgroundColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-items-per-row", myMdwHelper.getNumberFromData(data.maxItemsperRow, 1));

            $this.context.style.setProperty("--materialdesign-icon-list-items-min-width", myMdwHelper.getNumberFromData(data.iconItemMinWidth, 50) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-gaps", myMdwHelper.getNumberFromData(data.itemGaps, 4) + 'px');



            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-size", myMdwHelper.getNumberFromData(data.labelFontSize, 14) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-family", myMdwHelper.getValueFromData(data.labelFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-color", myMdwHelper.getValueFromData(data.labelFontColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-size", myMdwHelper.getNumberFromData(data.subLabelFontSize, 12) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-family", myMdwHelper.getValueFromData(data.subLabelFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-color", myMdwHelper.getValueFromData(data.subLabelFontColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-size", myMdwHelper.getNumberFromData(data.valueFontSize, 12) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-family", myMdwHelper.getValueFromData(data.valueFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-color", myMdwHelper.getValueFromData(data.valueFontColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-item-layout-horizontal-image-container-width", myMdwHelper.getStringFromNumberData(data.horizontalIconContainerWidth, 'auto', '', 'px'));
            $this.context.style.setProperty("--materialdesign-icon-list-item-layout-vertical-image-container-height", myMdwHelper.getStringFromNumberData(data.verticalIconContainerHeight, 'auto', '', 'px'));

            $this.context.style.setProperty("--materialdesign-font-card-title", myMdwHelper.getValueFromData(data.titleFontFamily, ''));


            let iconHeight = myMdwHelper.getNumberFromData(data.iconHeight, 24);

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
                bindingTokenList = [];
                oidsNeedSubscribe = false;

                if (data.listItemDataMethod === 'jsonStringObject') {
                    if (vis.states.attr(data.json_string_oid + '.val') && vis.states.attr(data.json_string_oid + '.val') !== 'null') {
                        try {
                            jsonData = JSON.parse(vis.states.attr(data.json_string_oid + '.val'));
                            countOfItems = jsonData.length - 1;
                        } catch (err) {
                            jsonData = [
                                {
                                    text: `<font color=\"red\"><b>${_("Error in JSON string")}</b></font>`,
                                    subText: `<label style="word-wrap: break-word; white-space: normal;">${err.message}</label>`
                                }
                            ];
                            countOfItems = jsonData.length - 1;
                            console.error(`[IconList - ${data.wid}] cannot parse json string! Error: ${err.message}`);
                        }
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

                for (var i = 0; i <= countOfItems; i++) {
                    let listItemObj = getListItemObj(i, data, jsonData);

                    let listLayout = 'materialdesign-icon-list-item-standard';
                    if (data.listLayout === 'card') {
                        if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                            listLayout = 'materialdesign-icon-list-item-card-layout-full';
                        } else {
                            listLayout = 'materialdesign-icon-list-item-card';
                        }
                    } else if (data.listLayout === 'cardOutlined') {
                        if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                            listLayout = 'materialdesign-icon-list-item-card-layout-full materialdesign-icon-list-item-card--outlined';
                        } else {
                            listLayout = 'materialdesign-icon-list-item-card materialdesign-icon-list-item-card--outlined';
                        }
                    }

                    let imageElement = '';
                    if (listItemObj.listType === 'text') {
                        imageElement = myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)
                    } else {
                        // Buttons
                        if (data.buttonLayout === 'round') {
                            let buttonHeight = myMdwHelper.getNumberFromData(data.buttonHeight, iconHeight * 1.5);
                            imageElement = `<div style="width: 100%; text-align: center;">
                                                <div class="materialdesign-icon-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: ${buttonHeight}px; height: ${buttonHeight}px;">
                                                    <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                                    </div>
                                                </div>
                                            </div>`
                        } else {
                            let buttonHeight = (myMdwHelper.getNumberFromData(data.buttonHeight, 0) > 0) ? data.buttonHeight + 'px' : '100%';
                            imageElement = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                                <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: ${buttonHeight};">
                                                    <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                                    </div>
                                                </div>
                                            </div>`
                        }
                    }

                    let lockElement = '';
                    if (listItemObj.listType !== 'text' && listItemObj.lockEnabled === true) {
                        lockElement = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} ${(myMdwHelper.getValueFromData(data.lockIconColor, null) !== null) ? `color: ${data.lockIconColor};` : ''}"></span>`;
                    }

                    let element = ''
                    let val = vis.states.attr(listItemObj.objectId + '.val');
                    if (data.itemLayout === 'vertical') {
                        if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                            element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''}" >
                                    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                        <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: 100%; padding: 4px;">
                                            <div class="materialdesign-button-body" style="display:flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%;">                            
                                            
                                                ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text materialdesign-icon-list-item-text-vertical" style="cursor: pointer;">${listItemObj.text}</label>` : ''}
                                                <div class="materialdesign-icon-list-item-layout-vertical-image-container">
                                                    ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                                    ${lockElement}
                                                </div>
                                                ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value materialdesign-icon-list-item-text-vertical" style="cursor: pointer;">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                                ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText materialdesign-icon-list-item-text-vertical" style="cursor: pointer;">${listItemObj.subText}</label>` : ''}
                                                <div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-vertical-status-line-card' : 'materialdesign-icon-list-item-layout-vertical-status-line'}" style="background: ${listItemObj.statusBarColor};"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>                                
                            `;
                        } else {
                            element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''}" >
                                    ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text materialdesign-icon-list-item-text-vertical">${listItemObj.text}</label>` : ''}
                                    <div class="materialdesign-icon-list-item-layout-vertical-image-container">
                                        ${imageElement}
                                        ${lockElement}
                                    </div>
                                    ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value materialdesign-icon-list-item-text-vertical">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                    ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText materialdesign-icon-list-item-text-vertical">${listItemObj.subText}</label>` : ''}
                                    <div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-vertical-status-line-card' : 'materialdesign-icon-list-item-layout-vertical-status-line'}" style="background: ${listItemObj.statusBarColor};"></div>
                                </div>
                            `;
                        }

                    } else {
                        if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                            element = `
                            <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''}" >
                                <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                    <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: 100%; padding: 4px;">
                                        <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">                            

                                            <div class="materialdesign-icon-list-item-layout-horizontal-image-container">
                                                ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                                ${lockElement}
                                            </div>
                                            <div class="materialdesign-icon-list-item-layout-horizontal-text-container" style="cursor: pointer;">
                                                ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text" style="cursor: pointer;">${listItemObj.text}</label>` : ''}
                                                ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText" style="cursor: pointer;">${listItemObj.subText}</label>` : ''}
                                                ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value" style="cursor: pointer;">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                            </div>
                                        </div>
                                        <div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-horizontal-status-line-card' : 'materialdesign-icon-list-item-layout-horizontal-status-line'}" style="background: ${listItemObj.statusBarColor};"></div>
                                    </div>
                                </div>
                            </div>
                            `;
                        } else {
                            element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''}" >
                                    <div class="materialdesign-icon-list-item-layout-horizontal-image-container">
                                        ${imageElement}
                                        ${lockElement}
                                    </div>
                                    <div class="materialdesign-icon-list-item-layout-horizontal-text-container">
                                        ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text">${listItemObj.text}</label>` : ''}
                                        ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText">${listItemObj.subText}</label>` : ''}
                                        ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                    </div>
                                    <div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-horizontal-status-line-card' : 'materialdesign-icon-list-item-layout-horizontal-status-line'}" style="background: ${listItemObj.statusBarColor};"></div>
                                </div>
                            `;
                        }
                    }

                    // Check if Oid is subscribed and put to vis subscribing object
                    oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(listItemObj.objectId, data.wid, widgetName, oidsNeedSubscribe);

                    // Check if Bindings is subscribed and put to vis subcribing and bindings object 
                    let bindingResult = myMdwHelper.bindingNeedSubscribe(element, data.wid, widgetName, oidsNeedSubscribe);
                    oidsNeedSubscribe = bindingResult.oidNeedSubscribe;
                    bindingTokenList = bindingTokenList.concat(bindingResult.bindingTokenList);

                    itemList.push(element);
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
                    if (!myMdwHelper.getBooleanFromData(data.cardUse, false)) {
                        $this.append(`
                            <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="flex-wrap: wrap;"' : ''}>
                                ${widgetElement}
                            </div>
                        `);
                    } else {
                        let colorBackground = myMdwHelper.getValueFromData(data.colorBackground, '');
                        $this.context.style.setProperty("--materialdesign-color-card-background", colorBackground);
                        $this.context.style.setProperty("--materialdesign-color-card-title-section-background", myMdwHelper.getValueFromData(data.colorTitleSectionBackground, ''));
                        $this.context.style.setProperty("--materialdesign-color-card-text-section-background", myMdwHelper.getValueFromData(data.colorTextSectionBackground, ''));
                        $this.context.style.setProperty("--materialdesign-color-card-title", myMdwHelper.getValueFromData(data.colorTitle, ''));

                        let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
                        let showTitleSection = 'display: none;';
                        if (myMdwHelper.getValueFromData(data.title, null) != null) {
                            showTitleSection = '';
                        }


                        // $this.css('padding', '2px');
                        $this.append(`<div class="materialdesign-html-card mdc-card" style="margin-top: 2px; margin-left: 2px; width: calc(100% - 4px); height: calc(100% - 10px);">
                                        <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                                            <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}">${data.title}</div>
                                        </div>
                                        <div class="materialdesign-html-card card-text-section iconlist" style="height: 100%; ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'overflow-y: auto; overflow-x: hidden;' : ''} padding: ${myMdwHelper.getNumberFromData(data.borderDistance, 0)}px;">
                                            <div class="materialdesign-html-card">
                                                <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="flex-wrap: wrap;"' : ''}>
                                                    ${widgetElement}
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                    }
                } else {
                    $this.find(`.${containerClass}`).replaceWith(`
                        <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="flex-wrap: wrap;"' : ''}>
                            ${widgetElement}
                        </div>              
                    `);
                }

                $this.scrollTop(scrollTop);
                $this.scrollLeft(scrollLeft);
            }

            function eventListener() {
                let iconButtons = $this.find('.materialdesign-iconList-button');

                for (var i = 0; i <= iconButtons.length - 1; i++) {
                    let listItemObj = getListItemObj(i, data, jsonData);

                    // set ripple effect to icon buttons
                    if (data.buttonLayout === 'round') {
                        new mdc.iconButton.MDCIconButtonToggle(iconButtons.get(i));
                    } else {
                        new mdc.ripple.MDCRipple(iconButtons.get(i));
                    }
                    iconButtons.get(i).style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.buttonColorPress, ''));

                    iconButtons.eq(i).click(function () {
                        // icon button click event
                        let index = $(this).attr('index');
                        let $item = $this.find(`#icon-list-item${index}`);

                        listItemObj = getListItemObj(index, data, jsonData);

                        if (listItemObj.listType !== 'text') {
                            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                        }

                        if (listItemObj.listType === 'buttonToggle') {
                            if ($item.attr('isLocked') === 'false' || $item.attr('isLocked') === undefined) {
                                let selectedValue = vis.states.attr(listItemObj.objectId + '.val');

                                myMdwHelper.setValue(listItemObj.objectId, !selectedValue);

                                setLayout(index, !selectedValue, listItemObj);
                            } else {
                                unlockButton($item);
                            }
                        } else if (listItemObj.listType === 'buttonState') {
                            if ($item.attr('isLocked') === 'false' || $item.attr('isLocked') === undefined) {
                                let valueToSet = listItemObj.buttonStateValue;
                                myMdwHelper.setValue(listItemObj.objectId, valueToSet);

                                setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                            } else {
                                unlockButton($item);
                            }
                        } else if (listItemObj.listType === 'buttonToggleValueTrue') {
                            if ($item.attr('isLocked') === 'false' || $item.attr('isLocked') === undefined) {
                                let val = vis.states.attr(listItemObj.objectId + '.val');

                                if (val === listItemObj.buttonToggleValueTrue || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueTrue)) {
                                    myMdwHelper.setValue(listItemObj.objectId, listItemObj.buttonToggleValueFalse);
                                } else {
                                    myMdwHelper.setValue(listItemObj.objectId, listItemObj.buttonToggleValueTrue);
                                }

                                setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                            } else {
                                unlockButton($item);
                            }
                        } else if (listItemObj.listType === 'buttonToggleValueFalse') {
                            if ($item.attr('isLocked') === 'false' || $item.attr('isLocked') === undefined) {
                                let val = vis.states.attr(listItemObj.objectId + '.val');

                                if (val === listItemObj.buttonToggleValueFalse || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueFalse)) {
                                    myMdwHelper.setValue(listItemObj.objectId, listItemObj.buttonToggleValueTrue);
                                } else {
                                    myMdwHelper.setValue(listItemObj.objectId, listItemObj.buttonToggleValueFalse);
                                }

                                setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                            } else {
                                unlockButton($item);
                            }
                        } else if (listItemObj.listType === 'buttonNav') {
                            vis.changeView(listItemObj.buttonNavView);
                        } else if (listItemObj.listType === 'buttonLink') {
                            window.open(listItemObj.buttonLink);
                        }
                    });

                    if (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState') {
                        // on Load & bind to object ids
                        let valId = listItemObj.objectId + '.val'
                        let valOnLoading = vis.states.attr(valId);
                        setLayout(i, valOnLoading, listItemObj);

                        if (!eventBind[valId]) {
                            // fires event only once per objectId

                            vis.states.bind(valId, function (e, newVal, oldVal) {
                                let input = $this.find('div[data-oid="' + listItemObj.objectId + '"]');
                                input.each(function (d) {
                                    // kann mit mehreren oid verknüpft sein
                                    let index = parseInt(input.eq(d).attr('id').replace('icon-list-item', ''));
                                    listItemObj = getListItemObj(index, data, jsonData);

                                    setLayout(index, vis.states.attr(valId), listItemObj);
                                });
                            });

                            // add to eventBind obj to prevent event fires multiples times if objectId is same on multiple objs
                            eventBind[valId] = true;
                            console.log(`[IconList - ${data.wid}] event bind for '${valId}'`);
                        }
                    }
                }

                // console.log(vis.states.__bindEvents)
            }

            function setLayout(index, val, listItemObj) {
                let $item = $this.find(`#icon-list-item${index}`);

                $item.find('.materialdesign-icon-list-item-value').text(`${val}${listItemObj.valueAppendix}`);

                if (listItemObj.listType === 'buttonState') {
                    // buttonState -> show as active if value is state value

                    if (val === listItemObj.buttonStateValue || parseFloat(val) === parseFloat(listItemObj.buttonStateValue)) {
                        val = true;
                    } else {
                        val = false;
                    }
                } else if (listItemObj.listType === 'buttonToggleValueTrue') {
                    if (val === listItemObj.buttonToggleValueTrue || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueTrue)) {
                        val = true;
                    } else {
                        val = false;
                    }
                } else if (listItemObj.listType === 'buttonToggleValueFalse') {
                    if (val === listItemObj.buttonToggleValueFalse || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueFalse)) {
                        val = false;
                    } else {
                        val = true;
                    }
                }

                if (val === true || val === 'true') {
                    $item.find('.materialdesign-iconList-button').css('background', listItemObj.buttonBackgroundActiveColor);
                    myMdwHelper.changeIconElement($item, listItemObj.imageActive, 'auto', iconHeight + 'px', listItemObj.imageActiveColor);
                } else {
                    $item.find('.materialdesign-iconList-button').css('background', listItemObj.buttonBackgroundColor);
                    myMdwHelper.changeIconElement($item, listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor);
                }

                if ($item.attr('isLocked') === 'true') {
                    if (myMdwHelper.getBooleanFromData(data.lockApplyOnlyOnImage, false) === true) {
                        $item.find('.materialdesign-iconList-button').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    } else {
                        $item.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    }
                }

                $item.show();
                $item.css('display', 'flex');
            }

            function unlockButton($item) {
                $item.find('.materialdesign-lock-icon').fadeOut();
                $item.attr('isLocked', false);
                $item.css('filter', 'grayscale(0%)');

                if (myMdwHelper.getBooleanFromData(data.lockApplyOnlyOnImage, false) === true) {
                    $item.find('.materialdesign-iconList-button').css('filter', 'grayscale(0%)');
                } else {
                    $item.css('filter', 'grayscale(0%)');
                }

                setTimeout(function () {
                    $item.attr('isLocked', true);
                    $item.find('.materialdesign-lock-icon').show();

                    if (myMdwHelper.getBooleanFromData(data.lockApplyOnlyOnImage, false) === true) {
                        $item.find('.materialdesign-iconList-button').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    } else {
                        $item.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                    }

                }, myMdwHelper.getNumberFromData(data.autoLockAfter, 10) * 1000);
            }

            function getListItemObj(i, data, jsonData) {
                if (data.listItemDataMethod === 'inputPerEditor') {
                    // Data from Editor
                    return {
                        background: myMdwHelper.getValueFromData(data.attr('itemBackgroundColor' + i), myMdwHelper.getValueFromData(data.itemBackgroundColor, '')),
                        text: myMdwHelper.getValueFromData(data.attr('label' + i), ''),
                        subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                        image: myMdwHelper.getValueFromData(data.attr('listImage' + i), ""),
                        imageColor: myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e"),
                        imageActive: myMdwHelper.getValueFromData(data.attr('listImageActive' + i), myMdwHelper.getValueFromData(data.attr('listImage' + i), "")),
                        imageActiveColor: myMdwHelper.getValueFromData(data.attr('listImageActiveColor' + i), myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e")),
                        buttonBackgroundColor: myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), ''),
                        buttonBackgroundActiveColor: myMdwHelper.getValueFromData(data.attr('buttonBgColorActive' + i), myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), '')),
                        listType: myMdwHelper.getValueFromData(data.attr('listType' + i), 'text'),
                        objectId: data.attr('oid' + i),
                        buttonStateValue: data.attr('listTypeButtonStateValue' + i),
                        buttonNavView: data.attr('listTypeButtonNav' + i),
                        buttonLink: data.attr('listTypeButtonLink' + i),
                        buttonToggleValueTrue: data.attr('typeButtonToggleValueTrue' + i),
                        buttonToggleValueFalse: data.attr('typeButtonToggleValueFalse' + i),
                        valueAppendix: myMdwHelper.getValueFromData(data.attr('valueAppendix' + i), ""),
                        showValueLabel: myMdwHelper.getBooleanFromData(data.attr('showValueLabel' + i), true),
                        statusBarColor: myMdwHelper.getValueFromData(data.attr('statusBarColor' + i), 'transparent'),
                        lockEnabled: myMdwHelper.getBooleanFromData(data.attr('lockEnabled' + i), false)
                    };
                } else {
                    // Data from json
                    return {
                        background: myMdwHelper.getValueFromData(jsonData[i].background, myMdwHelper.getValueFromData(data.itemBackgroundColor, '')),
                        text: myMdwHelper.getValueFromData(jsonData[i].text, ''),
                        subText: myMdwHelper.getValueFromData(jsonData[i].subText, ''),
                        image: myMdwHelper.getValueFromData(jsonData[i].image, ""),
                        imageColor: myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e"),
                        imageActive: myMdwHelper.getValueFromData(jsonData[i].imageActive, myMdwHelper.getValueFromData(jsonData[i].image, "")),
                        imageActiveColor: myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e")),
                        buttonBackgroundColor: myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundColor, ''),
                        buttonBackgroundActiveColor: myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundActiveColor, myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundColor, '')),
                        listType: myMdwHelper.getValueFromData(jsonData[i].listType, 'text'),
                        objectId: jsonData[i].objectId,
                        buttonStateValue: jsonData[i].buttonStateValue,
                        buttonNavView: jsonData[i].buttonNavView,
                        buttonLink: jsonData[i].buttonLink,
                        buttonToggleValueTrue: jsonData[i].buttonToggleValueTrue,
                        buttonToggleValueFalse: jsonData[i].buttonToggleValueFalse,
                        valueAppendix: myMdwHelper.getValueFromData(jsonData[i].valueAppendix, ""),
                        showValueLabel: myMdwHelper.getBooleanFromData(jsonData[i].showValueLabel, true),
                        statusBarColor: myMdwHelper.getValueFromData(jsonData[i].statusBarColor, 'transparent'),
                        lockEnabled: myMdwHelper.getBooleanFromData(jsonData[i].lockEnabled, false)
                    };
                }
            }

        } catch (ex) {
            console.error(`[IconList - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }