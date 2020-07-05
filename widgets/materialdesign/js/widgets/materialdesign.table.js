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

            $this.get(0).style.setProperty("--materialdesign-color-table-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-border", myMdwHelper.getValueFromData(data.borderColor, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-header-row-background", myMdwHelper.getValueFromData(data.colorHeaderRowBackground, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-header-row-text-color", myMdwHelper.getValueFromData(data.colorHeaderRowText, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-row-background", myMdwHelper.getValueFromData(data.colorRowBackground, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-row-background-hover", myMdwHelper.getValueFromData(data.colorRowBackgroundHover, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-row-text-color", myMdwHelper.getValueFromData(data.colorRowText, ''));
            $this.get(0).style.setProperty("--materialdesign-color-table-row-divider", myMdwHelper.getValueFromData(data.dividers, ''));

            let headerFontSize = myMdwHelper.getFontSize(data.headerTextSize);

            let tableLayout = '';
            if (data.tableLayout === 'card') {
                tableLayout = 'materialdesign-list-card';
            } else if (data.tableLayout === 'cardOutlined') {
                tableLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            tableElement.push(`<div class="mdc-data-table ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'fixed-header' : ''} ${tableLayout}" style="width: 100%; height: 100%;">
                                    <table class="mdc-data-table__table" aria-label="Material Design Widgets Table" style="width: 100%; height: 100%;">`)

            tableElement.push(`<thead style="${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'position: sticky; top: 0;' : ''} ${myMdwHelper.getBooleanFromData(data.showHeader, false) ? '' : 'display: none;'}">
                                    <tr class="mdc-data-table__header-row" style="height: ${(myMdwHelper.getNumberFromData(data.headerRowHeight, null) !== null) ? data.headerRowHeight + 'px' : '1px'};">`)


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
                                                    <span class="mdi mdi-triangle materialdesign-icon-image materialdesign-table-header-sort materialdesign-table-header-sort-hidden"></span>
                                            </th>`)
                }
            }
            tableElement.push(`</tr>
                            </thead>
                            <tbody class="mdc-data-table__content">
                            </tbody>
                            </table>
                            </div>`);

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
                    let sortByKey = undefined;
                    let sortASC = true;

                    if (table) {
                        let height = window.getComputedStyle($this.context, null).height
                        $this.find('.mdc-data-table').css('height', height);

                        // $this.find('.mdc-data-table__table').css('height', height);

                        let heightHeader = window.getComputedStyle($this.find('.mdc-data-table__header-row').get(0), null).height;
                        $this.find('.mdc-data-table__content').css('height', (parseInt(height.replace('px', '')) - parseInt(heightHeader.replace('px', '')) - 2) + 'px');

                        const mdcTable = new mdc.dataTable.MDCDataTable(table);

                        // adding Content
                        if (myMdwHelper.getValueFromData(data.oid, null) !== null && myMdwHelper.getValueFromData(data.oid, null) !== 'nothing_selected' && vis.states.attr(data.oid + '.val') !== null) {
                            vis.binds.materialdesign.table.getContentElements($this, vis.states.attr(data.oid + '.val'), data);
                        } else {
                            if (data.dataJson) {
                                vis.binds.materialdesign.table.getContentElements($this, data.dataJson, data);
                            }
                        }

                        // Content changed
                        vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                            vis.binds.materialdesign.table.getContentElements($this, newVal, data, null, oldVal, sortByKey, sortASC);
                        });

                        $this.find('.mdc-data-table__header-cell').click(function (obj) {
                            let colIndex = $(this).attr('colIndex');

                            let jsonData = [];
                            if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                                jsonData = vis.binds.materialdesign.table.getJsonData(vis.states.attr(data.oid + '.val'), data);
                            } else {
                                jsonData = JSON.parse(data.dataJson)
                            }

                            if (jsonData && jsonData.length > 0) {
                                sortByKey = (myMdwHelper.getValueFromData(data.attr('sortKey' + colIndex), null) !== null) ? data.attr('sortKey' + colIndex) : Object.keys(jsonData[0])[colIndex];

                                if ($(this).attr('sort')) {
                                    if ($(this).attr('sort') === 'ASC') {
                                        sortASC = false;
                                        $(this).attr('sort', 'DESC');
                                        $(this).find('.materialdesign-table-header-sort').removeClass('materialdesign-table-header-sort-hidden').removeClass('mdi-rotate-180').css('opacity', '1')
                                    } else {
                                        sortASC = true;
                                        $(this).attr('sort', 'ASC');
                                        $(this).find('.materialdesign-table-header-sort').removeClass('materialdesign-table-header-sort-hidden').addClass('mdi-rotate-180').css('opacity', '1')
                                    }
                                } else {
                                    // sort order is not defined -> sortASC
                                    sortASC = true;
                                    $(this).attr('sort', 'ASC');
                                    $(this).find('.materialdesign-table-header-sort').removeClass('materialdesign-table-header-sort-hidden').addClass('mdi-rotate-180').css('opacity', '1');
                                }


                                $('.mdc-data-table__header-cell').each(function () {
                                    if ($(this).attr('colIndex') !== colIndex) {
                                        $(this).find('.materialdesign-table-header-sort').css('opacity', '0').addClass('materialdesign-table-header-sort-hidden');
                                    }
                                });

                                vis.binds.materialdesign.table.getContentElements($this, null, data, vis.binds.materialdesign.table.sortByKey(jsonData, sortByKey, sortASC));      //TODO: sort key by user defined
                            }
                        });
                    }
                });
            });
        } catch (ex) {
            console.error(`[Table - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getContentElements: function ($this, input, data, jsonData = null, oldVal = null, sortByKey = undefined, sortASC = true) {
        let tableContent = $this.find('.mdc-data-table__content');
        let oldJsonData = null;
        let rowsCount = 0;

        if (jsonData === null) {
            jsonData = vis.binds.materialdesign.table.getJsonData(input, data);

            if (sortByKey) jsonData = vis.binds.materialdesign.table.sortByKey(jsonData, sortByKey, sortASC);

            rowsCount = jsonData.length - 1;
        } else {
            rowsCount = jsonData.length - 1;
        }

        if (oldVal !== null) {
            oldJsonData = vis.binds.materialdesign.table.getJsonData(oldVal, data);

            if (sortByKey) oldJsonData = vis.binds.materialdesign.table.sortByKey(oldJsonData, sortByKey, sortASC);

            if (rowsCount < oldJsonData.length - 1) {
                rowsCount = oldJsonData.length - 1;
            }
        }

        let existingRowsCount = tableContent.find('tr').length - 1
        if (rowsCount < existingRowsCount) {
            rowsCount = existingRowsCount
        }

        if (jsonData && jsonData != null) {
            for (var row = 0; row <= rowsCount; row++) {
                let $row = tableContent.find(`#row${row}`)

                // row not exist -> create
                if ($row.length === 0) {
                    if (jsonData[row]) {
                        tableContent.append(`<tr class="mdc-data-table__row" id="row${row}" style="height: ${(myMdwHelper.getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : '1px'};">
                                        </tr>`)

                        // col items is object
                        let until = (Object.keys(jsonData[row]).length - 1 > data.countCols) ? data.countCols : Object.keys(jsonData[row]).length - 1;

                        for (var col = 0; col <= until; col++) {
                            if (data.attr('showColumn' + col) && Object.values(jsonData[row])) {

                                let textSize = myMdwHelper.getFontSize(data.attr('colTextSize' + col));

                                let colElement = getColElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]);
                                tableContent.find(`#row${row}`).append(colElement);
                            }
                        }
                    }
                } else if ($row.length === 1) {
                    // row exist -> update cols
                    if (jsonData[row]) {
                        // col items is object
                        let colsCount = Object.keys(jsonData[row]).length - 1;

                        if (oldJsonData && oldJsonData[row] && colsCount < Object.keys(oldJsonData[row]).length - 1) {
                            colsCount = Object.keys(oldJsonData[row]).length - 1;
                        }

                        if (colsCount > data.countCols) {
                            colsCount = data.countCols;
                        }

                        let existingColsCount = $row.find('td').length - 1;
                        if (colsCount < existingColsCount) {
                            colsCount = existingColsCount;
                        }

                        for (var col = 0; col <= colsCount; col++) {
                            if (data.attr('showColumn' + col)) {
                                let textSize = myMdwHelper.getFontSize(data.attr('colTextSize' + col));

                                let existingCell = $this.find(`#cell-row${row}-col${col}`);
                                if (Object.values(jsonData[row])) {
                                    if (existingCell.length === 1) {
                                        if (oldJsonData) {
                                            if (oldJsonData[row] && !myUnderscore.isEqual(Object.values(jsonData[row])[col], Object.values(oldJsonData[row])[col])) {
                                                let colElement = getColElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]);
                                                existingCell.replaceWith($(colElement));
                                            }
                                        } else {
                                            let colElement = getColElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]);
                                            existingCell.replaceWith($(colElement));
                                        }
                                    } else {
                                        let colElement = getColElement(row, col, Object.values(jsonData[row])[col], textSize, jsonData[row]);
                                        tableContent.find(`#row${row}`).append(colElement);
                                    }
                                } else {
                                    existingCell.closest('td').remove();
                                }
                            }
                        }
                    } else {
                        $this.find(`#row${row}`).closest('tr').remove();
                    }
                }
            }

            function getColElement(row, col, objValue, textSize, rowData = null) {
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
                    objValue = `<img src="${objValue}" style="max-height: ${(myMdwHelper.getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : 'auto'}; auto; vertical-align: middle; max-width: ${myMdwHelper.getValueFromData(data.attr('imageSize' + col), '', '', 'px;')}">`;
                }

                let element = `${prefix}${objValue}${suffix}`

                if (typeof (objValue) === 'object') {
                    let elementData = vis.binds.materialdesign.table.getElementData(objValue, data.wid);

                    if (objValue.type === 'buttonToggle' || objValue.type === 'buttonToggle_vertical') {

                        let init = vis.binds.materialdesign.button.initializeButton(elementData);
                        if (objValue.type === 'buttonToggle_vertical') {
                            init = vis.binds.materialdesign.button.initializeVerticalButton(elementData);
                        }

                        element = `<div class="vis-widget materialdesign-widget materialdesign-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button Toggle', true);

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });
                    } else if (objValue.type === 'buttonToggle_icon') {
                        let init = vis.binds.materialdesign.button.initializeButton(elementData, true);

                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button Toggle Icon', true);

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Icon', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData, true);
                            vis.binds.materialdesign.button.handleToggle(btn, elementData);
                        });

                    } else if (objValue.type === 'buttonState' || objValue.type === 'buttonState_vertical') {

                        let init = vis.binds.materialdesign.button.initializeButton(elementData);
                        if (objValue.type === 'buttonState_vertical') {
                            init = vis.binds.materialdesign.button.initializeVerticalButton(elementData);
                        }

                        element = `<div class="vis-widget materialdesign-widget materialdesign-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button State', true);

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button State', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData);
                            vis.binds.materialdesign.button.handleState(btn, elementData);
                        });

                    } else if (objValue.type === 'buttonState_icon') {
                        let init = vis.binds.materialdesign.button.initializeButton(elementData, true);

                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button State Icon', true);

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button State Icon', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData, true);
                            vis.binds.materialdesign.button.handleState(btn, elementData);
                        });


                    } else if (objValue.type === 'buttonLink' || objValue.type === 'buttonLink_vertical') {

                        let init = vis.binds.materialdesign.button.initializeButton(elementData);
                        if (objValue.type === 'buttonLink_vertical') {
                            init = vis.binds.materialdesign.button.initializeVerticalButton(elementData);
                        }

                        element = `<div class="vis-widget materialdesign-widget materialdesign-button ${init.style} materialdesign-button-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Link', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData);
                            vis.binds.materialdesign.button.handleLink(btn, elementData);
                        });

                    } else if (objValue.type === 'buttonLink_icon') {
                        let init = vis.binds.materialdesign.button.initializeButton(elementData, true);

                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                        ${init.button}
                                    </div>`

                        myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Link Icon', function () {
                            let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`).children().get(0);
                            vis.binds.materialdesign.addRippleEffect(btn, elementData, true);
                            vis.binds.materialdesign.button.handleLink(btn, elementData);
                        });

                    } else if (objValue.type === 'progress') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 12px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.linear(progress, elementData);
                            });
                        });
                    } else if (objValue.type === 'progress_circular') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-circular-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress Circular', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress Circular', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-progress-circular-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let progress = $this.find(`.materialdesign-progress-circular-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.progress.circular(progress, elementData);
                            });
                        });
                    } else if (objValue.type === 'slider') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-slider-vertical materialdesign-slider-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${elementData["oid-working"]}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-slider-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let slider = $this.find(`.materialdesign-slider-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.slider.vuetifySlider(slider, elementData);
                            });
                        });

                    } else if (objValue.type === 'slider_round') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-slider-round materialdesign-slider-round-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${elementData["oid-working"]}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider Round', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider Round', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-slider-round-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                let slider = $this.find(`.materialdesign-slider-round-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.roundslider(slider, elementData);
                            });
                        });
                    } else if (objValue.type === 'switch') {
                        let init = vis.binds.materialdesign.switch.initialize(elementData);

                        element = `<div class="vis-widget materialdesign-widget mdc-form-field ${init.labelPosition} materialdesign-switch materialdesign-switch-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 50px;'}">
                                        ${init.myswitch}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Switch', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Switch', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-switch-table-row_${row}-col_${col}`, data.wid, 'Table Switch', function () {
                                let sw = $this.find(`.materialdesign-switch-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.switch.handle(sw, elementData);
                            });
                        });
                    } else if (objValue.type === 'checkbox') {
                        let init = vis.binds.materialdesign.checkbox.initialize(elementData);

                        element = `<div class="vis-widget materialdesign-widget mdc-form-field ${init.labelPosition} materialdesign-checkbox materialdesign-checkbox-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 50px;'}">
                                        ${init.checkbox}
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Checkbox', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Checkbox', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-checkbox-table-row_${row}-col_${col}`, data.wid, 'Table Checkbox', function () {
                                let checkbox = $this.find(`.materialdesign-checkbox-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.checkbox.handle(checkbox, elementData);
                            });
                        });
                    } else if (objValue.type === 'textfield') {

                        element = `<div class="vis-widget materialdesign-widget materialdesign-input materialdesign-input-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Textfield', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Textfield', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-input-table-row_${row}-col_${col}`, data.wid, 'Table Textfield', function () {
                                let input = $this.find(`.materialdesign-input-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.textfield(input, elementData);
                            });
                        });

                    } else if (objValue.type === 'select') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-select materialdesign-select-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Select', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Select', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-select-table-row_${row}-col_${col}`, data.wid, 'Table Select', function () {
                                let select = $this.find(`.materialdesign-select-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.select(select, elementData);
                            });
                        });

                    } else if (objValue.type === 'autocomplete') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-autocomplete materialdesign-autocomplete-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Autocomplete', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Autocomplete', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-autocomplete-table-row_${row}-col_${col}`, data.wid, 'Table Autocomplete', function () {
                                let autocomplete = $this.find(`.materialdesign-autocomplete-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.autocomplete(autocomplete, elementData);
                            });
                        });

                    } else if (objValue.type === 'materialdesignicon') {
                        element = `<div class="vis-widget materialdesign-widget materialdesign-icon materialdesign-icon-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : ''} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                        myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table MaterialDesignIcons', true);

                        myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Autocomplete', function () {
                            myMdwHelper.waitForElement($this, `.materialdesign-icon-table-row_${row}-col_${col}`, data.wid, 'Table MaterialDesignIcons', function () {
                                let icons = $this.find(`.materialdesign-icon-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.materialdesignicons.initialize(icons, elementData);
                            });
                        });

                    } else if (objValue.type === 'html') {
                        element = objValue.html;
                    }
                }

                return `<td class="mdc-data-table__cell ${textSize.class}"
                            id="cell-row${row}-col${col}"
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
        }
    },
    getJsonData: function (input, data) {
        let jsonData = [];

        if (input && typeof input === 'string') {
            try {
                jsonData = JSON.parse(input)
            } catch (err) {
                console.error(`[Table - ${data.wid}] getJsonData: cannot parse json string! input: ${input}, error: ${err.message}`);
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
        } else if (obj.type === 'buttonState') {
            return {
                wid: widgetId,

                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                buttontext: obj.buttontext,
                colorPress: obj.colorPress,
                labelWidth: obj.labelWidth,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (obj.type === 'buttonState_vertical') {
            return {
                wid: widgetId,

                oid: obj.oid,
                buttonStyle: obj.buttonStyle,
                value: obj.value,
                buttontext: obj.buttontext,
                colorPress: obj.colorPress,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (obj.type === 'buttonState_icon') {
            return {
                wid: widgetId,

                oid: obj.oid,
                value: obj.value,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,
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
        } else if (obj.type === 'buttonLink') {
            return {
                wid: widgetId,

                buttonStyle: obj.buttonStyle,
                href: obj.href,
                openNewWindow: obj.openNewWindow,
                buttontext: obj.buttontext,
                colorPress: obj.colorPress,
                labelWidth: obj.labelWidth,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight
            }
        } else if (obj.type === 'buttonLink_vertical') {
            return {
                wid: widgetId,

                buttonStyle: obj.buttonStyle,
                href: obj.href,
                openNewWindow: obj.openNewWindow,
                buttontext: obj.buttontext,
                colorPress: obj.colorPress,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconPosition: obj.iconPosition,
                iconHeight: obj.iconHeight
            }
        } else if (obj.type === 'buttonLink_icon') {
            return {
                wid: widgetId,

                href: obj.href,
                openNewWindow: obj.openNewWindow,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                image: obj.image,
                imageColor: obj.imageColor,
                iconHeight: obj.iconHeight,
                colorPress: obj.colorPress
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
                valueLabelStyle: obj.valueLabelStyle,
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
                readOnly: obj.readOnly,
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
                valueLabelStyle: obj.valueLabelStyle,
                valueLabelUnit: obj.valueLabelUnit,
                valueLabelMin: obj.valueLabelMin,
                valueLabelMax: obj.valueLabelMax,
                valueLessThan: obj.valueLessThan,
                textForValueLessThan: obj.textForValueLessThan,
                valueGreaterThan: obj.valueGreaterThan,
                textForValueGreaterThan: obj.textForValueGreaterThan
            }
        } else if (obj.type === 'switch') {
            return {
                wid: widgetId,

                oid: obj.oid,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                labelFalse: obj.labelFalse,
                labelTrue: obj.labelTrue,
                labelPosition: obj.labelPosition,
                labelClickActive: obj.labelClickActive,
                colorSwitchThumb: obj.colorSwitchThumb,
                colorSwitchTrack: obj.colorSwitchTrack,
                colorSwitchTrue: obj.colorSwitchTrue,
                colorSwitchHover: obj.colorSwitchHover,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (obj.type === 'checkbox') {
            return {
                wid: widgetId,

                oid: obj.oid,
                readOnly: obj.readOnly,
                toggleType: obj.toggleType,
                valueOff: obj.valueOff,
                valueOn: obj.valueOn,
                stateIfNotTrueValue: obj.stateIfNotTrueValue,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                labelFalse: obj.labelFalse,
                labelTrue: obj.labelTrue,
                labelPosition: obj.labelPosition,
                labelClickActive: obj.labelClickActive,
                colorCheckBox: obj.colorCheckBox,
                labelColorFalse: obj.labelColorFalse,
                labelColorTrue: obj.labelColorTrue,
                lockEnabled: obj.lockEnabled,
                autoLockAfter: obj.autoLockAfter,
                lockIcon: obj.lockIcon,
                lockIconTop: obj.lockIconTop,
                lockIconLeft: obj.lockIconLeft,
                lockIconSize: obj.lockIconSize,
                lockIconColor: obj.lockIconColor,
                lockFilterGrayscale: obj.lockFilterGrayscale
            }
        } else if (obj.type === 'textfield') {
            return {
                wid: widgetId,


                oid: obj.oid,
                inputType: obj.inputType,
                inputMask: obj.inputMask,
                inputMaxLength: obj.inputMaxLength,
                inputLayout: obj.inputLayout,
                inputLayoutBackgroundColor: obj.inputLayoutBackgroundColor,
                inputLayoutBackgroundColorHover: obj.inputLayoutBackgroundColorHover,
                inputLayoutBackgroundColorSelected: obj.inputLayoutBackgroundColorSelected,
                inputLayoutBorderColor: obj.inputLayoutBorderColor,
                inputLayoutBorderColorHover: obj.inputLayoutBorderColorHover,
                inputLayoutBorderColorSelected: obj.inputLayoutBorderColorSelected,
                inputTextFontFamily: obj.inputTextFontFamily,
                inputTextFontSize: obj.inputTextFontSize,
                inputTextColor: obj.inputTextColor,
                inputLabelText: obj.inputLabelText,
                inputLabelColor: obj.inputLabelColor,
                inputLabelColorSelected: obj.inputLabelColorSelected,
                inputLabelFontFamily: obj.inputLabelFontFamily,
                inputLabelFontSize: obj.inputLabelFontSize,
                inputTranslateX: obj.inputTranslateX,
                inputTranslateY: obj.inputTranslateY,
                inputPrefix: obj.inputPrefix,
                inputSuffix: obj.inputSuffix,
                inputAppendixColor: obj.inputAppendixColor,
                inputAppendixFontSize: obj.inputAppendixFontSize,
                inputAppendixFontFamily: obj.inputAppendixFontFamily,
                showInputMessageAlways: obj.showInputMessageAlways,
                inputMessage: obj.inputMessage,
                inputMessageFontFamily: obj.inputMessageFontFamily,
                inputMessageFontSize: obj.inputMessageFontSize,
                inputMessageColor: obj.inputMessageColor,
                showInputCounter: obj.showInputCounter,
                inputCounterColor: obj.inputCounterColor,
                inputCounterFontSize: obj.inputCounterFontSize,
                inputCounterFontFamily: obj.inputCounterFontFamily,
                clearIconShow: obj.clearIconShow,
                clearIcon: obj.clearIcon,
                clearIconSize: obj.clearIconSize,
                clearIconColor: obj.clearIconColor,
                prepandIcon: obj.prepandIcon,
                prepandIconSize: obj.prepandIconSize,
                prepandIconColor: obj.prepandIconColor,
                prepandInnerIcon: obj.prepandInnerIcon,
                prepandInnerIconSize: obj.prepandInnerIconSize,
                prepandInnerIconColor: obj.prepandInnerIconColor,
                appendIcon: obj.appendIcon,
                appendIconSize: obj.appendIconSize,
                appendIconColor: obj.appendIconColor,
                appendOuterIcon: obj.appendOuterIcon,
                appendOuterIconSize: obj.appendOuterIconSize,
                appendOuterIconColor: obj.appendOuterIconColor
            }
        } else if (obj.type === 'select') {
            let data = {
                wid: widgetId,

                oid: obj.oid,
                inputType: obj.inputType,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                inputLayout: obj.inputLayout,
                inputLayoutBackgroundColor: obj.inputLayoutBackgroundColor,
                inputLayoutBackgroundColorHover: obj.inputLayoutBackgroundColorHover,
                inputLayoutBackgroundColorSelected: obj.inputLayoutBackgroundColorSelected,
                inputLayoutBorderColor: obj.inputLayoutBorderColor,
                inputLayoutBorderColorHover: obj.inputLayoutBorderColorHover,
                inputLayoutBorderColorSelected: obj.inputLayoutBorderColorSelected,
                inputTextFontFamily: obj.inputTextFontFamily,
                inputTextFontSize: obj.inputTextFontSize,
                inputTextColor: obj.inputTextColor,
                inputLabelText: obj.inputLabelText,
                inputLabelColor: obj.inputLabelColor,
                inputLabelColorSelected: obj.inputLabelColorSelected,
                inputLabelFontFamily: obj.inputLabelFontFamily,
                inputLabelFontSize: obj.inputLabelFontSize,
                inputTranslateX: obj.inputTranslateX,
                inputTranslateY: obj.inputTranslateY,
                inputPrefix: obj.inputPrefix,
                inputSuffix: obj.inputSuffix,
                inputAppendixColor: obj.inputAppendixColor,
                inputAppendixFontSize: obj.inputAppendixFontSize,
                inputAppendixFontFamily: obj.inputAppendixFontFamily,
                showInputMessageAlways: obj.showInputMessageAlways,
                inputMessage: obj.inputMessage,
                inputMessageFontFamily: obj.inputMessageFontFamily,
                inputMessageFontSize: obj.inputMessageFontSize,
                inputMessageColor: obj.inputMessageColor,
                showInputCounter: obj.showInputCounter,
                inputCounterColor: obj.inputCounterColor,
                inputCounterFontSize: obj.inputCounterFontSize,
                inputCounterFontFamily: obj.inputCounterFontFamily,
                clearIconShow: obj.clearIconShow,
                clearIcon: obj.clearIcon,
                clearIconSize: obj.clearIconSize,
                clearIconColor: obj.clearIconColor,
                collapseIcon: obj.collapseIcon,
                collapseIconSize: obj.collapseIconSize,
                collapseIconColor: obj.collapseIconColor,
                prepandIcon: obj.prepandIcon,
                prepandIconSize: obj.prepandIconSize,
                prepandIconColor: obj.prepandIconColor,
                prepandInnerIcon: obj.prepandInnerIcon,
                prepandInnerIconSize: obj.prepandInnerIconSize,
                prepandInnerIconColor: obj.prepandInnerIconColor,
                appendOuterIcon: obj.appendOuterIcon,
                appendOuterIconSize: obj.appendOuterIconSize,
                appendOuterIconColor: obj.appendOuterIconColor,
                listDataMethod: obj.listDataMethod,
                countSelectItems: obj.countSelectItems,
                jsonStringObject: obj.jsonStringObject,
                valueList: obj.valueList,
                valueListLabels: obj.valueListLabels,
                valueListIcons: obj.valueListIcons,
                listPosition: obj.listPosition,
                listPositionOffset: obj.listPositionOffset,
                listItemHeight: obj.listItemHeight,
                listItemBackgroundColor: obj.listItemBackgroundColor,
                listItemBackgroundHoverColor: obj.listItemBackgroundHoverColor,
                listItemBackgroundSelectedColor: obj.listItemBackgroundSelectedColor,
                listItemRippleEffectColor: obj.listItemRippleEffectColor,
                showSelectedIcon: obj.showSelectedIcon,
                listIconSize: obj.listIconSize,
                listIconColor: obj.listIconColor,
                listIconHoverColor: obj.listIconHoverColor,
                listIconSelectedColor: obj.listIconSelectedColor,
                listItemFontSize: obj.listItemFontSize,
                listItemFont: obj.listItemFont,
                listItemFontColor: obj.listItemFontColor,
                listItemFontHoverColor: obj.listItemFontHoverColor,
                listItemFontSelectedColor: obj.listItemFontSelectedColor,
                listItemSubFontSize: obj.listItemSubFontSize,
                listItemSubFont: obj.listItemSubFont,
                listItemSubFontColor: obj.listItemSubFontColor,
                listItemSubFontHoverColor: obj.listItemSubFontHoverColor,
                listItemSubFontSelectedColor: obj.listItemSubFontSelectedColor,
                showValue: obj.showValue,
                listItemValueFontSize: obj.listItemValueFontSize,
                listItemValueFont: obj.listItemValueFont,
                listItemValueFontColor: obj.listItemValueFontColor,
                listItemValueFontHoverColor: obj.listItemValueFontHoverColor,
                listItemValueFontSelectedColor: obj.listItemValueFontSelectedColor,
            }

            for (var i = 0; i <= obj.countSelectItems; i++) {
                data['value' + i] = obj['value' + i];
                data['label' + i] = obj['label' + i];
                data['subLabel' + i] = obj['subLabel' + i];
                data['listIcon' + i] = obj['listIcon' + i];
                data['listIconColor' + i] = obj['listIconColor' + i];
            }

            return data;

        } else if (obj.type === 'autocomplete') {
            let data = {
                wid: widgetId,

                oid: obj.oid,
                inputMode: obj.inputMode,
                inputType: obj.inputType,
                vibrateOnMobilDevices: obj.vibrateOnMobilDevices,
                inputLayout: obj.inputLayout,
                inputLayoutBackgroundColor: obj.inputLayoutBackgroundColor,
                inputLayoutBackgroundColorHover: obj.inputLayoutBackgroundColorHover,
                inputLayoutBackgroundColorSelected: obj.inputLayoutBackgroundColorSelected,
                inputLayoutBorderColor: obj.inputLayoutBorderColor,
                inputLayoutBorderColorHover: obj.inputLayoutBorderColorHover,
                inputLayoutBorderColorSelected: obj.inputLayoutBorderColorSelected,
                inputTextFontFamily: obj.inputTextFontFamily,
                inputTextFontSize: obj.inputTextFontSize,
                inputTextColor: obj.inputTextColor,
                inputLabelText: obj.inputLabelText,
                inputLabelColor: obj.inputLabelColor,
                inputLabelColorSelected: obj.inputLabelColorSelected,
                inputLabelFontFamily: obj.inputLabelFontFamily,
                inputLabelFontSize: obj.inputLabelFontSize,
                inputTranslateX: obj.inputTranslateX,
                inputTranslateY: obj.inputTranslateY,
                inputPrefix: obj.inputPrefix,
                inputSuffix: obj.inputSuffix,
                inputAppendixColor: obj.inputAppendixColor,
                inputAppendixFontSize: obj.inputAppendixFontSize,
                inputAppendixFontFamily: obj.inputAppendixFontFamily,
                showInputMessageAlways: obj.showInputMessageAlways,
                inputMessage: obj.inputMessage,
                inputMessageFontFamily: obj.inputMessageFontFamily,
                inputMessageFontSize: obj.inputMessageFontSize,
                inputMessageColor: obj.inputMessageColor,
                showInputCounter: obj.showInputCounter,
                inputCounterColor: obj.inputCounterColor,
                inputCounterFontSize: obj.inputCounterFontSize,
                inputCounterFontFamily: obj.inputCounterFontFamily,
                clearIconShow: obj.clearIconShow,
                clearIcon: obj.clearIcon,
                clearIconSize: obj.clearIconSize,
                clearIconColor: obj.clearIconColor,
                collapseIcon: obj.collapseIcon,
                collapseIconSize: obj.collapseIconSize,
                collapseIconColor: obj.collapseIconColor,
                prepandIcon: obj.prepandIcon,
                prepandIconSize: obj.prepandIconSize,
                prepandIconColor: obj.prepandIconColor,
                prepandInnerIcon: obj.prepandInnerIcon,
                prepandInnerIconSize: obj.prepandInnerIconSize,
                prepandInnerIconColor: obj.prepandInnerIconColor,
                appendOuterIcon: obj.appendOuterIcon,
                appendOuterIconSize: obj.appendOuterIconSize,
                appendOuterIconColor: obj.appendOuterIconColor,
                listDataMethod: obj.listDataMethod,
                countSelectItems: obj.countSelectItems,
                jsonStringObject: obj.jsonStringObject,
                valueList: obj.valueList,
                valueListLabels: obj.valueListLabels,
                valueListIcons: obj.valueListIcons,
                listPosition: obj.listPosition,
                listPositionOffset: obj.listPositionOffset,
                listItemHeight: obj.listItemHeight,
                listItemBackgroundColor: obj.listItemBackgroundColor,
                listItemBackgroundHoverColor: obj.listItemBackgroundHoverColor,
                listItemBackgroundSelectedColor: obj.listItemBackgroundSelectedColor,
                listItemRippleEffectColor: obj.listItemRippleEffectColor,
                showSelectedIcon: obj.showSelectedIcon,
                listIconSize: obj.listIconSize,
                listIconColor: obj.listIconColor,
                listIconHoverColor: obj.listIconHoverColor,
                listIconSelectedColor: obj.listIconSelectedColor,
                listItemFontSize: obj.listItemFontSize,
                listItemFont: obj.listItemFont,
                listItemFontColor: obj.listItemFontColor,
                listItemFontHoverColor: obj.listItemFontHoverColor,
                listItemFontSelectedColor: obj.listItemFontSelectedColor,
                listItemSubFontSize: obj.listItemSubFontSize,
                listItemSubFont: obj.listItemSubFont,
                listItemSubFontColor: obj.listItemSubFontColor,
                listItemSubFontHoverColor: obj.listItemSubFontHoverColor,
                listItemSubFontSelectedColor: obj.listItemSubFontSelectedColor,
                showValue: obj.showValue,
                listItemValueFontSize: obj.listItemValueFontSize,
                listItemValueFont: obj.listItemValueFont,
                listItemValueFontColor: obj.listItemValueFontColor,
                listItemValueFontHoverColor: obj.listItemValueFontHoverColor,
                listItemValueFontSelectedColor: obj.listItemValueFontSelectedColor,
            }

            for (var i = 0; i <= obj.countSelectItems; i++) {
                data['value' + i] = obj['value' + i];
                data['label' + i] = obj['label' + i];
                data['subLabel' + i] = obj['subLabel' + i];
                data['listIcon' + i] = obj['listIcon' + i];
                data['listIconColor' + i] = obj['listIconColor' + i];
            }

            return data;
        } else if (obj.type === 'materialdesignicon') {
            return {
                wid: widgetId,

                mdwIcon: obj.mdwIcon,
                mdwIconSize: obj.mdwIconSize,
                mdwIconColor: obj.mdwIconColor
            }

        } else if (obj.type === 'html') {
            return obj.html;
        }
    },
    sortByKey: function (array, key, sortASC) {
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
};