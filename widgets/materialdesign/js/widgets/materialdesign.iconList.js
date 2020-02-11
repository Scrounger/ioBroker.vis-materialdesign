/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.52"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.iconlist =
    function (el, data) {
        try {
            let $this = $(el);

            let jsonData = null;
            let countOfItems = 0;

            if (data.listItemDataMethod === 'jsonStringObject') {
                try {
                    jsonData = JSON.parse(data.jsonStringObject);
                    countOfItems = jsonData.length - 1;
                } catch (err) {
                    jsonData = [
                        {
                            text: `<font color=\"red\"><b>${_("Error in JSON string")}</b></font>`,
                            subText: `<label style="word-wrap: break-word; white-space: normal;">${err.message}</label>`
                        }
                    ];
                    console.error(`[List] cannot parse json string! Error: ${err.message}`);
                }
            } else {
                countOfItems = data.countListItems;
            }

            let itemList = [];

            for (var i = 0; i <= countOfItems; i++) {
                let listItemObj = getListItemObj(i, data, jsonData);

                let iconHeight = myMdwHelper.getNumberFromData(data.iconHeight, 24);
                let buttonHeight = myMdwHelper.getNumberFromData(data.buttonHeight, iconHeight * 1.5);

                let imageElement = '';
                if (data.listType === 'text') {
                    imageElement = myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)
                } else {
                    // Buttons
                    imageElement = `<div style="width: 100%; text-align: center;">
                                        <div class="materialdesign-icon-button v-alert-materialdesign-icon-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: ${buttonHeight}px; height: ${buttonHeight}px;">
                                            <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                            ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                            </div>
                                        </div>
                                    </div>`
                }

                itemList.push(`
                    <div class="materialdesign-icon-list-item" id="icon-list-item${data.countOfItems}">                    
                        ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text">${listItemObj.text}</label>` : ''}
                        ${imageElement}
                    </div>
                `)
            }

            $this.append(`
                <div class="materialdesign-icon-list-container">
                    ${itemList.join("")}
                </div>
            `);

            myMdwHelper.waitForElement($this, `#icon-list-item${data.countViews}`, function () {

                let iconButtons = $this.find('.materialdesign-icon-button');
                for (var b = 0; b <= iconButtons.length - 1; b++) {
                    // set ripple effect to icon buttons
                    let button = new mdc.iconButton.MDCIconButtonToggle(iconButtons.get(b));
                    iconButtons.get(b).style.setProperty("--mdc-theme-primary", myMdwHelper.getValueFromData(data.buttonColorPress, ''));

                    button.listen('MDCIconButtonToggle:change', function (item) {
                        let index = $(this).attr('index');
                        console.log(index);
                    });

                }

                $this.context.style.setProperty("--materialdesign-icon-list-items-per-row", myMdwHelper.getNumberFromData(data.maxItemsperRow, 1));

                $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-size", myMdwHelper.getNumberFromData(data.labelFontSize, 14) + 'px');
                $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-family", myMdwHelper.getValueFromData(data.labelFontFamily, 'inherit'));
                $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-color", myMdwHelper.getValueFromData(data.labelFontColor, ''));

            });

            function getListItemObj(i, data, jsonData) {
                if (data.listItemDataMethod === 'inputPerEditor') {
                    // Data from Editor
                    return {
                        text: myMdwHelper.getValueFromData(data.attr('label' + i), ''),
                        subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                        image: myMdwHelper.getValueFromData(data.attr('listImage' + i), ""),
                        imageColor: myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e"),
                        imageActive: myMdwHelper.getValueFromData(data.attr('listImageActive' + i), ''),
                        imageActiveColor: myMdwHelper.getValueFromData(data.attr('listImageActiveColor' + i), ''),
                        buttonBackgroundColor: myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), ''),
                        buttonBackgroundActiveColor: myMdwHelper.getValueFromData(data.attr('buttonBgColorActive' + i), '')
                    };
                } else {
                    // Data from json
                    return {

                    };
                }
            }
        } catch (ex) {
            console.error(`[List] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
