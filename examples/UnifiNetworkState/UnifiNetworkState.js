// import
const mathjs = require("mathjs");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
moment.locale("de");


// Skript Einstellungen *************************************************************************************************************************************************

let dpList = '0_userdata.0.vis.NetzwerkDevicesStatus.jsonList';                     // Datenpunkt für IconList Widget (Typ: Zeichenkette (String))

let dpSortMode = '0_userdata.0.vis.NetzwerkDevicesStatus.sortMode';                          // Datenpunkt für Sortieren (Typ: Zeichenkette (String))
let dpFilterMode = '0_userdata.0.vis.NetzwerkDevicesStatus.filterMode';                      // Datenpunkt für Filter (Typ: Zeichenkette (String))

let durationFormat = "d [Tagen] hh [Stunden] mm [Minuten]";                         // Fomate für Betriebsdauer -> siehe momentjs library
let lastSeenFormat = "ddd DD.MM - HH:mm";                                           // Fomate für lastSeen -> siehe momentjs library

const timeDiff = 2;                                                                 // Zeitunterschied (in Minuten) zwischen jetzt und lastSeen des Gerätes, wenn größer dann 'false' (muss >= update interval des unifi Adapters sein)

const lastDays = 7;                                                                 // Verbundene Geräte der letzten X Tage einbeziehen

const checkInterval = 1;                                                            // Interval zum aktualisiern der jsonList für das Widget

let imagePath = '/vis.0/myImages/networkDevices/'                                   // Pfad zu den verwendeten Bildern

let sortResetAfter = 120;                                                   // Sortierung nach X Sekunden auf sortReset zurücksetzen (0=deaktiviert)
let sortReset = 'name'                                                      // Sortierung auf die zurückgesetzt werden soll

let filterResetAfter = 120;                                                 // Filter nach X Sekunden zurücksetzen (0=deaktiviert)

let speedIconSize = 20;
let speedTextSize = 14;

let trafficIconSize = 14;
let trafficTextSize = 14;

let elerbinsIconSize = 20;
let erlebnisTextSize = 14;

let offlineTextSize = 14;

// **********************************************************************************************************************************************************************


// Selector für alle UniFi LAN & WLAN Devices
var devices = $(`[id=unifi.0.default.clients.*.mac]`);


// Funktion alle x Minuten ausführen
schedule("*/" + checkInterval + " * * * *", createList);

// auf Änderungen der Sortieung hören
on({ id: dpSortMode, change: 'any' }, createList);
on({ id: dpSortMode, change: 'any' }, resetSort);

// auf Änderungen der Filter hören
on({ id: dpFilterMode, change: 'any' }, createList);
on({ id: dpFilterMode, change: 'any' }, resetFilter);

function createList() {
    try {
        let deviceList = [];

        for (var i = 0; i <= devices.length - 1; i++) {
            let idDevice = devices[i].replace('.mac', '');

            let isWired = getState(idDevice + ".is_wired").val;             // Unterscheiden zwischen LAN & WLAN
            let lastSeen = getLastSeen(idDevice, isWired);                  // nur die Devices der letzten x Tage betrachten

            if (isInRange(lastSeen) === true) {

                // Werte die sowohl WLAN und LAN haben
                let ip = existsState(idDevice + ".ip") ? getState(idDevice + ".ip").val : '';
                let mac = idDevice;
                let name = getName(idDevice, ip, mac);
                let isGuest = getState(idDevice + ".is_guest").val;
                let erlebnis = existsState(idDevice + ".satisfaction") ? getState(idDevice + ".satisfaction").val : 0;
                let note = parseNote(idDevice, name, mac, ip);

                let listType = 'text';
                let buttonLink = '';
                setLink();

                // Vars die für LAN & WLAN unterschiedlich
                let empfangenRaw = getTraffic(isWired, idDevice)
                let empfangen = formatTraffic(empfangenRaw).replace('.', ',');
                let gesendetRaw = getTraffic(isWired, idDevice, true);
                let gesendet = formatTraffic(gesendetRaw).replace('.', ',');

                let speed = '';
                let betriebszeit = 0;
                let image = '';
                let wlanSignal = '';

                if (isWired) {
                    let swPort = getState(idDevice + ".sw_port").val;

                    // Glasfaser Port nicht berücksitigen
                    if (swPort < 25 && isWired === true) {
                        speed = getState(`unifi.0.default.devices.${getState(idDevice + ".sw_mac").val}.port_table.port_${swPort}.speed`).val;
                        betriebszeit = getState(idDevice + ".uptime_by_usw").val;



                        image = (note && note.image) ? `${imagePath}${note.image}.png` : `${imagePath}lan_noImage.png`

                        if (!(name === mac && swPort === 5)) {
                            // ohne Proxmox LXCs auf Port 5 -> ändern mac adresse während backup
                            addToList();
                        }
                    }
                } else {
                    speed = existsState(idDevice + ".channel") ? (getState(idDevice + ".channel").val > 13) ? '5G' : '2G' : '';
                    betriebszeit = getState(idDevice + ".uptime").val;
                    wlanSignal = getState(idDevice + ".signal").val;
                    image = (note && note.image) ? `${imagePath}${note.image}.png` : `${imagePath}wlan_noImage.png`

                    addToList();
                }

                function setLink() {
                    if (note && note.link) {
                        listType = 'buttonLink';

                        if (note.link === 'http') {
                            buttonLink = `http://${ip}`;
                        } else if (note.link === 'https') {
                            buttonLink = `https://${ip}`;
                        } else {
                            buttonLink = note.link;
                        }
                    }
                }

                function addToList() {
                    let statusBarColor = 'FireBrick';
                    let isConn = isConnected(idDevice);
                    if (isConn === true) {
                        statusBarColor = 'green';
                    }

                    let text = name;

                    if (isGuest === true) {
                        text = `<span class="mdi mdi-account-box" style="color: #ff9800;"> ${name}</span>`
                    }

                    let speedElement = '';
                    if (speed === 1000 || speed === 100) {
                        speedElement = `<div style="display: flex; flex: 1; text-align: left; align-items: center; position: relative;">
                                            ${getLanSpeed(speed, speedIconSize, isConn)}
                                            <span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${speedTextSize}px; margin-left: 4px;">${speed.toString().replace('1000', '1.000')} MBit/s</span>
                                        </div>`
                    } else {
                        speedElement = `<div style="display: flex; flex: 1; text-align: left; align-items: center; position: relative;">
                                            ${getWifiStrenght(wlanSignal, speedIconSize, isConn)}
                                            <span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${speedTextSize}px; margin-left: 4px;">${speed}</span>
                                        </div>`;
                    }

                    let empfangenElement = `<span class="mdi mdi-arrow-down" style="font-size: ${trafficIconSize}px; color: #44739e;"></span><span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${trafficTextSize}px; margin-left: 2px; margin-right: 4px">${empfangen}</span>`
                    let gesendetElement = `<span class="mdi mdi-arrow-up" style="font-size: ${trafficIconSize}px; color: #44739e;"></span><span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${trafficTextSize}px; margin-left: 2px;">${gesendet}</span>`

                    let erlebnisElement = `<div style="display: flex; margin-left: 8px; align-items: center;">${getErlebnis(erlebnis, elerbinsIconSize, isConn)}<span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${erlebnisTextSize}px; margin-left: 4px;">${erlebnis} %</span></div>`

                    let subText = `
                                ${ip}
                                <div style="display: flex; flex-direction: row; padding-left: 8px; padding-right: 8px; align-items: center; justify-content: center;">
                                    ${getOnOffTime(isConn, betriebszeit, lastSeen)}
                                </div>
                                <div style="display: flex; flex-direction: row; padding-left: 8px; padding-right: 8px; margin-top: 10px; align-items: center;">
                                    ${speedElement}${empfangenElement}${gesendetElement}${erlebnisElement}
                                </div>
                                `

                    deviceList.push({
                        text: text,
                        subText: subText,
                        listType: listType,
                        buttonLink: buttonLink,
                        image: image,
                        statusBarColor: statusBarColor,
                        name: name,
                        ip: ip,
                        connected: isConn,
                        empfangen: empfangenRaw,
                        gesendet: gesendetRaw,
                        erlebnis: erlebnis,
                        betriebszeit: betriebszeit,
                        isWired: isWired
                    });
                }
            }
        }


        let sortMode = existsState(dpSortMode) ? getState(dpSortMode).val : '';

        if (sortMode === 'name') {
            deviceList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        } else if (sortMode === 'ip') {
            deviceList.sort(function (a, b) {
                return a[sortMode].split('.')[0] - b[sortMode].split('.')[0] || a[sortMode].split('.')[1] - b[sortMode].split('.')[1] || a[sortMode].split('.')[2] - b[sortMode].split('.')[2] || a[sortMode].split('.')[3] - b[sortMode].split('.')[3]
            });
        } else if (sortMode === 'connected' || sortMode === 'empfangen' || sortMode === 'gesendet' || sortMode === 'erlebnis' || sortMode === 'betriebszeit') {
            deviceList.sort(function (a, b) {
                return a[sortMode] == b[sortMode] ? 0 : +(a[sortMode] < b[sortMode]) || -1;
            });
        } else {
            // default: nach name sortieren
            sortMode = 'name'
            deviceList.sort(function (a, b) {
                return a[sortMode].toLowerCase() == b[sortMode].toLowerCase() ? 0 : +(a[sortMode].toLowerCase() > b[sortMode].toLowerCase()) || -1;
            });
        }

        let filterMode = existsState(dpFilterMode) ? getState(dpFilterMode).val : '';

        if (filterMode && filterMode !== null && filterMode !== '') {
            if (filterMode === 'connected') {
                deviceList = deviceList.filter(function (item) {
                    return item.connected === true;
                });
            } else if (filterMode === 'disconnected') {
                deviceList = deviceList.filter(function (item) {
                    return item.connected === false;
                });
            } else if (filterMode === 'lan') {
                deviceList = deviceList.filter(function (item) {
                    return item.isWired === true;
                });
            } else if (filterMode === 'wlan') {
                deviceList = deviceList.filter(function (item) {
                    return item.isWired === false;
                });
            }
        }


        let result = JSON.stringify(deviceList);
        if (existsState(dpList) && getState(dpList).val !== result) {
            setState(dpList, result, true);
        } else {
            setState(dpList, result, true);
        }

    } catch (err) {
        console.error(`[createList] error: ${err.message}`);
        console.error(`[createList] stack: ${err.stack}`);
    }


    // Functions **************************************************************************************************************************************
    function getLastSeen(idDevice, isWired) {
        return new Date(getState(idDevice + ".last_seen").val);
        /*
        if (isWired) {
            return getState(idDevice + "._last_seen_by_usw").val
        } else {
            return getState(idDevice + "._last_seen_by_uap").val
        }
        */
    }

    function getTraffic(isWired, idDevice, isSent = false) {
        if (isSent === false) {
            // empfangen
            if (isWired) {
                if (existsState(idDevice + ".wired-tx_bytes")) {
                    return getState(idDevice + ".wired-tx_bytes").val;
                }
            } else {
                if (existsState(idDevice + ".tx_bytes")) {
                    return getState(idDevice + ".tx_bytes").val;
                }
            }
        } else {
            // gesendet
            if (isWired) {
                if (existsState(idDevice + ".wired-rx_bytes")) {
                    return getState(idDevice + ".wired-rx_bytes").val;
                }
            } else {
                if (existsState(idDevice + ".rx_bytes")) {
                    return getState(idDevice + ".rx_bytes").val;
                }
            }
        }

        return 0;
    }

    function formatTraffic(traffic) {
        if (traffic > 0) {
            traffic = parseFloat(traffic) / 1048576;
            if (traffic < 100) {
                return `${mathjs.round(traffic, 0)} MB`
            } else {
                return `${mathjs.round(traffic / 1024, 2)} GB`
            }
        }

        return 'N/A';
    }

    function getName(idDevice, ip, mac) {
        let deviceName = '';

        if (existsState(idDevice + ".name")) {
            deviceName = getState(idDevice + ".name").val;
        }

        if (deviceName === null || deviceName === undefined || deviceName === '') {
            if (existsState(idDevice + ".hostname")) {
                deviceName = getState(idDevice + ".hostname").val;
            }
        }

        if (deviceName === null || deviceName === undefined || deviceName === '') {
            if (ip !== null && ip !== undefined && ip !== '') {
                deviceName = ip;
            } else {
                deviceName = mac;
            }
        }

        return deviceName;
    }

    function isConnected(device) {
        // Differenz zwischen lastSeen und Now berechnen -> prüfen ob verbunden
        //let diff = new Date().getTime() - lastSeen * 1000;

        //return (diff < timeDiff * 60000) ? true : false;
        let isOnline = getState(device + ".is_online").val;
        return isOnline;
    }

    function isInRange(lastSeen) {
        // Differenz zwischen lastSeen und Now berechnen -> prüfen ob in angegebenen Zeitraum verbunden war
        let diff = new Date().getTime() - lastSeen.getTime() * 1000;

        return (diff < lastDays * 86400 * 1000) ? true : false;
    }

    function getWifiStrenght(signal, size, isConnected) {
        let img = '';

        if (isConnected === false) {
            return `<span class="mdi mdi-wifi-off" style="color: gray; font-size: ${size}px"></span>`
        }

        if (signal < -70) {
            return `<span class="mdi mdi-signal-cellular-1" style="color: FireBrick; font-size: ${size}px"></span>`
        } else if (signal >= -70 && signal < -55) {
            return `<span class="mdi mdi-signal-cellular-2" style="color: #ff9800; font-size: ${size}px"></span>`
        } else {
            return `<span class="mdi mdi-signal-cellular-3" style="color: green; font-size: ${size}px"></span>`
        }
    }

    function getLanSpeed(speed, size, isConnected) {
        if (isConnected === false) {
            return `<span class="mdi mdi-network-off" style="color: gray; font-size: ${size}px;"></span>`
        }

        if (speed === 1000) {
            return `<span class="mdi mdi-network" style="color: green; font-size: ${size}px;"></span>`
        } else {
            return `<span class="mdi mdi-network" style="color: #ff9800; font-size: ${size}px;"></span>`
        }
    }

    function getErlebnis(erlebnis, size, isConnected) {
        if (isConnected === false) {
            return `<span class="mdi mdi-speedometer" style="color: gray; font-size: ${size}px;"></span>`
        }

        if (erlebnis >= 70) {
            return `<span class="mdi mdi-speedometer" style="color: green; font-size: ${size}px;"></span>`
        } else if (erlebnis < 70 && erlebnis >= 40) {
            return `<span class="mdi mdi-speedometer-medium" style="color: #ff9800; font-size: ${size}px;"></span>`
        } else {
            return `<span class="mdi mdi-speedometer-slow" style="color: FireBrick; font-size: ${size}px;"></span>`
        }
    }

    function parseNote(idDevice, name, mac, ip) {
        try {
            if (existsState(idDevice + ".note")) {
                let res = JSON.parse(getState(idDevice + ".note").val);
                return res;
            }
        } catch (ex) {
            console.error(`${name} (ip: ${ip}, mac: ${mac}): ${ex.message}`);
        }

        return undefined;
    }

    function getOnOffTime(isConnected, betriebszeit, lastSeen) {
        if (isConnected) {
            return `<span style="color: gray; font-size: ${offlineTextSize}px; line-height: 1.3; font-family: RobotoCondensed-LightItalic;">online seit ${moment.duration(betriebszeit, 'seconds').format(durationFormat, 0)}</span>`
        } else {
            let now = moment(new Date());
            let start = moment(lastSeen);
            let offlineDuration = (moment.duration(now.diff(start)));
            return `<span style="color: gray; font-size: ${offlineTextSize}px; line-height: 1.3; font-family: RobotoCondensed-LightItalic;">offline seit ${moment.duration(offlineDuration, 'seconds').format(durationFormat, 0)}</span>`
        }
    }
}

// Beim skript start ausführen
createList();


function resetSort() {
    let sortMode = existsState(dpSortMode) ? getState(dpSortMode).val : '';

    if (sortResetAfter > 0) {
        setTimeout(function () {
            if (existsState(dpSortMode) && sortMode === getState(dpSortMode).val) {
                setState(dpSortMode, sortReset);
            }
        }, sortResetAfter * 1000);
    }
}

function resetFilter() {
    let filterMode = existsState(dpFilterMode) ? getState(dpFilterMode).val : '';

    if (filterResetAfter > 0) {
        setTimeout(function () {
            if (existsState(dpFilterMode) && filterMode === getState(dpFilterMode).val) {
                setState(dpFilterMode, '');
            }
        }, filterResetAfter * 1000);
    }
}
