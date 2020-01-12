/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.38"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.views = {
    column: function (el, data) {
        try {
            let $this = $(el);
            let myHelper = vis.binds.materialdesign.helper;
            let columnsCount = myMdwHelper.getNumberFromData(data.countCols, 0) + 1;
            let columunList = [];
            let idLastElement = '';

            for (var i = 0; i <= columnsCount - 1; i++) {
                columunList.push(`
                    <div 
                        class="materialdesign-column-views-container-column" 
                        style="min-width: ${myMdwHelper.getNumberFromData(data.minWidth, 0)}px !important; width: calc(100% / ${columnsCount}) !important;">
                        <div class="materialdesign-column-views-container-column-view">
                `);

                let viewsList = myMdwHelper.getValueFromData(data.attr('viewsInColumn' + i), '').split('|');
                let viewsHeihgtList = myMdwHelper.getValueFromData(data.attr('viewsInColumnHeight' + i), '').split('|');

                for (var view = 0; view <= viewsList.length - 1; view++) {
                    let viewId = `col_${i}_view_${view}`;

                    columunList.push(`
                    <div 
                        class="materialdesign-column-views-container-column-item" 
                        id="${viewId}" 
                        style="min-width: ${myMdwHelper.getNumberFromData(data.minWidth, 0)}px !important; width: calc(100% / ${columnsCount}) !important; height: ${myMdwHelper.getNumberFromData(viewsHeihgtList[view], 100)}px">
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
            console.exception(`[Column Views]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    masonry: function (el, data) {
        try {
            let $this = $(el);
            let viewsList = [];
            let countCols = myMdwHelper.getNumberFromData(data.countCols, 3);

            $this.context.style.setProperty("--materialdesign-masonry-gaps", myMdwHelper.getNumberFromData(data.masnoryGaps, 0) + 'px');

            for (var i = 0; i <= data.countViews; i++) {
                let viewWidth = myMdwHelper.getValueFromData(data.attr('viewsWidth' + i), '');

                if (viewWidth !== '' && (viewWidth.endsWith('%') || viewWidth.endsWith('px'))) {
                    console.log('hier1')
                    viewWidth = `width: ${myMdwHelper.getValueFromData(data.attr('viewsWidth' + i))};`
                } else {
                    if (!isNaN(viewWidth) && viewWidth !== '') {
                        console.log('hier2')
                        viewWidth = `width: ${myMdwHelper.getValueFromData(data.attr('viewsWidth' + i))}px;`
                    } else {
                        console.log('hier3')
                        viewWidth = '';
                    }
                }

                let viewAlignment = myMdwHelper.getValueFromData(data.attr('viewAlignment' + i), 'center');
                if (viewAlignment === 'left') viewAlignment = 'flex-start';
                if (viewAlignment === 'right') viewAlignment = 'flex-end';

                viewsList.push(`
                    <div 
                        class="materialdesign-masonry-item" style="height: ${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100) + myMdwHelper.getNumberFromData(data.masnoryGaps, 0)}px; ${viewWidth}">
                            ${(vis.editMode) ? `<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e; height: ${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100)}px;"></div>` : ''}                          
                            <div data-vis-contains="${data.attr('View' + i)}" class="vis-widget-body vis-view-container">
                            </div>
                    </div>
                `)
            }

            $this.append(`
                <div class="materialdesign-masonry-container" style="--materialdesign-masonry-column-count: ${countCols}; text-align: ${data.viewAlignment};">
                    ${viewsList.join('')}
                </div>
            `);
            
        } catch (ex) {
            console.exception(`[Masonry Views] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};