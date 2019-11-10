/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.1.12"

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

            if (data.showHeader) {
                tableElement.push(`<thead>
                                    <tr class="mdc-data-table__header-row">`)
                for (var i = 0; i <= data.countCols; i++) {
                    tableElement.push(`<th class="mdc-data-table__header-cell ${headerFontSize.class}" role="columnheader" scope="col" style="text-align: ${data.attr('textAlign' + i)};${headerFontSize.style}">${getValueFromData(data.attr('label' + i), 'col ' + i)}</th>`)
                }
                tableElement.push(`</tr>
                            </thead>`);
            }


            tableElement.push(`<tbody class="mdc-data-table__content">`);

            let jsonData = null;
            try {
                jsonData = JSON.parse(data.dataJson)
            } catch{ }

            if (jsonData != null) {

                for (var row = 0; row <= jsonData.length - 1; row++) {
                    tableElement.push(`<tr class="mdc-data-table__row">`);

                    if (jsonData[row]) {
                        for (var col = 0; col <= jsonData[row].length - 1; col++) {
                            let textSize = getFontSize(data.attr('textSize' + col));

                            tableElement.push(`<td class="mdc-data-table__cell ${textSize.class}" style="text-align: ${data.attr('textAlign' + col)};${textSize.style}">${jsonData[row][col]}</td>`);
                        }
                    }
                    tableElement.push(`</tr>`);
                }
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

                const mdcTable = new mdc.dataTable.MDCDataTable(table);
            }, 1);

        } catch (ex) {
            console.exception(`handle: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};