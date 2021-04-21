let themeTypesList = ['colors', 'colorsDark', 'fonts', 'fontSizes'];
let themeDefaultDatapointsNotExists = [];
var myNamespace;

let $progress;

let adapterSettingsIsLoading = false;
let errorMsgCollector;

// This will be called by the admin adapter when the settings page loads
async function load(settings, onChange) {
    // example: select elements with id=key and class=value and insert value
    if (!settings) return;

    myNamespace = `${adapter}.${instance}`;
    adapterSettingsIsLoading = true;

    addVersionToAdapterTitle();

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

    $progress = $('.progressContainer');


    $(document).on("loadingFinished", function (e) {
        $progress.hide();

        adapterSettingsIsLoading = false;
        if (errorMsgCollector) {
            reportError(errorMsgCollector);
        }
    });

    createDatapoints(onChange);
    generateJavascriptInstancesDropDown(settings);

    await initializeSentry();

    for (const themeType of themeTypesList) {
        await createTab(themeType, settings[themeType], [], settings, onChange);
    }

    $(document).trigger("loadingFinished");

    eventsHandler(onChange);

    // reinitialize all the Materialize labels on the page if you are dynamically adding inputs:
    if (M) M.updateTextFields();
}

async function createDatapoints(onChange) {
    let themeId = `${myNamespace}.colors.darkTheme`;
    let themeObj = await getObjectAsync(themeId);

    if (!themeObj) {
        themeObj = {
            type: 'state',
            common: {
                name: 'Switch between light and dark colors',
                desc: 'Switch between light and dark colors',
                type: 'boolean',
                read: true,
                write: true,
                role: 'value',
                def: false,
            },
            native: {}
        };

        await this.setObjectAsync(themeId, themeObj);

        onChange();
    }

    let lastChangeId = `${myNamespace}.lastchange`;
    let lastChangeObj = await getObjectAsync(lastChangeId);

    if (!lastChangeObj) {
        lastChangeObj = {
            type: 'state',
            common: {
                name: 'last theme changes',
                desc: 'last theme changes',
                type: 'number',
                read: true,
                write: false,
                role: 'value',
                def: 0,
            },
            native: {}
        };

        await this.setObjectAsync(lastChangeId, lastChangeObj);

        onChange();
    }
}

async function generateJavascriptInstancesDropDown(settings) {
    socket.emit('getObjectView', 'system', 'instance', { startkey: 'system.adapter.javascript.', endkey: 'system.adapter.javascript.\u9999' }, function (err, doc) {
        if (err) {
            reportError(`[generateJavascriptInstancesDropDown] error: ${err}`);
        } else {
            if (doc.rows.length) {
                var result = [];
                for (var i = 0; i < doc.rows.length; i++) {
                    result.push(doc.rows[i].value);
                }

                if (result.length > 0) {
                    var text = '';
                    for (var r = 0; r < result.length; r++) {
                        var name = result[r]._id.substring('system.adapter.'.length);
                        text += '<option value="' + name + '">' + name + '</option>';
                    }

                    if (settings.javascriptInstance && settings.javascriptInstance !== '') {
                        $('#javascriptInstance').append(text).val(settings.javascriptInstance).select();
                    } else {
                        $('#javascriptInstance').append(text).val(result[0]._id.substring('system.adapter.'.length)).select();
                    }
                } else {
                    var text = '';
                    text += `<option value="">${_("not installed")}</option>`;
                    $('#javascriptInstance').append(text).val('').select();

                    $('.javascriptInstanceExist').find('input').each(function () {
                        $(this).attr('disabled', 'disabled');
                    });

                    $('#btnJavascript').addClass('disabled')
                }
            }
        }
    });
}

async function initializeSentry() {
    try {
        let id = `${myNamespace}.sentry`;
        let sentryObj = await getObjectAsync(id);

        if (!sentryObj) {
            // ggf. erstellen, falls nicht existiert
            sentryObj = {
                type: 'state',
                common: {
                    name: _("send Widget error reports"),
                    desc: _("Sentry - automatic error reporting"),
                    type: 'boolean',
                    read: true,
                    write: true,
                    role: 'value',
                    def: false,
                    uuid: generateUuidv4()
                },
                native: {}
            };

            await this.setObjectAsync(id, sentryObj);
        }

        if (sentryObj && sentryObj.common) {
            if (sentryObj.common.uuid) {
                // uuid prop exist                
                if (!/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(sentryObj.common.uuid)) {
                    sentryObj.common.uuid = generateUuidv4();
                    await setObjectAsync(id, sentryObj);
                }
            } else {
                sentryObj.common.uuid = generateUuidv4();
                await setObjectAsync(id, sentryObj);
            }
        }

        let sentryState = await getStateAsync(id);
        let checkEl = $('#sentryReport');

        if (sentryState) {
            checkEl.prop("checked", sentryState.val);
        } else {
            checkEl.prop("checked", true);
        }
    } catch (err) {
        reportError(`[initializeSentry] error: ${err.message}, stack: ${err.stack}`);
    }
}

//#region Tabs
async function createTab(themeType, themeObject, themeDefaults, settings, onChange, reset = false) {
    try {
        let defaultTableButtons = '';

        // check if defaultColors exist and number are equals
        if (!reset) themeDefaults = await loadDefaults(themeType, settings, onChange);

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

        // check if all properties exist in settings
        if (!reset) themeObject = await checkAllObjectsExistInSettings(themeType, themeObject, themeDefaults, onChange);

        await createTable(themeType, themeObject, themeDefaults, defaultTableButtons, onChange);
        eventsHandlerTab(themeType, themeObject, themeDefaults, settings, onChange)

    } catch (err) {
        reportError(`[createTab] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
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
                                    <th data-name="widget" style="width: 10%;" class="translate" data-type="text">${_("Widget")}</th>                                    
                                    <th data-name="desc" style="width: auto;" class="translate" data-type="text">${_("description")}</th>
                                    ${themeType.includes('colors') ? '<th data-name="pickr" style="width: 30px;" data-style="text-align: center;" class="translate" data-type="text"></th>' : ''}
                                    <th data-name="value" style="width: ${themeType === 'fontSizes' ? '65px' : '180px'};" data-style="text-align: ${themeType === 'fontSizes' ? 'center' : 'left'};" class="translate" data-type="${themeType === 'fontSizes' ? 'number' : 'text'}">${_(`${themeType}_table`)}</th>
                                    <th style="width: 150px; text-align: center;" class="header" data-buttons="${defaultButtons.trim()}">${_(`${themeType}Default`)}</th>
                                    <th data-name="id" style="width: 15%;" class="translate" data-type="text">${_("datapoint")}</th>
                                    <th style="width: 50px; text-align: center;" class="header" data-buttons="M B"></th>
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
        filterTable(themeType, $(`#${themeType}TableFilter`).val())

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
                try {
                    // apply default value to row
                    let rowNum = $(this).data('index');
                    let btnNum = $(this).data('command');

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
                } catch (err) {
                    reportError(`[createTable - btn click] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
                }
            });
        }

        // link copy buttons
        let btnBindingLink = $(`#${themeType}Table [data-command="B"]`);
        btnBindingLink.find('.material-icons').removeClass('material-icons').text('').addClass('mdi mdi-iobroker').css('font-size', '26px').css('font-weight', '100');
        btnBindingLink.on('click', function () {
            try {
                let rowNum = $(this).data('index');

                let inputId = $(`#${themeType}Table input[data-index=${rowNum}][data-name="id"]`);

                if (themeType.includes('colors')) {
                    clipboard.writeText(`{mode:${myNamespace}.colors.darkTheme;light:${myNamespace}.colors.${inputId.val().replace('dark.', 'light.')};dark:${myNamespace}.colors.${inputId.val().replace('light.', 'dark.')}; mode === "true" ? dark : light}`);

                    // Für Entwicklung Binding aufbereitet um in *.html zu verwenden
                    // clipboard.writeText(`{mode:${myNamespace}.colors.darkTheme;light:${myNamespace}.colors.${inputId.val().replace('dark.', 'light.')};dark:${myNamespace}.colors.${inputId.val().replace('light.', 'dark.')}; mode === "true" ? dark : light}`.replace(/;/g, '§').replace(/\"/g, '^'));                
                } else {
                    clipboard.writeText(`{${myNamespace}.${themeType}.${inputId.val()}}`);
                }

                M.Toast.dismissAll();
                M.toast({ html: _('Binding copied to clipboard'), displayLength: 1000, inDuration: 0, outDuration: 0, classes: 'rounded' });
            } catch (err) {
                reportError(`[createTable - btnBindingLink click] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
            }
        });

        let btnMdwLink = $(`#${themeType}Table [data-command="M"]`);
        btnMdwLink.find('.material-icons').removeClass('material-icons').text('').addClass('mdi mdi-material-design').css('font-size', '26px').css('font-weight', '100');
        btnMdwLink.on('click', function () {
            try {
                let rowNum = $(this).data('index');

                let inputId = $(`#${themeType}Table input[data-index=${rowNum}][data-name="id"]`);

                clipboard.writeText(`#mdwTheme:${myNamespace}.${themeType}.${inputId.val().replace('light.', '').replace('dark.', '')}`);

                M.Toast.dismissAll();
                M.toast({ html: _('Material Design Widget datapoint binding copied to clipboard'), displayLength: 1000, inDuration: 0, outDuration: 0, classes: 'rounded' });
            } catch (err) {
                reportError(`[createTable - btnMdwLink click] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
            }
        });

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

    } catch (err) {
        reportError(`[createTable] type: ${themeType} error: ${err.message}, stack: ${err.stack}`);
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
        confirmMessage(`<div style="font-size: 1.2rem; font-family: Segoe UI",Tahoma,Arial,"Courier New" !important;">${_(`Do you want to restore the default ${themeType}?`)}</div>`, `<i class="material-icons left">warning</i>${_('attention')}`, undefined, [_('Cancel'), _('OK')], function (result) {
            if (result === 1) {
                setTimeout(function () {
                    resetToDefault(themeType, themeObject, themeDefaults, settings, onChange);
                }, 250);
            }
        });
    });
}

async function resetToDefault(themeType, themeObject, themeDefaults, settings, onChange) {
    $progress.show();

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

        themeObject[i].desc = _(themeObject[i].desc);
    }

    await createTab(themeType, themeObject, themeDefaults, settings, onChange, true);

    onChange();

    $progress.hide();
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
        reportError(`[loadDefaults] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}

async function checkAllObjectsExistInSettings(themeType, themeObject, themeDefaults, onChange) {
    try {
        // check if all objects exist in settings
        let widgetList = {};

        let jsonList = await getJsonObjects(themeType);
        for (var i = 0; i <= jsonList.length - 1; i++) {
            try {
                if (!themeObject.find(o => o.id === jsonList[i].id)) {

                    // not exist -> add to settings list
                    if (!jsonList[i].value) {
                        jsonList[i].value = themeDefaults[jsonList[i].defaultValue];
                    }

                    jsonList[i].desc = _(jsonList[i].desc);
                    themeObject.splice(i, 0, jsonList[i]);

                    onChange();
                } else {
                    themeObject[i].desc = _(themeObject[i].desc);

                    // widget names changed -> fire onChange
                    if (themeObject[i].widget !== jsonList[i].widget) {
                        themeObject[i].widget = jsonList[i].widget;
                        onChange();
                    }

                    // id changed -> fire onChange
                    if (themeObject[i].id !== jsonList[i].id) {
                        themeObject[i].id = jsonList[i].id;
                        onChange();
                    }
                }

                let themeObjectWidgetList = themeObject[i].widget.split(', ');
                for (const widget of themeObjectWidgetList) {
                    widgetList[widget] = null;
                }

            } catch (err) {
                reportError(`[checkAllObjectsExistInSettings] themeType: ${themeType}, objNr.: ${i}, object: ${JSON.stringify(jsonList[i])} error: ${err.message}, stack: ${err.stack}`);
            }
        }

        createAutocompleteFilterElement(themeType, widgetList);

        return themeObject;

    } catch (err) {
        reportError(`[checkAllObjectsExistInSettings] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}

function createDefaultElement(themeType, themeDefaults, index) {
    try {
        $(`.${themeType}DefaultContainer`).append(`
            <div class="col s12 m6 l3 center" id="${themeType}PickerContainer${index}">
                <label id="${themeType}Input${index}" class="translate defaultLabel" style="text-align: left; display: block; margin-top: 5px;">${_(`${themeType}Default`)} ${index}</label>
                <div style="display: flex; align-items: center; margin-top: -10px;">
                    ${themeType.includes('colors') ? `<div class="${themeType}Picker" id="${themeType}Picker${index}"></div>` : ''}
                    <input type="${themeType === 'fontSizes' ? 'number' : 'text'}" class="value ${themeType}PickerInput" id="${themeType}${index}" value="${themeDefaults[index]}" ${themeType === 'fontSizes' ? 'style="width: 80px; text-align: center;"' : ''} />                
                    <div style="margin-left: 4px; margin-right: 4px; display: flex;">
                        <a class="btn-floating btn-small waves-effect waves-light" id="btn-mdw-${themeType}-${index}" style="width: 32px; height: 32px;"><i class="mdi mdi-material-design" style="font-size: 26px; font-weight: 100;"></i></a>
                        <a class="btn-floating btn-small waves-effect waves-light" id="btn-binding-${themeType}-${index}" style="width: 32px; height: 32px; margin-left: 2px;"><i class="mdi mdi-iobroker" style="font-size: 26px; font-weight: 100;"></i></a>
                    </div>
                </div>
            </div>`);

        $(`#btn-mdw-${themeType}-${index}`).on('click', function () {

            clipboard.writeText(`#mdwTheme:${myNamespace}.${themeType}.default_${index}`);

            M.Toast.dismissAll();
            M.toast({ html: _('Material Design Widget datapoint binding copied to clipboard'), displayLength: 700, inDuration: 0, outDuration: 0, classes: 'rounded' });
        });

        $(`#btn-binding-${themeType}-${index}`).on('click', function () {
            if (themeType.includes('colors')) {
                clipboard.writeText(`{mode:${myNamespace}.colors.darkTheme;light:${myNamespace}.colors.light.default_${index};dark:${myNamespace}.colors.dark.default_${index}; mode === "true" ? dark : light}`);
            } else {
                clipboard.writeText(`{${myNamespace}.${themeType}.default_${index}}`);
            }

            M.Toast.dismissAll();
            M.toast({ html: _('Binding copied to clipboard'), displayLength: 700, inDuration: 0, outDuration: 0, classes: 'rounded' });
        });

    } catch (err) {
        reportError(`[createDefaultElement] themeType: ${themeType}, error: ${err.message}, stack: ${err.stack}`);
    }
}

async function createAutocompleteFilterElement(themeType, widgetList) {
    M.Autocomplete.init($(`#${themeType}TableFilter`), {
        data: widgetList,
        sortFunction: function (a, b, inputString) {
            return a.localeCompare(b);
        },
        onAutocomplete: function (val) {
            // Callback function when value is autcompleted.
            filterTable(themeType, val);
        },
        minLength: 0
    });
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
    let selectedJavascriptInstance = $('#javascriptInstance').val();
    confirmMessage(`<div style="font-size: 1.2rem; font-family: Segoe UI",Tahoma,Arial,"Courier New" !important;">${_('After the script has been generated, the %s instance will be restarted!<br><br>Do you want to continue?', selectedJavascriptInstance)}</div>`, `<i class="material-icons left">warning</i>${_('attention')}`, undefined, [_('Cancel'), _('OK')], function (result) {
        if (result === 1) {
            createJavascript();
        }
    });
}

async function createJavascript() {
    try {
        let selectedJavascriptInstance = $('#javascriptInstance').val();
        var javascriptAdapter = await getObjectAsync(`system.adapter.${selectedJavascriptInstance}`);
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
                        engine: `system.adapter.${selectedJavascriptInstance}`,
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

    setStateAsync(`${myNamespace}.sentry`, obj.sentryReport, true);

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
            } else if (themeType === 'fontSizes') {
                setStateNumber(`${myNamespace}.${themeType}.default_${i}`, `${_(`${themeType}Default`)} ${i}`, themeDefault);
            } else {
                setStateString(`${myNamespace}.${themeType}.default_${i}`, `${_(`${themeType}Default`)} ${i}`, themeDefault);
            }
        });
    }

    for (var i = 0; i <= 3; i++) {
        setTimeout(function () {
            setStateAsync(`${myNamespace}.lastchange`, new Date().getTime(), true);
        }, 500 * i);
    }

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

async function setStateNumber(id, name, val, ack = true) {
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
                    type: 'number',
                    read: true,
                    write: false,
                    role: 'value',
                    def: 14
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

async function getStateAsync(id) {
    return new Promise((resolve, reject) => {
        socket.emit('getState', id, function (err, res) {
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

function generateUuidv4() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function filterTable(themeType, inputVal) {
    if (inputVal.length > 0) {
        $(`#${themeType}Table input[data-name=widget]`).each(function () {
            if (!$(this).val().toUpperCase().includes(inputVal.toUpperCase())) {
                $(this).closest('tr').hide();
            }
        });
    }
}

async function addVersionToAdapterTitle() {
    let instanceObj = await getObjectAsync(`system.adapter.${myNamespace}`);

    if (instanceObj && instanceObj.common && instanceObj.common.installedVersion) {
        let title = $('#adapterTitle');
        title.html(`${title.html()} <font size="3"><i>${instanceObj.common.installedVersion}</i></font>`);
    }
}


function reportError(msg) {
    console.error(msg);

    if (!adapterSettingsIsLoading) {
        showMessage(`<div style="display: flex; align-items: center; flex-direction: row;">
                        <i class="medium material-icons" style="color: FireBrick;">error_outline</i>
                        <div style="margin-left: 12px; font-weight: 700; font-size: 16px;">An error has occurred.<br>Please report this to the developer</div>
                    </div>
                    <textarea class="materialdesign-settings-error-msg" readonly="readonly" style="background: #e9e9e9; margin-top: 20px; height: calc(100% - 160px);">${msg.replace(', error:', ',\nerror:').replace(', stack:', ',\nstack:')}</textarea>`, 'Error', undefined);
    } else {
        if (!errorMsgCollector) {
            errorMsgCollector = msg;
        } else {
            errorMsgCollector = errorMsgCollector + '\n' + msg;
        }
    }
}