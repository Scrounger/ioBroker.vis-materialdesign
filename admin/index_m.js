var colors = [];
var myNamespace;
var colorPickers = [];
var defaultColors = [];


// This will be called by the admin adapter when the settings page loads
function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;

    myNamespace = `${adapter}.${instance}`;
    colors = settings.colors || [];

    $('.value').each(function () {
        var $key = $(this);
        var id = $key.attr('id');
        if ($key.attr('type') === 'checkbox') {
            // do not call onChange direct, because onChange could expect some arguments
            $key.prop('checked', settings[id])
                .on('change', () => onChange())
                ;
        } else {
            // do not call onChange direct, because onChange could expect some arguments
            $key.val(settings[id])
                .on('change', () => onChange())
                .on('keyup', () => onChange())
                ;
        }
    });
    onChange(false);

    globalScriptEnable();
    createColorsTab(colors, onChange, settings);

    eventsHandler(onChange, settings);

    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();
}


//#region Tab Colors
function createColorsTab(data, onChange, settings) {
    for (var i = 1; i <= 5; i++) {
        defaultColors[i] = settings[`color${i}`];
        createColorPicker(`#colorPicker${i}`, settings[`color${i}`], $(`#color${i}`), onChange, i);

        $(`#color${i}`).change(function () {
            // fires only on key enter or lost focus -> change colorPicker
            let inputEl = $(this);
            let index = inputEl.attr('id').replace('color', '');

            defaultColors[index] = inputEl.val();

            let pickrEl = $(`#colorPickerContainer${index} .pickr`);
            pickrEl.empty();
            createColorPicker(pickrEl.get(0), inputEl.val(), inputEl, onChange, index);

            colors = table2values('colors');
            for (var d in colors) {
                if (colors[d].defaultColor === index) {
                    colors[d].value = inputEl.val();
                }
            }

            createColorsTable(colors, onChange);
        });
    }

    createColorsTable(data, onChange);

    eventsHandlerColorsTab(onChange);
}

function createColorsTable(data, onChange) {
    $('.container_colorsTable').empty();

    let element = `<div class="col s12" id="colors">
                    <div class="table-values-div" style="margin-top: 10px;">
                        <table class="table-values" id="colorsTable">
                            <thead>
                                <tr>
                                    <th data-name="id" style="width: 30%;" class="translate" data-type="text">${_("datapoint")}</th>
                                    <th data-name="pickr" style="width: 30px;" data-style="text-align: center;" class="translate" data-type="text"></th>
                                    <th data-name="value" style="width: 160px;" data-style="text-align: left;" class="translate" data-type="text">${_("color")}</th>
                                    <th style="width: 160px; text-align: center;" class="header" data-buttons="1 2 3 4 5">${_("defaultColor")}</th>
                                    <th data-name="desc" style="width: auto;" class="translate" data-type="text">${_("description")}</th>
                                    <th data-name="defaultColor" style="display: none;" class="translate" data-type="text">${_("defaultColor")}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>`

    $('.container_colorsTable').html(element);

    values2table('colors', data, onChange);

    // Input readonly machen
    $('#colorsTable [data-name=id]').prop('readOnly', true);
    $('#colorsTable [data-name=desc]').prop('readOnly', true);

    // defaultcolor ausblenden
    $('#colorsTable [data-name=defaultColor]').closest('td').css('display', 'none');

    $('#colorsTable input[data-name=pickr]').each(function (i) {
        // create ColorPicker for rows & 
        let inpuEl = $(`#colorsTable input[data-index=${i}][data-name="value"]`);
        createColorPicker(this, data[i].value, inpuEl, onChange);

        setTableSelectedDefaultColor(i, data[i].defaultColor);
    });

    for (var i = 1; i <= 5; i++) {
        // Button Layout & Click event
        let btn = $(`#colorsTable [data-command="${i}"]`);
        btn.find('.material-icons').each(function (index) {
            $(this).text(i.toString()).removeClass('material-icons');

        });

        btn.on('click', function () {
            // apply default colors to row
            let rowNum = $(this).data('index');
            let btnNum = $(this).data('command');;

            // We have to recreate the color picker
            let pickrEl = $(`#colorsTable tr[data-index=${rowNum}] .pickr`);
            let inpuEl = $(`#colorsTable input[data-index=${rowNum}][data-name="value"]`);
            pickrEl.empty();
            createColorPicker(pickrEl.get(0), defaultColors[btnNum], inpuEl, onChange);
            inpuEl.val(defaultColors[btnNum]);

            setTableSelectedDefaultColor(rowNum, btnNum);

            onChange();
        })
    }

    $('#colorsTable input[data-name=value]').change(function () {
        // fires only on key enter or lost focus -> change colorPicker
        let inputEl = $(this);
        let rowNum = inputEl.data('index');

        let pickrEl = $(`#colorsTable tr[data-index=${rowNum}] .pickr`);
        pickrEl.empty();
        createColorPicker(pickrEl.get(0), inputEl.val(), inputEl, onChange);

        $(`#colorsTable input[data-index=${rowNum}][data-name="defaultColor"]`).val('');
        $(`#colorsTable .values-buttons[data-index=${rowNum}]`).css('background-color', '#2196f3');
    });
}

function createColorPicker(el, color, inputEl, onChange, defaultColorIndex = 0) {
    Pickr.create({
        el: el,
        theme: 'monolith', // or 'monolith', or 'nano'
        default: color,     // init color
        silent: false,

        swatches: [
            'black',
            'white',
            'blue',
            'magenta',
            'red',
            'yellow',
            'green',
            'cyan',
        ],
        outputPrecision: 0,
        comparison: false,

        components: {

            // Main components
            preview: true,
            opacity: true,
            hue: true,

            // Input / output Options
            interaction: {
                hex: true,
                rgba: true,
                input: true,
                cancel: true,
            }
        },
        i18n: {
            'btn:cancel': _('undo')
        }
    }).on('hide', instance => {
        let selectedColor = ''
        if (instance._representation === 'HEXA') {
            selectedColor = instance._color.toHEXA().toString();
        } else {
            selectedColor = instance._color.toRGBA().toString(0)
        }

        inputEl.val(selectedColor);
        inputEl.get(0).dispatchEvent(new Event('change'));

        if (defaultColorIndex > 0) {
            defaultColors[defaultColorIndex] = selectedColor;
        }

        onChange();
    });
}

function setTableSelectedDefaultColor(rowNum, btnNum) {
    $(`#colorsTable input[data-index=${rowNum}][data-name="defaultColor"]`).val(btnNum);

    $(`#colorsTable .values-buttons[data-index=${rowNum}]`).css('background-color', '#2196f3');
    $(`#colorsTable .values-buttons[data-index=${rowNum}][data-command="${btnNum}"]`).css('background-color', 'green');
}

function eventsHandlerColorsTab(onChange) {
    $('.myColorsTab').on('click', function () {
        //recreate Table on Tab click -> dynamically create select options
        colors = table2values('colors');

        createColorsTable(colors, onChange);
    });

    $('#resetColors').on('click', function () {
        confirmMessage(_('After the script has been generated, the javascript adapter will be restarted!<br><br><br>Do you want to continue?'), _('attention'), null, [_('Cancel'), _('OK')], function (result) {
            if (result === 1) {

            }
        });
    });
}

//#endregion

function eventsHandler(onChange) {
    $('#generateGlobalScript').on('change', function () {
        globalScriptEnable();
    });
}

function globalScriptEnable() {
    if ($("#generateGlobalScript").prop('checked')) {
        $('#scriptName').prop("disabled", false);
        $('#variableName').prop("disabled", false);
    } else {
        $('#scriptName').prop("disabled", true);
        $('#variableName').prop("disabled", true);
    }
}

// This will be called by the admin adapter when the user presses the save button
function save(callback) {
    // example: select elements with class=value and build settings object
    var obj = {};
    $('.value').each(function () {
        var $this = $(this);
        if ($this.attr('type') === 'checkbox') {
            obj[$this.attr('id')] = $this.prop('checked');
        } else {
            obj[$this.attr('id')] = $this.val();
        }
    });

    colors = table2values('colors');
    obj.colors = colors;

    storeStates();

    callback(obj);
}

async function storeStates() {
    try {
        for (const color of colors) {
            setStateString(`${myNamespace}.colors.${color.id}`, 'Fuuu', color.value);
        }
    } catch (err) {
        console.error(`[storeStates] error: ${err.message}, stack: ${err.stack}`)
    }
}

/**
 * @param {string} id
 * @param {string} name
 */
async function setStateString(id, name, val, ack = true) {
    let obj = await this.getObjectAsync(id);

    if (obj) {
        if (obj.common.name !== _(name)) {
            obj.common.name = _(name);
            await this.setObjectAsync(id, obj);
        }
    } else {
        await this.setObjectAsync(id,
            {
                type: 'state',
                common: {
                    name: _(name),
                    desc: _(name),
                    type: 'string',
                    read: true,
                    write: false,
                    role: 'value'
                },
                native: {}
            });
    }

    await setStateAsync(id, val, ack);
}

async function getForeignObjectsAsync(pattern) {
    return new Promise((resolve, reject) => {
        socket.emit('getForeignObjects', pattern, function (err, res) {
            if (!err && res) {
                resolve(res);
            } else {
                resolve(null);
            }
        });
    });
}

async function getObjectAsync(id) {
    return new Promise((resolve, reject) => {
        socket.emit('getObject', id, function (err, res) {
            if (!err && res) {
                resolve(res);
            } else {
                resolve(null);
            }
        });
    });
}

async function setObjectAsync(id, obj) {
    return new Promise((resolve, reject) => {
        socket.emit('setObject', id, obj, function (err, res) {
            if (!err && res) {
                resolve(res);
            } else {
                resolve(null);
            }
        });
    });
}

async function setStateAsync(id, val, ack = false) {
    return new Promise((resolve, reject) => {
        socket.emit('setState', id, val, ack, function (err, res) {
            if (!err && res) {
                resolve(res);
            } else {
                resolve(null);
            }
        });
    });
}