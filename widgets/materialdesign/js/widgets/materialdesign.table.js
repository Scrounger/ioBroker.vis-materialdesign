/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.table = {
    initialize: function (el, data) {
        try {
            let $this = $(el);
            let tableElement = []

            let headerFontSize = myMdwHelper.getFontSize(data.headerTextSize);

            let tableLayout = '';
            if (data.tableLayout === 'card') {
                tableLayout = 'materialdesign-list-card';
            } else if (data.tableLayout === 'cardOutlined') {
                tableLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            tableElement.push(`<div class="mdc-data-table ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'fixed-header' : ''} ${tableLayout}" style="width: 100%;">
                                    <table class="mdc-data-table__table" aria-label="Material Design Widgets Table">`)

            tableElement.push(`<thead ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'style="position: sticky; top: 0;"' : ''}>
                                    <tr class="mdc-data-table__header-row" style="height: ${(myMdwHelper.getNumberFromData(data.headerRowHeight, null) !== null) ? data.headerRowHeight + 'px' : '1px'};">`)



            if (data.showHeader) {
                for (var i = 0; i <= data.countCols; i++) {
                    if (data.attr('showColumn' + i)) {
                        tableElement.push(`<th class="mdc-data-table__header-cell ${headerFontSize.class}" 
                                            colIndex="${i}" 
                                            role="columnheader" 
                                            scope="col" 
                                            style="text-align: ${data.attr('textAlign' + i)};
                                                ${headerFontSize.style}; 
                                                padding-left: ${myMdwHelper.getNumberFromData(data.attr('padding_left' + i), 8)}px; 
                                                padding-right: ${myMdwHelper.getNumberFromData(data.attr('padding_right' + i), 8)}px; 
                                                font-family: ${myMdwHelper.getValueFromData(data.headerFontFamily, '')};
                                                ${(myMdwHelper.getNumberFromData(data.attr('columnWidth' + i), null) !== null) ? `width: ${data.attr('columnWidth' + i)}px;` : ''};">
                                                    ${myMdwHelper.getValueFromData(data.attr('label' + i), 'col ' + i)}
                                            </th>`)
                    }
                }
            }
            tableElement.push(`</tr>
                            </thead>`);


            tableElement.push(`<tbody class="mdc-data-table__content">`);

            // adding Content
            if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                tableElement.push(vis.binds.materialdesign.table.getContentElements($this, vis.states.attr(data.oid + '.val'), data));
            } else {
                tableElement.push(vis.binds.materialdesign.table.getContentElements($this, data.dataJson, data));
            }

            tableElement.push(`</tbody>`);


            tableElement.push(`</table>
                            </div>`)

            return tableElement.join('');
        } catch (ex) {
            console.error(`[Table - ${data.wid}] initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handle: function (el, data) {
        try {
            let $this = $(el);
            $this.append(this.initialize(el, data));

            myMdwHelper.waitForElement($this, `.mdc-data-table`, data.wid, 'Table', function () {
                myMdwHelper.waitForRealHeight($this.context, data.wid, 'Table', function () {
                    let table = $this.find('.mdc-data-table').get(0);

                    let height = window.getComputedStyle($this.context, null).height
                    $this.find('.mdc-data-table').css('height', height);
                    // $this.find('.mdc-data-table__table').css('height', height);

                    let heightHeader = window.getComputedStyle($this.find('.mdc-data-table__header-row').get(0), null).height;
                    $this.find('.mdc-data-table__content').css('height', (parseInt(height.replace('px', '')) - parseInt(heightHeader.replace('px', '')) - 2) + 'px');

                    table.style.setProperty("--materialdesign-color-table-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-border", myMdwHelper.getValueFromData(data.borderColor, ''));
                    table.style.setProperty("--materialdesign-color-table-header-row-background", myMdwHelper.getValueFromData(data.colorHeaderRowBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-header-row-text-color", myMdwHelper.getValueFromData(data.colorHeaderRowText, ''));
                    table.style.setProperty("--materialdesign-color-table-row-background", myMdwHelper.getValueFromData(data.colorRowBackground, ''));
                    table.style.setProperty("--materialdesign-color-table-row-text-color", myMdwHelper.getValueFromData(data.colorRowText, ''));
                    table.style.setProperty("--materialdesign-color-table-row-divider", myMdwHelper.getValueFromData(data.dividers, ''));

                    const mdcTable = new mdc.dataTable.MDCDataTable(table);

                    vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                        $this.find('.mdc-data-table__content').empty();
                        $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements($this, newVal, data));
                    });

                    $this.find('.mdc-data-table__header-cell').click(function (obj) {
                        let colIndex = $(this).attr('colIndex');
                        let sortASC = true;

                        let jsonData = [];
                        if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                            jsonData = vis.binds.materialdesign.table.getJsonData(vis.states.attr(data.oid + '.val'), data);
                        } else {
                            jsonData = JSON.parse(data.dataJson)
                        }

                        let key = (myMdwHelper.getValueFromData(data.attr('sortKey' + colIndex), null) !== null) ? data.attr('sortKey' + colIndex) : Object.keys(jsonData[0])[colIndex];

                        if ($(this).attr('sort')) {
                            if ($(this).attr('sort') === 'ASC') {
                                sortASC = false;
                                $(this).attr('sort', 'DESC');
                                ($(this).text().includes('▾') || $(this).text().includes('▴')) ?
                                    $(this).text($(this).text().replace('▾', '▴')) : $(this).text($(this).text() + '▴');
                            } else {
                                sortASC = true;
                                $(this).attr('sort', 'ASC');
                                ($(this).text().includes('▾') || $(this).text().includes('▴')) ?
                                    $(this).text($(this).text().replace('▴', '▾')) : $(this).text($(this).text() + '▾');
                            }
                        } else {
                            // sort order is not defined -> sortASC
                            sortASC = true;
                            $(this).attr('sort', 'ASC');
                            $(this).text($(this).text() + '▾');
                        }

                        $('.mdc-data-table__header-cell').each(function () {
                            if ($(this).attr('colIndex') !== colIndex) {
                                $(this).text($(this).text().replace('▴', '').replace('▾', ''));
                            }
                        });

                        $this.find('.mdc-data-table__content').empty();
                        $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements($this, null, data, sortByKey(jsonData, key, sortASC)));      //TODO: sort key by user defined

                        function sortByKey(array, key, sortASC) {
                            return array.sort(function (a, b) {
                                var x = a[key];
                                var y = b[key];

                                if (sortASC) {
                                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                                } else {
                                    return ((x > y) ? -1 : ((x < y) ? 1 : 0));
                                }
                            });
                        }
                    });
                });
            });
        } catch (ex) {
            console.error(`[Table - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getContentElements: function ($this, input, data, jsonData = null) {
        let contentElements = [];

        if (jsonData === null) {
            jsonData = vis.binds.materialdesign.table.getJsonData(input, data);
        }

        if (jsonData && jsonData != null) {

            for (var row = 0; row <= jsonData.length - 1; row++) {
                contentElements.push(`<tr class="mdc-data-table__row" style="height: ${(myMdwHelper.getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : '1px'};">`);

                if (jsonData[row]) {
                    // col items is object
                    let until = (Object.keys(jsonData[row]).length - 1 > data.countCols) ? data.countCols : Object.keys(jsonData[row]).length - 1;

                    for (var col = 0; col <= until; col++) {
                        if (data.attr('showColumn' + col)) {
                            let textSize = myMdwHelper.getFontSize(data.attr('colTextSize' + col));

                            contentElements.push(getContentElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]));
                        }
                    }
                }
                contentElements.push(`</tr>`);
            }

            function getContentElement(row, col, objValue, textSize, rowData = null) {
                let prefix = myMdwHelper.getValueFromData(data.attr('prefix' + col), '');
                let suffix = myMdwHelper.getValueFromData(data.attr('suffix' + col), '');

                if (rowData != null) {
                    if (prefix !== '') {
                        prefix = getInternalTableBinding(prefix, rowData);
                    }

                    if (suffix !== '') {
                        suffix = getInternalTableBinding(suffix, rowData);
                    }

                    function getInternalTableBinding(str, rowData) {
                        let regex = str.match(/(#\[obj\..*?\])/g);

                        if (regex && regex.length > 0) {
                            for (var i = 0; i <= regex.length - 1; i++) {
                                let objName = regex[i].replace('#[obj.', '').replace(']', '');

                                if (objName && rowData[objName]) {
                                    str = str.replace(regex[i], rowData[objName]);
                                } else {
                                    str = str.replace(regex[i], '');
                                }
                            }
                        }

                        return str;
                    }
                }

                if (data.attr('colType' + col) === 'image') {
                    objValue = `<img src="${objValue}" style="height: auto; vertical-align: middle; width: ${myMdwHelper.getValueFromData(data.attr('imageSize' + col), '', '', 'px;')}">`;
                }

                let element = `${prefix}${objValue}${suffix}`

                if (typeof (objValue) === 'object') {
                    let elementData = vis.binds.materialdesign.table.getElementData(objValue, data.wid);

                    if (objValue.type === 'buttonToggle' || objValue.type === 'buttonToggle_vertical') {

                        let init = vis.binds.materialdesign.button.initializeButton(elementData);
                        if (objValue.type === 'buttonToggle_vertical') {
                            init = vis.binds.materialdesign.button.initializeVerticalButton(elementData);
                        }

                        element = `<div class="vis-widget materialdesign-widget materialdesign-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });
                    } else if (objValue.type === 'buttonToggle_icon') {
                        let init = vis.binds.materialdesign.button.initializeButton(elementData, true);

                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData, true);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });
                    } else if (objValue.type === 'progress') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 12px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.linear(progress, elementData);
                            });
                        });
                    } else if (objValue.type === 'progress_circular') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-circular-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress Circular', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress Circular', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-circular-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-circular-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.circular(progress, elementData);
                            });
                        });
                    } else if (objValue.type === 'slider') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-slider-vertical materialdesign-slider-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${objValue["oid-working"]}" style="display: inline-block; position: relative; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                        </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-slider-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let slider = $this.find(`.materialdesign-slider-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.slider.vuetifySlider(slider, elementData);
                            });
                        });

                    } else if (objValue.type === 'slider_round') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-slider-round materialdesign-slider-round-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${objValue["oid-working"]}" style="display: inline-block; position: relative; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                        </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider Round', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider Round', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-slider-round-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let slider = $this.find(`.materialdesign-slider-round-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.roundslider(slider, elementData);
                            });
                        });
                    }
                }

                return `<td class="mdc-data-table__cell ${textSize.class}"
                            ${(objValue && objValue.rowspan) ? `rowspan="${objValue.rowspan}"` : ''}
                            ${(objValue && objValue.colspan) ? `colspan="${objValue.colspan}"` : ''}
                            style="
                            text-align: ${data.attr('textAlign' + col)};${textSize.style}; 
                            padding-left: ${myMdwHelper.getNumberFromData(data.attr('padding_left' + col), 8)}px; 
                            padding-right: ${myMdwHelper.getNumberFromData(data.attr('padding_right' + col), 8)}px; 
                            color: ${myMdwHelper.getValueFromData(data.attr('colTextColor' + col), '')}; 
                            font-family: ${myMdwHelper.getValueFromData(data.attr('fontFamily' + col), '')};
                            white-space: ${(data.attr('colNoWrap' + col) ? 'nowrap' : 'unset')};
                            ${(myMdwHelper.getNumberFromData(data.attr('columnWidth' + col), null) !== null) ? `width: ${data.attr('columnWidth' + col)}px;` : ''};
                            ">
                                ${element}
                        </td>`
            };

            return contentElements.join('');
        }
    },
    getJsonData: function (input, data) {
        let jsonData = [];

        if (input && typeof input === 'string') {
            try {
                jsonData = JSON.parse(input)
            } catch (err) {
                console.error(`[Table - ${data.wid}] getJsonData: input: ${input}, error: ${err.message}`);
            }
        } else {
            jsonData = input;

            if (!Array.isArray(jsonData)) {
                // convert to array
                jsonData = Object.keys(jsonData).map(function (_) { return jsonData[_]; });

                // extract data (json is diffrent to vis)
                let tmp = [];
                for (var i = 0; i <= Object.keys(jsonData).length - 1; i++) {
                    if (jsonData[i]._data) {
                        tmp.push(jsonData[i]._data);
                    }
                }
                jsonData = tmp;
            }
        }

        return jsonData;
    },
    getElementData: function (obj, widgetId) {
        if (obj.type === 'buttonToggle') {
            return {
                wid: widgetId,

                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                buttontext: obj.buttontext,
                labelTrue: obj.labelTrue,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                labelWidth: obj.labelWidth,
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,
                colorPress: obj.colorPress,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            };
        } else if (obj.type === 'buttonToggle_vertical') {
            return {
                wid: widgetId,

                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                buttontext: obj.buttontext,
                labelTrue: obj.labelTrue,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,
                colorPress: obj.colorPress,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }

        } else if (obj.type === 'buttonToggle_icon') {
            return {
                wid: widgetId,

                oid: obj.oid,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                pushButton: obj.pushButton,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                imageTrue: obj.imageTrue,
                imageTrueColor: obj.imageTrueColor,
                iconHeight: obj.iconHeight,
                colorBgFalse: obj.colorBgFalse,
                colorBgTrue: obj.colorBgTrue,
                colorPress: obj.colorPress,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (obj.type === 'progress') {
            return {
                wid: widgetId,

                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                reverse: obj.reverse,
                progressRounded: obj.progressRounded,
                progressStriped: obj.progressStriped,
                progressStripedColor: obj.progressStripedColor,
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustom: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily,
                textAlign: obj.textAlign
            }
        } else if (obj.type === 'progress_circular') {
            return {
                wid: widgetId,

                oid: obj.oid,
                min: obj.min,
                max: obj.max,
                progressCircularSize: obj.progressCircularSize,
                progressCircularWidth: obj.progressCircularWidth,
                progressCircularRotate: obj.progressCircularRotate,
                colorProgressBackground: obj.colorProgressBackground,
                colorProgress: obj.colorProgress,
                innerColor: obj.innerColor,
                colorOneCondition: obj.colorOneCondition,
                colorOne: obj.colorOne,
                colorTwoCondition: obj.colorTwoCondition,
                colorTwo: obj.colorTwo,
                showValueLabel: obj.showValueLabel,
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueMaxDecimals: obj.valueMaxDecimals,
                valueLabelCustom: obj.valueLabelCustom,
                textColor: obj.textColor,
                textFontSize: obj.textFontSize,
                textFontFamily: obj.textFontFamily
            }
        } else if (obj.type === 'slider') {
            return {
                wid: widgetId,

                oid: obj.oid,
                "oid-working": obj["oid-working"],
                orientation: obj.orientation,
                reverseSlider: obj.reverseSlider,
                knobSize: obj.knobSize,
                readOnly: obj.readOnly,
                min: obj.min,
                max: obj.max,
                step: obj.step,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                showTicks: obj.showTicks,
                tickSize: obj.tickSize,
                tickLabels: obj.tickLabels,
                tickColorBefore: obj.tickColorBefore,
                tickColorAfter: obj.tickColorAfter,
                colorBeforeThumb: obj.colorBeforeThumb,
                colorThumb: obj.colorThumb,
                colorAfterThumb: obj.colorAfterThumb,
                prepandText: obj.prepandText,
                prepandTextWidth: obj.prepandTextWidth,
                prepandTextColor: obj.prepandTextColor,
                prepandTextFontSize: obj.prepandTextFontSize,
                prepandTextFontFamily: obj.prepandTextFontFamily,
                showValueLabel: obj.showValueLabel,
                valueLabelUnit: obj.valueLabelUnit,
                valueLabelMin: obj.valueLabelMin,
                valueLabelMax: obj.valueLabelMax,
                valueLessThan: obj.valueLessThan,
                textForValueLessThan: obj.textForValueLessThan,
                valueGreaterThan: obj.valueGreaterThan,
                textForValueGreaterThan: obj.textForValueGreaterThan,
                valueLabelWidth: obj.valueLabelWidth,
                showThumbLabel: obj.showThumbLabel,
                thumbSize: obj.thumbSize,
                thumbBackgroundColor: obj.thumbBackgroundColor,
                thumbFontColor: obj.thumbFontColor,
                thumbFontSize: obj.thumbFontSize,
                thumbFontFamily: obj.thumbFontFamily,
                useLabelRules: obj.useLabelRules
            }
        } else if (obj.type === 'slider_round') {
            return {
                wid: widgetId,

                oid: obj.oid,
                "oid-working": obj["oid-working"],
                min: obj.min,
                max: obj.max,
                step: obj.step,
                startAngle: obj.startAngle,
                arcLength: obj.arcLength,
                sliderWidth: obj.sliderWidth,
                handleSize: obj.handleSize,
                handleZoom: obj.handleZoom,
                rtl: obj.rtl,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                colorSliderBg: obj.colorSliderBg,
                colorBeforeThumb: obj.colorBeforeThumb,
                colorThumb: obj.colorThumb,
                colorAfterThumb: obj.colorAfterThumb,
                valueLabelColor: obj.valueLabelColor,
                showValueLabel: obj.showValueLabel,
                valueLabelVerticalPosition: obj.valueLabelVerticalPosition,
                valueLabelUnit: obj.valueLabelUnit,
                valueLabelMin: obj.valueLabelMin,
                valueLabelMax: obj.valueLabelMax,
                valueLessThan: obj.valueLessThan,
                textForValueLessThan: obj.textForValueLessThan,
                valueGreaterThan: obj.valueGreaterThan,
                textForValueGreaterThan: obj.textForValueGreaterThan
            }
        }
    }
};