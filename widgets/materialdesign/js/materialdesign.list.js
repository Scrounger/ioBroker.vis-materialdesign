/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.0.1"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.list = {
    initialize: function (data) {
        try {
            let itemHeight = getValueFromData(data.listItemHeight, '', 'height: ', 'px !important;');

            let headerFontSize = getFontSize(data.listItemHeaderTextSize);
            let labelFontSize = getFontSize(data.listItemTextSize);
            let subLabelFontSize = getFontSize(data.listItemSubTextSize);

            let imageHeight = getValueFromData(data.listImageHeight, '', 'height: ', 'px !important;');
            let spaceBetweenImageAndLabel = getValueFromData(data.distanceBetweenTextAndImage, '', 'margin-right: ', 'px;');

            let nonInteractive = '';
            let itemRole = '';
            if (data.listType === 'text') {
                nonInteractive = ' mdc-list--non-interactive';
            } else if (data.listType === 'checkbox') {
                itemRole = 'role="checkbox"';
            } else if (data.listType === 'switch') {
                itemRole = 'role="switch"';
            }

            let itemList = [];

            let listLayout = '';
            if (data.listLayout === 'card') {
                listLayout = 'materialdesign-list-card';
            } else if (data.listLayout === 'cardOutlined') {
                listLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            for (var i = 0; i <= data.count; i++) {
                let itemHeaderText = getValueFromData(data.attr('groupHeader' + i), null);
                let itemLabelText = getValueFromData(data.attr('label' + i), `Item ${i}`);
                let itemSubLabelText = getValueFromData(data.attr('subLabel' + i), '');
                let itemImage = getValueFromData(data.attr('listImage' + i), '');

                // generate Header
                itemList.push(getListItemHeader(itemHeaderText, headerFontSize));

                // generate Item -> mdc-list-item
                let listItem = getListItem('standard', i, '', '', false, false, itemHeight, itemRole);

                // generate Item Label
                let itemLabel = '';
                if (itemSubLabelText === '') {
                    itemLabel = getListItemLabel('standard', i, itemLabelText, false, labelFontSize, true, '', '');
                } else {
                    itemLabel = getListItemTextElement(itemLabelText, itemSubLabelText, labelFontSize, subLabelFontSize);
                }

                // generate Item Image for Layout Standard
                let listItemImage = getListItemImage(itemImage, `${imageHeight}${spaceBetweenImageAndLabel}`);

                // generate Item
                itemList.push(`${listItem}${listItemImage}${itemLabel}</div>`);

                // generate Divider
                itemList.push(getListItemDivider(data.attr('dividers' + i), data.listItemDividerStyle));
            }

            return { itemList: itemList.join(''), nonInteractive: nonInteractive }
        } catch (ex) {
            console.exception(`initialize [${data.wid}]: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};
