/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.39"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

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
            console.error(`[Column Views]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    masonry: function (el, data) {
        try {
            let $this = $(el);
            let viewsList = [];

            for (var i = 0; i <= data.countViews; i++) {
                let viewWidth = myMdwHelper.getValueFromData(data.attr('viewsWidth' + i), '');

                if (viewWidth !== '' && (viewWidth.endsWith('%') || viewWidth.endsWith('px'))) {
                    viewWidth = `width: ${myMdwHelper.getValueFromData(data.attr('viewsWidth' + i))};`
                } else {
                    if (!isNaN(viewWidth) && viewWidth !== '') {
                        viewWidth = `width: ${myMdwHelper.getValueFromData(data.attr('viewsWidth' + i))}px;`
                    } else {
                        viewWidth = '';
                    }
                }

                let viewAlignment = myMdwHelper.getValueFromData(data.attr('viewAlignment' + i), 'center');
                if (viewAlignment === 'left') viewAlignment = 'flex-start';
                if (viewAlignment === 'right') viewAlignment = 'flex-end';

                viewsList.push(`
                    <div 
                        class="materialdesign-masonry-item" style="height: calc(${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100)}px + var(--materialdesign-masonry-gaps)); ${viewWidth}">
                            ${(vis.editMode) ? `<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e; height: ${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100)}px;"></div>` : ''}                          
                            <div data-vis-contains="${data.attr('View' + i)}" class="vis-widget-body vis-view-container">
                            </div>
                    </div>
                `)
            }

            $this.append(`
                <div class="materialdesign-masonry-container" style="text-align: ${data.viewAlignment};">
                    ${viewsList.join('')}
                </div>
            `);

            myMdwHelper.waitForElement($this, '.materialdesign-masonry-container', function () {
                var $window = $(window);
                var currentScreenWidth = $window.width();

                $window.resize(function () {
                    // resize event
                    var windowWidth = $window.width();

                    if (currentScreenWidth !== windowWidth) {
                        currentScreenWidth = windowWidth;
                        setColumns()
                    }
                });

                let desktopCols = myMdwHelper.getNumberFromData(data.countCols, 3);
                let desktopGaps = myMdwHelper.getNumberFromData(data.desktopGaps, 0);

                let handyPortraitWidth = myMdwHelper.getNumberFromData(data.handyPortraitWidth, 360);
                let handyPortraitCols = myMdwHelper.getNumberFromData(data.handyPortraitCols, 1);
                let handyPortraitGaps = myMdwHelper.getNumberFromData(data.handyPortraitGaps, desktopGaps);

                let handyLandscapeWidth = myMdwHelper.getNumberFromData(data.handyLandscapeWidth, 672);
                let handyLandscapeCols = myMdwHelper.getNumberFromData(data.handyLandscapeCols, 2);
                let handyLandscapeGaps = myMdwHelper.getNumberFromData(data.handyLandscapeGaps, desktopGaps);

                let tabletPortraitWidth = myMdwHelper.getNumberFromData(data.tabletPortraitWidth, 768);
                let tabletPortraitCols = myMdwHelper.getNumberFromData(data.tabletPortraitCols, 2);
                let tabletPortraitGaps = myMdwHelper.getNumberFromData(data.tabletPortraitGaps, desktopGaps);

                let tabletLandscapeWidth = myMdwHelper.getNumberFromData(data.tabletLandscapeWidth, 1024);
                let tabletLandscapeCols = myMdwHelper.getNumberFromData(data.tabletLandscapeCols, 3);
                let tabletLandscapeGaps = myMdwHelper.getNumberFromData(data.tabletLandscapeGaps, desktopGaps);

                setColumns();

                function setColumns() {
                    if (currentScreenWidth <= handyPortraitWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", handyPortraitCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", handyPortraitGaps + 'px');

                    } else if (currentScreenWidth > handyPortraitWidth && currentScreenWidth <= handyLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", handyLandscapeCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", handyLandscapeGaps + 'px');

                    } else if (currentScreenWidth > handyLandscapeWidth && currentScreenWidth <= tabletPortraitWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletPortraitCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletPortraitGaps + 'px');

                    } else if (currentScreenWidth > tabletPortraitWidth && currentScreenWidth <= tabletLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletLandscapeCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletLandscapeGaps + 'px');
                        
                    } else if (currentScreenWidth > tabletLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", desktopCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", desktopGaps + 'px');
                    }
                }
            });

        } catch (ex) {
            console.error(`[Masonry Views] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};