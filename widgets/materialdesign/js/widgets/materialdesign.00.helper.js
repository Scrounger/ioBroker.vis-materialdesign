/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.helper = {
    vibrate: function (duration) {
        try {
            if ("vibrate" in navigator) {
                window.navigator.vibrate(duration);
            }
        } catch (ex) {
            console.error(`vibrate [${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    waitForOid: function (oid, wid, widgetName, callBack, counter = 0, debug = false) {
        if (oid === undefined || oid === null) {
            if (debug) console.warn(`[${widgetName} ${wid}] [waitForOid] oid is '${oid}'`);
            callBack();
            return;
        }

        if (counter < 500) {
            setTimeout(function () {
                let val = vis.states.attr(oid + '.val');
                if (val !== undefined && val !== 'undefined' && val !== null && val !== 'null') {
                    callBack(val);
                } else {
                    if (debug) console.warn(`[${widgetName} ${wid}] [waitForOid] wait for value of oid '${oid}'`);
                    counter++
                    vis.binds.materialdesign.helper.waitForOid(oid, wid, widgetName, callBack, counter, debug);
                }
            }, 1)
        } else {
            console.warn(`[${widgetName} ${wid}] [waitForOid] stop waiting for value of oid '${oid}' after ${counter} retries`);
            callBack();
        }
    },
    waitForVisConnected: function (callBack, counter = 0, debug = false) {
        if (counter < 500) {
            setTimeout(function () {
                if (vis.conn && vis.conn.getIsConnected()) {
                    callBack();
                } else {
                    if (debug) console.log(`[waitForVisConnected] wait for vis connection`);
                    counter++
                    vis.binds.materialdesign.helper.waitForVisConnected(callBack, counter, debug);
                }
            }, 1)
        } else {
            console.warn(`[waitForVisConnected] stop waiting for vis connection after ${counter} retries`);
            callBack();
        }
    },
    waitForViews: function (callBack, counter = 0, debug = false) {
        if (counter < 500) {

            setTimeout(function () {
                if (vis.views && vis.views !== null && Object.keys(vis.views).length > 0) {
                    callBack();
                } else {
                    if (debug) console.log(`[waitForViews] wait for views`);
                    counter++
                    vis.binds.materialdesign.helper.waitForViews(callBack, counter, debug);
                }
            }, 1)
        } else {
            console.warn(`[waitForViews] stop waiting for vis views after ${counter} retries`);
            callBack();
        }
    },
    waitForWidgets: function (callBack, counter = 0, debug = false) {
        if (counter < 500) {

            setTimeout(function () {
                if (vis.widgets && vis.widgets !== null && Object.keys(vis.widgets).length > 0) {
                    callBack();
                } else {
                    if (debug) console.log(`[waitForWidgets] wait for widgets`);
                    counter++
                    vis.binds.materialdesign.helper.waitForWidgets(callBack, counter, debug);
                }
            }, 1)
        } else {
            console.warn(`[waitForWidgets] stop waiting for vis widgets after ${counter} retries`);
            callBack();
        }
    },
    waitForElement: function (parent, elementPath, wid, widgetName, callBack, counter = 0, debug = false) {
        if (counter < 100) {

            setTimeout(function () {
                if (parent.find(elementPath).length) {
                    callBack();
                } else {
                    if (debug) console.log(`[${widgetName} ${wid}] wait for elements`);
                    counter++
                    vis.binds.materialdesign.helper.waitForElement(parent, elementPath, wid, widgetName, callBack, counter, debug);
                }
            }, 50)
        } else {
            console.warn(`[${widgetName} ${wid}] stop waiting after ${counter} retries`);
            callBack();
        }
    },
    waitForRealWidth: function (element, wid, widgetName, callBack, counter = 0, debug = false) {
        if (counter < 100) {
            setTimeout(function () {
                let width = window.getComputedStyle(element, null).width

                if (width.includes('px')) {
                    callBack();
                } else {
                    if (debug) console.log(`[${widgetName} ${wid}] wait for real width`);
                    counter++
                    vis.binds.materialdesign.helper.waitForRealWidth(element, wid, widgetName, callBack, counter, debug);
                }
            }, 50);
        } else {
            if (debug) console.log(`[${widgetName} ${wid}] stop waiting for real width after 100 retries`);
            callBack();
        }
    },
    waitForRealHeight: function (element, wid, widgetName, callBack, counter = 0, debug = false) {
        if (counter < 100) {
            setTimeout(function () {
                let height = window.getComputedStyle(element, null).height

                if (height.includes('px')) {
                    callBack();
                } else {
                    if (debug) console.log(`[${widgetName} ${wid}] wait for real height`);
                    counter++
                    vis.binds.materialdesign.helper.waitForRealHeight(element, wid, widgetName, callBack, counter, debug);
                }
            }, 50);
        } else {
            if (debug) console.log(`[${widgetName} ${wid}] stop waiting for real height after 100 retries`);
            callBack();
        }
    },
    installedVersion: function (el, data) {
        myMdwHelper.waitForVisConnected(function () {
            myMdwHelper.getVersion(function (version) {
                $(el).find('#versionNumber').text(version);
            });
        });
    },
    getValueFromData: function (dataValue, nullValue, prepand = '', append = '') {
        try {
            if (Array.isArray(dataValue)) {
                if (dataValue.length > 0) {
                    return dataValue;
                } else {
                    return nullValue;
                }
            } else {
                if (dataValue === undefined || dataValue === 'undefined' || dataValue === null || dataValue === 'null' || dataValue === '') {
                    return nullValue;
                } else {
                    if (vis.editMode && isNaN(dataValue)) {
                        let binding = vis.extractBinding(dataValue, true);
                        if (binding && binding.length >= 1) {
                            let bindingVal = vis.formatBinding(dataValue, undefined, undefined, undefined, true);

                            if (bindingVal === undefined || bindingVal === 'undefined' || bindingVal === null || bindingVal === 'null' || bindingVal === '') {
                                return nullValue;
                            } else {
                                return bindingVal;
                            }
                        }
                    }

                    if (dataValue.toString().startsWith('#mdwTheme:')) {
                        let darkTheme = vis.states.attr('vis-materialdesign.0.colors.darkTheme.val') || false;
                        let id = dataValue.replace('#mdwTheme:', '');

                        if (id.includes('vis-materialdesign.0.colors.')) {
                            if (!darkTheme) {
                                let val = vis.states.attr(id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.light.') + '.val');
                                if (val && val !== null && val !== 'null') {
                                    return prepand + val + append;
                                } else {
                                    return nullValue;
                                }
                            } else {
                                let val = vis.states.attr(id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.dark.') + '.val');
                                if (val && val !== null && val !== 'null') {
                                    return prepand + val + append;
                                } else {
                                    return nullValue;
                                }
                            }
                        } else {
                            return prepand + vis.states.attr(id + '.val') + append;
                        }
                    } else {
                        return prepand + dataValue + append;
                    }
                }
            }
        } catch (err) {
            console.error(`[Helper] getValueFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`);
            return `[Helper] getValueFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`;
        }
    },
    getBooleanFromData: function (dataValue, nullValue) {
        try {
            if (dataValue === undefined || dataValue === null || dataValue === '') {
                return nullValue
            } else if (dataValue === true || dataValue === 'true' || dataValue === 1 || dataValue === '1') {
                return true;
            } else {
                return false;
            }

        } catch (err) {
            console.error(`[Helper] getBooleanFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`);
            return `[Helper] getBooleanFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`;
        }
    },
    getNumberFromData: function (dataValue, nullValue) {
        try {
            if (dataValue === undefined || dataValue === null || dataValue === '' || isNaN(dataValue)) {
                if (dataValue && dataValue !== null && dataValue.toString().startsWith('#mdwTheme:')) {
                    let id = dataValue.replace('#mdwTheme:', '');
                    let val = vis.states.attr(id + '.val');

                    if (val && val !== null && val !== 'null') {
                        return parseFloat(val);
                    } else {
                        return nullValue;
                    }
                } else {
                    return nullValue;
                }
            } else {
                return parseFloat(dataValue);
            }
        } catch (err) {
            console.error(`[Helper] getNumberFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`);
            return `[Helper] getNumberFromData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`;
        }
    },
    getStringFromNumberData: function (dataValue, nullValue, prepand = '', append = '') {
        try {
            if (dataValue === undefined || dataValue === 'undefined' || dataValue === null || dataValue === 'null' || dataValue === '') {
                return nullValue
            } else {
                if (dataValue && dataValue !== null && dataValue.toString().startsWith('#mdwTheme:')) {
                    let id = dataValue.replace('#mdwTheme:', '');
                    let val = vis.states.attr(id + '.val');

                    if (val && val !== null && val !== 'null') {
                        return prepand + parseFloat(val) + append;
                    } else {
                        return nullValue;
                    }
                }

                if (vis.editMode && isNaN(dataValue)) {
                    let binding = vis.extractBinding(dataValue, true);

                    if (binding && binding.length >= 1) {
                        let bindingVal = vis.formatBinding(dataValue, undefined, undefined, undefined, true);

                        if (bindingVal === undefined || bindingVal === 'undefined' || bindingVal === null || bindingVal === 'null' || bindingVal === '' || isNaN(bindingVal)) {
                            return nullValue;
                        } else {
                            return prepand + parseFloat(bindingVal) + append;
                        }
                    } else {
                        if (isNaN(dataValue)) {
                            return nullValue
                        } else {
                            return prepand + parseFloat(dataValue) + append;
                        }
                    }
                } else {
                    if (isNaN(dataValue)) {
                        return nullValue
                    } else {
                        return prepand + parseFloat(dataValue) + append;
                    }
                }
            }
        } catch (err) {
            console.error(`[Helper] getStringFromNumberData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`);
            return `[Helper] getStringFromNumberData: val: ${dataValue} error: ${err.message}, stack: ${err.stack}`;
        }
    },
    getFontSize: function (fontSizeValue) {
        let fontSize = vis.binds.materialdesign.helper.getValueFromData(fontSizeValue, null);

        if (fontSize !== null) {
            if (fontSize.includes('headline') || fontSize.includes('subtitle') || fontSize.includes('body') || fontSize.includes('caption') || fontSize.includes('button') || fontSize.includes('overline')) {
                // font size is a mdc-typography style
                return { class: `mdc-typography--${fontSize}`, style: '' };
            } else if (!isNaN(fontSize)) {
                // number only
                return { class: ``, style: `font-size: ${fontSize}px;` };
            } else {
                return { class: ``, style: `font-size: ${fontSize};` };
            }
        } else {
            return { class: '', style: '' };
        }
    },
    getListItemHeader: function (text, fontSize) {
        if (text !== null && text !== '') {
            return `<h3 class="mdc-list-group__subheader ${fontSize.class}" 
                        style="${fontSize.style}">
                            ${text}
                    </h3>`;
        }
        return '';
    },
    getListItemTextElement: function (text, subText, fontSize, subFontSize, align = 'left') {

        let alignFlex = 'flex-start';
        if (align === 'center') {
            alignFlex = 'center';
        } else if (align === 'right') {
            alignFlex = 'flex-end';
        }

        return `<span class="mdc-list-item__text" style="width: 100%">     
                    <span class="mdc-list-item__primary-text ${fontSize.class}" style="justify-content: ${alignFlex};${fontSize.style}">${text}</span>
                    <span class="mdc-list-item__secondary-text ${subFontSize.class}" style="text-align: ${align}; ${subFontSize.style}">${subText}</span>
                </span>`;
    },
    getListItemImage: function (image, style) {
        if (image != '') {
            return `<img 
                    class="mdc-list-item__graphic" src="${image}" 
                    style="width: auto; padding-top: 8px; padding-bottom: 8px;${style}"
                >`
        }
        return '';
    },

    getListItem: function (layout, itemIndex, backdropImage, hasSubItems, isSubItem = false, style = '', dataOid = '', role = '', dataValue = '', isDisabled = false, index = undefined, parentIndex = undefined, setValueOnMenuToggleClick = false, topAppBarUserId = undefined) {
        if (layout === 'standard') {
            // Layout: Standard
            return `<div 
                        class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''}${(hasSubItems) ? ' hasSubItems' : ''}${isDisabled ? ' mdc-list-item--disabled' : ''}" 
                        tabindex="${(itemIndex === 0) ? '0' : '-1'}" 
                        id="listItem_${itemIndex}"
                        ${topAppBarUserId ? `menuId="${topAppBarUserId}"` : ''}                        
                        ${index || index === 0 ? `index="${index}"` : ''}
                        ${parentIndex || parentIndex === 0 ? `parentIndex="${parentIndex}"` : ''}
                        style="${style}"
                        data-value="${dataValue}" 
                        ${dataOid} 
                        ${role}
                        ${hasSubItems ? `set-value-on-menu-toggle="${setValueOnMenuToggleClick}"` : ''}                        
                    >`
        } else {
            // Layout: Backdrop
            return `<div 
                        class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''} mdc-card__media${(hasSubItems) ? ' hasSubItems' : ''}${isDisabled ? ' mdc-list-item--disabled' : ''}" 
                        tabindex="${(itemIndex === 0) ? '0' : '-1'}"
                        id="listItem_${itemIndex}"
                        ${topAppBarUserId ? `menuId="${topAppBarUserId}"` : ''}
                        ${index || index === 0 ? `index="${index}"` : ''}
                        ${parentIndex || parentIndex === 0 ? `parentIndex="${parentIndex}"` : ''}
                        style="background-image: url(${backdropImage}); align-items: flex-end; padding: 0px;${style}"
                        data-value="${dataValue}" 
                        ${dataOid} 
                        ${role}
                        ${hasSubItems ? `set-value-on-menu-toggle="${setValueOnMenuToggleClick}"` : ''}
                    >`
        }
    },
    getListItemLabel: function (layout, itemIndex, text, hasSubItems, fontSize, showLabel, toggleIconColor, backdropLabelHeight, isSubItem = false, align = 'left', overflow = false) {

        let subItemToggleIcon = '';
        if (hasSubItems) {
            subItemToggleIcon = `<span 
                                    class="mdc-list-item__meta mdi mdi-menu-down toggleIcon" aria-hidden="true" style="font-size: 24px; ${vis.binds.materialdesign.helper.getValueFromData(toggleIconColor, '', 'color: ', ';')}">                                        
                                </span>`;
        }

        if (layout === 'standard') {
            // Layout: Standard
            let listItemLabel = `<span 
                                    class="mdc-list-item__text ${fontSize.class}"
                                    id="listItem_${itemIndex}"
                                    style="width: 100%; text-align: ${align};${overflow ? 'overflow: visible;' : ''} ${fontSize.style}${showLabel}">
                                        ${text}
                                </span>`;

            return listItemLabel + subItemToggleIcon;

        } else {
            // Layout: Backdrop

            // generate SubItems toggle Icon
            return `<div 
                        class="materialdesign-list-item-backdrop-container${(isSubItem) ? ' isSubItem' : ''}" 
                        id="backdropContainer_${itemIndex}" 
                        style="${backdropLabelHeight}">
                            <span 
                                class="mdc-list-item__text ${fontSize.class}"
                                id="listItem_${itemIndex}"
                                style="position: absolute; ${fontSize.style}${showLabel}">
                                    ${text}
                            </span>
                            ${subItemToggleIcon}
                    </div>`;
        }
    },
    getListItemDivider: function (showDivider, dividerLayout, isSubList = false) {
        if (showDivider === true || showDivider === 'true') {
            if (dividerLayout === 'standard') {
                return `<hr class="mdc-${isSubList ? 'sub' : ''}list-divider">`
            } else {
                return `<hr class="mdc-${isSubList ? 'sub' : ''}list-divider mdc-list-divider--${dividerLayout}">`
            }
        }
        return '';
    },
    getIconElement: function (iconData, width, height, iconColor = '', style = '', appendClass = '') {
        let className = `materialdesign-icon-image ${appendClass}`;

        let icon = myMdwHelper.getValueFromData(iconData, null);
        let color = myMdwHelper.getValueFromData(iconColor, '');

        if (icon !== null) {
            if (myMdwHelper.getAllowedImageFileExtensions().some(el => icon.includes(el))) {
                // is image
                return `<img 
                        class="${className}"
                        src="${icon}" 
                        style="width: ${width}; height: ${height}; ${style};" />`;
            } else {
                // is material-icons

                // return `<span class="mdi mdi-${icon} ${className}" 
                //             style="width: ${height}; height: ${height}; font-size: ${height}; color: ${color}; ${style};"></span>`

                // 01.02.2021 -> width & height rausgenommen
                return `<span class="mdi mdi-${icon} ${className}" 
                            style="width: auto; height: auto; font-size: ${height}; color: ${color}; ${style};"></span>`
            }
        }

        return '';
    },
    getListIcon: function (iconData, width, height, iconColor = '', style = '') {
        return myMdwHelper.getIconElement(iconData, width, height, iconColor, `padding-top: 8px; padding-bottom: 8px;${style}`, 'mdc-list-item__graphic');
    },
    changeIconElement: function (parentElement, iconData, width, height, iconColor = '', style = '', appendClass = '') {
        let className = (`materialdesign-icon-image ${appendClass}`).trim();

        let element = parentElement.find('.' + className.replace(/\s/g, '.'));

        let icon = myMdwHelper.getValueFromData(iconData, null);
        let color = myMdwHelper.getValueFromData(iconColor, '');

        if (icon !== null) {
            if (myMdwHelper.getAllowedImageFileExtensions().some(el => icon.includes(el))) {
                // is image
                if (element.is('img')) {
                    element.attr('src', icon);
                } else {
                    // previous image is material-icon
                    element.replaceWith(`<img 
                                            class="${className}"
                                            src="${icon}" 
                                            style="width: ${width}; height: ${height}; ${style};" />`);
                }
            } else {
                // is material-icons
                element.replaceWith(`<span class="mdi mdi-${icon} ${className}" 
                                                style="width: ${height}; height: ${height}; font-size: ${height}; color: ${color}; ${style};"></span>`)
            }
        }
    },
    changeListIconElement: function (parentElement, iconData, width, height, iconColor = '', style = '') {
        myMdwHelper.changeIconElement(parentElement, iconData, width, height, iconColor, `padding-top: 8px; padding-bottom: 8px;${style}`, 'mdc-list-item__graphic');
    },
    getAllowedImageFileExtensions: function () {
        return ['.gif', '.png', '.bmp', '.jpg', '.jpeg', '.tif', '.svg', 'http://', 'https://'];
    },
    getVisibility: function (val, visibilityOid, visibilityCond, visibilityVal) {
        let widgetData = {
            "visibility-oid": visibilityOid,
            "visibility-cond": visibilityCond,
            "visibility-val": visibilityVal
        }

        return vis.isWidgetHidden(undefined, undefined, val, widgetData);
    },
    getViewOfWidget(wid) {
        for (var view in vis.views) {
            if (vis.views[view].widgets && vis.views[view].widgets[wid]) {
                return view;
            }
        }
    },
    oidNeedSubscribe(oid, wid, widgetName, oidNeedSubscribe, isBinding = false, debug = false, force = false) {
        let view = vis.binds.materialdesign.helper.getViewOfWidget(wid);

        if (oid !== undefined) {
            // Check if Oid is subscribed and put to vis subscribing object
            if (!vis.editMode) {

                if (!vis.subscribing.byViews[view].includes(oid)) {
                    vis.subscribing.byViews[view].push(oid);

                    if (!isBinding) {
                        if (debug) console.log(`[oidNeedSubscribe] ${widgetName} (${wid}): oid '${oid}' need subscribe (view)`);
                    } else {
                        if (debug) console.log(`[oidNeedSubscribe] ${widgetName} (${wid}): binding '${oid}' need subscribe ${force ? '(force: true)' : ''}`);
                    }

                    return true;
                }

                if (!vis.subscribing.IDs.includes(oid)) {
                    vis.subscribing.byViews[view].push(oid);

                    if (!isBinding) {
                        if (debug) console.log(`[oidNeedSubscribe] ${widgetName} (${wid}): oid '${oid}' need subscribe (ID)`);
                    } else {
                        if (debug) console.log(`[oidNeedSubscribe] ${widgetName} (${wid}): binding '${oid}' need subscribe (ID)`);
                    }

                    return true;
                }
            }
        }

        return oidNeedSubscribe;
    },
    bindingNeedSubscribe(element, wid, widgetName, oidNeedSubscribe) {
        let result = { bindingTokenList: [], oidNeedSubscribe: oidNeedSubscribe };

        let bindings = vis.extractBinding(element);

        if (bindings !== 'null' && bindings !== null && bindings.length > 0) {
            for (var b = 0; b <= bindings.length - 1; b++) {
                result.bindingTokenList.push(bindings[b].token);

                let view = vis.binds.materialdesign.helper.getViewOfWidget(wid);

                if (vis.bindings.hasOwnProperty(bindings[b].systemOid) === false) {
                    result.oidNeedSubscribe = vis.binds.materialdesign.helper.oidNeedSubscribe(bindings[b].systemOid, wid, widgetName, oidNeedSubscribe, true);

                    vis.bindings[[bindings[b].systemOid]] = [{
                        visOid: bindings[b].visOid,
                        systemOid: bindings[b].systemOid,
                        token: bindings[b].token,
                        operations: bindings[b].operations,
                        format: bindings[b].format,
                        isSeconds: bindings[b].isSeconds,
                        type: "data",
                        view: view,
                        widget: wid,
                        attr: 'none'
                    }]
                }

                if (bindings[b].operations) {
                    for (var o = 0; o <= bindings[b].operations.length - 1; o++) {
                        if (bindings[b].operations[o].arg) {
                            for (var a = 0; a <= bindings[b].operations[o].arg.length - 1; a++) {
                                if (bindings[b].operations[o].arg[a].systemOid) {
                                    result.oidNeedSubscribe = vis.binds.materialdesign.helper.oidNeedSubscribe(bindings[b].operations[o].arg[a].systemOid, wid, widgetName, oidNeedSubscribe, true);
                                }
                            }
                        }
                    }
                }
            }
        }

        return result;
    },
    subscribeThemesAtRuntime(data, widgetName) {
        try {
            let oidsNeedSubscribe = false;

            oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.lastchange', data.wid, widgetName, oidsNeedSubscribe, false, data.debug);
            oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.colors.darkTheme', data.wid, widgetName, oidsNeedSubscribe, false, data.debug);

            for (const [key, value] of Object.entries(data)) {
                if (value) {
                    if (value.toString().startsWith('#mdwTheme:')) {
                        let id = value.replace('#mdwTheme:', '');
                        oidsNeedSubscribe = needsSubscribe(id, oidsNeedSubscribe);
                    } else {
                        if (value.toString().includes('#mdwTheme:') || key === 'json_string_oid' || key === 'oid') {
                            let extractIds;

                            if (key !== 'json_string_oid' && key !== 'oid') {
                                extractIds = value.match(/#mdwTheme:*[^*?"'`´,;:<>#\/{}\\ß\[\]\s]*/g);
                            } else {
                                // oid can include json string which can includes theme attributes
                                let val = vis.states.attr(value + '.val');
                                if (val && val !== null && val.toString().includes('#mdwTheme:')) {
                                    extractIds = val.match(/#mdwTheme:*[^*?"'`´,;:<>#\/{}\\ß\[\]\s]*/g);
                                }
                            }

                            if (extractIds && extractIds !== null && extractIds.length > 0) {
                                for (const str of extractIds) {
                                    let id = str.replace('#mdwTheme:', '');
                                    oidsNeedSubscribe = needsSubscribe(id, oidsNeedSubscribe);
                                }
                            }
                        }
                    }
                }
            }

            if (oidsNeedSubscribe) {
                myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, undefined, data.debug);
            }

            function needsSubscribe(id, oidsNeedSubscribe) {
                if (id.includes('vis-materialdesign.0.colors.')) {
                    let idLight = id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.light.');
                    oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(idLight, data.wid, widgetName, oidsNeedSubscribe, false, data.debug);

                    let idDark = id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.dark.');
                    oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(idDark, data.wid, widgetName, oidsNeedSubscribe, false, data.debug);
                } else {
                    oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(id, data.wid, widgetName, oidsNeedSubscribe, false, data.debug);
                }

                return oidsNeedSubscribe;
            }
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] subscribeThemesAtRuntime: error: ${ex.message}, stack: ${ex.stack}`);
            return false;
        }
    },
    subscribeStatesAtRuntime(wid, widgetName, callback, debug = false) {
        // modified from vis.js -> https://github.com/ioBroker/ioBroker.vis/blob/2a08ee6da626a65b9d0b42b8679563e74272bfc6/www/js/vis.js#L2710

        if (debug) console.log(`[subscribeStatesAtRuntime] ${widgetName} (${wid}) subscribe states at runtime`);

        let view = vis.binds.materialdesign.helper.getViewOfWidget(wid);

        if (!view || vis.editMode) {
            if (callback) callback();
            return;
        }

        if (!vis.subscribing.activeViews.includes(view)) {
            vis.subscribing.activeViews.push(view);
        }

        vis.subscribing.byViews[view] = vis.subscribing.byViews[view] || [];

        // subscribe
        var oids = [];
        for (var i = 0; i < vis.subscribing.byViews[view].length; i++) {
            let oid = vis.subscribing.byViews[view][i];

            if (!vis.subscribing.active.includes(oid)) {
                vis.subscribing.active.push(oid);

                oids.push(oid);

                if (debug) console.log(`[subscribeStatesAtRuntime] ${widgetName} (${wid}): '${oid}' subscribed (View)`);
            }

            if (!vis.subscribing.IDs.includes(oid)) {
                vis.subscribing.IDs.push(oid);
                if (debug) console.log(`[subscribeStatesAtRuntime] ${widgetName} (${wid}): '${oid}' add to subscribing.IDs`);
            }
        }

        if (oids.length > 0) {
            var that = vis;
            if (debug) console.log(`[subscribeStatesAtRuntime] ${widgetName} (${wid}): Request ${oids.length} states.`);
            vis.conn._socket.emit('getStates', oids, function (error, data) {
                if (error) that.showError(error);

                that.updateStates(data);
                that.conn.subscribe(oids, function () {

                    if (data && Object.keys(data).length > 0) {
                        if (debug) console.log(`[subscribeStatesAtRuntime] ${widgetName} (${wid}): inform widgets ${Object.keys(data).length} states subscribed`);

                        $(document).trigger("mdwSubscribe", data);
                    }

                    // vis.setValue('vis-materialdesign.0.lastchange', new Date().getTime());
                });

                if (callback) callback();
            });
        } else {
            if (callback) callback();
        }
    },
    isLayoutRefreshNeeded(widgetName, data, oids, debug) {
        let subscribedOids = Object.keys(myUnderscore.pick(oids, myUnderscore.identity));

        if (debug) console.log(`[isLayoutRefreshNeeded] ${widgetName} (${data.wid}): subscribed oids: ${JSON.stringify(subscribedOids)}`);

        for (const key of Object.keys(data)) {
            if (typeof (data[key]) === 'string') {
                if (subscribedOids.includes(data[key].replace('#mdwTheme:', ''))) {
                    if (debug) console.log(`[isLayoutRefreshNeeded] ${widgetName} (${data.wid}): refresh needed!`);
                    return true;
                }

                if (data[key].includes('#mdwTheme:')) {
                    let extractIds = data[key].match(/#mdwTheme:*[^*?"'`´,;:<>#\/{}\\ß\[\]\s]*/g);

                    if (extractIds && extractIds !== null && extractIds.length > 0) {
                        for (const str of extractIds) {
                            let id = str.replace('#mdwTheme:', '');
                            if (subscribedOids.includes(id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.light.'))) {
                                if (debug) console.log(`[isLayoutRefreshNeeded] ${widgetName} (${data.wid}): refresh needed!`);
                                return true;
                            } else if (subscribedOids.includes(id.replace('vis-materialdesign.0.colors.', 'vis-materialdesign.0.colors.dark.'))) {
                                if (debug) console.log(`[isLayoutRefreshNeeded] ${widgetName} (${data.wid}): refresh needed!`);
                                return true;
                            }
                        }
                    }
                }
            }
        }

        return false;
    },
    calcChecker(prop, wid, widgetName, debug = false) {
        if (prop.includes("calc")) {
            console.error(`${widgetName} (${wid}) not supoort calc()! Use px or % instead! (${prop})`);
        } else {
            if (debug) console.log(`${widgetName} (${wid}) width: ${prop}`);
        }
    },
    formatNumber(value, minDigits = undefined, maxDigits = undefined) {
        if (!isNaN(parseFloat(value))) {
            value = parseFloat(value);
            if ((minDigits !== undefined && minDigits !== '' && !isNaN(parseFloat(minDigits))) && (maxDigits !== undefined && maxDigits !== '' && !isNaN(parseFloat(maxDigits)))) {
                return value.toLocaleString(undefined, { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits });
            } else if (minDigits !== undefined && minDigits !== '' && !isNaN(parseFloat(minDigits))) {
                return value.toLocaleString(undefined, { minimumFractionDigits: minDigits });
            } else if (maxDigits !== undefined && maxDigits !== '' && !isNaN(parseFloat(maxDigits))) {
                return value.toLocaleString(undefined, { maximumFractionDigits: maxDigits });
            }

            return value.toLocaleString();
        }
        // keine zahl
        return value;
    },
    getObject(id, callback) {
        vis.conn._socket.emit('getObject', id, function (err, obj) {
            if (!err && obj) {
                callback(obj)
            } else {
                callback(undefined)
            }
        });
    },
    getVersion(callback) {
        vis.binds.materialdesign.helper.getObject('system.adapter.vis-materialdesign', function (obj) {
            if (obj && obj.common && obj.common.installedVersion) {
                callback(obj.common.installedVersion);
            } else if (obj && obj.common && obj.common.version) {
                callback(obj.common.version);
            } else {
                callback('unknown');
            }
        });
    },
    getHtmlmdwData(mdwData, properties) {
        for (const key of Object.keys(properties)) {
            if (properties[key] && key !== 'wid') {
                let value = properties[key];

                if (key === 'jsonStringObject') {
                    // nested json string: autoComplete, select
                    value = he.encode(value.toString());
                } else {
                    value = JSON.stringify(value);
                    value = value.replace(/^\"/, "").replace(/\"$/, "").replace(/\\n/g, ' ').replace(/\\t/g, '');
                }

                if (value.toString().includes("'")) {
                    console.warn('nested elements found, replace \' with \"');
                    console.warn(`${key}: ${value}`);
                    value = value.replace(/\'/g, '"');
                }

                if (mdwData === '') {
                    mdwData += `mdw-${key}='${value}'` + '\n';
                } else {
                    mdwData += '\t' + `mdw-${key}='${value}'` + '\n';
                }
            }
        }
        return mdwData;
    },
    getHtmlParentId(el) {
        let parentId = 'unknown';
        let $parent = el.closest('.vis-widget[id^=w]');
        parentId = $parent.attr('id');
        if (!parentId) {
            // Fallback if no parent id is found (e.g. MDW Dialog)            
            parentId = Object.keys(vis.widgets)[0];
        }

        return parentId;
    },
    extractHtmlWidgetData(el, widgetData, parentId, widgetName, logPrefix, callback) {
        for (const key of Object.keys(widgetData)) {
            if (key !== 'wid') {
                if (el.attr(`mdw-${key}`)) {
                    // widgetData[key] = el.attr(`mdw-${key}`).replace(/\\"/g, '"').replace(/&x22;/g, '"');
                    widgetData[key] = el.attr(`mdw-${key}`);
                } else if (el.attr(`mdw-${key.toLowerCase()}`)) {
                    // widgetData[key] = el.attr(`mdw-${key.toLowerCase()}`).replace(/\\"/g, '"').replace(/&x22;/g, '"');
                    widgetData[key] = el.attr(`mdw-${key.toLowerCase()}`);
                } else {
                    delete widgetData[key];
                }
            }
        }

        widgetData.debug = widgetData.debug === true || widgetData.debug === 'true' ? true : false;

        if (widgetData.debug) console.log(`${logPrefix} [extractHtmlWidgetData] widgetData: ${JSON.stringify(widgetData)} `);

        if (widgetData.oid) {

            let oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(widgetData.oid, parentId, widgetName, false, false, widgetData.debug);

            if (widgetData["oid-working"]) {
                oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(widgetData["oid-working"], parentId, widgetName, false, false, widgetData.debug);
            }

            if (oidsNeedSubscribe) {
                myMdwHelper.subscribeStatesAtRuntime(parentId, widgetName, function () {
                    if (widgetData.debug) console.log(`${logPrefix} [extractHtmlWidgetData] oid subscribed -> fire callback()`);

                    if (callback) callback(widgetData);
                }, widgetData.debug);
            } else {
                if (widgetData.debug) console.log(`${logPrefix} [extractHtmlWidgetData] nothing to subscribed -> fire callback()`);
                if (callback) callback(widgetData);
            }
        } else {
            if (widgetData.debug) console.log(`${logPrefix} [extractHtmlWidgetData] no oid exist, nothing to subscribed -> fire callback()`);
            if (callback) callback(widgetData);
        }
    },
    setValue(id, value) {
        if (!vis.editMode) {
            vis.binds.materialdesign.helper.getObject(id, function (obj) {
                if (obj && obj.common && obj.common['type'] && value !== null) {
                    if (obj.common['type'] === 'string') {
                        vis.setValue(id, value.toString());
                    } else if (obj.common['type'] === 'number') {
                        vis.setValue(id, parseFloat(value));
                    } else if (obj.common['type'] === 'boolean') {
                        vis.setValue(id, !(/^(false|0)$/i).test(value.toString().toLowerCase()) && !!value);
                    } else {
                        vis.setValue(id, value);
                    }
                } else {
                    vis.setValue(id, value);
                }
            })
        }
    },
    generateUuidv4() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    },
    async initializeSentry(version) {
        let id = 'vis-materialdesign.0.sentry';
        let sentryState = await this.getStateAsync(id);

        if (sentryState) {
            if (sentryState.val) {
                let sentryObj = await this.getObjectAsync(id);

                if (sentryObj && sentryObj.common) {
                    if (sentryObj.common.uuid) {
                        this._initializeSentry(version, sentryObj.common.uuid);
                    } else {
                        this._initializeSentry(version, 'uuid_error');
                    }
                }
            } else {
                console.log(`vis-materialdesign: sentry is deactivated.`)
            }
        } else {
            console.warn(`vis-materialdesign: sentry datapoint '${id}' not exist! Go to the adapter settings to activate it.`)
        }
    },
    _initializeSentry(version, uuid) {
        Sentry.init({
            dsn: 'https://888b0efc877b4b12a8a83e3c1fb7fe1a@sentry.iobroker.net/77',
            debug: false,
            release: version,
            integrations: [
                new Sentry.Integrations.Dedupe(),
                new Sentry.Integrations.CaptureConsole({
                    levels: ['error']
                })
            ],
            beforeSend(event) {
                // Modify the event here
                if (!vis.editMode && event && event.message && event.message.includes('materialdesign')) {
                    // only send to sentry, if error is at runtime and fired by MDW

                    if (!event.message.includes('cannot parse json string') &&                                                  // ignore json parse errors
                        !/\b(Cannot access)\b .* \b(before initialization)\b/g.test(event.message) &&                           // ignore lib init errors
                        !/\b(can't access lexical declaration)\b .* \b(before initialization)\b/g.test(event.message) &&        // ignore lib init errors                        
                        !event.message.includes('out of memory') &&
                        !event.message.includes('Error in eval') &&
                        !event.message.includes('moment is not defined')
                    ) {

                        event.message = event.message.replace(new RegExp("( - w\\d+)", "g"), "");   // remove data.wid from message
                        return event;
                    }
                }
            }
        });

        Sentry.configureScope(function (scope) {
            scope.setExtra("vis version", vis.version);
            scope.setUser({ id: uuid });
        });

        console.log('sentry initialized for vis-materialdesign');
    },
    async getStateAsync(id) {
        return new Promise((resolve, reject) => {
            vis.conn._socket.emit('getState', id, function (err, res) {
                if (!err && res) {
                    resolve(res);
                } else {
                    resolve(null);
                }
            });
        });
    },
    async getObjectAsync(id) {
        return new Promise((resolve, reject) => {
            vis.conn._socket.emit('getObject', id, function (err, res) {
                if (!err && res) {
                    resolve(res);
                } else {
                    resolve(null);
                }
            });
        });
    }
};

let myMdwHelper = vis.binds.materialdesign.helper;
vis.binds.materialdesign.showVersion();

// myMdwHelper.waitForVisConnected(async function () {
//     myMdwHelper.waitForViews(async function () {
//         myMdwHelper.waitForWidgets(async function () {
//             // subscribe Theme states that needs as listener
//             if (vis.widgets && Object.keys(vis.widgets).length > 0) {
//                 let dummyWid = Object.keys(vis.widgets)[0];
//                 let oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.lastchange', dummyWid, 'MDW Theme', false, false, false);
//                 oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe('vis-materialdesign.0.colors.darkTheme', dummyWid, 'MDW Theme', oidsNeedSubscribe, false, false);

//                 if (oidsNeedSubscribe) {
//                     myMdwHelper.subscribeStatesAtRuntime(dummyWid, 'MDW Theme', function () { }, true);
//                 }
//             }
//         });
//     });
// });