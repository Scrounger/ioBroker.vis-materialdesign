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

            let iconHeight = myMdwHelper.getNumberFromData(data.iconHeight, 24);
            let buttonHeight = myMdwHelper.getNumberFromData(data.buttonHeight, iconHeight * 1.5);

            for (var i = 0; i <= countOfItems; i++) {
                let listItemObj = getListItemObj(i, data, jsonData);

                let imageElement = '';
                if (data.listType === 'text') {
                    imageElement = myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)
                } else {
                    // Buttons
                    imageElement = `<div style="width: 100%; text-align: center;">
                                        <div class="materialdesign-icon-button" index="${i}" style="background: ${listItemObj.buttonBackgroundColor}; position: relative; width: ${buttonHeight}px; height: ${buttonHeight}px;">
                                            <div class="materialdesign-button-body" style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
                                            ${myMdwHelper.getIconElement(listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor)}
                                            </div>
                                        </div>
                                    </div>`
                }

                itemList.push(`
                    <div class="materialdesign-icon-list-item" id="icon-list-item${i}" data-oid="${listItemObj.objectId}">                    
                        ${(listItemObj.text !== '') ? `<label class="materialdesign-icon-list-item-text">${listItemObj.text}</label>` : ''}
                        ${imageElement}
                        <label class="materialdesign-icon-list-item-value"></label>
                        ${(listItemObj.subText !== '') ? `<label class="materialdesign-icon-list-item-subText">${listItemObj.subText}</label>` : ''}
                    </div>
                `)
            }

            $this.append(`
                <div class="materialdesign-icon-list-container">
                    ${itemList.join("")}
                </div>
            `);

            $this.context.style.setProperty("--materialdesign-icon-list-items-per-row", myMdwHelper.getNumberFromData(data.maxItemsperRow, 1));

            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-size", myMdwHelper.getNumberFromData(data.labelFontSize, 14) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-family", myMdwHelper.getValueFromData(data.labelFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-text-font-color", myMdwHelper.getValueFromData(data.labelFontColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-size", myMdwHelper.getNumberFromData(data.subLabelFontSize, 12) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-family", myMdwHelper.getValueFromData(data.subLabelFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-subText-font-color", myMdwHelper.getValueFromData(data.subLabelFontColor, ''));

            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-size", myMdwHelper.getNumberFromData(data.valueFontSize, 12) + 'px');
            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-family", myMdwHelper.getValueFromData(data.valueFontFamily, 'inherit'));
            $this.context.style.setProperty("--materialdesign-icon-list-items-value-font-color", myMdwHelper.getValueFromData(data.valueFontColor, ''));


            myMdwHelper.waitForElement($this, `#icon-list-item${countOfItems}`, function () {

                let iconButtons = $this.find('.materialdesign-icon-button');
                for (var i = 0; i <= iconButtons.length - 1; i++) {
                    let listItemObj = getListItemObj(i, data, jsonData);

                    // set ripple effect to icon buttons
                    let mdcButton = new mdc.iconButton.MDCIconButtonToggle(iconButtons.get(i));
                    iconButtons.get(i).style.setProperty("--mdc-theme-primary", myMdwHelper.getValueFromData(data.buttonColorPress, ''));

                    mdcButton.listen('MDCIconButtonToggle:change', function () {
                        // icon button click event
                        let index = $(this).attr('index');
                        listItemObj = getListItemObj(index, data, jsonData);

                        if (data.listType !== 'text') {
                            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                        }

                        if (data.listType === 'buttonToggle') {
                            let selectedValue = vis.states.attr(listItemObj.objectId + '.val');

                            vis.setValue(listItemObj.objectId, !selectedValue);

                            setLayout(index, !selectedValue, listItemObj);
                        }


                    });

                    if (data.listType === 'buttonToggle') {
                        let valOnLoading = vis.states.attr(listItemObj.objectId + '.val');
                        setLayout(i, valOnLoading, listItemObj);

                        vis.states.bind(listItemObj.objectId + '.val', function (e, newVal, oldVal) {
                            let input = $this.parent().find('div[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                            input.each(function (d) {
                                // kann mit mehreren oid verknüpft sein
                                let index = parseInt(input.eq(d).attr('id').replace('icon-list-item', ''));
                                listItemObj = getListItemObj(index, data, jsonData);

                                setLayout(index, newVal, listItemObj);
                            });
                        });
                    }

                }


            });

            function setLayout(index, val, listItemObj) {
                let $item = $this.find(`#icon-list-item${index}`);                

                $item.find('.materialdesign-icon-list-item-value').text(val);

                if (val === true) {
                    $item.find('.materialdesign-icon-button').css('background', listItemObj.buttonBackgroundActiveColor);
                    myMdwHelper.changeIconElement($item, listItemObj.imageActive, 'auto', iconHeight + 'px', listItemObj.imageActiveColor);
                } else {
                    $item.find('.materialdesign-icon-button').css('background', listItemObj.buttonBackgroundColor);
                    myMdwHelper.changeIconElement($item, listItemObj.image, 'auto', iconHeight + 'px', listItemObj.imageColor);
                }
            }

            function getListItemObj(i, data, jsonData) {
                if (data.listItemDataMethod === 'inputPerEditor') {
                    // Data from Editor
                    return {
                        text: myMdwHelper.getValueFromData(data.attr('label' + i), ''),
                        subText: myMdwHelper.getValueFromData(data.attr('subLabel' + i), ''),
                        image: myMdwHelper.getValueFromData(data.attr('listImage' + i), ""),
                        imageColor: myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e"),
                        imageActive: myMdwHelper.getValueFromData(data.attr('listImageActive' + i), myMdwHelper.getValueFromData(data.attr('listImage' + i), "")),
                        imageActiveColor: myMdwHelper.getValueFromData(data.attr('listImageActiveColor' + i), myMdwHelper.getValueFromData(data.attr('listImageColor' + i), "#44739e")),
                        buttonBackgroundColor: myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), ''),
                        buttonBackgroundActiveColor: myMdwHelper.getValueFromData(data.attr('buttonBgColorActive' + i), myMdwHelper.getValueFromData(data.attr('buttonBgColor' + i), '')),
                        objectId: data.attr('oid' + i)
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
