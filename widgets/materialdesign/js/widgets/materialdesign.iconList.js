/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.iconlist =
    function (el, data) {
        let widgetName = 'IconList';

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            myMdwHelper.waitForOid(data.json_string_oid, data.wid, widgetName, function () {
                let itemList = [];
                let jsonData = null;
                let oldJsonData = null;
                let changedItems = [];
                let countOfItems = 0;
                let countOfOldItems = 0;
                let containerClass = 'materialdesign-icon-list-container';
                let oidsNeedSubscribe = false;
                let bindingTokenList = [];
                let eventBind = {};

                let iconHeight = myMdwHelper.getNumberFromData(data.iconHeight, 24);

                generateContent();

                if (oidsNeedSubscribe) {
                    myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {

                        appendContent();
                        eventListener();
                        setLayout();
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
                    generateContent(oldVal);

                    if (oidsNeedSubscribe) {
                        myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                            appendContent(true, scrollTop, scrollLeft);
                            eventListener();
                            setLayout();
                        });
                    } else {
                        // json: hat keine objectIds / bindings bzw. bereits subscribed
                        appendContent(true, scrollTop, scrollLeft);
                        eventListener();
                        setLayout();
                    }
                });


                $(document).on("mdwSubscribe", function (e, oids) {
                    if (myMdwHelper.isLayoutRefreshNeeded(widgetName, data, oids, data.debug)) {
                        setLayout(true);
                    }
                });

                vis.states.bind('vis-materialdesign.0.colors.darkTheme.val', function (e, newVal, oldVal) {
                    setLayout(true);
                });

                vis.states.bind('vis-materialdesign.0.lastchange.val', function (e, newVal, oldVal) {
                    setLayout(true);
                });

                setLayout();
                function setLayout(changed = false) {
                    $this.context.style.setProperty("--materialdesign-icon-list-background", myMdwHelper.getValueFromData(data.containerBackgroundColor, ''));

                    $this.context.style.setProperty("--materialdesign-icon-list-items-per-row", myMdwHelper.getNumberFromData(data.maxItemsperRow, 1));

                    $this.context.style.setProperty("--materialdesign-icon-list-items-min-width", myMdwHelper.getNumberFromData(data.iconItemMinWidth, 50) + 'px');
                    $this.context.style.setProperty("--materialdesign-icon-list-items-min-height", myMdwHelper.getNumberFromData(data.iconItemMinHeight, 0) + 'px');
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

                    $this.context.style.setProperty("--materialdesign-color-card-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-title-section-background", myMdwHelper.getValueFromData(data.colorTitleSectionBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-text-section-background", myMdwHelper.getValueFromData(data.colorTextSectionBackground, ''));
                    $this.context.style.setProperty("--materialdesign-color-card-title", myMdwHelper.getValueFromData(data.colorTitle, ''));

                    let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
                    if (titleFontSize && titleFontSize.style) {
                        $this.find('.card-title').css('font-size', myMdwHelper.getStringFromNumberData(data.titleLayout, 'inherit', '', 'px'));
                    }

                    if (changed) {
                        for (var i = 0; i <= countOfItems; i++) {
                            let listItemObj = getListItemObj(i, data, jsonData);
                            let val = vis.states.attr(listItemObj.objectId + '.val');

                            setItemLayout(i, val, listItemObj);

                            // $this.find(`.materialdesign-icon-list-item[id*='icon-list-item${i}']`).css('background', listItemObj.background);
                            // $this.find(`.materialdesign-icon-list-item[id*='icon-list-item${i}'] .materialdesign-icon-image`).css('color', listItemObj.imageColor);
                        }
                    }
                }

                function generateContent(oldVal = undefined) {
                    itemList = [];
                    bindingTokenList = [];
                    oidsNeedSubscribe = false;
                    oldJsonData = null;
                    changedItems = []
                    countOfOldItems = 0;

                    if (data.listItemDataMethod === 'jsonStringObject') {
                        let val = vis.states.attr(data.json_string_oid + '.val');
                        if (val && val !== null && val !== 'null') {
                            try {
                                jsonData = JSON.parse(val);
                                if (oldVal) {
                                    oldJsonData = JSON.parse(oldVal);
                                    countOfOldItems = oldJsonData.length - 1;
                                }
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

                    for (var i = 0; i <= countOfItems; i++) {
                        let listItemObj = getListItemObj(i, data, jsonData);

                        if (oldVal) {
                            let oldListItemObj = getListItemObj(i, data, oldJsonData);

                            if (oldListItemObj === undefined) {
                                // item not exist in old data
                                changedItems.push(0);
                            } else if (!myUnderscore.isEqual(listItemObj, oldListItemObj)) {
                                // item changed compare to old data
                                changedItems.push(1);
                            } else {
                                // item not changed
                                changedItems.push(2);
                            }
                        }

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
                            imageElement = myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon')
                        } else {
                            // Buttons
                            if (data.buttonLayout === 'round') {
                                let buttonHeight = myMdwHelper.getNumberFromData(data.buttonHeight, iconHeight * 1.5);
                                imageElement = `<div style="width: 100%; text-align: center;">
                                                <div class="materialdesign-icon-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: ${buttonHeight}px; height: ${buttonHeight}px;">
                                                    <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon')}
                                                    </div>
                                                </div>
                                            </div>`
                            } else {
                                let buttonHeight = (myMdwHelper.getNumberFromData(data.buttonHeight, 0) > 0) ? data.buttonHeight + 'px' : '100%';
                                imageElement = `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                                <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: ${buttonHeight};">
                                                    <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon')}
                                                    </div>
                                                </div>
                                            </div>`
                            }
                        }

                        let lockElement = '';
                        if (listItemObj.listType !== 'text' && listItemObj.lockEnabled === true) {
                            lockElement = `<span class="mdi mdi-${myMdwHelper.getValueFromData(data.lockIcon, 'lock-outline')} materialdesign-lock-icon" 
                            style="position: absolute; left: ${myMdwHelper.getNumberFromData(data.lockIconLeft, 5)}%; top: ${myMdwHelper.getNumberFromData(data.lockIconTop, 5)}%; ${(myMdwHelper.getNumberFromData(data.lockIconSize, undefined) !== '0') ? `width: ${data.lockIconSize}px; height: ${data.lockIconSize}px; font-size: ${data.lockIconSize}px;` : ''} color: ${myMdwHelper.getValueFromData(data.lockIconColor, '#B22222')};"></span>`;
                        }

                        let element = ''
                        let val = vis.states.attr(listItemObj.objectId + '.val');

                        let usePercentOfRow = myMdwHelper.getNumberFromData(listItemObj.usePercentOfRow, 0);
                        // let cssPercentOfRow = usePercentOfRow > 0 ? `calc(${usePercentOfRow}% - (100% - 100% / var(--materialdesign-icon-list-items-per-row)) / var(--materialdesign-icon-list-items-per-row))` : 0;
                        let cssPercentOfRow = usePercentOfRow > 0 ? `calc(${usePercentOfRow}% - (var(--materialdesign-icon-list-items-gaps) + 6px) - (var(--materialdesign-icon-list-items-per-row) - 1) * var(--materialdesign-icon-list-items-gaps))` : '';


                        if (data.itemLayout === 'vertical') {
                            if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                                element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" visibilityOid="${listItemObj.visibilityOid}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none;' : ''} ${usePercentOfRow > 0 ? `flex-basis: ${cssPercentOfRow};` : ''}" >
                                    <div style="flex: 1; height: 100%; display: flex; flex-direction: column;">    
                                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
                                            <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: 100%; padding: 0; ${listItemObj.statusBarColor || listItemObj.statusBarText ? 'border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;' : ''}">
                                                <div class="materialdesign-button-body" style="display:flex; flex-direction: column; justify-content: center; align-items: center; width: 100%; height: 100%;">                            
                                                
                                                    ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text materialdesign-icon-list-item-text-vertical" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${listItemObj.text}</label>` : ''}
                                                    ${imageElement ? `<div class="materialdesign-icon-list-item-layout-vertical-image-container">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon')}
                                                        ${lockElement}
                                                    </div>` : ''}
                                                    ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value materialdesign-icon-list-item-text-vertical" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                                    ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText materialdesign-icon-list-item-text-vertical" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${listItemObj.subText}</label>` : ''}                                                
                                                </div>
                                            </div>
                                        </div>
                                        ${listItemObj.statusBarColor || listItemObj.statusBarText ? `<div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-vertical-status-line-card' : 'materialdesign-icon-list-item-layout-vertical-status-line'}" style="background: ${listItemObj.statusBarColor};">${listItemObj.statusBarText}</div>` : ''}
                                    </div>
                                </div>`;
                            } else {
                                element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" visibilityOid="${listItemObj.visibilityOid}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''} ${usePercentOfRow > 0 ? `flex-basis: ${cssPercentOfRow};` : ''}" >
                                    ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text materialdesign-icon-list-item-text-vertical">${listItemObj.text}</label>` : ''}
                                    ${imageElement ? `<div class="materialdesign-icon-list-item-layout-vertical-image-container">
                                        ${imageElement}
                                        ${lockElement}
                                    </div>` : ''}
                                    ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value materialdesign-icon-list-item-text-vertical">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                    ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText materialdesign-icon-list-item-text-vertical">${listItemObj.subText}</label>` : ''}
                                    ${listItemObj.statusBarColor || listItemObj.statusBarText ? `<div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-vertical-status-line-card' : 'materialdesign-icon-list-item-layout-vertical-status-line'}" style="background: ${listItemObj.statusBarColor};">${listItemObj.statusBarText}</div>` : ''}
                                </div>`;
                            }
                        } else {
                            if (data.buttonLayout === 'full' && listItemObj.listType !== 'text') {
                                element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" visibilityOid="${listItemObj.visibilityOid}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''} ${usePercentOfRow > 0 ? `flex-basis: ${cssPercentOfRow};` : ''}" >
                                    <div style="flex: 1; height: 100%; display: flex; flex-direction: column;">
                                        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">                                
                                            <div class="materialdesign-button materialdesign-iconList-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: 100%; height: 100%; padding: 0; ${listItemObj.statusBarColor || listItemObj.statusBarText ? 'border-bottom-left-radius: 0px; border-bottom-right-radius: 0px;' : ''}">
                                                <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">                            

                                                    ${imageElement ? `<div class="materialdesign-icon-list-item-layout-horizontal-image-container">
                                                        ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon')}
                                                        ${lockElement}
                                                    </div>` : ''}
                                                    <div class="materialdesign-icon-list-item-layout-horizontal-text-container" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">
                                                        ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${listItemObj.text}</label>` : ''}
                                                        ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${listItemObj.subText}</label>` : ''}
                                                        ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value" style="${listItemObj.readOnly === false ? 'cursor: pointer;' : ''}">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                                    </div>
                                                </div>                                        
                                            </div>                                    
                                        </div>
                                        ${listItemObj.statusBarColor || listItemObj.statusBarText ? `<div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-horizontal-status-line-card' : 'materialdesign-icon-list-item-layout-horizontal-status-line'}" style="background: ${listItemObj.statusBarColor};">${listItemObj.statusBarText}</div>` : ''}
                                    </div>
                                </div>`;
                            } else {
                                element = `
                                <div class="materialdesign-icon-list-item ${listLayout}" id="icon-list-item${i}" data-oid="${listItemObj.objectId}" visibilityOid="${listItemObj.visibilityOid}" isLocked="${listItemObj.lockEnabled}" style="${(listItemObj.background !== '') ? `background: ${listItemObj.background};` : ''} ${(listItemObj.listType !== 'text' && val === 'null') ? 'display: none' : ''} ${usePercentOfRow > 0 ? `flex-basis: ${cssPercentOfRow};` : ''}" >
                                <div style="flex: 1; height: 100%; display: flex; flex-direction: column;">    
                                    <div style="flex: 1; display: flex;">
                                        ${imageElement ? `<div class="materialdesign-icon-list-item-layout-horizontal-image-container">
                                            ${imageElement}
                                            ${lockElement}
                                        </div>` : ''}
                                        <div class="materialdesign-icon-list-item-layout-horizontal-text-container">
                                            ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text">${listItemObj.text}</label>` : ''}
                                            ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText">${listItemObj.subText}</label>` : ''}
                                            ${((listItemObj.showValueLabel === true || listItemObj.showValueLabel === 'true') && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? `<label class="materialdesign-icon-list-item-value">${(val !== 'null') ? `${val}${listItemObj.valueAppendix}` : ''}</label>` : ''}
                                        </div>                                        
                                    </div>
                                    ${listItemObj.statusBarColor || listItemObj.statusBarText ? `<div class="${(data.listLayout.includes('card')) ? 'materialdesign-icon-list-item-layout-horizontal-status-line-card' : 'materialdesign-icon-list-item-layout-horizontal-status-line'}" style="background: ${listItemObj.statusBarColor};">${listItemObj.statusBarText}</div>` : ''}
                                </div>
                                </div>`;
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
                    if (!replace) {
                        let widgetElement = itemList.join("");

                        if (bindingTokenList.length > 0) {
                            for (var b = 0; b <= bindingTokenList.length - 1; b++) {
                                widgetElement = widgetElement.replace(bindingTokenList[b], vis.formatBinding(bindingTokenList[b]))
                            }
                        }

                        if (!myMdwHelper.getBooleanFromData(data.cardUse, false)) {
                            $this.append(`
                            <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="height: auto; flex-wrap: wrap;"' : ''}>
                                ${widgetElement}
                            </div>
                        `);
                        } else {
                            let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
                            let showTitleSection = 'display: none;';
                            if (myMdwHelper.getValueFromData(data.title, null) != null) {
                                showTitleSection = '';
                            }

                            // $this.css('padding', '2px');
                            $this.append(`<div class="materialdesign-html-card mdc-card" style="margin-top: 3px; margin-left: 3px; margin-bottom: 3px; width: calc(100% - 6px); height: calc(100% - 6px);">
                                        <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                                            <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}">${data.title}</div>
                                        </div>
                                        <div class="materialdesign-html-card card-text-section iconlist" style="height: 100%; ${myMdwHelper.getBooleanFromData(data.showScrollbar, true) ? 'overflow-y: auto; overflow-x: hidden;' : ''} margin: ${myMdwHelper.getNumberFromData(data.borderDistance, 0)}px;">
                                            <div class="materialdesign-html-card">
                                                <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="height: auto; flex-wrap: wrap;"' : ''}>
                                                    ${widgetElement}
                                                </div>
                                            </div>
                                        </div>
                                    </div>`);
                        }
                    } else {
                        // $this.find(`.${containerClass}`).replaceWith(`
                        // <div class="${containerClass}" ${(myMdwHelper.getBooleanFromData(data.wrapItems, true)) ? 'style="height: auto; flex-wrap: wrap;"' : ''}>
                        //     ${widgetElement}
                        // </div>`);

                        for (var i = 0; i <= changedItems.length - 1; i++) {
                            let widgetElement = itemList[i];

                            if (bindingTokenList.length > 0) {
                                for (var b = 0; b <= bindingTokenList.length - 1; b++) {
                                    widgetElement = widgetElement.replace(bindingTokenList[b], vis.formatBinding(bindingTokenList[b]))
                                }
                            }

                            if (changedItems[i] === 0) {
                                if (data.debug) console.log(`[appendContent]: list item ${i} added!`);
                                $this.find(`.${containerClass}`).append(widgetElement);
                            } else if (changedItems[i] === 1) {
                                if (data.debug) console.log(`[appendContent]: list item ${i} changed!`);
                                $this.find(`#icon-list-item${i}`).replaceWith(widgetElement);
                            }
                        }

                        if (countOfItems < countOfOldItems) {
                            // count old data items is higher -> remove items
                            for (var i = 0; i <= countOfOldItems - countOfItems; i++) {
                                let index = i + countOfItems + 1;
                                if (data.debug) console.log(`[appendContent]: list item ${index} deleted!`);
                                $this.find(`#icon-list-item${index}`).remove();
                            }
                        }

                        // // Mit Animation -> geht noch nicht
                        // for (var i = 0; i <= changedItems.length - 1; i++) {
                        //     let widgetElement = itemList[i];

                        //     if (bindingTokenList.length > 0) {
                        //         for (var b = 0; b <= bindingTokenList.length - 1; b++) {
                        //             widgetElement = widgetElement.replace(bindingTokenList[b], vis.formatBinding(bindingTokenList[b]))
                        //         }
                        //     }

                        //     if (changedItems[i] === 0) {
                        //         if (data.debug) console.log(`[appendContent]: list item ${i} added!`);
                        //         // $this.find(`.${containerClass}`).append(widgetElement);

                        //         $(widgetElement).hide().appendTo(`.${containerClass}`).fadeIn('slow');

                        //     } else if (changedItems[i] === 1) {
                        //         if (data.debug) console.log(`[appendContent]: list item ${i} changed!`);
                        //         // $this.find(`#icon-list-item${i}`).replaceWith(widgetElement);

                        //         let $target = $this.find(`#icon-list-item${i}`);
                        //         $target.children().fadeOut(100, function () {
                        //             $target.replaceWith(function () {
                        //                 return $(widgetElement).hide().fadeIn(100).css('display', 'flex');
                        //             });
                        //         });
                        //     }
                        // }

                        // if (countOfItems < countOfOldItems) {
                        //     // count old data items is higher -> remove items
                        //     for (var i = 0; i <= countOfOldItems - countOfItems; i++) {
                        //         let index = i + countOfItems + 1;
                        //         if (data.debug) console.log(`[appendContent]: list item ${index} deleted!`);
                        //         // $this.find(`#icon-list-item${index}`).remove();

                        //         $this.find(`#icon-list-item${index}`).fadeOut('fast', function () {
                        //             $(this).remove();
                        //         });
                        //     }
                        // }
                    }

                    $this.scrollTop(scrollTop);
                    $this.scrollLeft(scrollLeft);
                }

                function eventListener() {
                    try {
                        let iconButtons = $this.find('.materialdesign-iconList-button');

                        for (var i = 0; i <= iconButtons.length - 1; i++) {
                            let itemIndex = $(iconButtons[i]).attr('index');
                            let listItemObj = getListItemObj(itemIndex, data, jsonData);

                            // set ripple effect to icon buttons
                            if (listItemObj.readOnly === false) {
                                if (data.buttonLayout === 'round') {
                                    new mdc.iconButton.MDCIconButtonToggle(iconButtons.get(i));
                                } else {
                                    new mdc.ripple.MDCRipple(iconButtons.get(i));
                                }
                            } else {
                                $(iconButtons[i]).css('cursor', 'default');
                            }

                            if (listItemObj.visibilityOid) {
                                vis.states.bind(listItemObj.visibilityOid + '.val', function (e, newVal, oldVal) {
                                    let itemWithVisibilityOid = $this.find('.materialdesign-icon-list-item[visibilityOid="' + listItemObj.visibilityOid + '"]');

                                    itemWithVisibilityOid.each(function (d) {
                                        let $item = $(this);
                                        let itemIndex = $item.attr('id').replace('icon-list-item', '');
                                        setViewVisibilityByCondition(itemIndex, $item);
                                    });
                                });
                            }

                            if (iconButtons && iconButtons.get(i)) {
                                if (listItemObj.readOnly === false) {
                                    iconButtons.get(i).style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.buttonColorPress, ''));

                                    iconButtons.eq(i).on('click', function () {
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

                                                setItemLayout(index, !selectedValue, listItemObj);
                                            } else {
                                                unlockButton($item);
                                            }
                                        } else if (listItemObj.listType === 'buttonState') {
                                            if ($item.attr('isLocked') === 'false' || $item.attr('isLocked') === undefined) {
                                                let valueToSet = listItemObj.buttonStateValue;
                                                myMdwHelper.setValue(listItemObj.objectId, valueToSet);

                                                setItemLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
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

                                                setItemLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
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

                                                setItemLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                                            } else {
                                                unlockButton($item);
                                            }
                                        } else if (listItemObj.listType === 'buttonNav') {
                                            vis.changeView(listItemObj.buttonNavView);
                                        } else if (listItemObj.listType === 'buttonLink') {
                                            window.open(listItemObj.buttonLink);
                                        }
                                    });
                                } else {
                                    iconButtons.get(i).style.setProperty("--materialdesign-color-icon-button-hover", 'transparent');
                                    setItemLayout(itemIndex, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                                }
                            }

                            if (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState') {
                                // on Load & bind to object ids
                                let valId = listItemObj.objectId + '.val'
                                let valOnLoading = vis.states.attr(valId);
                                setItemLayout(itemIndex, valOnLoading, listItemObj);

                                if (!eventBind[valId]) {
                                    // fires event only once per objectId

                                    vis.states.bind(valId, function (e, newVal, oldVal) {
                                        let input = $this.find('div[data-oid="' + listItemObj.objectId + '"]');
                                        input.each(function (d) {
                                            // kann mit mehreren oid verknüpft sein
                                            let index = parseInt(input.eq(d).attr('id').replace('icon-list-item', ''));
                                            listItemObj = getListItemObj(index, data, jsonData);

                                            setItemLayout(index, vis.states.attr(valId), listItemObj);
                                        });
                                    });

                                    // add to eventBind obj to prevent event fires multiples times if objectId is same on multiple objs
                                    eventBind[valId] = true;
                                    if (data.debug) console.log(`[IconList - ${data.wid}] event bind for '${valId}'`);
                                }
                            }
                        }
                    } catch (ex) {
                        console.error(`[${widgetName} - ${data.wid}] eventListener: error: ${ex.message}, stack: ${ex.stack}`);
                    }
                }

                function setItemLayout(index, val, listItemObj) {
                    let $item = $this.find(`#icon-list-item${index}`);

                    $item.css('background', listItemObj.background);

                    $item.find('.materialdesign-icon-list-item-value').text(`${val}${listItemObj.valueAppendix}`);
                    $item.find('.materialdesign-lock-icon').css('color', myMdwHelper.getValueFromData(data.lockIconColor, '#B22222'));

                    let iconButtons = $this.find('.materialdesign-iconList-button');

                    if (iconButtons && iconButtons.get(index)) {
                        if (listItemObj.readOnly === false) {
                            iconButtons.get(index).style.setProperty("--materialdesign-color-icon-button-hover", myMdwHelper.getValueFromData(data.buttonColorPress, ''));
                        } else {
                            iconButtons.get(index).style.setProperty("--materialdesign-color-icon-button-hover", 'transparent');
                        }
                    }

                    if (val !== undefined && val !== 'undefined' && val !== null && val !== 'null' && val !== '') {
                        if (listItemObj.listType === 'buttonState') {
                            // buttonState -> show as active if value is state value
                            if ((val || val === 0) && val.toString() === listItemObj.buttonStateValue.toString()) {
                                val = true;
                            } else {
                                val = false;
                            }
                        } else if (listItemObj.listType === 'buttonToggleValueTrue') {
                            if ((val || val === 0) && val.toString() === listItemObj.buttonToggleValueTrue.toString()) {
                                val = true;
                            } else {
                                val = false;
                            }
                        } else if (listItemObj.listType === 'buttonToggleValueFalse') {
                            if ((val || val === 0) && val.toString() === listItemObj.buttonToggleValueFalse.toString()) {
                                val = false;
                            } else {
                                val = true;
                            }
                        }
                    }

                    if (val === true || val === 'true') {
                        $item.find('.materialdesign-iconList-button').css('background', listItemObj.buttonBackgroundActiveColor);
                        myMdwHelper.changeIconElement($item, listItemObj.imageActive, 'auto', iconHeight + 'px', listItemObj.imageActiveColor, '', 'iconlist-icon');
                    } else {
                        $item.find('.materialdesign-iconList-button').css('background', listItemObj.buttonBackgroundColor);
                        myMdwHelper.changeIconElement($item, listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor, '', 'iconlist-icon');
                    }

                    if ($item.attr('isLocked') === 'true') {
                        if (myMdwHelper.getBooleanFromData(data.lockApplyOnlyOnImage, false) === true) {
                            $item.find('.materialdesign-iconList-button').css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                        } else {
                            $item.css('filter', `grayscale(${myMdwHelper.getNumberFromData(data.lockFilterGrayscale, 0)}%)`);
                        }
                    }

                    setViewVisibilityByCondition(index, $item);
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

                function setViewVisibilityByCondition(itemIndex, $item) {
                    let itemObj = getListItemObj(itemIndex, data, jsonData);

                    let visibility = myMdwHelper.getVisibility(vis.states.attr(itemObj.visibilityOid + '.val'), itemObj.visibilityOid, itemObj.visibilityCondition, itemObj.visibilityConditionValue);

                    if (data.debug) console.log(`[setViewVisibilityByCondition]: change item '${itemIndex}' visibility to ${!visibility}`);

                    if (visibility) {
                        $item.hide();
                    } else {
                        $item.show();
                        $item.css('display', 'flex');
                    }
                }

                function getListItemObj(i, data, jsonData) {
                    if (data.listItemDataMethod === 'inputPerEditor') {
                        // Data from Editor
                        return {
                            listType: myMdwHelper.getValueFromData(data.attr('listType' + i), 'text'),
                            objectId: data.attr('oid' + i),
                            usePercentOfRow: data.attr('usePercentOfRow' + i),
                            buttonStateValue: data.attr('listTypeButtonStateValue' + i),
                            buttonNavView: data.attr('listTypeButtonNav' + i),
                            buttonLink: data.attr('listTypeButtonLink' + i),
                            buttonToggleValueTrue: data.attr('typeButtonToggleValueTrue' + i),
                            buttonToggleValueFalse: data.attr('typeButtonToggleValueFalse' + i),
                            readOnly: myMdwHelper.getBooleanFromData(data.attr('readOnly' + i), false),
                            showValueLabel: myMdwHelper.getBooleanFromData(data.attr('showValueLabel' + i), true),
                            valueAppendix: myMdwHelper.getValueFromData(data.attr('valueAppendix' + i), ""),
                            background: myMdwHelper.getValueFromData(data.attr('itemBackgroundColor' + i), myMdwHelper.getValueFromData(data.itemBackgroundColor, '')),
                            text: myMdwHelper.getValueFromData(data.attr('label' + i), ''),
                            subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                            image: myMdwHelper.getValueFromData(data.attr('listImage' + i), ""),
                            imageColor: myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e"),
                            imageActive: myMdwHelper.getValueFromData(data.attr('listImageActive' + i), myMdwHelper.getValueFromData(data.attr('listImage' + i), "")),
                            imageActiveColor: myMdwHelper.getValueFromData(data.attr('listImageActiveColor' + i), myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e")),
                            buttonBackgroundColor: myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), ''),
                            buttonBackgroundActiveColor: myMdwHelper.getValueFromData(data.attr('buttonBgColorActive' + i), myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), '')),
                            statusBarColor: myMdwHelper.getValueFromData(data.attr('statusBarColor' + i), undefined),
                            statusBarText: myMdwHelper.getValueFromData(data.attr('statusBarText' + i), ''),
                            lockEnabled: myMdwHelper.getBooleanFromData(data.attr('lockEnabled' + i), false),
                            visibilityOid: myMdwHelper.getValueFromData(data.attr('visibilityOid' + i), ''),
                            visibilityCondition: myMdwHelper.getValueFromData(data.attr('visibilityCondition' + i), ''),
                            visibilityConditionValue: myMdwHelper.getValueFromData(data.attr('visibilityConditionValue' + i), ''),
                        };
                    } else {
                        // Data from json
                        if (jsonData[i]) {
                            return {
                                listType: myMdwHelper.getValueFromData(jsonData[i].listType, 'text'),
                                objectId: jsonData[i].objectId,
                                usePercentOfRow: jsonData[i].usePercentOfRow,
                                buttonStateValue: jsonData[i].buttonStateValue,
                                buttonNavView: jsonData[i].buttonNavView,
                                buttonLink: jsonData[i].buttonLink,
                                buttonToggleValueTrue: jsonData[i].buttonToggleValueTrue,
                                buttonToggleValueFalse: jsonData[i].buttonToggleValueFalse,
                                readOnly: myMdwHelper.getBooleanFromData(jsonData[i].readOnly, false),
                                showValueLabel: myMdwHelper.getBooleanFromData(jsonData[i].showValueLabel, true),
                                valueAppendix: myMdwHelper.getValueFromData(jsonData[i].valueAppendix, ""),
                                background: myMdwHelper.getValueFromData(jsonData[i].background, myMdwHelper.getValueFromData(data.itemBackgroundColor, '')),
                                text: myMdwHelper.getValueFromData(jsonData[i].text, ''),
                                subText: myMdwHelper.getValueFromData(jsonData[i].subText, ''),
                                image: myMdwHelper.getValueFromData(jsonData[i].image, ""),
                                imageColor: myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e"),
                                imageActive: myMdwHelper.getValueFromData(jsonData[i].imageActive, myMdwHelper.getValueFromData(jsonData[i].image, "")),
                                imageActiveColor: myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e")),
                                buttonBackgroundColor: myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundColor, ''),
                                buttonBackgroundActiveColor: myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundActiveColor, myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundColor, '')),
                                statusBarColor: myMdwHelper.getValueFromData(jsonData[i].statusBarColor, undefined),
                                statusBarText: myMdwHelper.getValueFromData(jsonData[i].statusBarText, ''),
                                lockEnabled: myMdwHelper.getBooleanFromData(jsonData[i].lockEnabled, false),
                                visibilityOid: myMdwHelper.getValueFromData(jsonData[i].visibilityOid, ''),
                                visibilityCondition: myMdwHelper.getValueFromData(jsonData[i].visibilityCondition, ''),
                                visibilityConditionValue: myMdwHelper.getValueFromData(jsonData[i].visibilityConditionValue, ''),
                            };
                        } else {
                            return undefined
                        }
                    }
                }
            }, 100, data.debug);
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }