/*
    ioBroker.vis vis-materialdesign Widget-Set
    
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

                if (data[1] === 'topAppBar') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#top-app-bar-with-navigation-drawer'
                }

                if (data[1] === 'topAppBarSubMenu') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#submenu'
                }

                if (data[1] === 'barChart') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#bar-chart'
                }

                if (data[1] === 'pieChart') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#pie-chart'
                }

                if (data[1] === 'lineHistoryChart') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#line-history-chart'
                }

                if (data[1] === 'jsonChart') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#json-chart'
                }

                if (data[1] === 'list') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#list'
                }

                if (data[1] === 'iconList') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#iconList'
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

                if (data[1] === 'select') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#select'
                }

                if (data[1] === 'autocomplete') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#autocomplete'
                }

                if (data[1] === 'table') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#table'
                }

                if (data[1] === 'columnViews') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#column-views'
                }

                if (data[1] === 'alerts') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#alerts'
                }

                if (data[1] === 'masonry') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#masonry-views'
                }

                if (data[1] === 'grid') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#grid-views'
                }

                if (data[1] === 'calendar') {
                    url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#calendar'
                }
            }

            return { input: `<a target="_blank" href="${url}">${_('readme')}</a>` }

        } catch (ex) {
            console.error(`[manualLink]: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    questionsAndAnswers: function (widAttr, data) {
        let url = 'https://github.com/Scrounger/ioBroker.vis-materialdesign#questions-and-answers-about-the-widgets';

        if (vis.language === 'de') {
            if (data[1] === 'alerts') {
                url = 'https://forum.iobroker.net/topic/29663/material-design-widgets-alerts-widget'
            }

            if (data[1] === 'buttons') {
                url = 'https://forum.iobroker.net/topic/29664/material-design-widgets-buttons-widget'
            }

            if (data[1] === 'calendar') {
                url = 'https://forum.iobroker.net/topic/29600/material-design-widgets-calendar-widget'
            }

            if (data[1] === 'checkboxSwitch') {
                url = 'https://forum.iobroker.net/topic/29667/material-design-widgets-checkbox-switch-widget'
            }

            if (data[1] === 'input') {
                url = 'https://forum.iobroker.net/topic/29666/material-design-widgets-input-select-autocompl'
            }

            if (data[1] === 'lineHistoryChart') {
                url = 'https://forum.iobroker.net/topic/29662/material-design-widgets-line-history-chart-widget'
            }

            if (data[1] === 'list') {
                url = 'https://forum.iobroker.net/topic/29665/material-design-widgets-list-widget'
            }

            if (data[1] === 'iconList') {
                url = 'https://forum.iobroker.net/topic/30331/material-design-widgets-iconlist-widget'
            }

            if (data[1] === 'progress') {
                url = 'https://forum.iobroker.net/topic/33623/material-design-widgets-progress-widget'
            }

            if (data[1] === 'masonry') {
                url = 'https://forum.iobroker.net/topic/29621/material-design-widgets-masonry-views-widget'
            }

            if (data[1] === 'slider') {
                url = 'https://forum.iobroker.net/topic/29661/material-design-widgets-slider-widget'
            }

            if (data[1] === 'table') {
                url = 'https://forum.iobroker.net/topic/29658/material-design-widgets-table-widget'
            }

            if (data[1] === 'topAppBar') {
                url = 'https://forum.iobroker.net/topic/29660/material-design-widgets-top-app-bar-widget'
            }

            if (data[1] === 'grid') {
                url = 'https://forum.iobroker.net/topic/29916/material-design-widgets-grid-views-widget'
            }

            if (data[1] === 'dialogView') {
                url = 'https://forum.iobroker.net/topic/31870/material-design-widgets-dialog-view-widget'
            }

            if (data[1] === 'jsonChart') {
                url = 'https://forum.iobroker.net/topic/31871/material-design-widgets-json-chart-widget'
            }

            if (data[1] === 'progress') {
                url = 'https://forum.iobroker.net/topic/33623/material-design-widgets-progress-widget'
            }
        }

        return { input: `<a target="_blank" href="${url}">${_('readme')}</a>` }
    },
    bmc: function (widAttr) {
        return { input: `<a target="_blank" href="https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=VWAXSTS634G88&source=url">${_('buymeacoffee')}</a>` }
    },
    onlineExample: function (widAttr) {
        return { input: `<a target="_blank" href="https://github.com/Scrounger/ioBroker.vis-materialdesign#online-example-project">${_('linkOnlineExampleProject')}</a>` }
    },
    visibilityCondition: function (widAttr) {
        return vis.editSelect(widAttr, ['==', '!=', '<=', '>=', '<', '>', 'consist', 'not consist', 'exist', 'not exist'], true);
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
    },
    exportData: function (widAttr, data) {
        try {
            var that = vis;
            let type = data[1];

            // options = {min: ?,max: ?,step: ?}
            // Select
            var line = {
                input: '<button id="inspect_' + widAttr + '" style="width: 100%;">' + widAttr + '</button>',
                init: function (w, data) {
                    $(this).button().click(function () {
                        $(this).val(true).trigger('change');

                        var wdata = $(this).data('wdata');
                        var data = {};
                        if (that.config['dialog-edit-text']) {
                            data = JSON.parse(that.config['dialog-edit-text']);
                        }
                        var editor = ace.edit('dialog-edit-text-textarea');
                        var changed = false;

                        var view = that.activeView;
                        let dialogText = 'Please select only one Widget to see the Widget data!';
                        if (that.activeWidgets.length === 1) {
                            let attrNames = []
                            let widgetAttrs = that.findCommonAttributes(view, that.activeWidgets)


                            let objectForDev = {};
                            let strTableForDev = `<table><thead><tr>
                                    <th>Property</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Values</th>
                                </tr></thead><tbody>`;
                            for (const attr in widgetAttrs) {
                                for (const prop in widgetAttrs[attr]) {
                                    attrNames.push(prop);

                                    // for documentation and object creation
                                    // let ausnahmen = ["manual", "questionsAndAnswers", "donate", "onlineExampleProject", "exportData"]
                                    // if (!ausnahmen.includes(prop)) {
                                    //     objectForDev[prop] = `obj.${prop}`;

                                    //     let valExample = '';
                                    //     if (widgetAttrs[attr][prop].type === 'select') {
                                    //         valExample = widgetAttrs[attr][prop].options !== null && Array.isArray(widgetAttrs[attr][prop].options) ? widgetAttrs[attr][prop].options.join(" | ") : '';
                                    //     } else if (widgetAttrs[attr][prop].type === 'checkbox') {
                                    //         valExample = "false | true";
                                    //     } else if (widgetAttrs[attr][prop].type === 'color') {
                                    //         valExample = "hex(#44739e), rgb(20, 50, 200), rgba(20, 50, 200, 0.5)";
                                    //     }

                                    //     strTableForDev = strTableForDev +
                                    //         `<tr>
                                    //             <td>${prop}</td>
                                    //             <td>${_(prop)}</td>
                                    //             <td>${widgetAttrs[attr][prop].type ? widgetAttrs[attr][prop].type.replace('color', 'string').replace('slider', 'number').replace('select', 'string').replace('checkbox', 'boolean').replace('id', 'string').replace('html', 'string').replace("undefined", 'string').replace("fontname", "string") : 'string'}</td>
                                    //             <td>${valExample}</td>
                                    //         </tr>
                                    //         `
                                    // }
                                }
                            }
                            strTableForDev = strTableForDev + `</tbody></table>`
                            if (Object.keys(objectForDev).length > 0) {
                                console.log(objectForDev);
                                console.log(strTableForDev);
                            }


                            let widget = that.views[view].widgets[that.activeWidgets[0]];
                            let style = widget.style;

                            let widgetData = Object.assign(
                                {
                                    type: type,
                                    width: style.width,
                                    height: style.height
                                },
                                widget.data);

                            for (var attr in widgetData) {
                                if ((!attrNames.includes(attr) || attr === 'exportData') && attr !== 'type' && attr !== 'width' && attr !== 'height') {
                                    delete widgetData[attr];
                                }

                                if (type === 'select' && attr === 'jsonStringObject') {
                                    if (!widgetData[attr].startsWith('{') && !widgetData[attr].endsWith("}")) {
                                        widgetData[attr] = JSON.parse(widgetData[attr]);
                                    }
                                }
                            }

                            dialogText = JSON.stringify(widgetData, null, "\t");
                        }

                        $('#dialog-edit-text').dialog({
                            autoOpen: true,
                            width: data.width || 800,
                            height: data.height || 600,
                            modal: true,
                            resize: function () {
                                editor.resize();
                            },
                            open: function (event) {
                                $(event.target).parent().find('.ui-dialog-titlebar-close .ui-button-text').html('');
                                $(this).parent().css({ 'z-index': 1000 });
                                if (data.top !== undefined) {
                                    if (data.top >= 0) {
                                        $(this).parent().css({ top: data.top });
                                    } else {
                                        $(this).parent().css({ top: 0 });
                                    }
                                }
                                if (data.left !== undefined) {
                                    if (data.left >= 0) {
                                        $(this).parent().css({ left: data.left });
                                    } else {
                                        $(this).parent().css({ left: 0 });
                                    }
                                }
                                editor.getSession().setMode('ace/mode/html');
                                editor.setOptions({
                                    enableBasicAutocompletion: true,
                                    enableLiveAutocompletion: true
                                });
                                editor.$blockScrolling = Infinity;
                                editor.getSession().setUseWrapMode(true);
                                editor.setValue(dialogText);
                                editor.navigateFileEnd();
                                editor.focus();
                                editor.getSession().on('change', function () {
                                    changed = false;
                                });
                            },
                            beforeClose: function () {
                                // dummy
                            },
                            buttons: [
                                {
                                    text: _('Close'),
                                    click: function () {
                                        $(this).dialog('close');
                                    }
                                }
                            ]
                        }).show();
                    });
                }
            };
            return line;

        } catch (ex) {
            console.error(`exportData: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};

if (vis.editMode) {
    myMdwMaterialDesignIconsList = vis.binds.materialdesign.materialdesignicons.getList();
}