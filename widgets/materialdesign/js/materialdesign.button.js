/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.0.1"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.button = {
    initializeButton: function (data, isToggle = false) {
        try {
            let buttonElementsList = [];

            let image = getValueFromData(data.image, null);

            let iconHeight = 'width: auto;';
            if (getValueFromData(data.iconHeight, 0) > 0) {
                iconHeight = `width: ${data.iconHeight}%;`
            }

            let labelWidth = '';
            if (getValueFromData(data.labelWidth, 0) > 0) {
                labelWidth = `style="width: ${data.labelWidth}%;"`
            }

            let invertImage = '';
            if (data.invertImage === 'true' || data.invertImage === true) {
                invertImage = "filter: invert(1); -webkit-filter: invert(1); -moz-filter: invert(1); -o-filter: invert(1); -ms-filter: invert(1);";
            }

            let buttonStyle = '';
            if (data.buttonStyle !== 'text') {
                buttonStyle = 'materialdesign-button--' + data.buttonStyle;
            }

            buttonElementsList.push(`<div 
                                        class="materialdesign-button-body" 
                                        style="display:flex; justify-content: center; align-items: center; width: 100%; height: 100%;">`);

            let imageElement = '';
            if (image !== null) {
                imageElement = `<img 
                                    class="imgButton" src="${image}" 
                                    style="${iconHeight}${invertImage}" />`;
            }

            let labelElement = '';
            if (getValueFromData(data.buttontext, null) != null) {
                labelElement = `<span 
                                    class="materialdesign-button__label" ${labelWidth}>
                                    ${data.buttontext}
                                </span>`;
            }

            if (data.iconPosition === 'left') {
                buttonElementsList.push(`${imageElement}${labelElement}</div>`);
            } else {
                buttonElementsList.push(`${labelElement}${imageElement}</div>`);
            }

            return { button: buttonElementsList.join(''), style: buttonStyle }

        } catch (ex) {
            console.exception(`handler: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    handleLink: function (el, data) {
        $(el).click(function () {
            if (!vis.editMode && data.href) {
                if (data.openNewWindow) {
                    window.open(data.href);
                } else {
                    window.location.href = data.href;
                }
            }
        });
    },
    handleNavigation: function (el, data) {
        if (!vis.editMode && data.nav_view) {
            var $this = $(el);
            var moved = false;
            $this.on('click touchend', function (e) {
                // Protect against two events
                if (vis.detectBounce(this)) return;
                if (moved) return;
                vis.changeView(data.nav_view, data.nav_view);
                //e.preventDefault();
                //return false;
            }).on('touchmove', function () {
                moved = true;
            }).on('touchstart', function () {
                moved = false;
            });
        }
    },

};