/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.views = {
    masonry: function (el, data) {
        try {
            let $this = $(el);
            let widgetName = 'Masonry';

            let viewsList = [];
            let oidsNeedSubscribe = false;

            for (var i = 0; i <= data.countViews; i++) {
                let viewWidth = myMdwHelper.getValueFromData(data.attr('viewsWidth' + i), '');

                if (viewWidth !== '' && (viewWidth.endsWith('%') || viewWidth.endsWith('px') || viewWidth.includes('calc'))) {
                    viewWidth = `width: ${viewWidth};`
                } else {
                    if (!isNaN(viewWidth) && viewWidth !== '') {
                        viewWidth = `width: ${viewWidth}px;`
                    } else {
                        viewWidth = '';
                    }
                }

                let viewAlignment = myMdwHelper.getValueFromData(data.attr('viewAlignment' + i), 'center');
                if (viewAlignment === 'left') viewAlignment = 'flex-start';
                if (viewAlignment === 'right') viewAlignment = 'flex-end';

                let viewHeight = myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 0);

                viewsList.push(`
                    <div 
                        class="materialdesign-masonry-item" id="${data.wid}-masonry_item_${i}" itemindex="${i}" sortOrder="${myMdwHelper.getNumberFromData(data.attr('viewSortOrder' + i), i)}" visibilityOid="${data.attr('visibilityOid' + i)}" style="${viewWidth}; display: none; ${myMdwHelper.getValueFromData(data.attr('View' + i), undefined) ? viewHeight > 0 ? `height: ${viewHeight}px;` : '' : 'height: 100px;'}">
                            ${(vis.editMode) ? `<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e; ${myMdwHelper.getValueFromData(data.attr('View' + i), undefined) ? viewHeight > 0 ? `height: ${viewHeight}px;` : '' : 'height: 100px;'}"></div>` : ''}
                            <div data-vis-contains="${data.attr('View' + i)}" class="vis-widget-body vis-view-container">
                            </div>
                    </div>
                    `)

                // Check if Oid is subscribed and put to vis subscribing object
                oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(data.attr('visibilityOid' + i), data.wid, widgetName, oidsNeedSubscribe);

                vis.states.bind(data.attr('visibilityOid' + i) + '.val', function (e, newVal, oldVal) {
                    let itemList = $this.find('.materialdesign-masonry-item[visibilityOid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                    itemList.each(function (d) {
                        setViewVisibilityByCondition($this.width());
                    });
                });
            }

            let resolutionHelper = `
                <div 
                class="materialdesign-masonry-item" style="height: 230px;">
                    <div class="mdc-card my-card-container" style="margin: 3px; width: calc(100% - 6px); height: 230px;">
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
            viewsList.sort(function (a, b) {
                let aSortOrder = parseInt($(a).attr('sortOrder'));
                let bSortOrder = parseInt($(b).attr('sortOrder'));
                return aSortOrder == bSortOrder ? 0 : +(aSortOrder > bSortOrder) || -1;
            });

            $this.append(`
                <div class="materialdesign-masonry-container" style="text-align: ${data.viewAlignment};">
                    ${(data.showResolutionAssistant) ? resolutionHelper : ''}
                    ${viewsList.join('')}
                </div>
            `);

            if (oidsNeedSubscribe) {
                myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                    handleWidget();
                });
            } else {
                // json: hat keine objectIds
                handleWidget();
            }

            function handleWidget() {
                myMdwHelper.waitForElement($this, `#${data.wid}-masonry_item_${0}`, data.wid, 'Masonry', function () {
                    myMdwHelper.waitForRealWidth($this.context, data.wid, 'Masonry', function () {
                        var currentWidgetWidth = $this.width();

                        myMdwHelper.calcChecker(getComputedStyle($this.context).width, data.wid, 'Masonry');

                        $(window).on('resize', function () {
                            // resize event
                            var widgetWidth = $this.width();

                            if (currentWidgetWidth !== widgetWidth && widgetWidth > 100) {
                                currentWidgetWidth = widgetWidth;
                                setColumns();
                                setViewVisibilityByCondition(currentWidgetWidth);
                            }
                        });

                        let desktopCols = myMdwHelper.getNumberFromData(data.countCols, 3);
                        let desktopGaps = myMdwHelper.getNumberFromData(data.desktopGaps, 0);

                        let handyPortraitWidth = myMdwHelper.getNumberFromData(data.handyPortraitWidth, 393);
                        let handyPortraitCols = myMdwHelper.getNumberFromData(data.handyPortraitCols, 1);
                        let handyPortraitGaps = myMdwHelper.getNumberFromData(data.handyPortraitGaps, desktopGaps);

                        let handyLandscapeWidth = myMdwHelper.getNumberFromData(data.handyLandscapeWidth, 754);
                        let handyLandscapeCols = myMdwHelper.getNumberFromData(data.handyLandscapeCols, 2);
                        let handyLandscapeGaps = myMdwHelper.getNumberFromData(data.handyLandscapeGaps, desktopGaps);

                        let tabletPortraitWidth = myMdwHelper.getNumberFromData(data.tabletPortraitWidth, 768);
                        let tabletPortraitCols = myMdwHelper.getNumberFromData(data.tabletPortraitCols, 2);
                        let tabletPortraitGaps = myMdwHelper.getNumberFromData(data.tabletPortraitGaps, desktopGaps);

                        let tabletLandscapeWidth = myMdwHelper.getNumberFromData(data.tabletLandscapeWidth, 1024);
                        let tabletLandscapeCols = myMdwHelper.getNumberFromData(data.tabletLandscapeCols, 3);
                        let tabletLandscapeGaps = myMdwHelper.getNumberFromData(data.tabletLandscapeGaps, desktopGaps);

                        setColumns();
                        setViewVisibilityByCondition(currentWidgetWidth);

                        // $this.find('.materialdesign-masonry-container').show();

                        function setColumns() {
                            if (data.showResolutionAssistant) $this.find('.masonry-helper-resolution-width').text(currentWidgetWidth + ' px');

                            if (currentWidgetWidth <= handyPortraitWidth) {
                                $this.context.style.setProperty("--materialdesign-masonry-column-count", handyPortraitCols);
                                $this.context.style.setProperty("--materialdesign-masonry-gaps", handyPortraitGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.masonry-helper-columns').text(handyPortraitCols);
                                    $this.find('.masonry-helper-gaps').text(handyPortraitGaps + ' px');
                                    $this.find('.masonry-helper-rule').text(_('mobil phone') + ' ' + _('portrait'));
                                }

                            } else if (currentWidgetWidth > handyPortraitWidth && currentWidgetWidth <= handyLandscapeWidth) {
                                $this.context.style.setProperty("--materialdesign-masonry-column-count", handyLandscapeCols);
                                $this.context.style.setProperty("--materialdesign-masonry-gaps", handyLandscapeGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.masonry-helper-columns').text(handyLandscapeCols);
                                    $this.find('.masonry-helper-gaps').text(handyLandscapeGaps + ' px');
                                    $this.find('.masonry-helper-rule').text(_('mobil phone') + ' ' + _('landscape'));
                                }

                            } else if (currentWidgetWidth > handyLandscapeWidth && currentWidgetWidth <= tabletPortraitWidth) {
                                $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletPortraitCols);
                                $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletPortraitGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.masonry-helper-columns').text(tabletPortraitCols);
                                    $this.find('.masonry-helper-gaps').text(tabletPortraitGaps + ' px');
                                    $this.find('.masonry-helper-rule').text(_('tablet') + ' ' + _('portrait'));
                                }

                            } else if (currentWidgetWidth > tabletPortraitWidth && currentWidgetWidth <= tabletLandscapeWidth) {
                                $this.context.style.setProperty("--materialdesign-masonry-column-count", tabletLandscapeCols);
                                $this.context.style.setProperty("--materialdesign-masonry-gaps", tabletLandscapeGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.masonry-helper-columns').text(tabletLandscapeCols);
                                    $this.find('.masonry-helper-gaps').text(tabletLandscapeGaps + ' px');
                                    $this.find('.masonry-helper-rule').text(_('tablet') + ' ' + _('landscape'));
                                }

                            } else if (currentWidgetWidth > tabletLandscapeWidth) {
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
                });
            }

            function setViewVisibilityByCondition(currentWidgetWidth) {
                for (var i = 0; i <= data.countViews; i++) {
                    let lessThan = myMdwHelper.getNumberFromData(data.attr('visibleResolutionLessThan' + i), 50000);
                    let greaterThan = myMdwHelper.getNumberFromData(data.attr('visibleResolutionGreaterThan' + i), 0);

                    let val = vis.states.attr(data.attr('visibilityOid' + i) + '.val');
                    let visibility = myMdwHelper.getVisibility(val, data.attr('visibilityOid' + i), data.attr('visibilityCondition' + i), data.attr('visibilityConditionValue' + i));

                    if (currentWidgetWidth < greaterThan) {
                        $this.find(`#${data.wid}-masonry_item_${i}`).hide();
                    } else if (currentWidgetWidth >= greaterThan && currentWidgetWidth <= lessThan) {
                        if (visibility) {
                            $this.find(`#${data.wid}-masonry_item_${i}`).hide();
                        } else {
                            $this.find(`#${data.wid}-masonry_item_${i}`).show();
                        }
                    } else if (currentWidgetWidth > lessThan) {
                        $this.find(`#${data.wid}-masonry_item_${i}`).hide();
                    } else {
                        if (visibility) {
                            $this.find(`#${data.wid}-masonry_item_${i}`).hide();
                        } else {
                            $this.find(`#${data.wid}-masonry_item_${i}`).show();
                        }
                    }
                }
            }
        } catch (ex) {
            console.error(`[Masonry Views - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    grid: function (el, data) {
        try {
            let $this = $(el);
            let widgetName = 'Grid';

            let viewsList = [];
            let oidsNeedSubscribe = false;

            let containerClass = 'materialdesign-grid';

            for (var i = 0; i <= data.countViews; i++) {
                let colSpan = myMdwHelper.getNumberFromData(data.attr('viewColSpan' + i), myMdwHelper.getNumberFromData(data.viewColSpan, 6));
                if (colSpan > 12) {
                    colSpan = 12;
                }

                let view = myMdwHelper.getValueFromData(data.attr('View' + i), undefined);
                let viewHeight = myMdwHelper.getNumberFromData(data.attr('viewsHeight' + i), 0);

                viewsList.push(`
                <div class="col col-${colSpan}" id="${data.wid}-grid-item${i}" itemindex="${i}" sortOrder="${myMdwHelper.getNumberFromData(data.attr('viewSortOrder' + i), i)}" visibilityOid="${data.attr('visibilityOid' + i)}" style="display: none;">
                    ${(vis.editMode && !view) ? `<div class="editmode-helper" style="border-style: dashed; border-width: 2px; border-color: #44739e; position: relative; ${view ? viewHeight > 0 ? `height: ${viewHeight}px;` : '' : 'height: 100px;'}"></div>` : ''}
                    <div data-vis-contains="${view}" class="vis-widget-body vis-view-container" style="position: relative; ${view ? viewHeight > 0 ? `height: ${viewHeight}px;` : '' : 'height: 100px;'}">
                    </div>
                </div>
                `)

                // Check if Oid is subscribed and put to vis subscribing object
                oidsNeedSubscribe = myMdwHelper.oidNeedSubscribe(data.attr('visibilityOid' + i), data.wid, widgetName, oidsNeedSubscribe);

                vis.states.bind(data.attr('visibilityOid' + i) + '.val', function (e, newVal, oldVal) {
                    let itemList = $this.find('.col[visibilityOid="' + e.type.substr(0, e.type.lastIndexOf(".")) + '"]');

                    itemList.each(function (d) {
                        setViewVisibilityByCondition($this.width());
                    });
                });
            }

            let resolutionHelper = `
                <div class="col col-12" id="resAssistent">
                    <div class="mdc-card my-card-container" style="margin: 3px; width: calc(100% - 6px); height: 230px;">
                        <div class="materialdesign-html-card card-title-section" >
                            <div class="materialdesign-html-card card-title mdc-typography--headline6" style="">${_('Resolution assistant')}</div>
                            
                        </div>
                        <div class="materialdesign-html-card card-text-section" style="display: block">
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="grid-helper-text">${_('width of resolution')}:</label>
                                <label class="grid-helper-value grid-helper-resolution-width">568px</label>
                            </div>
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="grid-helper-text">${_('used rule')}:</label>
                                <label class="grid-helper-value grid-helper-rule">mobil phone landscape</label>
                            </div>
                            <div style="width: 100%; display: flex; height: 40px; align-items: center">
                                <label class="grid-helper-text">${_('distance between views')}:</label>
                                <label class="grid-helper-value grid-helper-gaps">5px</label>
                            </div>                                                                               
                        </div>
                    </div>
                </div>
            `

            viewsList.sort(function (a, b) {
                let aSortOrder = parseInt($(a).attr('sortOrder'));
                let bSortOrder = parseInt($(b).attr('sortOrder'));
                return aSortOrder == bSortOrder ? 0 : +(aSortOrder > bSortOrder) || -1;
            });

            $this.append(`
            <div class="${containerClass}">
                <div class="materialdesign-grid-container">                    
                    <div class="materialdesign-grid-row" style="align-items: ${data.viewVertAlignment}; justify-content: ${data.viewHorAlignment};">
                        ${(data.showResolutionAssistant) ? resolutionHelper : ''}
                        ${viewsList.join('')}
                    </div>
                </div>
            </div>`);


            if (oidsNeedSubscribe) {
                myMdwHelper.subscribeStatesAtRuntime(data.wid, widgetName, function () {
                    handleWidget();
                });
            } else {
                // json: hat keine objectIds
                handleWidget();
            }

            function handleWidget() {
                myMdwHelper.waitForElement($this, `#${data.wid}-grid-item${0}`, data.wid, 'Grid ', function () {
                    myMdwHelper.waitForRealWidth($this.context, data.wid, 'Grid', function () {
                        var currentWidgetWidth = $this.width();

                        myMdwHelper.calcChecker(getComputedStyle($this.context).width, data.wid, 'Grid');

                        $(window).on('resize', function () {
                            // resize event
                            var widgetWidth = $this.width();

                            if (currentWidgetWidth !== widgetWidth && currentWidgetWidth && widgetWidth > 100) {
                                currentWidgetWidth = widgetWidth;
                                setColumns();
                                setViewVisibilityByCondition(currentWidgetWidth);
                            }
                        });

                        let desktopGaps = myMdwHelper.getNumberFromData(data.desktopGaps, 0);

                        let handyPortraitWidth = myMdwHelper.getNumberFromData(data.handyPortraitWidth, 393);
                        let handyPortraitGaps = myMdwHelper.getNumberFromData(data.handyPortraitGaps, desktopGaps);

                        let handyLandscapeWidth = myMdwHelper.getNumberFromData(data.handyLandscapeWidth, 754);
                        let handyLandscapeGaps = myMdwHelper.getNumberFromData(data.handyLandscapeGaps, desktopGaps);

                        let tabletPortraitWidth = myMdwHelper.getNumberFromData(data.tabletPortraitWidth, 768);
                        let tabletPortraitGaps = myMdwHelper.getNumberFromData(data.tabletPortraitGaps, desktopGaps);

                        let tabletLandscapeWidth = myMdwHelper.getNumberFromData(data.tabletLandscapeWidth, 1024);
                        let tabletLandscapeGaps = myMdwHelper.getNumberFromData(data.tabletLandscapeGaps, desktopGaps);

                        setColumns();
                        setViewVisibilityByCondition(currentWidgetWidth);

                        // $this.find(`.${containerClass}`).show();

                        function setColumns() {
                            if (data.showResolutionAssistant) $this.find('.grid-helper-resolution-width').text(currentWidgetWidth + ' px');

                            if (currentWidgetWidth <= handyPortraitWidth) {
                                $this.context.style.setProperty("--materialdesign-grid-gaps", handyPortraitGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.grid-helper-gaps').text(handyPortraitGaps + ' px');
                                    $this.find('.grid-helper-rule').text(_('mobil phone') + ' ' + _('portrait'));

                                    $this.find(`#resAssistent`).removeClass().addClass(`col col-12`);
                                }

                                for (var i = 0; i <= data.countViews; i++) {
                                    let colSpan = myMdwHelper.getNumberFromData(data.attr('handyGridPortraitColSpan' + i), myMdwHelper.getNumberFromData(data.handyGridPortraitColSpan, 12));
                                    if (colSpan > 12) {
                                        colSpan = 12;
                                    }

                                    $this.find(`#${data.wid}-grid-item${i}`).removeClass().addClass(`col col-${colSpan}`);
                                }

                            } else if (currentWidgetWidth > handyPortraitWidth && currentWidgetWidth <= handyLandscapeWidth) {
                                $this.context.style.setProperty("--materialdesign-grid-gaps", handyLandscapeGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.grid-helper-gaps').text(handyLandscapeGaps + ' px');
                                    $this.find('.grid-helper-rule').text(_('mobil phone') + ' ' + _('landscape'));

                                    $this.find(`#resAssistent`).removeClass().addClass(`col col-12`);
                                }

                                for (var i = 0; i <= data.countViews; i++) {
                                    let colSpan = myMdwHelper.getNumberFromData(data.attr('handyGridLandscapeColSpan' + i), myMdwHelper.getNumberFromData(data.handyGridLandscapeColSpan, 6));
                                    if (colSpan > 12) {
                                        colSpan = 12;
                                    }

                                    $this.find(`#${data.wid}-grid-item${i}`).removeClass().addClass(`col col-${colSpan}`);
                                }

                            } else if (currentWidgetWidth > handyLandscapeWidth && currentWidgetWidth <= tabletPortraitWidth) {
                                $this.context.style.setProperty("--materialdesign-grid-gaps", tabletPortraitGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.grid-helper-gaps').text(tabletPortraitGaps + ' px');
                                    $this.find('.grid-helper-rule').text(_('tablet') + ' ' + _('portrait'));

                                    $this.find(`#resAssistent`).removeClass().addClass(`col col-12`);
                                }

                                for (var i = 0; i <= data.countViews; i++) {
                                    let colSpan = myMdwHelper.getNumberFromData(data.attr('tabletGridPortraitColSpan' + i), myMdwHelper.getNumberFromData(data.tabletGridPortraitColSpan, 4));
                                    if (colSpan > 12) {
                                        colSpan = 12;
                                    }

                                    $this.find(`#${data.wid}-grid-item${i}`).removeClass().addClass(`col col-${colSpan}`);
                                }

                            } else if (currentWidgetWidth > tabletPortraitWidth && currentWidgetWidth <= tabletLandscapeWidth) {
                                $this.context.style.setProperty("--materialdesign-grid-gaps", tabletLandscapeGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.grid-helper-gaps').text(tabletLandscapeGaps + ' px');
                                    $this.find('.grid-helper-rule').text(_('tablet') + ' ' + _('landscape'));

                                    $this.find(`#resAssistent`).removeClass().addClass(`col col-12`);
                                }

                                for (var i = 0; i <= data.countViews; i++) {
                                    let colSpan = myMdwHelper.getNumberFromData(data.attr('tabletGridLandscapeColSpan' + i), myMdwHelper.getNumberFromData(data.tabletGridLandscapeColSpan, 3));
                                    if (colSpan > 12) {
                                        colSpan = 12;
                                    }

                                    $this.find(`#${data.wid}-grid-item${i}`).removeClass().addClass(`col col-${colSpan}`);
                                }

                            } else if (currentWidgetWidth > tabletLandscapeWidth) {
                                $this.context.style.setProperty("--materialdesign-grid-gaps", desktopGaps + 'px');

                                if (data.showResolutionAssistant) {
                                    $this.find('.grid-helper-gaps').text(desktopGaps + ' px');
                                    $this.find('.grid-helper-rule').text('-');

                                    $this.find(`#resAssistent`).removeClass().addClass(`col col-12`);
                                }

                                for (var i = 0; i <= data.countViews; i++) {
                                    let colSpan = myMdwHelper.getNumberFromData(data.attr('viewColSpan' + i), myMdwHelper.getNumberFromData(data.viewColSpan, 3));
                                    if (colSpan > 12) {
                                        colSpan = 12;
                                    }

                                    $this.find(`#${data.wid}-grid-item${i}`).removeClass().addClass(`col col-${colSpan}`);
                                }
                            }
                        }



                    });
                });
            }

            function setViewVisibilityByCondition(currentWidgetWidth) {
                for (var i = 0; i <= data.countViews; i++) {
                    let lessThan = myMdwHelper.getNumberFromData(data.attr('visibleResolutionLessThan' + i), 50000);
                    let greaterThan = myMdwHelper.getNumberFromData(data.attr('visibleResolutionGreaterThan' + i), 0);

                    let val = vis.states.attr(data.attr('visibilityOid' + i) + '.val');
                    let visibility = myMdwHelper.getVisibility(val, data.attr('visibilityOid' + i), data.attr('visibilityCondition' + i), data.attr('visibilityConditionValue' + i));

                    if (currentWidgetWidth < greaterThan) {
                        $this.find(`#${data.wid}-grid-item${i}`).hide();
                    } else if (currentWidgetWidth >= greaterThan && currentWidgetWidth <= lessThan) {
                        if (visibility) {
                            $this.find(`#${data.wid}-grid-item${i}`).hide();
                        } else {
                            $this.find(`#${data.wid}-grid-item${i}`).show();
                        }
                    } else if (currentWidgetWidth > lessThan) {
                        $this.find(`#${data.wid}-grid-item${i}`).hide();
                    } else {
                        if (visibility) {
                            $this.find(`#${data.wid}-grid-item${i}`).hide();
                        } else {
                            $this.find(`#${data.wid}-grid-item${i}`).show();
                        }
                    }
                }
            }
        } catch (ex) {
            console.error(`[Grid Views - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    advancedViewInWidget: function (el, data) {
        try {
            let $this = $(el);
            let val = vis.states.attr(data.oid + '.val');
            let containerClass = 'vis-view-container';
            let widgetName = 'Advanced View in Widget';

            $this.append(`<div class="vis-widget-body ${containerClass}" data-vis-contains="${val}"><div>`);

            bindView(val);

            vis.states.bind(data.oid + '.val', function (e, newVal, oldVal) {
                bindView(newVal);
            });

            if (vis.editMode) {
                $this.append(`<div class="editmode-helper" style="top: 0px;"></div>`);
            }

            function bindView(view) {
                

                myMdwHelper.waitForOid(data.oid, data.wid, widgetName, function () {
                    let $container = $this.find(`.${containerClass}`);

                    
                    if ($container.find(".vis-view,.container-error").length > 0) {
                        draw(view);
                    } else {
                        $this.empty();
                        $this.append(`<div class="vis-widget-body ${containerClass}" data-vis-contains="${view}"><div>`);
                        draw(view);
                    }

                    function draw() {
                        $container.find(".vis-view,.container-error").fadeOut(myMdwHelper.getNumberFromData(data.fadeOutDuration, 50), function () {
                            $container.empty();
                            $container.attr('data-vis-contains', view);

                            if (vis.views[view]) {
                                vis.renderView(view, view, true, function (_view) {
                                    $('#visview_' + _view).appendTo($container).data('persistent', true).fadeIn(myMdwHelper.getNumberFromData(data.fadeInDuration, 50));
                                });
                            } else {
                                $container.html('<span style="color: red" class="container-error">' + _('error: view not found.') + '</span>');
                                console.warn(`[Advanced View in Widget - ${data.wid}] '${view}' not existis!`);
                            }
                        });
                    }
                });
            }
        } catch (ex) {
            console.error(`[Advanced View in Widget - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    advancedViewInWidget8: function (el, data) {
        let widgetName = 'Advanced View in Widget 8';

        try {
            var $this = $(el);
            let val = vis.states.attr(data.oid + '.val');
            let containerClass = 'vis-view-container';

            var timer = null;

            var viewArr = [];
            var i = 0;
            while (data.attr('contains_view_' + i) !== undefined) {
                viewArr.push(data.attr('contains_view_' + i));
                i++;
            }

            $this.append(`${vis.editMode ? '<div class="editmode-helper" />' : ''}
                    <div class="vis-widget-body">
                        <div class="${containerClass}" data-oid="${data.oid}" data-vis-contains="${viewArr[val]}" />
                    </div>`);

            let $container = $this.find(`.${containerClass}`);

            function draw(val) {
                timer = null;
                var view = viewArr[val];
                if (!data.persistent) {
                    $container.parent().find('div.vis-view').fadeOut(myMdwHelper.getNumberFromData(data.fadeOutDuration, 50), function () {
                        $container.parent().find('div.vis-view').remove();

                        if (vis.views[view]) {
                            vis.renderView(view, view, true, function (_view) {
                                var $view = $('#visview_' + _view);
                                $view.data('persistent', data.persistent).fadeIn(myMdwHelper.getNumberFromData(data.fadeInDuration, 50));;
                                if (!$container.find('#visview_' + _view).length) {
                                    $view.appendTo($container).fadeIn(myMdwHelper.getNumberFromData(data.fadeInDuration, 50));;
                                }
                            });
                        }
                        vis.destroyUnusedViews();
                    });
                } else {
                    $container.parent().find('div.vis-view').fadeOut(myMdwHelper.getNumberFromData(data.fadeOutDuration, 50), function () {
                        $container.parent().find('div.vis-view').hide().appendTo($('#vis_container'));

                        if (vis.views[view]) {
                            vis.renderView(view, view, true, function (_view) {
                                var $view = $('#visview_' + _view);
                                $view.data('persistent', data.persistent).fadeIn(myMdwHelper.getNumberFromData(data.fadeInDuration, 50));;
                                if (!$container.find('#visview_' + _view).length) {
                                    $view.appendTo($container).fadeIn(myMdwHelper.getNumberFromData(data.fadeInDuration, 50));;
                                }
                            });
                        }
                        vis.destroyUnusedViews();
                    });
                }
            }

            function onChange(e, newVal, oldVal) {
                if (newVal === 'true' || newVal === true) newVal = 1;
                if (newVal === 'false' || newVal === false) newVal = 0;
                if (data.notIfInvisible && !$container.is(':visible')) {
                    return;
                }

                if (timer) {
                    clearTimeout(timer)
                }
                timer = setTimeout(function () {
                    if (newVal !== oldVal && viewArr[newVal] !== viewArr[oldVal]) {
                        draw(newVal);
                    }
                }, 50);
            }

            if (data.oid) {
                vis.states.bind(data.oid + '.val', onChange);

                // remember all ids, that bound
                $container.parent().parent()
                    .data('bound', [data.oid + '.val'])
                    // remember bind handler
                    .data('bindHandler', onChange);
            }
        } catch (ex) {
            console.error(`[${widgetName} - ${data.wid}] error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};