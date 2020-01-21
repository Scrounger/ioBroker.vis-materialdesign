/*
    ioBroker.vis vis-materialdesign Widget-Set

    version: "0.2.45"

    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

let myMdwMaterialDesignIconsList = [];

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
            console.error(`[manualLink]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    bmc: function (widAttr) {
        return { input: `<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VWAXSTS634G88&source=url">${_('buymeacoffee')}</a>` }
    },
    onlineExample: function (widAttr) {
        return { input: `<a target="_blank" href="https://github.com/Scrounger/ioBroker.vis-materialdesign#online-example-project">${_('linkOnlineExampleProject')}</a>` }
    },
    imagesAndMaterialDesignIcons: function (widAttr) {
        try {
            var that = vis;

            let line = {
                // autocomplete for material icons
                input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
                init: function (_wid_attr, data) {
                    $(this).autocomplete({
                        minLength: 0,
                        source: function (request, response) {

                            if (vis.editMode && myMdwMaterialDesignIconsList.length === 0) {
                                myMdwMaterialDesignIconsList = vis.binds.materialdesign.materialdesignicons.getList();
                            }

                            var _data = $.grep(myMdwMaterialDesignIconsList, function (value) {
                                return value.toLowerCase().includes(request.term.toLowerCase());
                            });

                            response(_data);
                        },
                        select: function (event, ui) {
                            $(this).val(ui.item.value);
                            $(this).trigger('change', ui.item.value);
                        }
                    }).focus(function () {
                        // Show dropdown menu
                        $(this).autocomplete('search', '');
                    }).autocomplete('instance')._renderItem = function (ul, item) {

                        return $('<li>')
                            .append(`
                            <div style="display: flex; align-items: center;">
                                <span class="mdi mdi-${item.label}" style="width: 40px; font-size: 24px; color: #44739e;"></span>
                                <label>${item.label}</label>
                            </div>
                            `)
                            .appendTo(ul);
                    };
                }
            };

            if ($.fm) {
                // button for image dialog
                line.button = {
                    icon: 'ui-icon-note',
                    text: false,
                    title: _('Select image'),
                    click: function (/*event*/) {
                        var wdata = $(this).data('wdata');
                        var defPath = ('/' + (that.conn.namespace ? that.conn.namespace + '/' : '') + that.projectPrefix + 'img/');

                        var current = that.widgets[wdata.widgets[0]].data[wdata.attr];
                        //workaround, that some widgets calling direct the img/picure.png without /vis/
                        if (current && current.substring(0, 4) === 'img/') {
                            current = '/vis/' + current;
                        }

                        $.fm({
                            lang: that.language,
                            defaultPath: defPath,
                            path: current || defPath,
                            uploadDir: '/' + (that.conn.namespace ? that.conn.namespace + '/' : ''),
                            fileFilter: myMdwHelper.getAllowedImageFileExtensions(),
                            folderFilter: false,
                            mode: 'open',
                            view: 'prev',
                            userArg: wdata,
                            conn: that.conn,
                            zindex: 1001
                        }, function (_data, userData) {
                            var src = _data.path + _data.file;
                            $('#inspect_' + wdata.attr).val(src).trigger('change');
                        });
                    }
                };
            }
            return line;

        } catch (ex) {
            console.error(`imagesAndMaterialDesignIcons: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    materialDesignIcons: function (widAttr) {
        try {
            var that = vis;

            let line = {
                // autocomplete for material icons
                input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
                init: function (_wid_attr, data) {
                    $(this).autocomplete({
                        minLength: 0,
                        source: function (request, response) {

                            if (vis.editMode && myMdwMaterialDesignIconsList.length === 0) {
                                myMdwMaterialDesignIconsList = vis.binds.materialdesign.materialdesignicons.getList();
                            }

                            var _data = $.grep(myMdwMaterialDesignIconsList, function (value) {
                                return value.toLowerCase().includes(request.term.toLowerCase());
                            });

                            response(_data);
                        },
                        select: function (event, ui) {
                            $(this).val(ui.item.value);
                            $(this).trigger('change', ui.item.value);
                        }
                    }).focus(function () {
                        // Show dropdown menu
                        $(this).autocomplete('search', '');
                    }).autocomplete('instance')._renderItem = function (ul, item) {

                        return $('<li>')
                            .append(`
                            <div style="display: flex; align-items: center;">
                                <span class="mdi mdi-${item.label}" style="width: 40px; font-size: 24px; color: #44739e;"></span>
                                <label>${item.label}</label>
                            </div>
                            `)
                            .appendTo(ul);
                    };
                }
            };
            return line;

        } catch (ex) {
            console.error(`materialDesignIcons: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};

if (vis.editMode) {
    myMdwMaterialDesignIconsList = vis.binds.materialdesign.materialdesignicons.getList();
}