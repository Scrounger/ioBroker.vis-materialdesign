/************************************************************************************************************************************************************************
Version: 1.0.2
created by Scrounger

Dieses Skript erzeugt einen json string um den Status aller Skripte mithilfe des Material Design IconList Widget anzuzeigen.
=========================================================================================================================================================================

!!! Voraussetzungen !!!
* Material Design Widgets               >= 0.2.66
* Javascript Adapter                    >= 4.0.0
* Javascript Adapter NPM Module:        moment, moment-timezone, moment-duration-format
=========================================================================================================================================================================

--- Links ---
* Support:          https://forum.iobroker.net/topic/30662/material-design-widgets-skript-status
* Github:           https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/iconlist/skriptstatus

=========================================================================================================================================================================

--- Changelog ---
* 1.0.0:            Initial release
* 1.0.1:            Verriegeln Funktion hinzugefügt, Fehlerbehebung
* 1.0.2:            Fehlerbehebung falls Texte zu lang

************************************************************************************************************************************************************************/

const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");

// Skript Einstellungen *************************************************************************************************************************************************

let dpList = '0_userdata.0.vis.SkriptStatus.jsonList';                      // Datenpunkt für IconList Widget (Typ: Zeichenkette (String))
let dpskriptRestart = '0_userdata.0.vis.SkriptStatus.restart';              // Datenpunkt für Skript restart (Typ: Zeichenkette (String))

let dpSortMode = '0_userdata.0.vis.SkriptStatus.sortMode';                  // Datenpunkt für Sortieren (Typ: Zeichenkette (String))
let dpFilterMode = '0_userdata.0.vis.SkriptStatus.filterMode';              // Datenpunkt für Filter (Typ: Zeichenkette (String))

const checkInterval = 30;                                                   // Interval wie oft Status der Skripte aktualisiert werden soll (in Sekunden)

let sprache = 'de';                                                         // Sprache für formatierung letzte Änderung
let formatierungLastChange = "ddd DD.MM - HH:mm";                           // Formatierung letzte Änderung -> siehe momentjs library

let neustarten = true;                                                      // true: Skript wird neugestartet, false: Skript wird gestoppt oder gestartet

let farbeSkriptAktiv = 'green';                                             // Status Bar Farbe wenn Skript aktiv ist
let farbeSkriptDeaktiviert = 'darkgrey';                                    // Status Bar Farbe wenn Skript deaktiviert ist
let farbeSkriptProblem = 'FireBrick';                                       // Status Bar Farbe wenn Skript Problem hat

let sortResetAfter = 120;                                                   // Sortierung nach X Sekunden auf sortReset zurücksetzen (0=deaktiviert)
let sortReset = 'name'                                                      // Sortierung auf die zurückgesetzt werden soll

let filterResetAfter = 120;                                                 // Filter nach X Sekunden zurücksetzen (0=deaktiviert)

// **********************************************************************************************************************************************************************


// Fomate für moment Lib
moment.locale(sprache);

// auf Änderungen aktiver Skripts hören
let enableSelector = `[id=javascript.*.scriptEnabled.*]`;
let skriptEnableList = $(enableSelector);
if (skriptEnableList.length === 0) {
    // Fehlermeldung ausgeben, wenn selector kein result liefert
    console.error(`no result for selector '${enableSelector}'`)
} else {
    // listener nur für Änderung bei alive
    skriptEnableList.on(skriptStatus);
}

// auf Änderungen Skripts mit Problemen hören
let problemSelector = `[id=javascript.*.scriptProblem.*]`;
let skriptProblemList = $(problemSelector);
if (skriptProblemList.length === 0) {
    // Fehlermeldung ausgeben, wenn selector kein result liefert
    console.error(`no result for selector '${problemSelector}'`)
} else {
    // listener nur für Änderung bei alive
    skriptProblemList.on(skriptStatus);
}


// auf Änderungen der Sortieung hören
on({ id: dpSortMode, change: 'any' }, skriptStatus);
on({ id: dpSortMode, change: 'any' }, resetSort);

// auf Änderungen der Filter hören
on({ id: dpFilterMode, change: 'any' }, skriptStatus);
on({ id: dpFilterMode, change: 'any' }, resetFilter);


// Funktion adapterStatus alle x Sekunden ausführen
schedule('*/' + checkInterval + ' * * * * *', skriptStatus);

function skriptStatus() {
    try {
        skriptList = [];

        for (var i = 0; i <= skriptEnableList.length - 1; i++) {
            let id = skriptEnableList[i];
            let obj = getObject(id);

            let scriptObj = undefined;
            let scriptName = '';
            let engineType = '';
            let lastChangeText = '';
            let lastChange = 0;
            let image = 'image-off-outline';
            let imageColor = '';
            let statusBarColor = farbeSkriptDeaktiviert;
            let status = 1;


            if (obj && obj !== null && obj.native && obj.native.script) {
                scriptObj = getObject(obj.native.script);

                if (scriptObj && scriptObj.common) {
                    if (scriptObj.common.name) {
                        scriptName = scriptObj.common.name;
                    }

                    if (scriptObj.common.engineType) {
                        engineType = scriptObj.common.engineType.replace('/js', '').replace('/ts', '');

                        if (engineType.toLowerCase() === 'Javascript'.toLowerCase()) {
                            image = 'language-javascript';
                            imageColor = '#ffca28';
                        } else if (engineType.toLowerCase() === 'TypeScript'.toLowerCase()) {
                            image = 'language-typescript';
                            imageColor = '#007acc';
                        } else if (engineType.toLowerCase() === 'Blockly'.toLowerCase()) {
                            image = 'puzzle';
                            imageColor = '#5a80a6';
                        }
                    }

                    if (scriptObj.ts) {
                        lastChange = scriptObj.ts;
                        lastChangeText = moment(scriptObj.ts).format(formatierungLastChange);
                    }

                    if (scriptObj.common.enabled) {
                        statusBarColor = farbeSkriptAktiv;
                        status = 0;
                    }

                    if (myHelper().getStateValueIfExist(id) === 'true') {
                        statusBarColor = farbeSkriptAktiv;
                        status = 0;
                    }

                    if (myHelper().getStateValueIfExist(id.replace('.scriptEnabled.', '.scriptProblem.'), false) === 'true') {
                        statusBarColor = farbeSkriptProblem;
                        status = 2;
                    }

                    let folder = '-';
                    let folderList = id.replace('javascript.0.scriptEnabled.').split(".");
                    if (folderList.length > 1) {
                        folder = id.replace('javascript.0.scriptEnabled.', '').replace('.' + folderList[folderList.length - 1], '');
                    }

                    let text = `<div style="display: flex; flex-direction: row; line-height: 1.5; padding-right: 8px; align-items: center;">
                                    <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">${scriptName}</div>
                                </div>`
                    if (status === 2) {
                        text = `<div style="display: flex; flex-direction: row; line-height: 1.5; padding-right: 8px; align-items: center;">
                                    <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;"><span class="mdi mdi-alert-box-outline" style="color: #ec0909;"></span>${scriptName}</div>
                                </div>`
                    }

                    let subText = `<div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                        <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">Sprache</div>
                                        <div style="color: grey; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${engineType}</div>
                                    </div>
                                    <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px; align-items: center;">
                                        <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">letzte Änderung</div>
                                        <div style="color: grey; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-align: right;">${lastChangeText}</div>
                                    </div>
                                    <div style="display: flex; flex-direction: row; line-height: 1.3; padding-left: 1px; padding-right: 8px;">
                                        <div style="flex: 1; width: 1px; text-overflow: ellipsis; overflow: hidden;">Ordner</div>
                                        <div style="color: grey; font-size: 14px; font-family: RobotoCondensed-LightItalic; text-overflow: ellipsis; white-space: normal; text-align: right;">${folder}</div>
                                    </div>`

                    skriptList.push({
                        text: text,
                        subText: subText,
                        statusBarColor: statusBarColor,
                        image: image,
                        imageColor: imageColor,
                        listType: "buttonState",
                        objectId: dpskriptRestart,
                        buttonStateValue: (obj && obj !== null && obj.native && obj.native.script) ? obj.native.script : '',
                        showValueLabel: false,
                        name: scriptName,
                        lastChange: lastChange,
                        status: status,
                        folder: folder,
                        lockEnabled: true
                    });
                }
            }
        }

        let sortMode = myHelper().getStateValueIfExist(dpSortMode, 'name');

        if (sortMode === 'name') {
            skriptList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        } else if (sortMode === 'lastChange' || sortMode === 'status' || sortMode === 'folder') {
            skriptList.sort(function (a, b) {
                return a[sortMode] == b[sortMode] ? 0 : +(a[sortMode] < b[sortMode]) || -1;
            });
        } else {
            // default: nach name sortieren
            sortMode = 'name'
            skriptList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        }


        let filterMode = myHelper().getStateValueIfExist(dpFilterMode, null);

        if (filterMode && filterMode !== null && filterMode !== '') {
            if (filterMode === 'error') {
                skriptList = skriptList.filter(function (item) {
                    return item.status === 2;
                });
            } else if (filterMode === 'deactivated') {
                skriptList = skriptList.filter(function (item) {
                    return item.status === 1;
                });
            } else if (filterMode === 'activated') {
                skriptList = skriptList.filter(function (item) {
                    return item.status === 0;
                });
            }
        }


        let result = JSON.stringify(skriptList);
        if (existsState(dpList) && getState(dpList).val !== result) {
            setState(dpList, result, true);
        } else {
            setState(dpList, result, true);
        }

    } catch (err) {
        console.error(`[skriptStatus] error: ${err.message}, stack: ${err.stack}`);
    }
}


// // Funktion um Skript starten / Stoppen
on({ id: dpskriptRestart }, function (obj) {
    var scriptObj = getObject(obj.state.val.toString());

    if (neustarten) {
        scriptObj.common.enabled = true;
        setObject(obj.state.val.toString(), scriptObj);
    }
    else {
        if (scriptObj && scriptObj.common) {

            if (scriptObj.common.enabled) {
                scriptObj.common.enabled = false;
            } else {
                scriptObj.common.enabled = true;
            }

            setObject(obj.state.val.toString(), scriptObj);
        }
    }
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

// Beim Staren des Skriptes Adapter Status abrufen
skriptStatus();

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
