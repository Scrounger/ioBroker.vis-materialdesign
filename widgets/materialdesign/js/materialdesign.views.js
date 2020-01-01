/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.26"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.views = {
    column: function (el, data) {
        try {
            let $this = $(el);
            let myHelper = vis.binds.materialdesign.helper;
            let columnsCount = getNumberFromData(data.countCols, 0) + 1;
            let columunList = [];
            let idLastElement = '';

            for (var i = 0; i <= columnsCount - 1; i++) {
                columunList.push(`
                    <div 
                        class="materialdesign-column-views-container-column" 
                        style="min-width: ${getNumberFromData(data.minWidth, 0)}px !important; width: calc(100% / ${columnsCount}) !important;">
                        <div class="materialdesign-column-views-container-column-view">
                `);

                let viewsList = getValueFromData(data.attr('viewsInColumn' + i), '').split('|');
                let viewsHeihgtList = getValueFromData(data.attr('viewsInColumnHeight' + i), '').split('|');

                for (var view = 0; view <= viewsList.length - 1; view++) {
                    let viewId = `col_${i}_view_${view}`;

                    columunList.push(`
                    <div 
                        class="materialdesign-column-views-container-column-item" 
                        id="${viewId}" 
                        style="min-width: ${getNumberFromData(data.minWidth, 0)}px !important; width: calc(100% / ${columnsCount}) !important; height: ${getNumberFromData(viewsHeihgtList[view], 100)}px">
                            ${(vis.editMode) ? '<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e;"></div>' : ''}
                            <div data-vis-contains="${viewsList[view]}" class="vis-widget-body vis-view-container">
                            </div>
                    </div>
                    `)

                    idLastElement = viewId;
                }
                columunList.push(`</div></div>`);
            }

            $this.append(`
                <div class="materialdesign-column-views-container">
                    ${columunList.join('')}
                </div>
            `);
        } catch (ex) {
            console.exception(`column: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};