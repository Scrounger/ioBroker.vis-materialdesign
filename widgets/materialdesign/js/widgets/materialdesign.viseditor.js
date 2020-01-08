/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.35"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

// this code can be placed directly in materialdesign.html
vis.binds.materialdesign.viseditor = {
    manualLink: function (widAttr, data) {
        try {
            let url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#iobrokervis-materialdesign';
            
            if (data) {

                if (data[1] === 'card') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#card'
                }

                if (data[1] === 'drawer') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#top-app-bar-with-navigation-drawer'
                }

                if (data[1] === 'drawerSubMenuViews') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#submenu'
                }

                if (data[1] === 'lineHistoryChart') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#line-history-chart'
                }

                if (data[1] === 'list') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#list'
                }

                if (data[1] === 'progress') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#progress'
                }

                if (data[1] === 'slider') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#slider'
                }

                if (data[1] === 'switch') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#switch'
                }

                if (data[1] === 'table') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#table'
                }

                if (data[1] === 'columnViews') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#column-views'
                }
            }

            return { input: `<a target="_blank" href="${url}">${_('readme')}</a>` }

        } catch (ex) {
            console.exception(`[manualLink]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    bmc: function (widAttr) {
        return { input: `<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VWAXSTS634G88&source=url">${_('buymeacoffee')}</a>` }
    },
    onlineExample: function (widAttr) {
        return { input: `<a target="_blank" href="https://github.com/Scrounger/ioBroker.vis-materialdesign#online-example-project">${_('linkOnlineExampleProject')}</a>` }
    }
};