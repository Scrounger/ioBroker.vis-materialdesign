/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.54"

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
                if (listItemObj.listType === 'text') {
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
                        ${(data.showValueLabel && (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState')) ? '<label class="materialdesign-icon-list-item-value"></label>' : ''}
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


            myMdwHelper.waitForElement($this, `.materialdesign-icon-list-container`, function () {
                console.log('div find');

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

                        if (listItemObj.listType !== 'text') {
                            vis.binds.materialdesign.helper.vibrate(data.vibrateOnMobilDevices);
                        }

                        if (listItemObj.listType === 'buttonToggle') {
                            let selectedValue = vis.states.attr(listItemObj.objectId + '.val');

                            vis.setValue(listItemObj.objectId, !selectedValue);

                            setLayout(index, !selectedValue, listItemObj);
                        } else if (listItemObj.listType === 'buttonState') {
                            let valueToSet = listItemObj.buttonStateValue;
                            vis.setValue(listItemObj.objectId, valueToSet);

                            setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);
                        } else if (listItemObj.listType === 'buttonToggleValueTrue') {
                            let val = vis.states.attr(listItemObj.objectId + '.val');

                            if (val === listItemObj.buttonToggleValueTrue || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueTrue)) {
                                vis.setValue(listItemObj.objectId, listItemObj.buttonToggleValueFalse);
                            } else {
                                vis.setValue(listItemObj.objectId, listItemObj.buttonToggleValueTrue);
                            }

                            setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);

                        } else if (listItemObj.listType === 'buttonToggleValueFalse') {
                            let val = vis.states.attr(listItemObj.objectId + '.val');

                            if (val === listItemObj.buttonToggleValueFalse || parseFloat(val) === parseFloat(listItemObj.buttonToggleValueFalse)) {
                                vis.setValue(listItemObj.objectId, listItemObj.buttonToggleValueTrue);
                            } else {
                                vis.setValue(listItemObj.objectId, listItemObj.buttonToggleValueFalse);
                            }

                            setLayout(index, vis.states.attr(listItemObj.objectId + '.val'), listItemObj);

                        } else if (listItemObj.listType === 'buttonNav') {
                            vis.changeView(listItemObj.buttonNavView);
                        } else if (listItemObj.listType === 'buttonLink') {
                            window.open(listItemObj.buttonLink);
                        }
                    });



                    if (listItemObj.listType.includes('buttonToggle') || listItemObj.listType === 'buttonState') {
                        console.log('onLoad');
                        // on Load & bind to object ids
                        let valOnLoading = vis.states.attr(listItemObj.objectId + '.val');
                        setLayout(i, valOnLoading, listItemObj);

                        vis.states.bind(listItemObj.objectId + '.val', function (e, newVal, oldVal) {
                            let input = $this.find('div[data-oid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

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

                console.log(listItemObj.objectId + ": " + val);
                console.log(vis.states.attr(listItemObj.objectId + '.val'));

                $item.find('.materialdesign-icon-list-item-value').text(val);

                if (listItemObj.listType === 'buttonState') {
                    // buttonState -> show as active if value is state value
                    if (val === listItemObj.buttonStateValue) {
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
                        listType: myMdwHelper.getValueFromData(data.attr('listType' + i), 'text'),
                        objectId: data.attr('oid' + i),
                        buttonStateValue: data.attr('listTypeButtonStateValue' + i),
                        buttonNavView: data.attr('listTypeButtonNav' + i),
                        buttonLink: data.attr('listTypeButtonLink' + i),
                        buttonToggleValueTrue: data.attr('typeButtonToggleValueTrue' + i),
                        buttonToggleValueFalse: data.attr('typeButtonToggleValueFalse' + i)
                    };
                } else {
                    // Data from json
                    return {
                        text: myMdwHelper.getValueFromData(jsonData[i].text, ''),
                        subText: myMdwHelper.getValueFromData(jsonData[i].subText, ''),
                        image: myMdwHelper.getValueFromData(jsonData[i].image, ""),
                        imageColor: myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e"),
                        imageActive: myMdwHelper.getValueFromData(jsonData[i].imageActive, myMdwHelper.getValueFromData(jsonData[i].image, "")),
                        imageActiveColor: myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, myMdwHelper.getValueFromData(jsonData[i].imageColor, "#44739e")),
                        buttonBackgroundColor: myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, ''),
                        buttonBackgroundActiveColor: myMdwHelper.getValueFromData(jsonData[i].buttonBackgroundActiveColor, myMdwHelper.getValueFromData(jsonData[i].imageActiveColor, '')),
                        listType: myMdwHelper.getValueFromData(jsonData[i].listType, 'text'),
                        objectId: jsonData[i].objectId,
                        buttonStateValue: jsonData[i].buttonStateValue,
                        buttonNavView: jsonData[i].buttonNavView,
                        buttonLink: jsonData[i].buttonLink,
                        buttonToggleValueTrue: jsonData[i].buttonToggleValueTrue,
                        buttonToggleValueFalse: jsonData[i].buttonToggleValueFalse
                    };
                }
            }
        } catch (ex) {
            console.error(`[List] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }