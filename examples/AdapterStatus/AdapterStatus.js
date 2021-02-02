/************************************************************************************************************************************************************************
Dieses Skript erzeugt einen json string um den Status aller Adapter mithilfe des Material Design IconList oder Table Widget in VIS anzuzeigen.

created by Scrounger
=========================================================================================================================================================================*/

// Version des Skriptes - hier nichts ändern!
let version = '1.8.0'

// !!! Benötigte Adapter !!!                                                                                                                    // hier nichts ändern!
let requiredAdapters = {
    vis: '1.3.7',
    "vis-materialdesign": '0.4.2',
    javascript: '4.8.4',
    logparser: '1.1.0'
}

// !!! Benötigte Javascript Adapter NPM Module !!!                                                                                              // hier nichts ändern!
let javascriptModules = [
    'moment',
    'moment-timezone'
]

let scriptUrl = "https://raw.githubusercontent.com/Scrounger/ioBroker.vis-materialdesign/master/examples/AdapterStatus/AdapterStatus.js"        // hier nichts ändern!

/*=========================================================================================================================================================================

--- Links ---
* Support:          https://forum.iobroker.net/topic/30661/material-design-widgets-adapter-status
* Github:           https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/AdapterStatus

=========================================================================================================================================================================

--- Changelog ---
* 1.0.0:            Initial release
* 1.0.1:            Verriegeln Funktion hinzugefügt, Einstellung Farbe Werte von bommel_30 hinzugefügt, Fehlerbehebung
* 1.0.2:            Fehlerbehebung falls Texte zu lang
* 2.0.0:            Komplette Überarbeitung des Skriptes

************************************************************************************************************************************************************************/


// Skript Einstellungen *************************************************************************************************************************************************
let idDatenpunktPrefix = '0_userdata.0'                                             // '0_userdata.0' or 'javascript.x'
let idDatenPunktStrukturPrefix = 'vis.MaterialDesignWidgets.AdapterStatus'          // Struktur unter Prefix

let adminUpdatesListId = 'admin.0.info.updatesList';                                // Datenpunkt Admin Adapter für verfübare Updates der Adapter

let language = await getLanguage();                                                 // wird automatisch vom System übernommen, bei Abweichung Kürzel Sprache angeben, z.B. 'en', 'de', ect.

let checkScriptUpdates = true;                                                      // Prüft bei jedem skript start ob eine neuere Version vorhanden ist (Internetverbindung wird benötigt)                        

// Adpater LogParser
let useLogParser = true;                                                            // Verwendung Adpater LogParser aktivieren / deaktivieren
let warnAndErrorId = 'logparser.0.filters.WarnAndError.json'                        // Id des JSON Datenpunktes für alle Warn und Error Meldungen

let myLayout = await getLayout();
async function getLayout() {
    return {
        colors: {
            title: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.title'),
            subTitle: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.subTitle'),
            statusBar: {
                active: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.active'),
                notActive: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.notActive'),
                notConnected: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.notConnected'),
                deactivated: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.deactivated'),
                extension: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.extension'),
                once: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.once'),
                schedule: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.statusBar.schedule')
            },
            icons: {
                upgradeable: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.icons.upgradeable')
            },
            datapoints: {
                desc: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.desc'),
                value: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.value'),
                icon: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.icon'),
            }
        },
        fonts: {
            title: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.title'),
            subTitle: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.subTitle'),
            datapoints: {
                desc: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.datapoints.desc'),
                value: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.datapoints.value')
            }
        },
        fontSizes: {
            title: await getMdwTheme('vis-materialdesign.0.fontSizes.scripts.adapterStatus.title'),
            subTitle: await getMdwTheme('vis-materialdesign.0.fontSizes.scripts.adapterStatus.subTitle'),
            datapoints: {
                desc: await getMdwTheme('vis-materialdesign.0.fontSizes.scripts.adapterStatus.datapoints.desc'),
                value: await getMdwTheme('vis-materialdesign.0.fontSizes.scripts.adapterStatus.datapoints.value')
            },
            icons: {
                upgradeable: await getMdwTheme('vis-materialdesign.0.fontSizes.scripts.adapterStatus.icons.upgradeable')
            }
        },
        icons: {
            upgradeable: 'update',
            cpu: '',
            ram_total: '',
            ram_used: '',
            ram_reserved: '',
            uptime: '',
            mode: '',
            logParser: {
                warn: 'alert',
                error: 'alert-box'
            }
        }
    }
}

async function getValueLayout(id, icon, title, unit = '', convertToDuration = '') {
    if (await existsStateAsync(id)) {
        return `<div class='vis-widget materialdesign-widget materialdesign-value materialdesign-value-html-element'
                    style='width: 100%; height: auto; position: relative; display: flex; align-items: center;'
                    mdw-debug='false'
                    mdw-oid='${id}'
                    mdw-textAlign='end'
                    mdw-valuesFontColor='${myLayout.colors.datapoints.value}'
                    mdw-valuesFontFamily='${myLayout.fonts.datapoints.value}'
                    mdw-valuesFontSize='${myLayout.fontSizes.datapoints.value}'
                    mdw-prepandText='${title}'
                    mdw-prepandTextColor='${myLayout.colors.datapoints.desc}'
                    mdw-prepandTextFontFamily='${myLayout.fonts.datapoints.desc}'
                    mdw-prepandTextFontSize='${myLayout.fontSizes.datapoints.desc}'
                    mdw-valueLabelUnit='${unit}'
                    mdw-image='${icon}'
                    mdw-imageColor='${myLayout.colors.datapoints.icon}'
                    mdw-iconPosition='left'
                    mdw-iconHeight='20'
                    mdw-convertToDuration='${convertToDuration}'
                    mdw-minDecimals='2'
                ></div>`;
    } else {
        return ''
    }
}

async function getButtonLayout(){
    return `<div class='vis-widget materialdesign-widget materialdesign-button materialdesign-button-html-element'
                style='width: 100%; height: 30px; position: relative; padding: 0px; border-radius: 4px 4px 0 0;'
                mdw-type='state_default'
                mdw-oid='nothing_selected'
                mdw-buttonStyle='text'
                mdw-value='true'
                mdw-vibrateOnMobilDevices='50'
                mdw-buttontext=' State'
                mdw-textFontFamily='#mdwTheme:vis-materialdesign.0.fonts.button.default.text'
                mdw-textFontSize='#mdwTheme:vis-materialdesign.0.fontSizes.button.default.text'
                mdw-mdwButtonPrimaryColor='#mdwTheme:vis-materialdesign.0.colors.button.default.primary'
                mdw-mdwButtonSecondaryColor='#mdwTheme:vis-materialdesign.0.colors.button.default.secondary'
                mdw-image='pencil'
                mdw-iconPosition='left'
                mdw-autoLockAfter='10'
                mdw-lockIconColor='#mdwTheme:vis-materialdesign.0.colors.button.lock_icon'
                mdw-lockFilterGrayscale='30'
            ></div>`
}

let logParserWarnIconColor = 'gold'
let logParserErrorIconColor = 'FireBrick'

//************************************************************************************************************************************************************************

// imports
const moment = require("moment");
const request = require('request');

// Fomate für moment Lib
moment.locale(language.toString());

// vars
let aliveSelector = `[id=system.adapter*.alive]`;
let adapterAliveList = $(aliveSelector);
let logParserList = undefined;                                  //TODO: update / listener, Graph mit Error / Warn pro Instanz

// listener

startScript();
async function startScript() {
    try {
        if (await dependeciesCheck()) {
            console.debug(`[startScript] Dependecies check successful.`);

            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.iconList`, '', 'string', 'JSON for Icon List Widget');
            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.table`, '', 'string', 'JSON for Table Widget');
            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.sort`, '', 'string', 'sort mode');
            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.filter`, '', 'string', 'filter mode');
            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.upgradeable`, false, 'boolean', 'script update is available');
            await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.updateInfo`, '', 'string', 'JSON for Alarm Widget');

            if (checkScriptUpdates) {
                checkUpdateAvailable();
                on({ id: 'admin.0.info.newUpdates', change: 'any' }, checkUpdateAvailable);         // prüft bei Adapter Update durch Admin ob neue version des skriptes verfügbar, sofern aktiviert
            }

            useLogParser = await checkLogParser();
            if (useLogParser) {
                await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.show`, false, 'boolean', 'show Dialog Widget');
                await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.adapter`, '', 'string', 'used adpater for dialog');
                await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.table`, '', 'string', 'JSON for table used in dialog');
                await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.title`, '', 'string', 'dialog title');
                await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.subtitle`, '', 'string', 'dialog subtitle');

                on({ id: `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.adapter`, change: 'any' }, showDialog);
            }

            if (adapterAliveList.length > 0) {
                refreshAdapterStatus();
                adapterAliveList.on(refreshAdapterStatus);
            } else {
                // listener nur für Änderung bei alive
                console.error(`no result for selector '${aliveSelector}'`);
            }

            // auf .connection Änderungen hören
            let connectionSelector = `[id=*.info.connection]`;
            let adapterConnectionList = $(connectionSelector);
            if (adapterConnectionList.length > 0) {
                // listener nur für Änderung bei alive
                adapterConnectionList.on(refreshAdapterStatus);
            } else {
                // Fehlermeldung ausgeben, wenn selector kein result liefert
                console.error(`no result for selector '${connectionSelector}'`)
            }

            // auf .connected Änderungen hören
            let connectedSelector = `[id=system.adapter.*.connected]`;
            let adapterConnectedList = $(connectedSelector);
            if (adapterConnectedList.length > 0) {
                adapterConnectedList.on(refreshAdapterStatus);
            } else {
                console.error(`no result for selector '${connectedSelector}'`)
            }

            // MDW-Theme changes listener
            on({ id: 'vis-materialdesign.0.lastchange', change: 'any' }, refreshAdapterStatus);
            on({ id: 'vis-materialdesign.0.colors.darkTheme', change: 'any' }, refreshAdapterStatus);

        } else {
            console.error(`Dependecies errors -> script not started!`);
        }
    } catch (err) {
        console.error(`[startScript] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function refreshAdapterStatus(obj) {
    if (obj) {
        console.debug(`[refreshAdapterStatus] triggered by '${obj.id}'`);
    } else {
        console.debug(`[refreshAdapterStatus] triggered by script start`);
    }

    let updateList = await getMyState(adminUpdatesListId);

    try {
        console.debug(`[refreshAdapterStatus] using LogParser Adapter is ${useLogParser ? 'activated' : 'deactivated'}`);

        let iconList = [];

        if (obj && (obj.id === 'vis-materialdesign.0.lastchange' || obj.id === 'vis-materialdesign.0.colors.darkTheme')) {
            console.debug(`[refreshAdapterStatus] theme has changed`);
            myLayout = await getLayout();
        }

        if (useLogParser) {
            await getAndFormatLogParser();
        }

        // Fehlermeldung ausgeben, wenn selector kein result liefert
        for (const adapter of adapterAliveList) {
            let idAdapter = replaceLast(adapter, '.alive', '');
            let instance = idAdapter.replace('system.adapter.', '');
            let objAdapter = await getMyObject(idAdapter);

            if (objAdapter && objAdapter.common) {
                let warnCounts = 0;
                let errorCounts = 0;
                let logParserElement = '';

                if (useLogParser) {
                    let result = await filterLogParserList(idAdapter);
                    warnCounts = result.warnCounts;
                    errorCounts = result.errorCounts;
                    logParserElement = result.element;
                }

                let status = await getStatusColor(idAdapter, objAdapter);
                let subText = `<div style="margin-top: 10px;">
                                    ${logParserElement}
                                    ${await getValueLayout(idAdapter + '.cpu', myLayout.icons.cpu, _('CPU'), '%')}
                                    ${await getValueLayout(idAdapter + '.memHeapTotal', myLayout.icons.ram_total, _('RAM total'), 'MB')}
                                    ${await getValueLayout(idAdapter + '.memHeapUsed', myLayout.icons.ram_total, _('RAM used'), 'MB')}
                                    ${await getValueLayout(idAdapter + '.memRss', myLayout.icons.ram_reserved, _('RAM reserved'), 'MB')}
                                    ${((objAdapter.common.mode === 'daemon' || objAdapter.common.mode === 'once') && objAdapter.common.enabled) ? `${await getValueLayout(idAdapter + '.uptime', myLayout.icons.uptime, _("runtime"), '', 'humanize')}` : '<br>'}
                                </div>`

                let statusBar = `<div style="display: flex;">
                                    ${await getButtonLayout()} 
                                    ${await getButtonLayout()}
                                </div>
                                <div style="width: 100%; background: ${status.color}; height: 4px; border-radius: 0 0 4px 4px;"></div>`

                iconList.push({
                    listType: (useLogParser && (warnCounts > 0 || errorCounts > 0)) ? "buttonState" : "text",
                    objectId: `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.adapter`,
                    buttonStateValue: `${idAdapter.replace('system.adapter.', '')}|${objAdapter.common.title}`,
                    showValueLabel: false,
                    text: await getTitle(idAdapter, instance, objAdapter, updateList),
                    subText: subText,
                    image: await getImage(objAdapter, idAdapter),
                    status: status.status,
                    // statusBarColor: status.color,
                    statusBarText: statusBar
                });
            } else {
                console.error(`[refreshAdapterStatus] Adapter object '${idAdapter}' has no common properties!`);
            }
        }

        let newVal = JSON.stringify(iconList);
        let oldState = await getMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.iconList`);
        if (oldState.val !== newVal) {
            await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.iconList`, newVal);
        }

    } catch (err) {
        console.error(`[refreshAdapterStatus] error: ${err.message}, stack: ${err.stack}`);
    }
}



async function showDialog(obj) {
    if (logParserList) {
        let instance = obj.state.val.split("|")[0];
        let name = obj.state.val.split("|")[1];

        let filteredList = logParserList.filter(e => e.from === instance);

        await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.table`, JSON.stringify(filteredList));
        await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.show`, true);
        await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.title`, name);
        await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.dialog.subtitle`, instance);
    }
}

//#region LogParser Functions
async function checkLogParser() {
    try {
        if (useLogParser) {
            console.debug(`[checkLogParser] Adapter LogParser is activated, using datapoint '${warnAndErrorId}'`);

            if (!await existsStateAsync(warnAndErrorId)) {
                console.error(`[checkLogParser] datapoint '${warnAndErrorId}' not exist! Check your settings of LogParser Adapter`);
                return false;
            } else {
                // on({ id: warnAndErrorId, change: 'any' }, refreshAdapterStatus);
                return true;
            }
        }
    } catch (err) {
        console.error(`[checkLogParser] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function getAndFormatLogParser() {
    try {
        // refresh log parser data
        let obj = await getMyState(warnAndErrorId);
        if (obj && obj.val) {
            let rawData = JSON.parse(obj.val);
            logParserList = [];

            if (rawData && rawData.length > 0) {
                for (var i = 0; i <= rawData.length - 1; i++) {
                    let data = rawData[i];

                    if (data.severity.includes('>warn<') || data.severity.includes('>error<')) {
                        logParserList.push({
                            date: data.date,
                            severity: data.severity.includes('>warn<') ? `<span class="mdi mdi-${myLayout.icons.logParser.warn}" style="color: ${logParserWarnIconColor};"></span>` : `<span class="mdi mdi-${myLayout.icons.logParser.error}" style="color: ${logParserErrorIconColor};"></span>`,
                            from: data.from,
                            message: data.message,
                            level: data.severity.includes('>warn<') ? 'warn' : 'error',
                            ts: data.ts
                        });
                    }
                }
            }
        } else {
            logParserList = undefined;
        }
    } catch (err) {
        console.error(`[getAndFormatLogParser] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function filterLogParserList(idAdapter) {
    idAdapter = idAdapter.replace('system.adapter.', '');
    let warns = 0;
    let errors = 0;

    try {
        let filtered = logParserList.filter(e => e.from === idAdapter);


        if (filtered && filtered.length > 0) {
            warns = filtered.filter(e => e.level.includes('warn')).length;
            errors = filtered.filter(e => e.level.includes('error')).length;
            console.debug(`[filterLogParserList] instance '${idAdapter}' has ${warns} warn and ${errors} error messages`);
        }
    } catch (err) {
        console.error(`[filterLogParserList] error: ${err.message}, stack: ${err.stack}`);
    }

    let element = `<div style="display: flex; justify-content: end; align-items: center;">
                        <span style="flex: 1; color: ${myLayout.colors.datapoints.desc}; font-family: ${myLayout.fonts.datapoints.desc}; font-size: ${myLayout.fontSizes.datapoints.desc};">Log</span>`

    if (warns > 0 || errors > 0) {
        if (warns > 0) {
            element += `<span class="mdi mdi-${myLayout.icons.logParser.warn}" style="font-size: ${myLayout.fontSizes.datapoints.value}; margin-right: 2px; color: ${logParserWarnIconColor};"></span>
                        <span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">${warns}</span>`;
        }

        if (errors > 0) {
            element += `<span class="mdi mdi-${myLayout.icons.logParser.error}" style="font-size: ${myLayout.fontSizes.datapoints.value}; margin-right: 2px; color: ${logParserErrorIconColor};"></span>
                        <span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">${errors}</span>`
        }
    } else {
        element += `<span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">keine</span>`
    }

    element += '</div>';

    return { warnCounts: warns, errorCounts: errors, element: element }
}
//#endregion

//#region Dependecies Functions
async function dependeciesCheck() {
    try {
        // Check required Adapter versions 
        for (const adapterName in requiredAdapters) {
            if (await existsObjectAsync(`system.adapter.${adapterName}`)) {
                let requiredVersion = requiredAdapters[adapterName];
                let adapter = await getObjectAsync(`system.adapter.${adapterName}`);

                if (adapterName !== 'logparser' || (adapterName === 'logparser' && useLogParser)) {
                    if (adapter.common && adapter.common.version) {
                        let adapterVersion = adapter.common.version;

                        if (compareVersions(adapterVersion, requiredVersion)) {
                            console.debug(`[dependeciesCheck] Adapter '${adapterName}' ${adapterVersion} is installed`);
                        } else {
                            console.error(`newer version of Adapter '${adapterName}' is required - installed: ${adapterVersion}, required ${requiredVersion}`)
                            return false;
                        }
                    }
                }
            } else {
                console.error(`Adapter '${adapterName}' is needed for this script, please install it!`);
                return false;
            }
        }

        // Check required Javascript Adapter NPM Modules 
        let javascriptInstanceObj = await getObjectAsync(`system.adapter.javascript.${instance}`);

        if (javascriptInstanceObj) {
            if (javascriptInstanceObj.native && javascriptInstanceObj.native.libraries) {
                let installedModules = javascriptInstanceObj.native.libraries;

                for (const module of javascriptModules) {
                    if (installedModules.includes(module)) {
                        console.debug(`[dependeciesCheck] NPM Module '${module}' is installed for 'javascript.${instance}' instance`);
                    } else {
                        console.error(`NPM Module '${module}' is not installed for 'javascript.${instance}' instance. Please install the npm module!`)
                        return false;
                    }
                }
            } else {
                console.error(`No npm modules for 'javascript.${instance}' instance found. Please install the required npm modules!`)
            }
        }

        return true;
    } catch (err) {
        console.error(`[dependeciesCheck] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function checkUpdateAvailable(obj) {
    try {
        console.debug(`[startScript] looking for new script versions is ${checkScriptUpdates ? 'activated' : 'deactivated'}`);

        if (checkScriptUpdates) {
            var options = { url: scriptUrl, method: 'GET', headers: { 'User-Agent': 'request' } };

            request(options, async function (error, response, body) {
                if (!error && response && response.statusCode && response.statusCode == 200) {
                    let extractedVersion = body.match(/^let version = \'[0-9]*\.?[0-9]*.*$/m);

                    if (extractedVersion) {
                        let availableVersion = extractedVersion.toString().match(/\d+(\.\d+)+/);

                        if (availableVersion && availableVersion[0]) {
                            availableVersion = availableVersion[0];

                            if (compareVersions(version, availableVersion)) {
                                console.debug(`[checkUpdateAvailable] no new script version is available (installed: ${version})`);
                                await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.upgradeable`, false);

                                await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.updateInfo`, '');
                            } else {
                                console.warn(`[checkUpdateAvailable] new version '${availableVersion}' of script is available (installed: ${version})`);
                                await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.upgradeable`, true);

                                let alarmMessage = [{
                                    text: `new version ${availableVersion} of script is available`,
                                    icon: 'information-variant',
                                    iconColor: "#44739e",
                                    backgroundColor: "#fafafa",
                                    fontColor: "#44739e",
                                }]

                                await setMyState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.updateInfo`, JSON.stringify(alarmMessage));
                            }
                        }
                    }
                } else {
                    console.warn(`[checkUpdateAvailable] check failed, code: ${response.statusCode == 200}, error: ${error}`);
                }
            });
        }
    } catch (err) {
        console.error(`[checkUpdateAvailable] error: ${err.message}, stack: ${err.stack}`);
    }
}
//#endregion

//#region Helper Functions

async function getTitle(idAdapter, instance, objAdapter, updateList) {
    let upgradeable = (await isAdapterUpgradeable(updateList, idAdapter)) ? `<span class="mdi mdi-${myLayout.icons.upgradeable}" style="color: ${myLayout.colors.icons.upgradeable}; font-size: ${myLayout.fontSizes.icons.upgradeable}px;"></span>` : '';
    return `<div style="display: flex; flex-direction: row; line-height: 1.1; padding-right: 8px;">
                    <div style="flex: 1; width: 1px; display: block; margin-right: 10px;">
                        <div style="color: ${myLayout.colors.title}; font-family: ${myLayout.fonts.title}; font-size: ${myLayout.fontSizes.title}px; text-overflow: ellipsis; overflow: hidden;">${objAdapter.common.title}</div>
                        <div style="color: ${myLayout.colors.subTitle}; font-family: ${myLayout.fonts.subTitle}; font-size: ${myLayout.fontSizes.subTitle}px; text-overflow: ellipsis; overflow: hidden;">${instance}</div>
                    </div>
                    ${upgradeable}
                </div>`
}

async function getImage(obj, idAdapter) {
    if (obj.common.icon) {
        let path = `/${idAdapter.replace('system.adapter.', '').split('.')[0]}.admin/${obj.common.icon}`;

        console.debug(`[getImage] '${idAdapter}' image path: ${path}`);
        return path
    }
}

async function getStatusColor(idAdapter, objAdapter) {
    let color = myLayout.colors.statusBar.notActive;
    let status = 'notActive';

    let alive = await getMyState(`${idAdapter}.alive`, true);

    if (alive && alive.val) {
        color = myLayout.colors.statusBar.active;
        status = 'activated';

        let connection = await getMyState(`${idAdapter.replace('system.adapter.', '')}.info.connection`, true);
        if (connection && !connection.val) {
            color = myLayout.colors.statusBar.notConnected;
            status = 'notConnected';
        } else {
            let connected = await getMyState(`${idAdapter}.connected`, true);
            if (connected && !connected.val) {
                color = myLayout.colors.statusBar.notConnected;
                status = 'notConnected';
            }
        }
    }

    if (objAdapter.common.mode === 'schedule') {
        // Adapter ist zeitgesteuert
        color = myLayout.colors.statusBar.schedule;
        status = 'schedule';
    }

    if (objAdapter.common.mode === 'extension') {
        // Adapter ist Extension
        color = myLayout.colors.statusBar.extension;
        status = 'extension';
    }

    if (objAdapter.common.mode === 'once') {
        // Adapter wird mit System gestartet
        color = myLayout.colors.statusBar.once;
        status = 'once';
    }

    if (!objAdapter.common.enabled) {
        // Adapter ist deaktiviert
        color = myLayout.colors.statusBar.deactivated;
        status = 'deactivated';
    }

    return { color: color, status: status }
}

async function getLanguage() {
    try {
        let sysConfig = await getObjectAsync('system.config');

        if (sysConfig && sysConfig.common && sysConfig.common.language) {
            console.debug(`[getLanguage] using language '${sysConfig.common.language}'`);
            return sysConfig.common.language;
        } else {
            console.warn(`system language could not be read -> Fallback to 'en`);
            return 'en';
        }
    } catch (err) {
        console.error(`[getLanguage] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function isAdapterUpgradeable(updateList, idAdapter) {
    if (updateList) {
        let val = updateList.val;
        return val && val.includes(idAdapter.replace('system.adapter.', '').split(".")[0]);
    }

    return false;
}

async function getMdwTheme(id) {
    if (id.startsWith('vis-materialdesign.0.')) {
        if (id.startsWith('vis-materialdesign.0.colors.')) {
            if (await existsStateAsync('vis-materialdesign.0.colors.darkTheme')) {
                let darkTheme = await getStateAsync('vis-materialdesign.0.colors.darkTheme');

                if (darkTheme.val) {
                    id = id.replace('.light.', '.dark.');
                }
            }
        }

        if (await existsStateAsync(id)) {
            let state = await getStateAsync(id);
            return state.val;
        } else {
            console.error(`[getMdwTheme] datapoint '${id}' not exist! Go to Material Design Widgets settings and fix the issue!`);
        }
    } else {
        console.error(`[getMdwTheme] datapoint '${id}' is not a valid Material Design Widget theme datapoint! Check your script settings!`);
    }
}

async function myCreateState(id, val, type, name, write = false) {
    try {
        if (!await existsStateAsync(id)) {
            console.debug(`[myCreateState] creating state '${id}'`);
            await createStateAsync(id, {
                'name': name,
                'type': type,
                'read': true,
                'write': write
            });

            await setStateAsync(id, val, true);
        }
    } catch (err) {
        console.error(`[myCreateState] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function setMyState(id, val, ack = true) {
    try {
        if (await existsStateAsync(id)) {
            await setStateAsync(id, val, ack);
        } else {
            console.error(`[mySetState] datapoint '${id}' not exist! Please restart the script manually!`);
        }
    } catch (err) {
        console.error(`[mySetState] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function getMyState(id, ignoreWarnings = false) {
    try {
        if (await existsStateAsync(id)) {
            return await getStateAsync(id);
        } else {
            if (!ignoreWarnings) console.error(`[mySetState] datapoint '${id}' not exist!`);
            return undefined;
        }
    } catch (err) {
        console.error(`[mySetState] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function getMyObject(id) {
    try {
        if (await existsObjectAsync(id)) {
            return await getObjectAsync(id);
        } else {
            console.error(`[mySetState] datapoint '${id}' not exist!`);
            return undefined;
        }
    } catch (err) {
        console.error(`[mySetState] error: ${err.message}, stack: ${err.stack}`);
    }
}

function compareVersions(adapterVersion, requiredVersion) {
    const x = adapterVersion.split('.').map(e => parseInt(e, 10));
    const y = requiredVersion.split('.').map(e => parseInt(e, 10));

    for (const i in x) {
        y[i] = y[i] || 0;
        if (x[i] === y[i]) {
            continue;
        } else if (x[i] > y[i]) {
            return true;
        } else {
            return false;
        }
    }
    return y.length > x.length ? false : true;
}

function replaceLast(str, what, replacement) {
    return reverse(reverse(str).replace(new RegExp(reverse(what)), reverse(replacement)));
};

function reverse(str) {
    return str.split('').reverse().join('');
};

let _ = function (text) {
    if (dictionary[text] && dictionary[text][language]) {
        return dictionary[text][language];
    } else {
        console.warn(`no translation for '${text}' exists`);
        return text;
    }
}

let dictionary = {
    "runtime": {
        "en": "runtime",
        "de": "Laufzeit",
        "ru": "время выполнения",
        "pt": "tempo de execução",
        "nl": "looptijd",
        "fr": "Durée",
        "it": "runtime",
        "es": "tiempo de ejecución",
        "pl": "runtime",
        "zh-cn": "运行"
    },
    "RAM total": {
        "en": "RAM total",
        "de": "RAM insgesamt",
        "ru": "Всего RAM",
        "pt": "RAM total",
        "nl": "RAM totaal",
        "fr": "Total RAM",
        "it": "RAM totale",
        "es": "RAM total",
        "pl": "Całkowita pamięć RAM",
        "zh-cn": "总RAM"
    },
    "RAM used": {
        "en": "RAM used",
        "de": "RAM verwendet",
        "ru": "ОЗУ использовано",
        "pt": "RAM usada",
        "nl": "RAM gebruikt",
        "fr": "RAM utilisée",
        "it": "RAM utilizzata",
        "es": "RAM utilizada",
        "pl": "Wykorzystana pamięć RAM",
        "zh-cn": "使用的RAM"
    },
    "RAM reserved": {
        "en": "RAM reserved",
        "de": "RAM reserviert",
        "ru": "RAM зарезервировано",
        "pt": "RAM reservada",
        "nl": "RAM gereserveerd",
        "fr": "RAM réservée",
        "it": "RAM riservata",
        "es": "RAM reservada",
        "pl": "Pamięć RAM zarezerwowana",
        "zh-cn": "RAM预留"
    },
    "CPU": {
        "en": "CPU",
        "de": "CPU",
        "ru": "ЦПУ",
        "pt": "CPU",
        "nl": "processor",
        "fr": "CPU",
        "it": "processore",
        "es": "UPC",
        "pl": "procesor",
        "zh-cn": "中央处理器"
    }
}
//#endregion