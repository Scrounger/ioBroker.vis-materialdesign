var colors = [];
var myNamespace;

// This will be called by the admin adapter when the settings page loads
function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;

    myNamespace = `${adapter}.${instance}`;
    colors = settings.colors || [];

    console.log(adapter);
    console.log(instance);

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
    createColorsTable(colors, onChange);

    eventsHandler(onChange);

    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();
}

function createColorsTable(data, onChange) {
    $('.container_colorsTable').empty();

    let element = `<div class="col s12" id="colors">
                    <div class="table-values-div" style="margin-top: 10px;">
                        <table class="table-values" id="colorsTable">
                            <thead>
                                <tr>
                                    <th data-name="name" style="width: 30%;" class="translate" data-type="text">${_("Name")}</th>
                                    <th data-name="pickr" style="width: 40px;" class="translate" data-type="text"></th>
                                    <th data-name="value" style="width: auto;" class="translate" data-type="text">${_("Value")}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>`

    $('.container_colorsTable').html(element);

    values2table('colors', data, onChange);

    $('[data-name=name]').prop('disabled', true);

    $('input[data-name=pickr]').each(function (index) {
        let pick = Pickr.create({
            el: this,
            theme: 'monolith', // or 'monolith', or 'nano'
            default: data[index].value,     // init color

            swatches: [
                'white',
                'blue',
                'magenta',
                'red',
                'yellow',
                'green',
                'cyan',
                'black'
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
                'btn:cancel': _('back')
            }
        }).on('hide', instance => {
            if (instance._representation === 'HEXA') {
                $(`input[data-index=${index}][data-name="value"]`).val(instance._color.toHEXA().toString());
            } else {
                $(`input[data-index=${index}][data-name="value"]`).val(instance._color.toRGBA().toString(0));
            }

            onChange();
        });
    });

    $('#colorsTable .values-buttons[data-command="edit"]').on('click', function () {
        let rowNum = $(this).data('index');
        console.warn(rowNum);
    });
}

function eventsHandler(onChange) {
    $('#generateGlobalScript').on('change', function () {
        globalScriptEnable();
    });

    $('.myColorsTab').on('click', function () {
        //recreate Table on Tab click -> dynamically create select options
        colors = table2values('colors');

        createColorsTable(colors, onChange);
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
            setStateString(`${myNamespace}.colors.${color.name}`, 'Fuuu', color.value);
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