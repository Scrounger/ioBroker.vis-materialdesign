/************************************************************************************************************************************************************************
Version: 1.0.2
created by Scrounger

Dieses Skript erzeugt einen json string um den Status aller Adapter mithilfe des Material Design IconList Widget anzuzeigen.
=========================================================================================================================================================================

!!! Voraussetzungen !!!
* Material Design Widgets               >= 0.2.66
* Javascript Adapter                    >= 4.0.0
* Javascript Adapter NPM Module:        moment, moment-timezone, moment-duration-format
=========================================================================================================================================================================

--- Links ---
* Support:          https://forum.iobroker.net/topic/30661/material-design-widgets-adapter-status
* Github:           https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/iconlist/adapterstatus

=========================================================================================================================================================================

--- Changelog ---
* 1.0.0:            Initial release
* 1.0.1:            Verriegeln Funktion hinzugefügt, Einstellung Farbe Werte von bommel_30 hinzugefügt, Fehlerbehebung
* 1.0.2:            Fehlerbehebung falls Texte zu lang

************************************************************************************************************************************************************************/

// Imports -> müssen im Javascript Adapter unter 'Zusätzliche NPM-Module' eingetragen sein
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");


// Skript Einstellungen *************************************************************************************************************************************************

let dpList = '0_userdata.0.vis.AdapterStatus.jsonList';                     // Datenpunkt für IconList Widget (Typ: Zeichenkette (String))
let dpAdapterRestart = '0_userdata.0.vis.AdapterStatus.restartTrigger';     // Datenpunkt für Adapter restart (Typ: Zeichenkette (String))

let dpSortMode = '0_userdata.0.vis.AdapterStatus.sortMode';                 // Datenpunkt für Sortieren (Typ: Zeichenkette (String))
let dpFilterMode = '0_userdata.0.vis.AdapterStatus.filterMode';             // Datenpunkt für Filter (Typ: Zeichenkette (String))

let adminUpdatesList = 'admin.0.info.updatesList';                          // Datenpunkt Admin Adapter für verfübare Updates der Adapter

const checkInterval = 30;                                                   // Interval wie oft Status der Adapter aktualisiert werden soll (in Sekunden)

let sprache = 'de';                                                         // Sprache für formatierung Dauer 
let formatierungDauer = "dd[T] hh[h] mm[m]";                                // Formatierung der Dauer -> siehe momentjs library

let neustarten = true;                                                      // true: Adapter wird neugestartet, false: Adapter wird gestoppt oder gestartet

let verriegeln = true;                                                      // Verriegeln Funktion verwenden

let farbeAdapterAktiv = 'green';                                            // Status Bar Farbe wenn Adapter aktiv ist
let farbeAdapterNichtAktiv = 'FireBrick';                                   // Status Bar Farbe wenn Adapter nicht aktiv ist oder Fehler vorliegt
let farbeAdapterDeaktiviert = 'darkgrey';                                   // Status Bar Farbe wenn Adapter deaktiviert ist
let farbeAdapterNichtVerbunden = 'yellow';                                  // Status Bar Farbe wenn Adapter nicht verbunden ist
let farbeAdapterZeitgesteuert = 'lightgreen';                               // Status Bar Farbe wenn Adapter zeitgesteuert ist
let farbeAdapterErweiterung = '#44739e';                                    // Status Bar Farbe wenn Adapter Erweiterung ist
let farbeAdapterSystem = '#44739e';                                         // Status Bar Farbe wenn Adapter mit System gestartet wird
let farbeAdapterWerte = 'gray';                                             // Sekundärfarbe Adapterwerte


let sortResetAfter = 120;                                                   // Sortierung nach X Sekunden auf sortReset zurücksetzen (0=deaktiviert)
let sortReset = 'memHeapUsed'                                               // Sortierung auf die zurückgesetzt werden soll

let filterResetAfter = 120;                                                 // Filter nach X Sekunden zurücksetzen (0=deaktiviert)



// **********************************************************************************************************************************************************************

// Fomate für moment Lib
moment.locale(sprache);

// auf .alive Änderungen hören
let aliveSelector = `[id=system.adapter.*.alive]`;
let adapterAliveList = $(aliveSelector);
if (adapterAliveList.length === 0) {
    // Fehlermeldung ausgeben, wenn selector kein result liefert
    console.error(`no result for selector '${aliveSelector}'`)
} else {
    // listener nur für Änderung bei alive
    adapterAliveList.on(adapterStatus);
}

// auf .connection Änderungen hören
let connectionSelector = `[id=*.info.connection]`;
let adapterConnectionList = $(connectionSelector);
if (adapterConnectionList.length === 0) {
    // Fehlermeldung ausgeben, wenn selector kein result liefert
    console.error(`no result for selector '${connectionSelector}'`)
} else {
    // listener nur für Änderung bei alive
    adapterConnectionList.on(adapterStatus);
}

// auf .connected Änderungen hören
let connectedSelector = `[id=system.adapter.*.connected]`;
let adapterConnectedList = $(connectedSelector);
if (adapterConnectedList.length === 0) {
    // Fehlermeldung ausgeben, wenn selector kein result liefert
    console.error(`no result for selector '${connectedSelector}'`)
} else {
    // listener nur für Änderung bei alive
    adapterConnectedList.on(adapterStatus);
}

// auf Änderungen der Sortieung hören
on({ id: dpSortMode, change: 'any' }, adapterStatus);
on({ id: dpSortMode, change: 'any' }, resetSort);

// auf Änderungen der Filter hören
on({ id: dpFilterMode, change: 'any' }, adapterStatus);
on({ id: dpFilterMode, change: 'any' }, resetFilter);

// Funktion adapterStatus alle x Sekunden ausführen
schedule('*/' + checkInterval + ' * * * * *', adapterStatus);

function adapterStatus() {
    // Funktion um Status der Adapter abzurufen und als JSON String für das Material Design Widget IconList aufbereiten
    try {
        let adapterList = [];
        let updateList = myHelper().getStateValueIfExist(adminUpdatesList);

        for (var i = 0; i <= adapterAliveList.length - 1; i++) {
            let id = adapterAliveList[i].replace('.alive', '');
            let obj = getObject(adapterAliveList[i].replace('.alive', ''));

            let nameArray = id.replace('system.adapter.', '').split(".");

            let name = nameArray[0];
            name = name.charAt(0).toUpperCase() + name.slice(1);

            let nameWithInstance = name;
            let adapterInstance = nameArray[1];
            if (parseInt(adapterInstance) > 0) {
                nameWithInstance = name + '.' + adapterInstance;
            }

            let uptime = (existsState(id + '.uptime')) ? moment.duration(getState(id + '.uptime').val, 'seconds').format(formatierungDauer, 0) : '-';
            let image = (myHelper().checkCommonPropertyExist(obj, 'icon')) ? `/${nameArray[0]}.admin/${obj.common.icon}` : 'image-off-outline';

            let hasUpdates = updateList && updateList.includes(nameArray[0]);
            let newVersion = (hasUpdates) ? '<span class="mdi mdi-update" style="color: #ec0909;"></span>' : '';

            let text = `<div style="display: flex; flex-direction: row; line-height: 1.5; padding-right: 8px; align-items: center;">
                            <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">${newVersion} ${nameWithInstance}</div>
                            <div style="color: ${farbeAdapterWerte}; font-size: 12px; font-family: RobotoCondensed-LightItalic;">${myHelper().getCommonPropertyIfExist(obj, 'version', '-', 'v', '')}</div>
                        </div>`

            let subText = `<div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">CPU</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${myHelper().getStateValueIfExist(id + '.cpu', '-', '', ' %')}</div>
                            </div>
                            <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">RAM total</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${myHelper().getStateValueIfExist(id + '.memHeapTotal', '-', '', ' MB')}</div>
                            </div>
                            <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">RAM verwendet</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${myHelper().getStateValueIfExist(id + '.memHeapUsed', '-', '', ' MB')}</div>
                            </div>
                            <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">RAM reserviert</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${myHelper().getStateValueIfExist(id + '.memRss', '-', '', ' MB')}</div>
                            </div>
                            <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">Betriebszeit</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${uptime}</div>
                            </div>
                            <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">Modus</div>
                                <div style="color: ${farbeAdapterWerte}; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${myHelper().getCommonPropertyIfExist(obj, 'mode', '-')}</div>
                            </div>`

            let statusBarColor = farbeAdapterNichtAktiv;
            let status = 3;            

            if (myHelper().getStateValueIfExist(adapterAliveList[i]) === 'true') {
                statusBarColor = farbeAdapterAktiv;
                status = 0;

                if (existsState(id.replace('system.adapter.', '') + '.info.connection')) {
                    if (!getState(id.replace('system.adapter.', '') + '.info.connection').val) {
                        statusBarColor = farbeAdapterNichtVerbunden;
                        status = 4;
                    }
                } else {
                    if (myHelper().getStateValueIfExist(adapterAliveList[i].replace('.alive', '.connected')) === 'false') {
                        statusBarColor = farbeAdapterNichtVerbunden;
                        status = 4;
                    }
                }
            }

            if (myHelper().getCommonPropertyIfExist(obj, 'mode') === 'schedule') {
                // Adapter ist zeitgesteuert
                statusBarColor = farbeAdapterZeitgesteuert;
                status = 1;
            }

            if (myHelper().getCommonPropertyIfExist(obj, 'mode') === 'extension') {
                // Adapter ist Extension
                statusBarColor = farbeAdapterErweiterung;
                status = 1;
            }

            if (myHelper().getCommonPropertyIfExist(obj, 'mode') === 'once') {
                // Adapter wird mit System gestartet
                statusBarColor = farbeAdapterSystem;
                status = 1;
            }

            if (myHelper().getCommonPropertyIfExist(obj, 'enabled', false).toString() === 'false') {
                // Adapter ist deaktiviert
                statusBarColor = farbeAdapterDeaktiviert;
                status = 2;
            }

            adapterList.push({
                text: text,
                subText: subText,
                image: image,
                listType: "buttonState",
                objectId: dpAdapterRestart,
                buttonStateValue: id,
                statusBarColor: statusBarColor,
                showValueLabel: false,
                name: name,
                mode: myHelper().getCommonPropertyIfExist(obj, 'mode'),
                hasUpdates: hasUpdates,
                cpu: parseFloat(myHelper().getStateValueIfExist(id + '.cpu', '0')),
                memHeapTotal: parseFloat(myHelper().getStateValueIfExist(id + '.memHeapTotal', '0')),
                memHeapUsed: parseFloat(myHelper().getStateValueIfExist(id + '.memHeapUsed', '0')),
                memRss: parseFloat(myHelper().getStateValueIfExist(id + '.memRss', '0')),
                uptime: parseFloat(myHelper().getStateValueIfExist(id + '.uptime', 0)),
                status: status,
                lockEnabled: verriegeln
            });
        }

        let sortMode = myHelper().getStateValueIfExist(dpSortMode, 'name');

        if (sortMode === 'name' || sortMode === 'mode') {
            adapterList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        } else if (sortMode === 'hasUpdates' || sortMode === 'cpu' || sortMode === 'memHeapTotal' || sortMode === 'memHeapUsed' || sortMode === 'memRss' || sortMode === 'uptime' || sortMode === 'status') {
            adapterList.sort(function (a, b) {
                return a[sortMode] == b[sortMode] ? 0 : +(a[sortMode] < b[sortMode]) || -1;
            });
        } else {
            // default: nach name sortieren
            sortMode = 'name'
            adapterList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        }

        // Filter: not connected, updates, deaktiviert, aktiviert

        let filterMode = myHelper().getStateValueIfExist(dpFilterMode, null);

        if (filterMode && filterMode !== null && filterMode !== '') {
            if (filterMode === 'hasUpdates') {
                adapterList = adapterList.filter(function (item) {
                    return item.hasUpdates === true;
                });
            } else if (filterMode === 'notConnected') {
                adapterList = adapterList.filter(function (item) {
                    return item.status === 4;
                });
            } else if (filterMode === 'deactivated') {
                adapterList = adapterList.filter(function (item) {
                    return item.status === 2;
                });
            } else if (filterMode === 'activated') {
                adapterList = adapterList.filter(function (item) {
                    return item.status <= 1;
                });
            }
        }

        let result = JSON.stringify(adapterList);
        if (existsState(dpList) && getState(dpList).val !== result) {
            setState(dpList, result, true);
        } else {
            setState(dpList, result, true);
        }

    } catch (err) {
        console.error(`[adapterStatus] error: ${err.message}, stack: ${err.stack}`);
    }
}

// Beim Staren des Skriptes Adapter Status abrufen
adapterStatus();

// Funktion um Adapter zu starten / neu starten
on({ id: dpAdapterRestart }, function (obj) {
    var adapter = getObject(obj.state.val.toString());

    if (neustarten) {
        if (adapter.common && adapter.common.enabled === false) {
            // Adapter deaktiviert -> starten
            adapter.common.enabled = true;
        }
    } else {
        if (adapter.common && adapter.common.enabled) {
            adapter.common.enabled = !adapter.common.enabled;
        } else {
            adapter.common.enabled = true;
        }
    }

    setObject(obj.state.val, adapter);
    console.log(`${obj.state.val.replace('system.adapter.', '')} neugestartet`);
});


function resetSort() {
    let sortMode = myHelper().getStateValueIfExist(dpSortMode, null);

    if (sortResetAfter > 0) {
        setTimeout(function () {
            if (sortMode !== null && sortMode === myHelper().getStateValueIfExist(dpSortMode, null)) {
                setState(dpSortMode, sortReset);
            }
        }, sortResetAfter * 1000);
    }
}

function resetFilter() {
    let filterMode = myHelper().getStateValueIfExist(dpFilterMode, null);

    if (filterResetAfter > 0) {
        setTimeout(function () {
            if (filterMode !== null && filterMode === myHelper().getStateValueIfExist(dpFilterMode, null)) {
                setState(dpFilterMode, '');
            }
        }, filterResetAfter * 1000);
    }
}

function myHelper() {
    return {
        getStateValueIfExist: function (id, nullValue = undefined, prepand = '', append = '') {
            if (existsState(id)) {
                return prepand + getState(id).val + append;
            } else {
                return nullValue;
            }
        },
        getCommonPropertyIfExist: function (object, prop, nullValue = undefined, prepand = '', append = '') {
            if (myHelper().checkCommonPropertyExist(object, prop)) {
                return prepand + object.common[prop] + append;
            } else {
                return nullValue;
            }
        },
        checkCommonPropertyExist: function (object, prop) {
            if (object && object.common && object.common[prop]) {
                return true;
            } else {
                return false;
            }
        }
    }
}