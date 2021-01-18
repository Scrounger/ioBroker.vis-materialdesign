/************************************************************************************************************************************************************************
Dieses Skript erzeugt einen json string um den Status aller Adapter mithilfe des Material Design IconList oder Table Widget in VIS anzuzeigen.
created by Scrounger
=========================================================================================================================================================================*/
let version = '1.9.0'                                                               // hier nichts ändern! Version des Skriptes

// !!! Benötigte Adapter !!!                                                        // hier nichts ändern!
let requiredAdapters = {
    vis: '1.3.6',
    "vis-materialdesign": '0.4.2',
    javascript: '4.0.0',
    logparser: '1.1.0'
}

// !!! Benötigte Javascript Adapter NPM Module !!!                                  // hier nichts ändern!
let javascriptModules = [
    'moment',
    'moment-timezone',
    'moment-duration-format'
]
/*=========================================================================================================================================================================

--- Links ---
* Support:          https://forum.iobroker.net/topic/30661/material-design-widgets-adapter-status
* Github:           https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/iconlist/adapterstatus

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


let language = getLanguage();                                                       // wird automatisch vom System übernommen, bei Abweichung Kürzel Sprache angeben, z.B. 'en', 'de', ect.
let useLogParser = true;                                                            // Adpater LogParser verwenden um Fehlermeldung pro Adapter zu zählen und anzuzeigen
let checkScriptUpdates = true;                                                      // Prüft bei jedem skript start ob eine neuere Version vorhanden ist (Internetverbindung wird benötigt)                        

//************************************************************************************************************************************************************************

// imports
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
const request = require('request');

// Fomate für moment Lib
moment.locale(language.toString());

startScript();
async function startScript() {
    if (await dependeciesCheck()) {
        console.debug(`[startScript] Dependecies check successful.`);

        await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.iconList`, '', 'string', 'JSON for Icon List Widget');
        await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.table`, '', 'string', 'JSON for Table Widget');
        await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.sort`, '', 'string', 'sort mode');
        await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.filter`, '', 'string', 'filter mode');
        await myCreateState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.upgradeable`, false, 'boolean', 'script update is available');

        refreshAdapterStatus();



    } else {
        console.error(`Dependecies errors -> script not started!`);
    }
}

async function checkUpdateAvailable() {
    var options = { url: 'https://raw.githubusercontent.com/Scrounger/ioBroker.vis-materialdesign/master/examples/Proxmox/Proxmox.js', method: 'GET', headers: { 'User-Agent': 'request' } };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            //   var info = JSON.parse(body);  // info ist ein Objekt
            //   var x = info.xy;  // xy ist eine Eigenschaft des Objektes info
            //   console.log(info);
            console.log(body.match(/^Version:.*$/m))
        }
    });
}

async function refreshAdapterStatus() {
    let aliveSelector = `[id=system.adapter*.alive]`;
    let adapterList = $(aliveSelector);

    if (adapterList.length > 0) {
        // Fehlermeldung ausgeben, wenn selector kein result liefert
        for (const adapter of adapterList) {
            console.log(adapter);
        }
    } else {
        // listener nur für Änderung bei alive
        console.error(`no result for selector '${aliveSelector}'`);
    }
}

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

    } catch (err) {
        console.error(`[dependeciesCheck] error: ${err.message}, stack: ${err.stack}`);
    }
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

async function myCreateState(id, val, type, name, write = false) {
    if (!await existsStateAsync(id)) {
        console.debug(`[myCreateState] creating state '${id}'`);
        await createStateAsync(id, {
            'name': name,
            'type': type,
            'read': true,
            'write': write
        });
    }

    await setStateAsync(id, val, true);
}