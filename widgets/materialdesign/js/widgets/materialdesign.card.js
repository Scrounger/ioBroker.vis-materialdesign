/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.card = {
    initialize: function (data) {
        try {

            let card = '';

            let cardStyle = '';
            if (data.cardStyle !== 'default') {
                cardStyle = 'mdc-card--outlined';
            }

            let titleFontSize = myMdwHelper.getFontSize(data.titleLayout);
            let subTitleFontSize = myMdwHelper.getFontSize(data.subtitleLayout);
            let textFontSize = myMdwHelper.getFontSize(data.textFontSize);

            let labelTextHeight = myMdwHelper.getValueFromData(data.labelTextHeight, '', 'height: ', 'px;');
            let labelSubTextHeight = myMdwHelper.getValueFromData(data.labelSubTextHeight, '', 'height: ', 'px;');

            let showImage = 'display: none;';
            if (myMdwHelper.getValueFromData(data.image, null) !== null) {
                showImage = '';
            }

            let showTitleSection = 'display: none;';
            if (myMdwHelper.getValueFromData(data.title, null) != null || myMdwHelper.getValueFromData(data.subtitle, null) != null) {
                showTitleSection = '';
            }

            let htmlLayout = '';
            if (data.htmlLayout === 'custom') {
                htmlLayout = 'card-custom-body';
            } else {
                htmlLayout = 'mdc-typography mdc-typography--' + data.htmlLayout;
            }

            let titleSection = []
            if (data.showTitle || data.showSubTitle) {
                if (data.cardLayout !== 'Horizontal') {
                    titleSection.push(`<div class="materialdesign-html-card card-title-section" style="${showTitleSection}">`)

                } else {
                    // Horizontal Layout
                    titleSection.push(`<div class="materialdesign-html-card card-title-section">`)
                }

                if (data.showTitle) {
                    titleSection.push(`<div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}${labelTextHeight}">${myMdwHelper.getValueFromData(data.title, '')}</div>`);
                }
                if (data.showSubTitle) {
                    titleSection.push(`<div class="materialdesign-html-card card-subtitle ${subTitleFontSize.class}" style="${subTitleFontSize.style}${labelSubTextHeight}">${myMdwHelper.getValueFromData(data.subtitle, '')}</div>`);
                }

                titleSection.push(`</div>`);
            }

            let textSection = '';
            if (data.showText) {
                textSection = `<div class="materialdesign-html-card card-text-section">
                                    <div class="materialdesign-html-card ${textFontSize.class}" style="${textFontSize.style}">${myMdwHelper.getValueFromData(data.html, '')}</div>
                                </div>`
            }

            if (data.cardLayout === 'Basic') {
                card = `<div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}"></div>
                        ${titleSection.join('')}
                        ${textSection}`
            } else if (data.cardLayout === 'BasicHeader') {
                card = `${titleSection.join('')}
                        <div class="materialdesign-html-card mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}"></div>
                        ${textSection}`
            } else if (data.cardLayout === 'BasicHeaderOverlay') {
                card = `<div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}">
                            <div class="materialdesign-html-card mdc-card__media-content">
                                ${titleSection.join('')}
                            </div>
                        </div>
                        ${textSection}`
            } else if (data.cardLayout === 'Horizontal') {
                card = `<div class="materialdesign-html-card horizontal-container" style="${showTitleSection}">
                            <div class="materialdesign-html-card mdc-card__media mdc-card__media--square" style="background-image: url(${data.image});${showImage}"></div>
                            <div>
                                ${titleSection.join('')}
                                ${textSection}
                            </div>
                        </div>`
            }

            return { card: card, style: cardStyle }

        } catch (ex) {
            console.error(`[Card - ${data.wid}] initialize: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handler: function (el, data) {
        try {
            let $this = $(el);

            let card = $this.context;

            // mdc.ripple.MDCRipple.attachTo($this.find('.mdc-card__primary-action').get(0));

            let colorBackground = myMdwHelper.getValueFromData(data.colorBackground, '');
            card.style.setProperty("--materialdesign-color-card-background", colorBackground);
            card.style.setProperty("--materialdesign-color-card-title-section-background", myMdwHelper.getValueFromData(data.colorTitleSectionBackground, colorBackground));
            card.style.setProperty("--materialdesign-color-card-text-section-background", myMdwHelper.getValueFromData(data.colorTextSectionBackground, colorBackground));

            card.style.setProperty("--materialdesign-color-card-title", myMdwHelper.getValueFromData(data.colorTitle, ''));
            card.style.setProperty("--materialdesign-color-card-sub-title", myMdwHelper.getValueFromData(data.colorSubtitle, ''));

            this.backgroundImageRefresh(el, data, `url(${data.image}`, data.refreshInterval, data.refreshOnWakeUp, data.refreshOnViewChange, false);

        } catch (ex) {
            console.error(`[Card - ${data.wid}] handler: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    backgroundImageRefresh: function (el, data, src, refreshInterval, refreshOnWakeUp, refreshOnViewChange, refreshWithNoQuery) {
        var widgetView;
        if (src && typeof src === 'object') {
            widgetView = refreshInterval;
            refreshInterval = src.refreshInterval;
            refreshOnWakeUp = src.refreshOnWakeUp;
            refreshOnViewChange = src.refreshOnViewChange;
            refreshWithNoQuery = src.refreshWithNoQuery;
            src = src.src;
        } else if (refreshInterval && typeof refreshInterval === 'object') {
            widgetView = refreshOnWakeUp;
            refreshInterval = refreshInterval.refreshInterval;
            refreshOnWakeUp = refreshInterval.refreshOnWakeUp;
            refreshOnViewChange = refreshInterval.refreshOnViewChange;
            refreshWithNoQuery = refreshInterval.refreshWithNoQuery;
        }
        refreshOnViewChange = refreshOnViewChange === true || refreshOnViewChange === 'true';
        refreshOnWakeUp = refreshOnWakeUp === true || refreshOnWakeUp === 'true';
        refreshWithNoQuery = refreshWithNoQuery === true || refreshWithNoQuery === 'true';

        if (!vis.editMode && src) {
            var $this = $(el).find('.mdc-card__media');
            refreshInterval = parseInt(refreshInterval, 10) || 0;

            if (refreshOnViewChange) {
                widgetView = widgetView || vis.activeView;
                vis.navChangeCallbacks.push(function (view) {
                    if (view === widgetView) {
                        $this.css('background-image', src + (refreshWithNoQuery ? '' : ((src.indexOf('?') !== -1) ? '&' : '?') + '_refts=' + ((new Date()).getTime())));
                    }
                });
            }
            if (refreshOnWakeUp) {
                //console.log("refreshOnWakeUp!");
                vis.onWakeUp(function () {
                    // TODO this does not work. :(
                    // console.log("wakeup refresh!");
                    $this.css('background-image', src + (refreshWithNoQuery ? '' : ((src.indexOf('?') !== -1) ? '&' : '?') + '_refts=' + ((new Date()).getTime())));
                    //console.log($this.attr('src'));
                });
            }

            vis.states.bind(data.refresh_oid + '.val', function (e, newVal, oldVal) {
                if (newVal !== oldVal) {
                    setTimeout(function () {
                        $this.fadeOut(myMdwHelper.getNumberFromData(data.refresh_animation_duration, 250), function () {
                            $this.css('background-image', src + (refreshWithNoQuery ? '' : ((src.indexOf('?') !== -1) ? '&' : '?') + '_refts=' + ((new Date()).getTime())));
                            $this.fadeIn(myMdwHelper.getNumberFromData(data.refresh_animation_duration, 250));
                        });
                    }, myMdwHelper.getNumberFromData(data.refresh_oid_delay, 250));
                }
            });
        }
    }
};