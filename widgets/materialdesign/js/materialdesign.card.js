/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.3"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.card = {
    initialize: function (data) {
        try {

            let card = '';

            let cardStyle = '';
            if (data.cardStyle !== 'default') {
                cardStyle = 'mdc-card--outlined';
            }

            let titleFontSize = getFontSize(data.titleLayout);
            let subTitleFontSize = getFontSize(data.subtitleLayout);
            let textFontSize = getFontSize(data.textFontSize);

            let labelTextHeight = getValueFromData(data.labelTextHeight, '', 'height: ', 'px;');
            let labelSubTextHeight = getValueFromData(data.labelSubTextHeight, '', 'height: ', 'px;');

            let showImage = 'display: none;';
            if (getValueFromData(data.image, null) !== null) {
                showImage = '';
            }

            let showTitleSection = 'display: none;';
            if (getValueFromData(data.title, null) != null || getValueFromData(data.subtitle, null) != null) {
                showTitleSection = '';
            }

            let htmlLayout = '';
            if (data.htmlLayout === 'custom') {
                htmlLayout = 'card-custom-body';
            } else {
                htmlLayout = 'mdc-typography mdc-typography--' + data.htmlLayout;
            }

            if (data.cardLayout === 'Basic') {
                card = `<div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}"></div>
                        <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                            <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}${labelTextHeight}">${data.title}</div>
                            <div class="materialdesign-html-card card-subtitle ${subTitleFontSize.class}" style="${subTitleFontSize.style}${labelSubTextHeight}">${data.subtitle}</div>
                        </div>
                        <div class="materialdesign-html-card card-text-section">
                            <div class="materialdesign-html-card ${textFontSize.class}" style="${textFontSize.style}">${data.html}</div>
                        </div>`
            } else if (data.cardLayout === 'BasicHeader') {
                card = `<div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                            <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}${labelTextHeight}">${data.title}</div>
                            <div class="materialdesign-html-card card-subtitle ${subTitleFontSize.class}" style="${subTitleFontSize.style}${labelSubTextHeight}">${data.subtitle}</div>
                        </div>
                        <div class="materialdesign-html-card mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}"></div>
                        <div class="materialdesign-html-card card-text-section">
                            <div class="materialdesign-html-card ${textFontSize.class}" style="${textFontSize.style}">${data.html}</div>
                        </div>`
            } else if (data.cardLayout === 'BasicHeaderOverlay') {
                card = `<div class="mdc-card__media mdc-card__media--16-9" style="background-image: url(${data.image});${showImage}">
                            <div class="materialdesign-html-card mdc-card__media-content">
                                <div class="materialdesign-html-card card-title-section" style="${showTitleSection}">
                                    <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}${labelTextHeight}">${data.title}</div>
                                    <div class="materialdesign-html-card card-subtitle ${subTitleFontSize.class}" style="${subTitleFontSize.style}${labelSubTextHeight}">${data.subtitle}</div>
                                </div>
                            </div>
                        </div>
                        <div class="materialdesign-html-card card-text-section">
                            <div class="materialdesign-html-card ${textFontSize.class}" style="${textFontSize.style}">${data.html}</div>
                        </div>`
            } else if (data.cardLayout === 'Horizontal') {
                card = `<div class="materialdesign-html-card horizontal-container" style="${showTitleSection}">
                            <div class="materialdesign-html-card mdc-card__media mdc-card__media--square" style="background-image: url(${data.image});${showImage}"></div>
                            <div>
                                <div class="materialdesign-html-card card-title-section">
                                    <div class="materialdesign-html-card card-title ${titleFontSize.class}" style="${titleFontSize.style}${labelTextHeight}">${data.title}</div>
                                    <div class="materialdesign-html-card card-subtitle ${subTitleFontSize.class}" style="${subTitleFontSize.style}${labelSubTextHeight}">${data.subtitle}</div>
                                </div>
                                <div class="materialdesign-html-card card-text-section">
                                    <div class="materialdesign-html-card ${textFontSize.class}" style="${textFontSize.style}">${data.html}</div>
                                </div>
                            </div>
                        </div>`
            }

            return { card: card, style: cardStyle }

        } catch (ex) {
            console.exception(`initialize: error:: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handler: function (el, data) {
        try {
            let $this = $(el);

            let card = $this.context;

            let colorBackground = getValueFromData(data.colorBackground, '');
            card.style.setProperty("--materialdesign-color-card-background", colorBackground);
            card.style.setProperty("--materialdesign-color-card-title-section-background", getValueFromData(data.colorTitleSectionBackground, colorBackground));
            card.style.setProperty("--materialdesign-color-card-text-section-background", getValueFromData(data.colorTextSectionBackground, colorBackground));

            card.style.setProperty("--materialdesign-color-card-title", getValueFromData(data.colorTitle, ''));
            card.style.setProperty("--materialdesign-color-card-sub-title", getValueFromData(data.colorSubtitle, ''));



        } catch (ex) {
            console.exception(`handler: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};