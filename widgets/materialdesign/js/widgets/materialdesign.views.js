/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.48"

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
                    <span style="color:red"><b>Will be removed in next Version! Please use the Masnory Views Widget.</span>
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

                let paddingBottom = 'var(--materialdesign-masonry-gaps)'
                if (i >= data.countViews) {
                    paddingBottom = '0px';
                }

                viewsList.push(`
                    <div 
                        class="materialdesign-masonry-item" style="height: ${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100)}px; ${viewWidth}; padding-bottom: ${paddingBottom};">
                            ${(vis.editMode) ? `<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e; height: ${myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 100)}px;"></div>` : ''}                          
                            <div data-vis-contains="${data.attr('View' + i)}" class="vis-widget-body vis-view-container">
                            </div>
                    </div>
                `)
            }

            let resolutionHelper = `
                <div 
                class="materialdesign-masonry-item" style="height: calc(230px + var(--materialdesign-masonry-gaps));">
                    <div class="mdc-card my-card-container" style="width: 100%; height: 230px;">
                        <div class="materialdesign-html-card card-title-section" >
                            <div class="materialdesign-html-card card-title mdc-typography--headline6" style="">${_('Resolution assistant')}</div>
                            
                        </div>
                        <div class="materialdesign-html-card card-text-section" style="display: block">
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="masonry-helper-text">${_('width of resolution')}:</label>
                                <label class="masonry-helper-value masonry-helper-resolution-width">568px</label>
                            </div>
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="masonry-helper-text">${_('used rule')}:</label>
                                <label class="masonry-helper-value masonry-helper-rule">mobil phone landscape</label>
                            </div>
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="masonry-helper-text">${_('number of columns')}:</label>
                                <label class="masonry-helper-value masonry-helper-columns">5</label>
                            </div>
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="masonry-helper-text">${_('distance between views')}:</label>
                                <label class="masonry-helper-value masonry-helper-gaps">5px</label>
                            </div>                                                                               
                        </div>
                    </div>
                </div>
            `

            $this.append(`
                <div class="materialdesign-masonry-container" style="text-align: ${data.viewAlignment};">
                    ${(data.showResolutionAssistant) ? resolutionHelper : ''}
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
                    if (data.showResolutionAssistant) $this.find('.masonry-helper-resolution-width').text(currentScreenWidth + ' px');

                    if (currentScreenWidth <= handyPortraitWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", handyPortraitCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", handyPortraitGaps + 'px');

                        if (data.showResolutionAssistant) {
                            $this.find('.masonry-helper-columns').text(handyPortraitCols);
                            $this.find('.masonry-helper-gaps').text(handyPortraitGaps + ' px');
                            $this.find('.masonry-helper-rule').text(_('mobil phone') + ' ' + _('portrait'));
                        }

                    } else if (currentScreenWidth > handyPortraitWidth && currentScreenWidth <= handyLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", handyLandscapeCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", handyLandscapeGaps + 'px');

                        if (data.showResolutionAssistant) {
                            $this.find('.masonry-helper-columns').text(handyLandscapeCols);
                            $this.find('.masonry-helper-gaps').text(handyLandscapeGaps + ' px');
                            $this.find('.masonry-helper-rule').text(_('mobil phone') + ' ' + _('landscape'));
                        }

                    } else if (currentScreenWidth > handyLandscapeWidth && currentScreenWidth <= tabletPortraitWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletPortraitCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletPortraitGaps + 'px');

                        if (data.showResolutionAssistant) {
                            $this.find('.masonry-helper-columns').text(tabletPortraitCols);
                            $this.find('.masonry-helper-gaps').text(tabletPortraitGaps + ' px');
                            $this.find('.masonry-helper-rule').text(_('tablet') + ' ' + _('portrait'));
                        }

                    } else if (currentScreenWidth > tabletPortraitWidth && currentScreenWidth <= tabletLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletLandscapeCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletLandscapeGaps + 'px');

                        if (data.showResolutionAssistant) {
                            $this.find('.masonry-helper-columns').text(tabletLandscapeCols);
                            $this.find('.masonry-helper-gaps').text(tabletLandscapeGaps + ' px');
                            $this.find('.masonry-helper-rule').text(_('tablet') + ' ' + _('landscape'));
                        }

                    } else if (currentScreenWidth > tabletLandscapeWidth) {
                        $this.context.style.setProperty("--materialdesign-masonry-column-count", desktopCols);
                        $this.context.style.setProperty("--materialdesign-masonry-gaps", desktopGaps + 'px');

                        if (data.showResolutionAssistant) {
                            $this.find('.masonry-helper-columns').text(desktopCols);
                            $this.find('.masonry-helper-gaps').text(desktopGaps + ' px');
                            $this.find('.masonry-helper-rule').text('-');
                        }
                    }
                }
            });

        } catch (ex) {
            console.error(`[Masonry Views] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};