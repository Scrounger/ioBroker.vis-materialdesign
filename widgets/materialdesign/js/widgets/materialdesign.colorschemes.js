/*
    ioBroker.vis vis-materialdesign Widget-Set
    
    Copyright 2019 Scrounger scrounger@gmx.net
*/
"use strict";

vis.binds.materialdesign.colorScheme = {
    get: function (schemeName, dataSize = 1) {
        try {
            let schemes = {};
            schemes["scrounger.pie"] = ["#44739e", "#6dd600", "#ff9800", "#8e24aa", "#ffeb3b", "#d32f2f", "#a65628"]
            schemes["material.red"] = ["#ffebee", "#ffcdd2", "#ef9a9a", "#e57373", "#ef5350", "#f44336", "#e53935", "#d32f2f", "#c62828", "#b71c1c"].reverse();
            schemes["material.pink"] = ["#fce4ec", "#f8bbd0", "#f48fb1", "#f06292", "#ec407a", "#e91e63", "#d81b60", "#c2185b", "#ad1457", "#880e4f"].reverse();
            schemes["material.purple"] = ["#f3e5f5", "#e1bee7", "#ce93d8", "#ba68c8", "#ab47bc", "#9c27b0", "#8e24aa", "#7b1fa2", "#6a1b9a", "#4a148c"].reverse();
            schemes["material.deeppurple"] = ["#ede7f6", "#d1c4e9", "#b39ddb", "#9575cd", "#7e57c2", "#673ab7", "#5e35b1", "#512da8", "#4527a0", "#311b92"].reverse();
            schemes["material.indigo"] = ["#e8eaf6", "#c5cae9", "#9fa8da", "#7986cb", "#5c6bc0", "#3f51b5", "#3949ab", "#303f9f", "#283593", "#1a237e"].reverse();
            schemes["material.blue"] = ["#e3f2fd", "#bbdefb", "#90caf9", "#64b5f6", "#42a5f5", "#2196f3", "#1e88e5", "#1976d2", "#1565c0", "#0d47a1"].reverse();
            schemes["material.lightblue"] = ["#e1f5fe", "#b3e5fc", "#81d4fa", "#4fc3f7", "#29b6f6", "#03a9f4", "#039be5", "#0288d1", "#0277bd", "#01579b"].reverse();
            schemes["material.cyan"] = ["#e0f7fa", "#b2ebf2", "#80deea", "#4dd0e1", "#26c6da", "#00bcd4", "#00acc1", "#0097a7", "#00838f", "#006064"].reverse();
            schemes["material.teal"] = ["#e0f2f1", "#b2dfdb", "#80cbc4", "#4db6ac", "#26a69a", "#009688", "#00897b", "#00796b", "#00695c", "#004d40"].reverse();
            schemes["material.green"] = ["#e8f5e9", "#c8e6c9", "#a5d6a7", "#81c784", "#66bb6a", "#4caf50", "#43a047", "#388e3c", "#2e7d32", "#1b5e20"].reverse();
            schemes["material.lightgreen"] = ["#f1f8e9", "#dcedc8", "#c5e1a5", "#aed581", "#9ccc65", "#8bc34a", "#7cb342", "#689f38", "#558b2f", "#33691e"].reverse();
            schemes["material.lime"] = ["#f9fbe7", "#f0f4c3", "#e6ee9c", "#dce775", "#d4e157", "#cddc39", "#c0ca33", "#afb42b", "#9e9d24", "#827717"].reverse();
            schemes["material.yellow"] = ["#fffde7", "#fff9c4", "#fff59d", "#fff176", "#ffee58", "#ffeb3b", "#fdd835", "#fbc02d", "#f9a825", "#f57f17"].reverse();
            schemes["material.amber"] = ["#fff8e1", "#ffecb3", "#ffe082", "#ffd54f", "#ffca28", "#ffc107", "#ffb300", "#ffa000", "#ff8f00", "#ff6f00"].reverse();
            schemes["material.orange"] = ["#fff3e0", "#ffe0b2", "#ffcc80", "#ffb74d", "#ffa726", "#ff9800", "#fb8c00", "#f57c00", "#ef6c00", "#e65100"].reverse();
            schemes["material.deeporange"] = ["#fbe9e7", "#ffccbc", "#ffab91", "#ff8a65", "#ff7043", "#ff5722", "#f4511e", "#e64a19", "#d84315", "#bf360c"].reverse();
            schemes["material.brown"] = ["#efebe9", "#d7ccc8", "#bcaaa4", "#a1887f", "#8d6e63", "#795548", "#6d4c41", "#5d4037", "#4e342e", "#3e2723"].reverse();
            schemes["material.grey"] = ["#fafafa", "#f5f5f5", "#eeeeee", "#e0e0e0", "#bdbdbd", "#9e9e9e", "#757575", "#616161", "#424242", "#212121"].reverse();
            schemes["material.bluegrey"] = ["#eceff1", "#cfd8dc", "#b0bec5", "#90a4ae", "#78909c", "#607d8b", "#546e7a", "#455a64", "#37474f", "#263238"].reverse();

            schemes["material.setOne"] = ["#b71c1c", "#0d47a1", "#1b5e20", "#4a148c", "#e65100", "#f57f17", "#3e2723"];
            schemes["material.setTwo"] = ["#c62828", "#1565c0", "#2e7d32", "#6a1b9a", "#ef6c00", "#9e9d24", "#4e342e"];
            schemes["material.setThree"] = ["#d32f2f", "#1976d2", "#388e3c", "#7b1fa2", "#f57c00", "#fbc02d", "#5d4037"];

            schemes["brewer.SetOne"] = ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'];
            schemes["brewer.SetTwo"] = ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'];
            schemes["brewer.SetThree"] = ['#8dd3c7', '#ffffb3', '#bebada', '#fb8072', '#80b1d3', '#fdb462', '#b3de69', '#fccde5', '#d9d9d9', '#bc80bd', '#ccebc5', '#ffed6f'];

            if (myMdwHelper.getValueFromData(schemeName, null) != null) {
                let result = [];
                let selected = schemes[schemeName];

                if (dataSize && selected && selected.length > 0) {
                    let repeats = Math.ceil(dataSize + 1 / selected.length);

                    for (var i = 0; i <= repeats - 1; i++) {
                        result = result.concat(selected);
                    }
                }

                return result;
            } else {
                return schemes;
            }
        } catch (ex) {
            console.error(`[colorScheme] get: error: ${ex.message}, stack: ${ex.stack}`);
        }
    },
    preview: function (data) {
        try {
            let schemes = vis.binds.materialdesign.colorScheme.get();

            let preview = [];

            for (var key in schemes) {
                if (schemes.hasOwnProperty(key)) {
                    let prevElement = `<div style="display: flex; margin-top: 4px">
                                        <label style="min-width: 180px; color: black">${key}:</label>`

                    for (var i = 0; i <= schemes[key].length; i++) {
                        prevElement = prevElement + `<div style="min-width: 30px; min-height: 4px; margin-left: 4px; background: ${schemes[key][i]}"></div>`
                    }
                    preview.push(prevElement + '</div>');
                }
            }

            return preview.join('');
        } catch (ex) {
            console.error(`[colorScheme] preview: error: ${ex.message}, stack: ${ex.stack}`);
        }

    },
    editorSelector: function (widAttr) {
        try {
            var that = this;
            let colorSchemes = vis.binds.materialdesign.colorScheme.get();
            // Auto-complete
            return {
                input: '<input type="text" id="inspect_' + widAttr + '" class="vis-edit-textbox"/>',
                init: function (_wid_attr, data) {
                    $(this).autocomplete({
                        minLength: 0,
                        source: function (request, response) {
                            var _data = $.grep(Object.keys(colorSchemes), function (value) {
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
                        let colArray = colorSchemes[item.label];

                        let prevElement = `<div style="display: flex; margin-top: 4px;">`;
                        for (var i = 0; i <= colArray.length; i++) {
                            prevElement = prevElement + `<div style="min-width: 20px; min-height: 4px; margin-left: 4px; background: ${colArray[i]}"></div>`
                        }
                        prevElement = prevElement + '</div>';

                        return $('<li>')
                            .append('<a><span>' + item.label + '</span></a>')
                            .append(prevElement)
                            .appendTo(ul);
                    };
                }
            };
        } catch (ex) {
            console.error(`[colorScheme] editorSelector: error: ${ex.message}, stack: ${ex.stack}`);
        }
    }
};