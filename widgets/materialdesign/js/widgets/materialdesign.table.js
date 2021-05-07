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
                tableLayout = 'materialdesign-table-card';
            } else if (data.tableLayout === 'cardOutlined') {
                tableLayout = 'materialdesign-table-card materialdesign-table-card--outlined';
            }

            tableElement.push(`<div class="mdc-data-table ${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'fixed-header' : ''} ${tableLayout}" ${myMdwHelper.getBooleanFromData(data.roundBorder, true) ? '' : 'style="border-radius: 0;"'}>
                                    <table class="mdc-data-table__table" aria-label="Material Design Widgets Table" style="width: 100%; height: 100%;">`)

            tableElement.push(`<thead style="${myMdwHelper.getBooleanFromData(data.fixedHeader, false) ? 'position: sticky; top: 0;' : ''}">
                                    <tr class="mdc-data-table__header-row" style="height: ${(myMdwHelper.getNumberFromData(data.headerRowHeight, null) !== null) ? data.headerRowHeight + 'px' : '1px'};">`)

            if (myMdwHelper.getBooleanFromData(data.showHeader, false)) {
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
        let widgetName = 'Table';

        try {
            let $this = $(el);

            myMdwHelper.subscribeThemesAtRuntime(data, widgetName);

            $this.append(vis.binds.materialdesign.table.initialize(el, data));

            myMdwHelper.waitForElement($this, `.mdc-data-table`, data.wid, 'Table', function () {
                myMdwHelper.waitForRealHeight($this.context, data.wid, 'Table', function () {
                    let table = $this.find('.mdc-data-table').get(0);
                    let sortByKey = undefined;
                    let sortASC = true;

                    if (table) {
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
                        function setLayout(changed) {
                            $this.get(0).style.setProperty("--materialdesign-color-table-background", myMdwHelper.getValueFromData(data.colorBackground, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-border", myMdwHelper.getValueFromData(data.borderColor, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-header-row-background", myMdwHelper.getValueFromData(data.colorHeaderRowBackground, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-header-row-text-color", myMdwHelper.getValueFromData(data.colorHeaderRowText, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-row-background", myMdwHelper.getValueFromData(data.colorRowBackground, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-row-background-hover", myMdwHelper.getValueFromData(data.colorRowBackgroundHover, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-row-text-color", myMdwHelper.getValueFromData(data.colorRowText, ''));
                            $this.get(0).style.setProperty("--materialdesign-color-table-row-divider", myMdwHelper.getValueFromData(data.dividers, ''));

                            let $headerRow = $this.find('.mdc-data-table__header-cell');
                            $headerRow.css('font-family', myMdwHelper.getValueFromData(data.headerFontFamily, ''));

                            let headerFontSize = myMdwHelper.getFontSize(data.headerTextSize);
                            if (headerFontSize && headerFontSize.style) {
                                $headerRow.css('font-size', myMdwHelper.getStringFromNumberData(data.headerTextSize, 'inherit', '', 'px'));
                            }

                            if (changed) {
                                for (var col = 0; col <= data.countCols; col++) {
                                    let $colCells = $this.find(`.mdc-data-table__cell[id*='col${col}']`)
                                    $colCells.css('font-family', myMdwHelper.getValueFromData(data.attr('fontFamily' + col), ''));

                                    let textSize = myMdwHelper.getFontSize(data.attr('colTextSize' + col));

                                    if (textSize && textSize.style) {
                                        $colCells.css('font-size', myMdwHelper.getStringFromNumberData(data.attr('colTextSize' + col), 'inherit', '', 'px'));
                                    }
                                }
                            }
                        }

                        $this.find('.mdc-data-table__header-cell').on('click', function (obj) {
                            let colIndex = $(this).attr('colIndex');

                            let jsonData = [];
                            if (myMdwHelper.getValueFromData(data.oid, null) !== null && vis.states.attr(data.oid + '.val') !== null) {
                                jsonData = vis.binds.materialdesign.table.getJsonData(vis.states.attr(data.oid + '.val'), data);
                            } else {
                                jsonData = vis.binds.materialdesign.table.getJsonData(data.dataJson, data);
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
            console.error(`[${widgetName} - ${data.wid}] handle: error: ${ex.message}, stack: ${ex.stack}`);
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

                        tableContent.append(`<tr class="mdc-data-table__row" id="row${row}" style="height: ${(myMdwHelper.getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : '1px'}; ${row === 0 && !myMdwHelper.getBooleanFromData(data.showHeader, false) ? 'border-top-color: transparent' : ''};">
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
                try {
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

                    if (objValue && typeof (objValue) === 'object') {
                        if (objValue.type === 'buttonToggle' || objValue.type === 'buttonToggle_vertical') {
                            let type = objValue.type === 'buttonToggle' ? vis.binds.materialdesign.button.types.toggle.default : vis.binds.materialdesign.button.types.toggle.vertical;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button Toggle', true);

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });
                        } else if (objValue.type === 'buttonToggle_icon') {
                            let type = vis.binds.materialdesign.button.types.toggle.icon;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button Toggle Icon', true);

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Icon', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData, true);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });

                        } else if (objValue.type === 'buttonState' || objValue.type === 'buttonState_vertical') {
                            let type = objValue.type === 'buttonToggle' ? vis.binds.materialdesign.button.types.state.default : vis.binds.materialdesign.button.types.state.vertical;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button State', true);

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button State', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });

                        } else if (objValue.type === 'buttonState_icon') {
                            let type = vis.binds.materialdesign.button.types.state.icon;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Button State Icon', true);

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button State Icon', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData, true);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });

                        } else if (objValue.type === 'buttonLink' || objValue.type === 'buttonLink_vertical') {
                            let type = objValue.type === 'buttonToggle' ? vis.binds.materialdesign.button.types.link.default : vis.binds.materialdesign.button.types.link.vertical;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-button materialdesign-button-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Link', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });

                        } else if (objValue.type === 'buttonLink_icon') {
                            let type = vis.binds.materialdesign.button.types.link.icon;
                            let elementData = vis.binds.materialdesign.button.getDataFromJson(objValue, data.wid, type);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-icon-button materialdesign-button-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 48px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 48px;'}">
                                    </div>`

                            myMdwHelper.waitForElement($this, `.materialdesign-button-table-row_${row}-col_${col}`, data.wid, 'Table Button Link Icon', function () {
                                let btn = $this.find(`.materialdesign-button-table-row_${row}-col_${col}`);

                                vis.binds.materialdesign.addRippleEffect($(btn.get(0)).children(), elementData, true);
                                vis.binds.materialdesign.button.initialize(btn, elementData, type);
                            });

                        } else if (objValue.type === 'progress') {
                            let elementData = vis.binds.materialdesign.progress.getDataFromJson(objValue, data.wid, vis.binds.materialdesign.progress.types.linear);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 12px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-progress-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                    let progress = $this.find(`.materialdesign-progress-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.progress.linear(progress, elementData);
                                });
                            });
                        } else if (objValue.type === 'progress_circular') {
                            let elementData = vis.binds.materialdesign.progress.getDataFromJson(objValue, data.wid, vis.binds.materialdesign.progress.types.circular);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-progress materialdesign-progress-circular-table-row_${row}-col_${col}" data-oid="${elementData.oid}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Progress Circular', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Progress Circular', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-progress-circular-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                    let progress = $this.find(`.materialdesign-progress-circular-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.progress.circular(progress, elementData);
                                });
                            });
                        } else if (objValue.type === 'slider') {
                            let elementData = vis.binds.materialdesign.slider.getDataFromJson(objValue, data.wid);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-slider-vertical materialdesign-slider-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${elementData["oid-working"]}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : ''}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-slider-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                    let slider = $this.find(`.materialdesign-slider-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.slider.vuetifySlider(slider, elementData);
                                });
                            });

                        } else if (objValue.type === 'slider_round') {
                            let elementData = vis.binds.materialdesign.roundslider.getDataFromJson(objValue, data.wid);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-slider-round materialdesign-slider-round-table-row_${row}-col_${col}" data-oid="${elementData.oid}" data-oid-working="${elementData["oid-working"]}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 60px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 60px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Slider Round', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Slider Round', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-slider-round-table-row_${row}-col_${col}`, data.wid, 'Table Button Toggle Vertical', function () {
                                    let slider = $this.find(`.materialdesign-slider-round-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.roundslider.initialize(slider, elementData);
                                });
                            });
                        } else if (objValue.type === 'switch') {
                            let elementData = vis.binds.materialdesign.switch.getDataFromJson(objValue, data.wid);
                            let init = vis.binds.materialdesign.switch.initialize(elementData);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget ${init.labelPosition} materialdesign-switch materialdesign-switch-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 50px;'}">
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
                            let elementData = vis.binds.materialdesign.checkbox.getDataFromJson(objValue, data.wid);
                            let init = vis.binds.materialdesign.checkbox.initialize(elementData);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget ${init.labelPosition} materialdesign-checkbox materialdesign-checkbox-table-row_${row}-col_${col}" data-oid="${elementData.oid}" isLocked="${myMdwHelper.getBooleanFromData(elementData.lockEnabled, false)}" style="position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80px;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 50px;'}">
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
                            let elementData = vis.binds.materialdesign.textfield.getDataFromJson(objValue, data.wid);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-input materialdesign-input-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Textfield', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Textfield', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-input-table-row_${row}-col_${col}`, data.wid, 'Table Textfield', function () {
                                    let input = $this.find(`.materialdesign-input-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.textfield.initialize(input, elementData);
                                });
                            });

                        } else if (objValue.type === 'select') {
                            let elementData = vis.binds.materialdesign.select.getDataFromJson(objValue, data.wid);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-select materialdesign-select-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Select', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Select', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-select-table-row_${row}-col_${col}`, data.wid, 'Table Select', function () {
                                    let select = $this.find(`.materialdesign-select-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.select.initialize(select, elementData);
                                });
                            });

                        } else if (objValue.type === 'autocomplete') {
                            let elementData = vis.binds.materialdesign.autocomplete.getDataFromJson(objValue, data.wid);

                            element = `<span style="color: red; font-weight: 700; font-size: 10px;">deprecated!!! Use <a href="https://github.com/Scrounger/ioBroker.vis-materialdesign#html-widgets" target="_blank">HTML Widgets instead!</a></span><br><br><div class="vis-widget materialdesign-widget materialdesign-autocomplete materialdesign-autocomplete-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important; ${objValue.width ? `width: ${objValue.width};` : 'width: 80%;'} ${objValue.height ? `height: ${objValue.height};` : 'height: 38px;'}">
                                    </div>`

                            myMdwHelper.oidNeedSubscribe(elementData.oid, data.wid, 'Table Autocomplete', true);

                            myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Autocomplete', function () {
                                myMdwHelper.waitForElement($this, `.materialdesign-autocomplete-table-row_${row}-col_${col}`, data.wid, 'Table Autocomplete', function () {
                                    let autocomplete = $this.find(`.materialdesign-autocomplete-table-row_${row}-col_${col}`);

                                    vis.binds.materialdesign.autocomplete.initialize(autocomplete, elementData);
                                });
                            });

                        } else if (objValue.type === 'materialdesignicon') {
                            let elementData = vis.binds.materialdesign.materialdesignicons.getDataFromJson(objValue, data.wid);

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
                            element = `<div class="vis-widget materialdesign-widget materialdesign-html-table-row_${row}-col_${col}" style="display: inline-block; position: relative; vertical-align: ${myMdwHelper.getValueFromData(objValue.verticalAlign, 'middle')}; overflow:visible !important;">
                        </div>`

                            if (objValue.oid) {
                                myMdwHelper.oidNeedSubscribe(objValue.oid, data.wid, 'Table Html', true);

                                myMdwHelper.subscribeStatesAtRuntime(data.wid, 'Table Html', function () {
                                    myMdwHelper.waitForElement($this, `.materialdesign-html-table-row_${row}-col_${col}`, data.wid, 'Table MaterialDesignIcons', function () {
                                        let htmlContainer = $this.find(`.materialdesign-html-table-row_${row}-col_${col}`);

                                        let val = vis.states.attr(objValue.oid + '.val')
                                        htmlContainer.html(objValue.html.replace('[#value]', val));

                                        vis.states.bind(objValue.oid + '.val', function (e, newVal, oldVal) {
                                            if (newVal !== oldVal) {
                                                htmlContainer.html(objValue.html.replace('[#value]', newVal))
                                            }
                                        });
                                    });
                                });
                            } else {
                                element = objValue.html;
                            }
                        } else {
                            // HTML Widgets in container
                            element = objValue.html
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
                            ${(objValue && objValue.cellStyleAttrs) ? `${objValue.cellStyleAttrs}` : ''}
                            ">
                                ${element}
                        </td>`
                } catch (err) {
                    console.error(`[getColElement] row: ${row}, col: ${col}, objValue: ${JSON.stringify(objValue)}`);
                    console.error(`[getColElement] error: ${err.message}, stack: ${err.stack}`);

                    return `<td class="mdc-data-table__cell"
                                id="cell-row${row}-col${col}"
                                style="color: red; font-weight: bold;">
                                    ${_('Error:')} ${err.message}
                            </td>`
                }
            };
        }
    },
    getJsonData: function (input, data) {
        let jsonData = [];

        if (input && typeof input === 'string') {
            try {
                input = input.replace(/\n/g, ' ').replace(/\t/g, '');

                jsonData = JSON.parse(input);
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