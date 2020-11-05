let themeTypesList = ['colors', 'colorsDark', 'fonts', 'fontSizes'];
var myNamespace;

// This will be called by the admin adapter when the settings page loads
async function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;

    myNamespace = `${adapter}.${instance}`;

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

    for (const themeType of themeTypesList) {
        createTab(themeType, settings[themeType], [], settings, onChange);
    }

    eventsHandler(onChange);

    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();
}

//#region Tabs
async function createTab(themeType, themeObject, themeDefaults, settings, onChange, reset = false) {
    try {
        let defaultTableButtons = '';

        // check if defaultColors exist and number are equals
        if (!reset) themeDefaults = await loadDefaults(themeType, settings, onChange);

        // check if all fonts exist in settings
        if (!reset) themeObject = await checkAllObjectsExistInSettings(themeType, themeObject, themeDefaults, onChange);

        $(`.${themeType}DefaultContainer`).empty();
        for (var i = 0; i <= themeDefaults.length - 1; i++) {
            defaultTableButtons += `${i} `;

            // create Default elements
            createDefaultElement(themeType, themeDefaults, i);

            // if colors -> create colorPicker
            if (themeType.includes('colors')) {
                createColorPicker(`#${themeType}Picker${i}`, themeDefaults[i], themeDefaults, $(`#${themeType}${i}`), onChange, i);
            }

            $(`#${themeType}${i}`).change(function () {
                // default input: color changed -> fires only on key enter or lost focus -> change colorPicker
                let inputEl = $(this);
                let inputVal = inputEl.val();
                let index = inputEl.attr('id').replace(themeType, '');

                themeDefaults[index] = inputVal;

                let pickr = null;
                if (themeType.includes('colors')) {
                    let pickrEl = $(`#${themeType}PickerContainer${index} .pickr`);
                    pickrEl.empty();
                    pickr = createColorPicker(pickrEl.get(0), inputVal, themeDefaults, inputEl, onChange, index);
                }

                setTimeout(function () {
                    if (themeType.includes('colors')) {
                        if (!inputVal.startsWith('#') && !inputVal.startsWith('rgb')) {
                            // convert color names to hex
                            let convertedColor = pickr._color.toHEXA().toString();
                            inputEl.val(convertedColor);
                            themeDefaults[index] = convertedColor;
                        }
                    }
                    $(`#${themeType}Table [data-name=defaultValue]`).each(function () {
                        let defaultVal = $(this).val();

                        if (defaultVal === index.toString()) {
                            let rowNum = $(this).attr('data-index');

                            let targetInput = $(`#${themeType}Table input[data-index=${rowNum}][data-name="value"]`);

                            if (themeType.includes('colors')) {
                                // We have to recreate the color picker
                                let pickrEl = $(`#${themeType}Table tr[data-index=${rowNum}] .pickr`);
                                pickrEl.empty();
                                createColorPicker(pickrEl.get(0), themeDefaults[index], themeDefaults, targetInput, onChange);
                            }
            
                            targetInput.val(themeDefaults[index]);
                        }
                    });
                }, 100);

                onChange();
            });
        }

        createTable(themeType, themeObject, themeDefaults, defaultTableButtons, onChange);
        eventsHandlerTab(themeType, themeObject, themeDefaults, settings, onChange)

    } catch (err) {
        console.error(`[createTab] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
    }
}

async function createTable(themeType, themeObject, themeDefaults, defaultButtons, onChange) {
    try {
        $(`.container_${themeType}Table`).empty();

        let element = `<div class="col s12" id="${themeType}">
                    <div class="table-values-div" style="margin-top: 10px;">
                        <table class="table-values" id="${themeType}Table">
                            <thead>
                                <tr>
                                    <th data-name="widget" style="width: 15%;" class="translate" data-type="text">${_("Widget")}</th>
                                    <th data-name="id" style="width: 15%;" data-style="cursor: copy" class="translate" data-type="text">${_("datapoint")}</th>
                                    ${themeType.includes('colors') ? '<th data-name="pickr" style="width: 30px;" data-style="text-align: center;" class="translate" data-type="text"></th>' : ''}
                                    <th data-name="value" style="width: 200px;" data-style="text-align: left;" class="translate" data-type="text">${_(`${themeType}_table`)}</th>
                                    <th style="width: 150px; text-align: center;" class="header" data-buttons="${defaultButtons.trim()}">${_(`${themeType}Default`)}</th>
                                    <th data-name="desc" style="width: auto;" class="translate" data-type="text">${_("description")}</th>
                                    <th data-name="defaultValue" style="display: none;" class="translate" data-type="text">${_(`${themeType}Default`)}</th>
                                </tr>
                            </thead>
                        </table>
                    </div>
                </div>`

        $(`.container_${themeType}Table`).html(element);

        values2table(themeType, themeObject, onChange);

        // Inputs readonly
        $(`#${themeType}Table [data-name=widget]`).prop('readOnly', true);
        $(`#${themeType}Table [data-name=id]`).prop('readOnly', true);
        $(`#${themeType}Table [data-name=desc]`).prop('readOnly', true);

        // defaultValue ausblenden
        $(`#${themeType}Table [data-name=defaultValue]`).closest('td').css('display', 'none');


        // check if filter is set
        let inputFilterVal = $(`#${themeType}TableFilter`).val();

        if (inputFilterVal.length > 0) {
            $(`#${themeType}Table input[data-name=widget]`).each(function () {
                if (!$(this).val().toUpperCase().includes(inputFilterVal.toUpperCase())) {
                    $(this).closest('tr').hide();
                }
            });
        }

        if (themeType.includes('colors')) {
            $(`#${themeType}Table input[data-name=pickr]`).each(function (i) {
                // create ColorPicker for rows & 
                let inpuEl = $(`#${themeType}Table input[data-index=${i}][data-name="value"]`);
                if (themeObject[i].value) {
                    createColorPicker(this, themeObject[i].value, themeDefaults, inpuEl, onChange);
                } else {
                    createColorPicker(this, themeDefaults[themeObject[i].defaultValue], themeDefaults, inpuEl, onChange);
                }

                setTableSelectedDefault(themeType, i, themeObject[i].defaultValue);
            });
        } else {
            $(`#${themeType}Table input[data-name="value"]`).each(function (i) {
                setTableSelectedDefault(themeType, i, themeObject[i].defaultValue);
            });
        }

        for (var i = 0; i <= themeDefaults.length - 1; i++) {
            // Button Layout & Click event
            let btn = $(`#${themeType}Table [data-command="${i}"]`);
            btn.find('.material-icons').each(function (index) {
                $(this).text(i.toString()).removeClass('material-icons');
            });

            btn.on('click', function () {
                // apply default value to row
                let rowNum = $(this).data('index');
                let btnNum = $(this).data('command');;

                let inpuEl = $(`#${themeType}Table input[data-index=${rowNum}][data-name="value"]`);


                if (themeType.includes('colors')) {
                    // We have to recreate the color picker
                    let pickrEl = $(`#${themeType}Table tr[data-index=${rowNum}] .pickr`);
                    pickrEl.empty();
                    createColorPicker(pickrEl.get(0), themeDefaults[btnNum], themeDefaults, inpuEl, onChange);
                }

                inpuEl.val(themeDefaults[btnNum]);
                setTableSelectedDefault(themeType, rowNum, btnNum);

                onChange();
            });
        }

        $(`#${themeType}Table input[data-name=value]`).change(function () {
            // fires only on key enter or lost focus -> change colorPicker            
            let inputEl = $(this);
            let rowNum = inputEl.data('index');

            if (themeType.includes('colors')) {
                let pickrEl = $(`#${themeType}Table tr[data-index=${rowNum}] .pickr`);
                pickrEl.empty();

                let pickr = createColorPicker(pickrEl.get(0), inputEl.val(), themeDefaults, inputEl, onChange);

                setTimeout(function () {
                    if (!inputEl.val().startsWith('#') && !inputEl.val().startsWith('rgb')) {
                        // convert color names to hex
                        let convertedColor = pickr._color.toHEXA().toString();
                        inputEl.val(convertedColor);
                    }
                }, 100);
            }

            $(`#${themeType}Table input[data-index=${rowNum}][data-name="defaultValue"]`).val('');
            $(`#${themeType}Table .values-buttons[data-index=${rowNum}]`).css('background-color', '#2196f3');
        });

        $(`#${themeType}Table input[data-name=id]`).click(function () {

            if (themeType.includes('colors')) {
                clipboard.writeText(`{mode:${myNamespace}.colors.darkTheme;light:${myNamespace}.colors.${$(this).val().replace('dark.', 'light.')};dark:${myNamespace}.colors.${$(this).val().replace('light.', 'dark.')}; mode === "true" ? dark : light}`.replace(/;/g, '§').replace(/\"/g, '^'));
            } else {
                clipboard.writeText(`{${myNamespace}.${themeType}.${$(this).val()}}`);
            }

            M.Toast.dismissAll();
            M.toast({ html: _('Binding copied to clipboard'), displayLength: 700, inDuration: 0, outDuration: 0, classes: 'rounded' });
        });

    } catch (err) {
        console.error(`[createTable] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
    }
}

function setTableSelectedDefault(themeType, rowNum, btnNum) {
    $(`#${themeType}Table input[data-index=${rowNum}][data-name="defaultValue"]`).val(btnNum);

    $(`#${themeType}Table .values-buttons[data-index=${rowNum}]`).css('background-color', '#2196f3');
    $(`#${themeType}Table .values-buttons[data-index=${rowNum}][data-command="${btnNum}"]`).css('background-color', 'green');
}

function eventsHandlerTab(themeType, themeObject, themeDefaults, settings, onChange) {
    $(`#${themeType}TableFilter`).keyup(function () {
        $(`#${themeType}Table`).find('tr:gt(0)').show(); // show all rows

        let filter = $(this).val();
        if (filter.length > 0) {
            $(`#${themeType}Table input[data-name=widget]`).each(function () {
                if (!$(this).val().toUpperCase().includes(filter.toUpperCase())) {
                    $(this).closest('tr').hide();
                }
            });
        } else {
            $(`#${themeType}Table`).find('tr:gt(0)').show(); // show all rows
        }
    });

    $(`#${themeType}TableFilterClear`).click(function () {
        $(`#${themeType}TableFilter`).val(''); // empty field
        $(`#${themeType}Table`).find('tr:gt(0)').show(); // show all rows
    });

    $(`#${themeType}Reset`).on('click', function () {
        confirmMessage(`<div style="font-size: 1.2rem; font-family: Segoe UI",Tahoma,Arial,"Courier New" !important;">${_(`Do you want to restore the default ${themeType}?`)}</div>`, `<i class="material-icons left">warning</i>${_('attention')}`, undefined, [_('Cancel'), _('OK')], async function (result) {
            if (result === 1) {

                // reset defaultColors
                themeDefaults = await getJsonObjects(`default${themeType}`);
                for (var i = 0; i <= themeDefaults.length - 1; i++) {
                    let inputEl = $(`#${themeType}${i}`);
                    inputEl.val(themeDefaults[i]);
                }

                // reset table colors
                themeObject = await getJsonObjects(themeType);
                for (var i = 0; i <= themeObject.length - 1; i++) {
                    if (!themeObject[i].value) {
                        themeObject[i].value = themeDefaults[themeObject[i].defaultValue];
                    }

                    // themeObject[i].desc = _(themeObject[i].desc);
                }

                createTab(themeType, themeObject, themeDefaults, settings, onChange, true);

                onChange();
            }
        });
    });
}

async function loadDefaults(themeType, settings, onChange) {
    try {
        let result = [];

        // check if default colors / fonts / sizes exist and number are equals
        let jsonDefaults = await getJsonObjects(`default${themeType}`);
        if (settings[`default${themeType}`].length === 0) {
            result = jsonDefaults;
        } else if (settings[`default${themeType}`].length !== jsonDefaults.length) {
            for (var i = 0; i <= jsonDefaults.length - 1; i++) {
                result[i] = settings[`default${themeType}`][i] || jsonDefaults[i];
            }
            onChange();
        } else {
            result = settings[`default${themeType}`];
        }

        return result;
    } catch (err) {
        console.error(`[loadDefaults] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}

async function checkAllObjectsExistInSettings(themeType, themeObject, themeDefaults, onChange) {
    try {
        // check if all objects exist in settings
        let jsonList = await getJsonObjects(themeType);
        for (var i = 0; i <= jsonList.length - 1; i++) {
            if (!themeObject.find(o => o.id === jsonList[i].id)) {

                // not exist -> add to settings list
                if (!jsonList[i].value) {
                    jsonList[i].value = themeDefaults[jsonList[i].defaultValue];
                }

                // jsonList[i].desc = _(jsonList[i].desc);
                themeObject.splice(i, 0, jsonList[i]);

                onChange();
            }
        }

        return themeObject;

    } catch (err) {
        console.error(`[checkAllObjectsExistInSettings] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}

function createDefaultElement(themeType, themeDefaults, index) {
    try {
        $(`.${themeType}DefaultContainer`).append(`
            <div class="col s12 m6 l3 defaultContainer" id="${themeType}PickerContainer${index}">
                <label for="${themeType}${index}" id="${themeType}Input${index}" class="translate defaultLabel">${_(`${themeType}Default`)} ${index}</label>
                ${themeType.includes('colors') ? `<div class="${themeType}Picker" id="${themeType}Picker${index}"></div>` : ''}
                <input type="text" class="value ${themeType}PickerInput" id="${themeType}${index}" value="${themeDefaults[index]}" />
            </div>`);
    } catch (err) {
        console.error(`[createDefaultElement] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}


function createColorPicker(el, color, colorDefaults, inputEl, onChange, defaultColorIndex = 0) {
    let pickr = Pickr.create({
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
            colorDefaults[defaultColorIndex] = selectedColor;
        }

        onChange();
    });

    return pickr;
}

//#endregion


//#region global script
function eventsHandler(onChange) {
    $('#btnJavascript').on('click', function () {
        createJavascriptConfirm();
    });
}

function createJavascriptConfirm() {
    confirmMessage(`<div style="font-size: 1.2rem; font-family: Segoe UI",Tahoma,Arial,"Courier New" !important;">${_('After the script has been generated, the javascript adapter will be restarted!<br><br><br>Do you want to continue?')}</div>`, `<i class="material-icons left">warning</i>${_('attention')}`, undefined, [_('Cancel'), _('OK')], function (result) {
        if (result === 1) {
            createJavascript();
        }
    });
}

async function createJavascript() {
    try {
        var javascriptAdapter = await getObjectAsync("system.adapter.javascript.0");
        if (javascriptAdapter) {
            // javascript adapter exists

            let rootName = $('#variableName').val();
            let autoScript = `var ${rootName} = {};\n`

            // get alle theme datapoints
            let statesList = await getForeignObjectsAsync(myNamespace + '.*');

            if (statesList != null && Object.keys(statesList).length > 0) {
                let existingVarName = [];

                for (var id in statesList) {
                    if (id !== `${myNamespace}.colors.darkTheme`) {

                        let idSplitted = id.replace(myNamespace + ".", "").split(".");
                        let varName = ""
                        if (idSplitted.length > 0) {
                            for (var i = 0; i < idSplitted.length; i++) {
                                if (i === 0) {
                                    varName = `${rootName}.${idSplitted[i]}`;
                                } else {
                                    varName = varName.concat(`.${idSplitted[i]}`)
                                }

                                if (!existingVarName.includes(`${varName} = {};\n`)) {
                                    autoScript = autoScript.concat(`${varName} = {};\n`);
                                    existingVarName.push(`${varName} = {};\n`);
                                }
                            }

                            // Funktionen den linkedObjects hinzufügen
                            autoScript = autoScript.concat(`${varName}.getId = ${createGetFunction(id, `"${id}"`)}\n`);
                            autoScript = autoScript.concat(`${varName}.getValue = ${createGetFunction(id, `getState("${id}").val`)}\n`);
                        }

                        autoScript = autoScript.concat("\n");
                    }
                }

                // erste Ordner (Mappe) anlegen
                let folder = {
                    type: "channel",
                    _id: "script.js.global.MaterialDesignWidgets",
                    common: {
                        name: "MaterialDesignWidgets",
                        expert: true
                    }
                }

                // Skript erstellen
                let scriptId = `script.js.global.MaterialDesignWidgets.${myNamespace.replace(".", "")}`
                let script = {
                    type: "script",
                    _id: scriptId,
                    common: {
                        name: $('#scriptName').val(),
                        expert: true,
                        engineType: "Javascript/js",
                        engine: "system.adapter.javascript.0",
                        source: autoScript,
                        debug: false,
                        verbose: false,
                        enabled: true
                    }
                }
                await setObjectAsync(scriptId, script);
            }
        }
    } catch (err) {
        showError("generate javascript:" + err)
    }


}

function createGetFunction(id, returnStatement) {
    return `function () { if(existsState("${id}")) { return ${returnStatement}; } else { console.warn("object '${id}' not exist!"); return '';} };`;
}
//#endregion

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

    for (const themeType of themeTypesList) {
        obj[themeType] = table2values(themeType);

        for (const themeObject of obj[themeType]) {
            if (themeType.includes('colors')) {
                setStateString(`${myNamespace}.colors.${themeObject.id}`, themeObject.desc, themeObject.value);
            } else {
                setStateString(`${myNamespace}.${themeType}.${themeObject.id}`, themeObject.desc, themeObject.value);
            }
        }

        obj[`default${themeType}`] = [];
        $(`.${themeType}DefaultContainer input`).each(function (i) {
            let themeDefault = $(this).val();
            obj[`default${themeType}`].push(themeDefault);
            if (themeType.includes('colors')) {
                if (themeType === 'colorsDark') {
                    setStateString(`${myNamespace}.colors.dark.default_${i}`, `${_(`${themeType}Default`)} ${i}`, themeDefault);
                } else {
                    setStateString(`${myNamespace}.colors.light.default_${i}`, `${_(`${themeType}Default`)} ${i}`, themeDefault);
                }
            } else {
                setStateString(`${myNamespace}.${themeType}.default_${i}`, `${_(`${themeType}Default`)} ${i}`, themeDefault);
            }
        });
    }

    // obj.defaultcolors = defaultColors;

    // storeStates();

    callback(obj);
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

async function getJsonObjects(lib) {
    return new Promise((resolve, reject) => {
        $.getJSON(`./lib/${lib}.json`, function (json) {
            if (json) {
                resolve(json);
            } else {
                resolve(null);
            }
        });
    });
}