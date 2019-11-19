/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.0"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.table = {
    initialize: function (data) {
        try {
            let tableElement = []

            let headerFontSize = getFontSize(data.headerTextSize);

            let tableLayout = '';
            if (data.tableLayout === 'card') {
                tableLayout = 'materialdesign-list-card';
            } else if (data.tableLayout === 'cardOutlined') {
                tableLayout = 'materialdesign-list-card materialdesign-list-card--outlined';
            }

            tableElement.push(`<div class="mdc-data-table ${tableLayout}" style="width: 100%;">
                                    <table class="mdc-data-table__table" aria-label="Material Design Widgets Table">`)

            tableElement.push(`<thead>
                                    <tr class="mdc-data-table__header-row" style="height: ${(getNumberFromData(data.headerRowHeight, null) !== null) ? data.headerRowHeight + 'px' : '1px'};">`)

            if (data.showHeader) {
                for (var i = 0; i <= data.countCols; i++) {
                    if (data.attr('showColumn' + i)) {
                        tableElement.push(`<th class="mdc-data-table__header-cell ${headerFontSize.class}" colIndex="${i}" role="columnheader" scope="col" style="text-align: ${data.attr('textAlign' + i)};${headerFontSize.style}; padding-left: ${getNumberFromData(data.attr('padding_left' + i), 8)}px; padding-right: ${getNumberFromData(data.attr('padding_right' + i), 8)}px; font-family: ${getValueFromData(data.headerFontFamily, '')}">${getValueFromData(data.attr('label' + i), 'col ' + i)}</th>`)
                    }
                }
            }
            tableElement.push(`</tr>
                            </thead>`);


            tableElement.push(`<tbody class="mdc-data-table__content">`);

            // adding Content
            if (getValueFromData(data.oid, null) !== null) {
                tableElement.push(vis.binds.materialdesign.table.getContentElements(vis.states.attr(data.oid + '.val'), data));
            } else {
                tableElement.push(vis.binds.materialdesign.table.getContentElements(data.dataJson, data));
            }

            tableElement.push(`</tbody>`);


            tableElement.push(`</table>
                            </div>`)

            return tableElement.join('');
        } catch (ex) {
            console.exception(`initialize: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handle: function (el, data) {
        try {
            setTimeout(function () {

                let $this = $(el);
                let table = $this.find('.mdc-data-table').get(0);

                table.style.setProperty("--materialdesign-color-table-background", getValueFromData(data.colorBackground, ''));
                table.style.setProperty("--materialdesign-color-table-header-row-background", getValueFromData(data.colorHeaderRowBackground, ''));
                table.style.setProperty("--materialdesign-color-table-header-row-text-color", getValueFromData(data.colorHeaderRowText, ''));
                table.style.setProperty("--materialdesign-color-table-row-background", getValueFromData(data.colorRowBackground, ''));
                table.style.setProperty("--materialdesign-color-table-row-text-color", getValueFromData(data.colorRowText, ''));
                table.style.setProperty("--materialdesign-color-table-row-divider", getValueFromData(data.dividers, ''));

                const mdcTable = new mdc.dataTable.MDCDataTable(table);

                vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                    $this.find('.mdc-data-table__content').empty();
                    $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements(newVal, data));
                });

                $this.find('.mdc-data-table__header-cell').click(function (obj) {
                    let colIndex = $(this).attr('colIndex');
                    let sortASC = true;

                    let jsonString = '';
                    if (getValueFromData(data.oid, null) !== null) {
                        jsonString = vis.states.attr(data.oid + '.val');
                    } else {
                        jsonString = data.dataJson
                    }

                    try {
                        let jsonData = JSON.parse(jsonString)
                        let key = (getValueFromData(data.attr('sortKey' + colIndex), null) !== null) ? data.attr('sortKey' + colIndex) : Object.keys(jsonData[0])[colIndex];

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
                        $this.find('.mdc-data-table__content').append(vis.binds.materialdesign.table.getContentElements(null, data, sortByKey(jsonData, key, sortASC)));      //TODO: sort key by user defined

                    } catch (err) {
                        console.error(`handle: ${jsonString}, error: ${err.message}`);
                    }

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

            }, 1);
        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    getContentElements: function (input, data, jsonData = null) {
        let contentElements = [];

        if (jsonData === null) {
            try {
                jsonData = JSON.parse(input)
            } catch (err) {
                console.error(`input: ${input}, error: ${err.message}`);
            }
        }

        if (jsonData != null) {

            for (var row = 0; row <= jsonData.length - 1; row++) {
                contentElements.push(`<tr class="mdc-data-table__row" style="height: ${(getNumberFromData(data.rowHeight, null) !== null) ? data.rowHeight + 'px' : '1px'};">`);

                if (jsonData[row]) {
                    // col items is object
                    for (var col = 0; col <= Object.keys(jsonData[row]).length - 1; col++) {
                        if (data.attr('showColumn' + col)) {
                            let textSize = getFontSize(data.attr('textSize' + col));

                            contentElements.push(getContentElement(col, Object.values(jsonData[row])[col], textSize, jsonData[row]));
                        }
                    }
                }
                contentElements.push(`</tr>`);
            }

            function getContentElement(col, objValue, textSize, rowData = null) {
                let prefix = getValueFromData(data.attr('prefix' + col), '');
                let suffix = getValueFromData(data.attr('suffix' + col), '');

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

                                str = str.replace(regex[i], rowData[objName]);

                            }
                        }

                        return str;
                    }
                }

                if (data.attr('colType' + col) === 'image') {
                    objValue = `<img src="${objValue}" style="height: auto; vertical-align: middle; width: ${getValueFromData(data.attr('imageSize' + col), '', '', 'px;')}">`;
                }

                return `<td class="mdc-data-table__cell ${textSize.class}" 
                            style="
                            text-align: ${data.attr('textAlign' + col)};${textSize.style}; 
                            padding-left: ${getNumberFromData(data.attr('padding_left' + col), 8)}px; 
                            padding-right: ${getNumberFromData(data.attr('padding_right' + col), 8)}px; 
                            color: ${getValueFromData(data.attr('textColor' + col), '')}; 
                            font-family: ${getValueFromData(data.attr('fontFamily' + col), '')}
                            ">
                                ${prefix}${objValue}${suffix}
                        </td>`
            };

            return contentElements.join('');
        }
    }
};