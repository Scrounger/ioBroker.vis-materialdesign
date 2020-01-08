/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.35"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.helper = {
    vibrate: function (duration) {
        try {
            if ("vibrate" in navigator) {
                window.navigator.vibrate(duration);
            }
        } catch (ex) {
            console.exception(`vibrate [${data.wid}]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    waitForElement: function (parent, elementPath, callBack) {
        window.setTimeout(function () {
            if (parent.find(elementPath).length) {
                callBack(elementPath, $(elementPath));
            } else {
                console.log('wait');
                vis.binds.materialdesign.helper.waitForElement(parent, elementPath, callBack);
            }
        }, 50)
    },    
    installedVersion: function (el, data) {
        setTimeout(function () {
            let version = 'version: "0.2.35"'
            console.log(version);
            $(el).find('.materialdesign-installed-version-badge').attr('src', `https://img.shields.io/badge/installed-${version.replace('version: "', '').replace('"', '')}-%234ac51c`);
        }, 1)
    },
    getValueFromData: function (dataValue, nullValue, prepand = '', append = '') {
        try {
            return (dataValue === undefined || dataValue === null || dataValue === '') ? nullValue : prepand + dataValue + append;
        } catch (err) {
            console.error(err.message);
            return 'Error';
        }
    },
    getNumberFromData: function (dataValue, nullValue) {
        try {
            return (dataValue === undefined || dataValue === null || dataValue === '' || isNaN(dataValue)) ? nullValue : parseFloat(dataValue);
        } catch (err) {
            console.error(err.message);
            return 'Error';
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
        if (text !== null) {
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
    getListItem: function (layout, itemIndex, backdropImage, hasSubItems, isSubItem = false, style = '', dataOid = '', role = '', dataValue = '') {
        if (layout === 'standard') {
            // Layout: Standard
            return `<div 
                        class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''}${(hasSubItems) ? ' hasSubItems' : ''}" 
                        tabindex="${(itemIndex === 0) ? '0' : '-1'}" 
                        id="listItem_${itemIndex}" 
                        style="${style}"
                        data-value="${dataValue}" 
                        ${dataOid} 
                        ${role}
                    >`
        } else {
            // Layout: Backdrop
            return `<div 
                        class="mdc-list-item${(isSubItem) ? ' mdc-sub-list-item isSubItem' : ''}${(itemIndex === 0) ? ' mdc-list-item--activated' : ''} mdc-card__media${(hasSubItems) ? ' hasSubItems' : ''}" 
                        tabindex="${(itemIndex === 0) ? '0' : '-1'}"
                        id="listItem_${itemIndex}"
                        style="background-image: url(${backdropImage}); align-items: flex-end; padding: 0px;${style}"
                    >`
        }
    },
    getListItemLabel: function (layout, itemIndex, text, hasSubItems, fontSize, showLabel, toggleIconColor, backdropLabelHeight, isSubItem = false, align = 'left') {

        let subItemToggleIcon = '';
        if (hasSubItems) {
            subItemToggleIcon = `<span 
                                    class="mdc-list-item__meta material-icons toggleIcon" aria-hidden="true" ${vis.binds.materialdesign.helper.getValueFromData(toggleIconColor, '', 'style="color: ', ';"')}>
                                        keyboard_arrow_down
                                </span>`;
        }

        if (layout === 'standard') {
            // Layout: Standard
            let listItemLabel = `<span 
                                    class="mdc-list-item__text ${fontSize.class}"
                                    id="listItem_${itemIndex}"
                                    style="width: 100%; text-align: ${align}; ${fontSize.style}${showLabel}">
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
    getListItemDivider: function (showDivider, dividerLayout) {
        if (showDivider === true || showDivider === 'true') {
            if (dividerLayout === 'standard') {
                return '<hr class="mdc-list-divider">'
            } else {
                return `<hr class="mdc-list-divider mdc-list-divider--${dividerLayout}">`
            }
        }
        return '';
    }
};

let myMdwHelper = vis.binds.materialdesign.helper;