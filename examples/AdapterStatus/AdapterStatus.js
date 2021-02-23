/************************************************************************************************************************************************************************
This script creates a json string to display the status of all adapters using the Material Design IconList or Table Widget in VIS.

created by Scrounger        https://forum.iobroker.net/user/scrounger
=========================================================================================================================================================================

--- Links ---
* Support:                  https://forum.iobroker.net/topic/30661/material-design-widgets-adapter-status
* Github:                   https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/AdapterStatus

=========================================================================================================================================================================

--- Changelog ---
* 2.0.0:                    Complete revision of the script

************************************************************************************************************************************************************************/

// Version of the script - do not change anything here!
let version = '1.7.0'

// Required adapters - do not change anything here!
let requiredAdapters = {
    vis: '1.3.7',
    "vis-materialdesign": '0.4.2',
    javascript: '4.8.4',
    logparser: '1.1.0'
}

// Required Javascript Adapter NPM Module - do not change anything here!
let javascriptModules = [
    'moment',
    'moment-timezone'
]

// Skript Update URL - do not change anything here!
let scriptUrl = "https://raw.githubusercontent.com/Scrounger/ioBroker.vis-materialdesign/master/examples/AdapterStatus/AdapterStatus.js"


// Script Settings *************************************************************************************************************************************************
let debug = false;                                                                   // debug Modus

// show hosts
let showHosts = true;

// Adpater LogParser
let useLogParser = true;                                                            // Enable / disable use of the Adpater LogParser
let warnAndErrorId = 'logparser.0.filters.WarnAndError.json'                        // Id of the JSON datapoint for all warning and error messages

// Check for Script Updates
let checkScriptUpdates = true;                                                      // Checks at script start and cyclically if a newer version is available (internet connection required)

// Language
let language = await getLanguage();                                                 // is automatically taken over by the system, in case of deviation specify abbreviation language, e.g. 'en', 'de', ect.

// layout settings ******************************************************************************************************************************************************
// All layout settings (color, font and font size) can be configured with the Theme Editor in the Adapter Settings. 

let showValueIcons = false;                                                                                                                     // show icons before values description                                            

let myLayout = await getLayout();
async function getLayout() {
    return {
        colors: {                                                                                                                               // colors
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
                upgradeable: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.icons.upgradeable'),
                logParser: {
                    warn: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.icons.logParser.warn'),
                    error: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.icons.logParser.error')
                },
            },
            datapoints: {
                desc: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.desc'),
                value: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.value'),
                icon: await getMdwTheme('vis-materialdesign.0.colors.light.scripts.adapterStatus.datapoints.icon'),
            }
        },
        fonts: {                                                                                                                                // fonts
            title: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.title'),
            subTitle: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.subTitle'),
            datapoints: {
                desc: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.datapoints.desc'),
                value: await getMdwTheme('vis-materialdesign.0.fonts.scripts.adapterStatus.datapoints.value')
            }
        },
        fontSizes: {                                                                                                                            // font sizes
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
        icons: {                                                                                                                                // icons
            upgradeable: 'update',
            cpu: 'cpu-64-bit',
            ram_total: 'memory',
            ram_used: 'memory',
            ram_reserved: 'memory',
            uptime: 'clock-check-outline',
            logParser: {
                warn: 'alert',
                error: 'alert-box'
            },
            buttons: {
                start: 'play',
                stop: 'stop',
                restart: 'restart'
            },
            sort: {
                adapterName: 'sort-alphabetical-variant',
                adapterInstance: 'sort-numeric-variant',
                status: 'information-variant',
                upgradeable: 'update'
            },
            filter: {
                activated: 'checkbox-marked',
                deactivated: 'checkbox-blank-outline',
                notActive: 'checkbox-blank-off-outline',
                notConnected: 'network-off'
            },
            host: 'iobroker'
        }
    }
}

// Values layout
async function getValueLayout(id, icon, title, unit = '', convertToDuration = '') {
    let idExists = await existsStateAsync(id);

    return `<div class='vis-widget materialdesign-widget materialdesign-value materialdesign-value-html-element'
                style='width: 100%; height: auto; position: relative; display: flex; align-items: center;'
                mdw-debug='false'
                mdw-oid='${idExists ? id : ''}'
                mdw-overrideText='${!idExists ? '-' : ''}'
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
                mdw-iconHeight='14'
                mdw-convertToDuration='${convertToDuration}'
                mdw-minDecimals='2'
                mdw-changeEffectEnabled='true'
                mdw-effectFontColor='#00e640'
                mdw-effectDuration='1500'
            ></div>`;
}

// Buttons Layout
async function getButtonLayout(id, value, title, icon) {
    return `<div class='vis-widget materialdesign-widget materialdesign-button materialdesign-button-html-element'
                style='width: 100%; height: 30px; position: relative; padding: 0px; border-radius: 4px 4px 0 0;'
                mdw-type='state_default'
                mdw-oid='${id}'
                mdw-buttonStyle='text'
                mdw-value='${value}'
                mdw-vibrateOnMobilDevices='50'
                mdw-buttontext='${title}'
                mdw-textFontFamily='#mdwTheme:vis-materialdesign.0.fonts.button.default.text'
                mdw-textFontSize='#mdwTheme:vis-materialdesign.0.fontSizes.button.default.text'
                mdw-mdwButtonPrimaryColor='#mdwTheme:vis-materialdesign.0.colors.button.default.primary'
                mdw-mdwButtonSecondaryColor='#mdwTheme:vis-materialdesign.0.colors.button.default.secondary'
                mdw-image='${icon}'
                mdw-iconPosition='left'
                mdw-autoLockAfter='10'
                mdw-lockIconColor='#mdwTheme:vis-materialdesign.0.colors.button.lock_icon'
                mdw-lockFilterGrayscale='30'
            ></div>`
}

// datapoints settings (experts only!) ***********************************************************************************************************************************
let idDatenpunktPrefix = '0_userdata.0';                                            // '0_userdata.0' or 'javascript.x'
let idDatenPunktStrukturPrefix = 'vis.MaterialDesignWidgets.AdapterStatus';         // Datapoint structure under prefix

let adminUpdatesListId = 'admin.0.info.updatesList';                                // Datapoint of the Admin Adapter with info about available updates of the single adapters

let datapointIDs = {                                                                // used datapoints of the script where all data are stored                             
    action: 'action',
    iconList: 'iconList',
    table: 'table',
    updateInfo: 'updateInfo',
    upgradeable: 'upgradeable',
    dialog: {
        adapter: 'dialog.adapter',
        show: 'dialog.show',
        subtitle: 'dialog.subtitle',
        table: 'dialog.table',
        title: 'dialog.title',
        image: 'dialog.image'
    },
    select: {
        sort: 'select.sort',
        sortJson: 'select.sortJson',
        progress: 'select.progress',
        filter: 'select.filter',
        filterJson: 'select.filterJson'
    },
    hosts: {
        iconList: 'hosts.iconList'
    }
}

//************************************************************************************************************************************************************************

// imports
const moment = require("moment");
const request = require('request');

// Fomate für moment Lib
moment.locale(language.toString());

// vars
let aliveSelector = `[id=system.adapter*.alive]`;
let adapterAliveList = $(aliveSelector);

let aliveHostSelector = `[id=system.host.*.alive]`;
let hostAliveList = $(aliveSelector);

let logParserList = undefined;                                  //TODO: update / listener, Graph mit Error / Warn pro Instanz

// listener


startScript();
async function startScript() {
    try {
        if (await dependeciesCheck()) {
            if (debug) console.debug(`[startScript] Dependecies check successful.`);

            // AdapterStatus Datapoints
            await myCreateStateAsync(createId(datapointIDs.iconList), '', 'string', 'JSON for Icon List Widget');
            await myCreateStateAsync(createId(datapointIDs.table), '', 'string', 'JSON for Table Widget');

            await myCreateStateAsync(createId(datapointIDs.select.progress), false, 'boolean', 'show progress bar');

            await myCreateStateAsync(createId(datapointIDs.select.sort), '', 'string', 'sort mode');
            await myCreateStateAsync(createId(datapointIDs.select.sortJson), '', 'string', 'json string for Select Widget');
            await generateSortJson();
            on({ id: createId(datapointIDs.select.sort), change: 'any' }, refreshAdapterStatus);

            await myCreateStateAsync(createId(datapointIDs.select.filter), '', 'string', 'filter mode');
            await myCreateStateAsync(createId(datapointIDs.select.filterJson), '', 'string', 'json string for Select Widget');
            await generateFilterJson()
            on({ id: createId(datapointIDs.select.filter), change: 'any' }, refreshAdapterStatus);

            await myCreateStateAsync(createId(datapointIDs.upgradeable), false, 'boolean', 'script update is available');
            await myCreateStateAsync(createId(datapointIDs.updateInfo), '', 'string', 'JSON for Alarm Widget');
            await myCreateStateAsync(createId(datapointIDs.action), '', 'string', 'Button action');

            on({ id: createId(datapointIDs.action), change: 'any' }, adapterAction);

            if (checkScriptUpdates) {
                checkUpdateAvailable();
                on({ id: 'admin.0.info.newUpdates', change: 'any' }, checkUpdateAvailable);         // prüft bei Adapter Update durch Admin ob neue version des skriptes verfügbar, sofern aktiviert
            }

            useLogParser = await checkLogParser();
            if (useLogParser) {
                await myCreateStateAsync(createId(datapointIDs.dialog.show), false, 'boolean', 'show Dialog Widget');
                await myCreateStateAsync(createId(datapointIDs.dialog.adapter), '', 'string', 'used adpater for dialog');
                await myCreateStateAsync(createId(datapointIDs.dialog.table), '', 'string', 'JSON for table used in dialog');
                await myCreateStateAsync(createId(datapointIDs.dialog.title), '', 'string', 'dialog title');
                await myCreateStateAsync(createId(datapointIDs.dialog.subtitle), '', 'string', 'dialog subtitle');
                await myCreateStateAsync(createId(datapointIDs.dialog.image), '', 'string', 'dialog image');

                on({ id: createId(datapointIDs.dialog.adapter), change: 'any' }, showDialog);
            }

            // Adapter: auf .alive Änderungen hören
            if (adapterAliveList.length > 0) {
                refreshAdapterStatus();
                adapterAliveList.on(refreshAdapterStatus);
            } else {
                // listener nur für Änderung bei alive
                console.error(`no result for selector '${aliveSelector}'`);
            }

            // Adapter: auf .connection Änderungen hören
            let connectionSelector = `[id=*.info.connection]`;
            let adapterConnectionList = $(connectionSelector);
            if (adapterConnectionList.length > 0) {
                // listener nur für Änderung bei alive
                adapterConnectionList.on(refreshAdapterStatus);
            } else {
                // Fehlermeldung ausgeben, wenn selector kein result liefert
                console.error(`no result for selector '${connectionSelector}'`)
            }

            // Adapter: auf .connected Änderungen hören
            let connectedSelector = `[id=system.adapter.*.connected]`;
            let adapterConnectedList = $(connectedSelector);
            if (adapterConnectedList.length > 0) {
                adapterConnectedList.on(refreshAdapterStatus);
            } else {
                console.error(`no result for selector '${connectedSelector}'`)
            }

            if (showHosts) {
                // Adapter: auf .alive Änderungen hören
                if (hostAliveList.length > 0) {
                    hostAliveList.on(refreshAdapterStatus);
                } else {
                    // listener nur für Änderung bei alive
                    console.error(`no result for selector '${aliveHostSelector}'`);
                }
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
        if (debug) console.debug(`[refreshAdapterStatus] triggered by '${obj.id}'`);
    } else {
        if (debug) console.debug(`[refreshAdapterStatus] triggered by script start`);
    }

    await setMyStateAsync(createId(datapointIDs.select.progress), true, true);

    let updateList = await getMyStateAsync(adminUpdatesListId);

    // ggf. wurden neuer Adapter installiert ohne das das skript neu gestartet wurde -> adapter liste refreshen
    adapterAliveList = $(aliveSelector);

    try {
        if (debug) console.debug(`[refreshAdapterStatus] using LogParser Adapter is ${useLogParser ? 'activated' : 'deactivated'}`);

        let iconList = [];

        if (obj && (obj.id === 'vis-materialdesign.0.lastchange' || obj.id === 'vis-materialdesign.0.colors.darkTheme')) {
            if (debug) console.debug(`[refreshAdapterStatus] theme has changed`);
            myLayout = await getLayout();
        }

        if (useLogParser) {
            await getAndFormatLogParser();
        }

        for (const adapter of adapterAliveList) {
            let idAdapter = replaceLast(adapter, '.alive', '');
            let instance = idAdapter.replace('system.adapter.', '');
            let objAdapter = await getMyObjectAsync(idAdapter);

            if (objAdapter && objAdapter.common) {
                let warnCounts = 0;
                let errorCounts = 0;
                let logParserElement = '';
                let status = await getStatusColor(idAdapter, objAdapter);

                if (useLogParser) {
                    let result = await filterLogParserList(idAdapter);
                    warnCounts = result.warnCounts;
                    errorCounts = result.errorCounts;
                    logParserElement = result.element;

                    if (warnCounts > 0 || errorCounts > 0) {
                        let title = objAdapter.common.title;
                        let index = objAdapter.common.title.indexOf(' ', objAdapter.common.title.indexOf(' ') + 1);
                        if (index > 0) {
                            title = title.substring(0, index) + '\\n' + title.substring(index + 1)
                        }
                    }
                }

                let titleObj = await getTitle(idAdapter, instance, objAdapter, updateList);
                let valuesObj = await getValues(idAdapter);
                let imagePath = await getImage(objAdapter, idAdapter);

                iconList.push({
                    listType: (useLogParser && (warnCounts > 0 || errorCounts > 0)) ? "buttonState" : "text",
                    objectId: createId(datapointIDs.dialog.adapter),
                    buttonStateValue: `${idAdapter.replace('system.adapter.', '')}|${objAdapter.common.title}|${imagePath}`,
                    showValueLabel: false,
                    text: titleObj.element,
                    subText: await getSubTitle(idAdapter, objAdapter, logParserElement),
                    image: imagePath,
                    status: status.status,
                    statusBarText: await getStatusBar(status, instance),
                    adapterName: titleObj.adapterName,
                    instance: instance,
                    upgradeable: titleObj.upgradeable,
                    warnings: warnCounts,
                    errors: errorCounts,
                    cpu: valuesObj.cpu,
                    memHeapTotal: valuesObj.memHeapTotal,
                    memHeapUsed: valuesObj.memHeapUsed,
                    memRss: valuesObj.memRss,
                    uptime: valuesObj.uptime
                });

            } else {
                console.error(`[refreshAdapterStatus] Adapter object '${idAdapter}' has no common properties!`);
            }
        }

        if (showHosts) await refreshHostStatus(obj, iconList);

        iconList = await filterList(obj, iconList);
        await sortList(obj, iconList);

        await setMyStateAsync(createId(datapointIDs.select.progress), false, true);

        let newVal = JSON.stringify(iconList);
        let oldState = await getMyStateAsync(createId(datapointIDs.iconList));
        if (oldState.val !== newVal) {
            await setMyStateAsync(createId(datapointIDs.iconList), newVal);
        }

    } catch (err) {
        console.error(`[refreshAdapterStatus] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function refreshHostStatus(obj, iconList) {
    let updateList = await getMyStateAsync(adminUpdatesListId);

    // ggf. wurden neuer Host installiert ohne das das skript neu gestartet wurde -> adapter liste refreshen
    hostAliveList = $(aliveHostSelector);

    try {
        if (debug) console.debug(`[refreshHostStatus] using LogParser Adapter is ${useLogParser ? 'activated' : 'deactivated'}`);

        if (obj && (obj.id === 'vis-materialdesign.0.lastchange' || obj.id === 'vis-materialdesign.0.colors.darkTheme')) {
            if (debug) console.debug(`[refreshHostStatus] theme has changed`);
            myLayout = await getLayout();
        }

        if (useLogParser) {
            await getAndFormatLogParser();
        }

        for (const host of hostAliveList) {
            let idHost = replaceLast(host, '.alive', '');
            let objHost = await getMyObjectAsync(idHost);

            if (objHost && objHost.common) {
                let hostName = objHost.common.hostname
                let warnCounts = 0;
                let errorCounts = 0;
                let logParserElement = '';
                let status = await getStatusColor(idHost, undefined);

                if (useLogParser) {
                    let result = await filterLogParserList(idHost);
                    warnCounts = result.warnCounts;
                    errorCounts = result.errorCounts;
                    logParserElement = result.element;
                }

                let titleObj = await getTitle(idHost, undefined, undefined, updateList, hostName);
                let valuesObj = await getValues(idHost);

                iconList.push({
                    listType: (useLogParser && (warnCounts > 0 || errorCounts > 0)) ? "buttonState" : "text",
                    objectId: createId(datapointIDs.dialog.adapter),
                    buttonStateValue: `${idHost.replace('system.', '')}|${hostName}`,
                    showValueLabel: false,
                    text: titleObj.element,
                    subText: await getSubTitle(idHost, undefined, logParserElement),
                    image: myLayout.icons.host,
                    status: status.status,
                    statusBarColor: status.color,
                    adapterName: titleObj.adapterName,
                    instance: titleObj.adapterName,
                    upgradeable: titleObj.upgradeable,
                    warnings: warnCounts,
                    errors: errorCounts,
                    cpu: valuesObj.cpu,
                    memHeapTotal: valuesObj.memHeapTotal,
                    memHeapUsed: valuesObj.memHeapUsed,
                    memRss: valuesObj.memRss,
                    uptime: valuesObj.uptime
                });
            } else {
                console.error(`[refreshAdapterStatus] Host object '${idHost}' has no common properties!`);
            }
        }

    } catch (err) {
        console.error(`[refreshHostStatus] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function generateSortJson() {
    let list = [
        {
            text: _('adapter name'),
            value: 'adapterName',
            icon: myLayout.icons.sort.adapterName
        },
        {
            text: _('adapter instance'),
            value: 'instance',
            icon: myLayout.icons.sort.adapterInstance
        },
        {
            text: _('status'),
            value: 'status',
            icon: myLayout.icons.sort.status
        },
        {
            text: _('updates available'),
            value: 'upgradeable',
            icon: myLayout.icons.sort.upgradeable
        },
        {
            text: _('CPU'),
            value: "cpu",
            icon: myLayout.icons.cpu
        },
        {
            text: _("RAM total"),
            value: "memHeapTotal",
            icon: myLayout.icons.ram_total
        },
        {
            text: _("RAM used"),
            value: "memHeapUsed",
            icon: myLayout.icons.ram_used
        },
        {
            text: _("RAM reserved"),
            value: "memRss",
            icon: myLayout.icons.ram_reserved
        },
        {
            text: _("runtime"),
            value: "uptime",
            icon: myLayout.icons.uptime
        }
    ];

    if (useLogParser) {
        list.push(
            {
                text: _('Warnings'),
                value: 'warnings',
                icon: myLayout.icons.logParser.warn
            },
            {
                text: _('Errors'),
                value: 'errors',
                icon: myLayout.icons.logParser.error
            }
        );
    }

    await setMyStateAsync(createId(datapointIDs.select.sortJson), JSON.stringify(list), true);
}

async function generateFilterJson() {
    let list = [
        {
            text: _('updates available'),
            value: 'upgradeable',
            icon: myLayout.icons.sort.upgradeable
        },
        {
            text: _('activated'),
            value: 'activated',
            icon: myLayout.icons.filter.activated
        },
        {
            text: _('deactivated'),
            value: 'deactivated',
            icon: myLayout.icons.filter.deactivated
        },
        {
            text: _('not active'),
            value: 'notActive',
            icon: myLayout.icons.filter.notActive
        },
        {
            text: _('not connected'),
            value: 'notConnected',
            icon: myLayout.icons.filter.notConnected
        },
    ]

    if (useLogParser) {
        list.push(
            {
                text: _('Warnings'),
                value: 'warnings',
                icon: myLayout.icons.logParser.warn
            },
            {
                text: _('Errors'),
                value: 'errors',
                icon: myLayout.icons.logParser.error
            }
        );
    }

    await setMyStateAsync(createId(datapointIDs.select.filterJson), JSON.stringify(list), true);
}

async function filterList(obj, list) {
    let filterState;
    let filterMode = undefined;

    if (obj && obj.id === createId(datapointIDs.select.filter)) {
        filterState = obj.state;
    } else {
        filterState = await getMyStateAsync(createId(datapointIDs.select.filter));
    }

    if (filterState && filterState.val) {
        filterMode = filterState.val;

        if (filterMode && filterMode !== '') {
            if (filterMode === 'notActive' || filterMode === 'activated' || filterMode === 'deactivated' || filterMode === 'notConnected') {
                list = list.filter(function (item) {
                    return item.status === filterMode;
                });
            } else if (filterMode === 'warnings' || filterMode === 'errors') {
                list = list.filter(function (item) {
                    return item[filterMode] > 0;
                });
            } else if (filterMode === 'upgradeable') {
                list = list.filter(function (item) {
                    return item.upgradeable === true;
                });
            }
        }
    }

    return list;
}

let reverseSort = 1;
async function sortList(obj, list) {
    let sortState;
    let sortMode = 'Adaptername';

    if (obj && obj.id === createId(datapointIDs.select.sort)) {
        sortState = obj.state;
        if (obj.state.val === obj.oldState.val) {
            reverseSort = reverseSort * (-1);
        } else {
            reverseSort = 1;
        }
    } else {
        sortState = await getMyStateAsync(createId(datapointIDs.select.sort));
    }

    // console.warn(reverseSort);

    if (sortState && sortState.val) {
        sortMode = sortState.val;

        if (debug) console.debug(`[sortList] sort list, sortMode '${sortMode}'`);

        if (sortMode === 'adapterName' || sortMode === 'instance' || sortMode === 'status') {
            list.sort(function (a, b) {
                return (a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1) * reverseSort;
            });
        } else if (sortMode === 'upgradeable' || sortMode === 'cpu' || sortMode === 'memHeapTotal' || sortMode === 'memHeapUsed' || sortMode === 'memRss' || sortMode === 'uptime' || sortMode === 'warnings' || sortMode === 'errors') {
            list.sort(function (a, b) {
                return (a[sortMode] == b[sortMode] ? 0 : +(a[sortMode] < b[sortMode]) || -1) * reverseSort;
            });
        }
    }
}

async function adapterAction(obj) {
    // start, restart, stop adapter

    if (obj && obj.state && obj.state.val) {
        let instance = obj.state.val.split('|')[0];
        let action = obj.state.val.split('|')[1];
        let adapterObj = await getObjectAsync('system.adapter.' + instance);

        if (adapterObj && adapterObj.common) {
            if (debug) console.debug(`[adapterAction] ${action} '${instance}'`);

            if (action === 'restart') {
                adapterObj.common.enabled = true;
            } else if (action === 'start') {
                adapterObj.common.enabled = true;
            } else if (action === 'stop') {
                adapterObj.common.enabled = false;
            }
        }

        setObject('system.adapter.' + instance, adapterObj);
    }
}

async function showDialog(obj) {
    if (logParserList) {
        let objSplitted = obj.state.val.split("|");
        let instance = objSplitted[0];
        let name = objSplitted[1];
        let image = objSplitted[2];

        let filteredList = logParserList.filter(e => e.from === instance);

        await setMyStateAsync(createId(datapointIDs.dialog.table), JSON.stringify(filteredList));
        await setMyStateAsync(createId(datapointIDs.dialog.title), name);
        await setMyStateAsync(createId(datapointIDs.dialog.subtitle), instance);
        await setMyStateAsync(createId(datapointIDs.dialog.image), image);

        await setMyStateAsync(createId(datapointIDs.dialog.show), true);
    }
}

//#region LogParser Functions
async function checkLogParser() {
    try {
        if (useLogParser) {
            if (debug) console.debug(`[checkLogParser] Adapter LogParser is activated, using datapoint '${warnAndErrorId}'`);

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
        let obj = await getMyStateAsync(warnAndErrorId);
        if (obj && obj.val) {
            let rawData = JSON.parse(obj.val);
            logParserList = [];

            if (rawData && rawData.length > 0) {
                for (var i = 0; i <= rawData.length - 1; i++) {
                    let data = rawData[i];

                    if (data.severity.includes('>warn<') || data.severity.includes('>error<')) {
                        logParserList.push({
                            date: data.date,
                            severity: data.severity.includes('>warn<') ? `<span class="mdi mdi-${myLayout.icons.logParser.warn}" style="color: ${myLayout.colors.icons.logParser.warn};"></span>` : `<span class="mdi mdi-${myLayout.icons.logParser.error}" style="color: ${myLayout.colors.icons.logParser.error};"></span>`,
                            message: data.message,
                            from: data.from,
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

async function filterLogParserList(id) {
    if (id.includes('.host.')) {
        id = id.replace('system.', '');
    } else {
        id = id.replace('system.adapter.', '');
    }

    let warns = 0;
    let errors = 0;

    try {
        let filtered = logParserList.filter(e => e.from === id);


        if (filtered && filtered.length > 0) {
            warns = filtered.filter(e => e.level.includes('warn')).length;
            errors = filtered.filter(e => e.level.includes('error')).length;
            if (debug) console.debug(`[filterLogParserList] instance '${id}' has ${warns} warn and ${errors} error messages`);
        }
    } catch (err) {
        console.error(`[filterLogParserList] error: ${err.message}, stack: ${err.stack}`);
    }

    let element = `<div style="display: flex; justify-content: end; align-items: center;">
                        <span style="flex: 1; text-align: left; color: ${myLayout.colors.datapoints.desc}; font-family: ${myLayout.fonts.datapoints.desc}; font-size: ${myLayout.fontSizes.datapoints.desc};">Log</span>`

    if (warns > 0 || errors > 0) {
        if (warns > 0) {
            element += `<span class="mdi mdi-${myLayout.icons.logParser.warn}" style="font-size: ${myLayout.fontSizes.datapoints.value}; margin-right: 2px; color: ${myLayout.colors.icons.logParser.warn};"></span>
                        <span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">${warns}</span>`;
        }

        if (errors > 0) {
            element += `<span class="mdi mdi-${myLayout.icons.logParser.error}" style="font-size: ${myLayout.fontSizes.datapoints.value}; margin-right: 2px; color: ${myLayout.colors.icons.logParser.error};"></span>
                        <span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">${errors}</span>`
        }
    } else {
        element += `<span style="margin-right: 4px; color: ${myLayout.colors.datapoints.value}; font-family: ${myLayout.fonts.datapoints.value}; font-size: ${myLayout.fontSizes.datapoints.value};">-</span>`
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
                            if (debug) console.debug(`[dependeciesCheck] Adapter '${adapterName}' ${adapterVersion} is installed`);
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
                        if (debug) console.debug(`[dependeciesCheck] NPM Module '${module}' is installed for 'javascript.${instance}' instance`);
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
        if (debug) console.debug(`[startScript] looking for new script versions is ${checkScriptUpdates ? 'activated' : 'deactivated'}`);

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
                                if (debug) console.debug(`[checkUpdateAvailable] no new script version is available (installed: ${version})`);
                                await setMyStateAsync(createId(datapointIDs.upgradeable), false);

                                await setMyStateAsync(createId(datapointIDs.updateInfo), '');
                            } else {
                                console.warn(`[checkUpdateAvailable] new version '${availableVersion}' of script is available (installed: ${version})`);
                                await setMyStateAsync(createId(datapointIDs.upgradeable), true);

                                let alarmMessage = [{
                                    text: _('new version %s of script is available').replace('%s', availableVersion),
                                    icon: 'information-variant',
                                    iconColor: "#44739e",
                                    backgroundColor: "#fafafa",
                                    fontColor: "#44739e",
                                }]

                                await setMyStateAsync(createId(datapointIDs.updateInfo), JSON.stringify(alarmMessage));
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

async function getTitle(idAdapter, instance, objAdapter, updateList, hostName = undefined) {
    let upgradeable = await isAdapterUpgradeable(updateList, idAdapter);
    let adapterName = !hostName ? objAdapter.common.title : hostName

    return {
        adapterName: adapterName,
        upgradeable: upgradeable,
        element: `<div style="display: flex; flex-direction: row; line-height: 1.1; padding-right: 8px;">
                    <div style="flex: 1; width: 1px; display: block; margin-right: 10px;">
                        <div style="color: ${myLayout.colors.title}; font-family: ${myLayout.fonts.title}; font-size: ${myLayout.fontSizes.title}px; text-overflow: ellipsis; overflow: hidden;">${adapterName}</div>
                        ${!hostName ? `<div style="color: ${myLayout.colors.subTitle}; font-family: ${myLayout.fonts.subTitle}; font-size: ${myLayout.fontSizes.subTitle}px; text-overflow: ellipsis; overflow: hidden;">${instance}</div>` : ''}
                    </div>
                    ${upgradeable ? `<span class="mdi mdi-${myLayout.icons.upgradeable}" style="color: ${myLayout.colors.icons.upgradeable}; font-size: ${myLayout.fontSizes.icons.upgradeable}px;"></span>` : ''}
                </div>`
    }
}

async function getSubTitle(id, objAdapter, logParserElement) {
    return `<div style="margin-top: 10px;">
                ${logParserElement}
                ${await getValueLayout(id + '.cpu', showValueIcons ? myLayout.icons.cpu : '', _('CPU'), '%')}
                ${await getValueLayout(id + '.memHeapTotal', showValueIcons ? myLayout.icons.ram_total : '', _('RAM total'), 'MB')}
                ${await getValueLayout(id + '.memHeapUsed', showValueIcons ? myLayout.icons.ram_total : '', _('RAM used'), 'MB')}
                ${await getValueLayout(id + '.memRss', showValueIcons ? myLayout.icons.ram_reserved : '', _('RAM reserved'), 'MB')}
                ${id.includes('.host.') || (objAdapter && (objAdapter.common.mode === 'daemon' || objAdapter.common.mode === 'once') && objAdapter.common.enabled) ? `${await getValueLayout(id + '.uptime', showValueIcons ? myLayout.icons.uptime : '', _("runtime"), '', 'humanize')}` : '<br>'}
            </div>`
}

async function getValues(id) {
    let cpu = await getMyStateAsync(id + '.cpu', true);
    let memHeapTotal = await getMyStateAsync(id + '.memHeapTotal', true);
    let memHeapUsed = await getMyStateAsync(id + '.memHeapUsed', true);
    let memRss = await getMyStateAsync(id + '.memRss', true);
    let uptime = await getMyStateAsync(id + '.uptime', true);

    return {
        cpu: cpu ? cpu.val : 0,
        memHeapTotal: memHeapTotal ? memHeapTotal.val : 0,
        memHeapUsed: memHeapUsed ? memHeapUsed.val : 0,
        memRss: memRss ? memRss.val : 0,
        uptime: uptime ? uptime.val : 0,
    }
}

async function getImage(obj, idAdapter) {
    if (obj.common.icon) {
        let path = `/${idAdapter.replace('system.adapter.', '').split('.')[0]}.admin/${obj.common.icon}`;

        if (debug) console.debug(`[getImage] '${idAdapter}' image path: ${path}`);
        return path
    }
}

async function getStatusColor(id, objAdapter) {
    let color = myLayout.colors.statusBar.notActive;
    let status = 'notActive';

    let alive = await getMyStateAsync(`${id}.alive`, true);

    if (alive && alive.val) {
        color = myLayout.colors.statusBar.active;
        status = 'activated';

        let connection = await getMyStateAsync(`${id.replace('system.adapter.', '')}.info.connection`, true);
        if (connection && !connection.val) {
            color = myLayout.colors.statusBar.notConnected;
            status = 'notConnected';
        } else {
            let connected = await getMyStateAsync(`${id}.connected`, true);
            if (connected && !connected.val) {
                color = myLayout.colors.statusBar.notConnected;
                status = 'notConnected';
            }
        }
    }

    if (objAdapter && objAdapter.common.mode === 'schedule') {
        // Adapter ist zeitgesteuert
        color = myLayout.colors.statusBar.schedule;
        status = 'schedule';
    }

    if (objAdapter && objAdapter.common.mode === 'extension') {
        // Adapter ist Extension
        color = myLayout.colors.statusBar.extension;
        status = 'extension';
    }

    if (objAdapter && objAdapter.common.mode === 'once') {
        // Adapter wird mit System gestartet
        color = myLayout.colors.statusBar.once;
        status = 'once';
    }

    if (objAdapter && !objAdapter.common.enabled) {
        // Adapter ist deaktiviert
        color = myLayout.colors.statusBar.deactivated;
        status = 'deactivated';
    }

    return { color: color, status: status }
}

async function getStatusBar(status, instance) {
    let id = createId(datapointIDs.action)
    let buttonOne = '';
    let buttonTwo = '';

    if (debug) console.debug(`[getStatusBar] ${instance}: ${status.status}`);

    if (status.status === 'deactivated') {
        buttonOne = await getButtonLayout(id, `${instance}|start`, '&nbsp;' + _('start'), myLayout.icons.buttons.start);
    } else {
        buttonOne = await getButtonLayout(id, `${instance}|restart`, '&nbsp;' + _('restart'), myLayout.icons.buttons.restart);
        buttonTwo = await getButtonLayout(id, `${instance}|stop`, '&nbsp;' + _('stop'), myLayout.icons.buttons.stop);
    }

    return `<div style="display: flex;">
                ${buttonOne} 
                ${buttonTwo}
            </div>
            <div style="width: 100%; background: ${status.color}; height: 4px; border-radius: 0 0 4px 4px;"></div>`
}

async function getLanguage() {
    try {
        let sysConfig = await getObjectAsync('system.config');

        if (sysConfig && sysConfig.common && sysConfig.common.language) {
            if (debug) console.debug(`[getLanguage] using language '${sysConfig.common.language}'`);
            return sysConfig.common.language;
        } else {
            console.warn(`system language could not be read -> Fallback to 'en`);
            return 'en';
        }
    } catch (err) {
        console.error(`[getLanguage] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function isAdapterUpgradeable(updateList, id) {
    if (updateList) {
        let val = updateList.val;

        if (id.includes('.host.')) {
            return val && val.includes('js-controller');
        } else {
            return val && val.includes(id.replace('system.adapter.', '').split(".")[0]);
        }
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

function createId(id) {
    return `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.${id}`;
}

async function myCreateStateAsync(id, val, type, name, write = false) {
    try {
        if (!await existsStateAsync(id)) {
            if (debug) console.debug(`[myCreateStateAsync] creating state '${id}'`);
            await createStateAsync(id, {
                'name': name,
                'type': type,
                'read': true,
                'write': write
            });

            await setStateAsync(id, val, true);
        }
    } catch (err) {
        console.error(`[myCreateStateAsync] error: ${err.message}, stack: ${err.stack}`);
    }
}

async function setMyStateAsync(id, val, ack = true) {
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

async function getMyStateAsync(id, ignoreWarnings = false) {
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

async function getMyObjectAsync(id) {
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
    },
    "start": {
        "en": "start",
        "de": "starten",
        "ru": "Начните",
        "pt": "começar",
        "nl": "begin",
        "fr": "début",
        "it": "inizio",
        "es": "comienzo",
        "pl": "początek",
        "zh-cn": "开始"
    },
    "restart": {
        "en": "restart",
        "de": "neu starten",
        "ru": "рестарт",
        "pt": "reiniciar",
        "nl": "herstarten",
        "fr": "redémarrer",
        "it": "ricomincia",
        "es": "Reanudar",
        "pl": "uruchom ponownie",
        "zh-cn": "重新开始"
    },
    "stop": {
        "en": "stop",
        "de": "stoppen",
        "ru": "Стоп",
        "pt": "Pare",
        "nl": "hou op",
        "fr": "Arrêtez",
        "it": "fermare",
        "es": "alto",
        "pl": "zatrzymać",
        "zh-cn": "停"
    },
    "Warnings": {
        "en": "Warnings",
        "de": "Warnungen",
        "ru": "Предупреждения",
        "pt": "Avisos",
        "nl": "Waarschuwingen",
        "fr": "Avertissements",
        "it": "Avvertenze",
        "es": "Advertencias",
        "pl": "Ostrzeżenia",
        "zh-cn": "警告事项"
    },
    "Errors": {
        "en": "Errors",
        "de": "Fehler",
        "ru": "Ошибки",
        "pt": "Erros",
        "nl": "Fouten",
        "fr": "les erreurs",
        "it": "Errori",
        "es": "Errores",
        "pl": "Błędy",
        "zh-cn": "失误"
    },
    "new version %s of script is available": {
        "en": "new version %s of script is available",
        "de": "Neue Version %s des Skripts ist verfügbar",
        "ru": "доступна новая версия %s  скрипта",
        "pt": "nova versão %s  do script está disponível",
        "nl": "nieuwe versie %s  van het script is beschikbaar",
        "fr": "la nouvelle version %s  du script est disponible",
        "it": "è disponibile la nuova versione %s  dello script",
        "es": "nueva versión %s  del script está disponible",
        "pl": "dostępna jest nowa wersja %s  skryptu",
        "zh-cn": "新版本的脚本％s可用"
    },
    "updates available": {
        "en": "updates available",
        "de": "Updates verfügbar",
        "ru": "доступны обновления",
        "pt": "atualizações disponíveis",
        "nl": "updates beschikbaar",
        "fr": "mises à jour disponibles",
        "it": "aggiornamenti disponibili",
        "es": "actualizaciones disponibles",
        "pl": "Dostępne aktualizacje",
        "zh-cn": "可用更新"
    },
    "status": {
        "en": "status",
        "de": "Status",
        "ru": "положение дел",
        "pt": "status",
        "nl": "toestand",
        "fr": "statut",
        "it": "stato",
        "es": "estado",
        "pl": "status",
        "zh-cn": "状态"
    },
    "adapter name": {
        "en": "adapter name",
        "de": "Adaptername",
        "ru": "имя адаптера",
        "pt": "nome do adaptador",
        "nl": "adapter naam",
        "fr": "nom de l'adaptateur",
        "it": "nome dell'adattatore",
        "es": "nombre del adaptador",
        "pl": "nazwa adaptera",
        "zh-cn": "适配器名称"
    },
    "adapter instance": {
        "en": "adapter instance",
        "de": "Adapterinstanz",
        "ru": "экземпляр адаптера",
        "pt": "instância do adaptador",
        "nl": "adapter instantie",
        "fr": "instance d'adaptateur",
        "it": "istanza dell'adattatore",
        "es": "instancia de adaptador",
        "pl": "instancja adaptera",
        "zh-cn": "适配器实例"
    },
    "not active": {
        "en": "not active",
        "de": "nicht aktiv",
        "ru": "не активный",
        "pt": "não ativo",
        "nl": "niet actief",
        "fr": "pas actif",
        "it": "non attivo",
        "es": "no activo",
        "pl": "nieaktywny",
        "zh-cn": "不活跃"
    },
    "activated": {
        "en": "activated",
        "de": "aktiviert",
        "ru": "активирован",
        "pt": "ativado",
        "nl": "geactiveerd",
        "fr": "activé",
        "it": "attivato",
        "es": "activado",
        "pl": "aktywowany",
        "zh-cn": "活性"
    },
    "deactivated": {
        "en": "deactivated",
        "de": "deaktiviert",
        "ru": "деактивирован",
        "pt": "desativado",
        "nl": "gedeactiveerd",
        "fr": "désactivé",
        "it": "disattivato",
        "es": "desactivado",
        "pl": "dezaktywowany",
        "zh-cn": "停用"
    },
    "not connected": {
        "en": "not connected",
        "de": "nicht verbunden",
        "ru": "Не подключен",
        "pt": "não conectado",
        "nl": "niet verbonden",
        "fr": "pas connecté",
        "it": "non collegato",
        "es": "no conectado",
        "pl": "nie połączony",
        "zh-cn": "未连接"
    }
}
//#endregion