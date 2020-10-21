/**
 * Listings for UniFi devices (to use with Material Design Widgets)
 *
 * Requirements:
 *  - UniFi controller running on your network
 *  - UniFi ioBroker adapter >= 0.5.8 (https://www.npmjs.com/package/iobroker.unifi)
 *  - Libraries on ioBroker
 *  - Some programming skills
 *
 * @license http://www.opensource.org/licenses/mit-license.html  MIT License
 * @author  Scrounger <Scrounger@gmx.net>
 * @author  web4wasch @WEB4WASCH
 * @author  cdellasanta <70055566+cdellasanta@users.noreply.github.com>
 * @link    https://forum.iobroker.net/topic/30875/material-design-widgets-unifi-netzwerk-status
 */

// Script configuration
const prefix = '0_userdata.0.vis.NetzwerkDevicesStatus'; // Might be better to use an english prefix (e.g. '0_userdata.0.vis.unifiNetworkState'), but then remember to adapt the Views too
const locale = 'de'; // On change make sure you drop all states (delete prefix directory)

const lastDays = 7;       // Show devices that have been seen in the network within the last X days
const updateInterval = 1; // Lists update interval in minutes (modulo on current minutes, therefore more than 30 means once per hour, more than 60 means never)

const imagePath = '/vis.0/myImages/networkDevices/'; // Path for images

const defaultSortMode = 'name'; // Value for default and reset sort
const sortResetAfter = 120;     // Reset sort value after X seconds (0=disabled)
const filterResetAfter = 120;   // Reset filter after X seconds (0=disabled)

// Optional: display links into a separate view, instead of new navigation window (set false to disable this feature)
const devicesView = {currentViewState: '0_userdata.0.vis.currentView', devicesViewKey: 1};

const speedIconSize = 20;
const speedTextSize = 14;
const trafficIconSize = 14;
const trafficTextSize = 14;
const experienceIconSize = 20;
const experienceTextSize = 14;
const offlineTextSize = 14;

// **********************************************************************************************************************************************************************
const mathjs = require('mathjs');
const moment = require('moment');

// States are registered automatically if prefix directory does not exists (delete directory to recreate them)
setup();

// Create lists on script startup
createList();

// Refresh lists every updateInterval minutes
schedule(`*/${updateInterval} * * * *`, createList);

// Change on sort mode triggers list generation and reset of sort-timer-reset
on({id: `${prefix}.sortMode`, change: 'any'}, () => { createList(); resetSortTimer(); });

// Change on filter mode triggers list generation and reset of filter-timer-reset
on({id: `${prefix}.filterMode`, change: 'any'}, () => { createList(); resetFilterTimer(); });

if (devicesView) {
    // On selected device change, go to "Devices" view
    on({id: `${prefix}.selectedUrl`, change: 'any'}, () => { setState(devicesView.currentViewState, devicesView.devicesViewKey); });
}

function createList() {
    try {
        let devices = $('[id=unifi.0.default.clients.*.mac]'); // Query every time function is called (for new devices)
        let deviceList = [];

        for (var i = 0; i <= devices.length - 1; i++) {
            let idDevice = devices[i].replace('.mac', '');
            let isWired = getState(`${idDevice}.is_wired`).val;
            let lastSeen = new Date(getState(`${idDevice}.last_seen`).val);

            if (isInRange(lastSeen)) {
                // Values for both WLAN and LAN
                let isConnected = getState(`${idDevice}.is_online`).val;
                let ip = existsState(`${idDevice}.ip`) ? getState(`${idDevice}.ip`).val : '';
                let mac = idDevice;
                let name = getName(idDevice, ip, mac);
                let isGuest = getState(`${idDevice}.is_guest`).val;
                let experience = (existsState(`${idDevice}.satisfaction`) && isConnected) ? (getState(`${idDevice}.satisfaction`).val || 100) : 0; // For LAN devices I got null as expirience .. file a bug?
                let note = parseNote(idDevice, name, mac, ip);
                let icon = (note && note.icon) || '';

                let listType = 'text';
                let buttonLink = '';
                setLink();

                // Variables for values that are fetched differently depending on device wiring
                let receivedRaw = getTraffic(isWired, idDevice)
                let received = formatTraffic(receivedRaw).replace('.', ',');
                let sentRaw = getTraffic(isWired, idDevice, true);
                let sent = formatTraffic(sentRaw).replace('.', ',');

                let speed = '';
                let uptime = 0;
                let image = '';
                let wlanSignal = '';

                if (isWired) {
                    let switchPort = getState(`${idDevice}.sw_port`).val;

                    // Do not consider fiber ports
                    if (switchPort > 24) {
                        continue; // Skip add
                    }

                    speed = getState(`unifi.0.default.devices.${getState(`${idDevice}.sw_mac`).val}.port_table.port_${switchPort}.speed`).val;
                    uptime = getState(`${idDevice}.uptime_by_usw`).val;
                    image = (note && note.image) ? `${imagePath}${note.image}.png` : `${imagePath}lan_noImage.png`
                } else {
                    speed = existsState(`${idDevice}.channel`) ? (getState(`${idDevice}.channel`).val > 13) ? '5G' : '2G' : '';
                    uptime = getState(`${idDevice}.uptime`).val;
                    wlanSignal = getState(`${idDevice}.signal`).val;
                    image = (note && note.image) ? `${imagePath}${note.image}.png` : `${imagePath}wlan_noImage.png`
                }

                addToList();

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
                    let statusBarColor = isConnected ? 'green' : 'FireBrick';
                    let text = isGuest ? `<span class="mdi mdi-account-box" style="color: #ff9800;"> ${name}</span>` : name;
                    let speedElement;

                    if (speed === 1000 || speed === 100) {
                        speedElement = `<div style="display: flex; flex: 1; text-align: left; align-items: center; position: relative;">
                                            ${getLanSpeed(speed, speedIconSize, isConnected)}
                                            <span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${speedTextSize}px; margin-left: 4px;">${speed.toString().replace('1000', '1.000')} MBit/s</span>
                                        </div>`
                    } else {
                        speedElement = `<div style="display: flex; flex: 1; text-align: left; align-items: center; position: relative;">
                                            ${getWifiStrength(wlanSignal, speedIconSize, isConnected)}
                                            <span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${speedTextSize}px; margin-left: 4px;">${speed}</span>
                                        </div>`;
                    }

                    let receivedElement = `<span class="mdi mdi-arrow-down" style="font-size: ${trafficIconSize}px; color: #44739e;"></span><span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${trafficTextSize}px; margin-left: 2px; margin-right: 4px">${received}</span>`
                    let sentElement = `<span class="mdi mdi-arrow-up" style="font-size: ${trafficIconSize}px; color: #44739e;"></span><span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${trafficTextSize}px; margin-left: 2px;">${sent}</span>`

                    let experienceElement = `<div style="display: flex; margin-left: 8px; align-items: center;">${getExperience(experience, experienceIconSize, isConnected)}<span style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: ${experienceTextSize}px; margin-left: 4px;">${experience} %</span></div>`

                    let subText = `
                                ${ip}
                                <div style="display: flex; flex-direction: row; padding-left: 8px; padding-right: 8px; align-items: center; justify-content: center;">
                                    ${getOnOffTime(isConnected, uptime, lastSeen)}
                                </div>
                                <div style="display: flex; flex-direction: row; padding-left: 8px; padding-right: 8px; margin-top: 10px; align-items: center;">
                                    ${speedElement}${receivedElement}${sentElement}${experienceElement}
                                </div>
                                `

                    deviceList.push({
                        text: text,
                        subText: subText,
                        listType: listType,
                        buttonLink: buttonLink,
                        image: image,
                        icon: icon,
                        statusBarColor: statusBarColor,
                        name: name,
                        ip: ip,
                        connected: isConnected,
                        received: receivedRaw,
                        sent: sentRaw,
                        experience: experience,
                        uptime: uptime,
                        isWired: isWired
                    });
                }
            }
        }

        // Sorting
        let sortMode = existsState(`${prefix}.sortMode`) ? getState(`${prefix}.sortMode`).val : defaultSortMode;

        deviceList.sort((a, b) => {
            switch (sortMode) {
                case 'ip':
                    const na = Number(a['ip'].split(".").map(v => `000${v}`.slice(-3)).join(''));
                    const nb = Number(b['ip'].split(".").map(v => `000${v}`.slice(-3)).join(''));
                    return na - nb;
                case 'connected':
                case 'received':
                case 'sent':
                case 'experience':
                case 'uptime':
                    return a[sortMode] === b[sortMode] ? 0 : +(a[sortMode] < b[sortMode]) || -1;
                case 'name':
                default:
                    return a['name'].localeCompare(b['name'], locale, {sensitivity: 'base'});
            }
        });

        if (devicesView) {
            // Create links list (before filtering)
            let linkList = [];

            deviceList.forEach(obj => {
                if (obj.listType === 'buttonLink') {
                    linkList.push({
                        text: obj.name, /** @todo Add some props (connected, ip, received, sent, experience, ...)? */
                        value: obj.buttonLink,
                        icon: obj.icon
                    });

                    // Change behaviour to buttonState, a listener on the state change on objectId will trigger the jump to that view
                    obj['listType'] = 'buttonState';
                    obj['objectId'] = `${prefix}.selectedUrl`;
                    obj['showValueLabel'] = false;
                    obj['buttonStateValue'] = obj.buttonLink;
                    delete obj['buttonLink'];
                }
            });

            let linkListString = JSON.stringify(linkList);

            if (existsState(`${prefix}.linksJsonList`) && getState(`${prefix}.linksJsonList`).val !== linkListString) {
                setState(`${prefix}.linksJsonList`, linkListString, true);
            }
        }

        // Filtering
        let filterMode = existsState(`${prefix}.filterMode`) ? getState(`${prefix}.filterMode`).val : '';

        if (filterMode && filterMode !== '') {
            deviceList = deviceList.filter(item => {
                switch (filterMode) {
                    case 'connected':
                        return item.connected;
                    case 'disconnected':
                        return !item.connected;
                    case 'lan':
                        return item.isWired;
                    case 'wlan':
                        return !item.isWired;
                    default:
                        return false; // Unknown filter, return no item
                }
            });
        }

        let result = JSON.stringify(deviceList);

        if (existsState(`${prefix}.jsonList`) && getState(`${prefix}.jsonList`).val !== result) {
            setState(`${prefix}.jsonList`, result, true);
        }
    } catch (err) {
        console.error(`[createList] error: ${err.message}`);
        console.error(`[createList] stack: ${err.stack}`);
    }

    // Functions **************************************************************************************************************************************
    function getTraffic(isWired, idDevice, isSent = false) {
        if (!isSent) {
            // Received
            if (isWired) {
                if (existsState(`${idDevice}.wired-tx_bytes`)) {
                    return getState(`${idDevice}.wired-tx_bytes`).val;
                }
            } else {
                if (existsState(`${idDevice}.tx_bytes`)) {
                    return getState(`${idDevice}.tx_bytes`).val;
                }
            }
        } else {
            // Sent
            if (isWired) {
                if (existsState(`${idDevice}.wired-rx_bytes`)) {
                    return getState(`${idDevice}.wired-rx_bytes`).val;
                }
            } else {
                if (existsState(`${idDevice}.rx_bytes`)) {
                    return getState(`${idDevice}.rx_bytes`).val;
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

        if (existsState(`${idDevice}.name`)) {
            deviceName = getState(`${idDevice}.name`).val;
        }

        if (deviceName === null || deviceName === undefined || deviceName === '') {
            if (existsState(`${idDevice}.hostname`)) {
                deviceName = getState(`${idDevice}.hostname`).val;
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

    function isInRange(lastSeen) {
        let diff = new Date().getTime() - lastSeen.getTime() * 1000;

        return (diff < lastDays * 86400 * 1000) ? true : false;
    }

    function getWifiStrength(signal, size, isConnected) {
        if (!isConnected) {
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
        if (!isConnected) {
            return `<span class="mdi mdi-network-off" style="color: gray; font-size: ${size}px;"></span>`
        }

        if (speed === 1000) {
            return `<span class="mdi mdi-network" style="color: green; font-size: ${size}px;"></span>`
        } else {
            return `<span class="mdi mdi-network" style="color: #ff9800; font-size: ${size}px;"></span>`
        }
    }

    function getExperience(experience, size, isConnected) {
        let color = 'gray';
        let icon = 'mdi-speedometer';

        if (isConnected) {
            if (experience >= 70) {
                color = 'green';
            } else if (experience >= 40) {
                color = '#ff9800';
                icon += '-medium';
            } else {
                color = 'FireBrick';
                icon += '-slow';
            }
        }

        return `<span class="mdi ${icon}" style="color: ${color}; font-size: ${size}px;"></span>`;
    }

    function parseNote(idDevice, name, mac, ip) {
        try {
            if (existsState(`${idDevice}.note`)) {
                return JSON.parse(getState(`${idDevice}.note`).val);
            }
        } catch (ex) {
            console.error(`${name} (ip: ${ip}, mac: ${mac}): ${ex.message}`);
        }

        return undefined;
    }

    function getOnOffTime(isConnected, uptime, lastSeen) {
        return `<span style="color: gray; font-size: ${offlineTextSize}px; line-height: 1.3; font-family: RobotoCondensed-LightItalic;">
               ${translate(isConnected ? 'online' : 'offline')} ${(isConnected ? moment().subtract(uptime, 's') : moment(lastSeen)).fromNow()}
               </span>`;
    }
}

function resetSortTimer() {
    let sortMode = existsState(`${prefix}.sortMode`) ? getState(`${prefix}.sortMode`).val : '';

    if (sortResetAfter > 0) {
        setTimeout(() => {
            if (existsState(`${prefix}.sortMode`) && sortMode === getState(`${prefix}.sortMode`).val) {
                setState(`${prefix}.sortMode`, defaultSortMode);
            }
        }, sortResetAfter * 1000);
    }
}

function resetFilterTimer() {
    let filterMode = existsState(`${prefix}.filterMode`) ? getState(`${prefix}.filterMode`).val : '';

    if (filterResetAfter > 0) {
        setTimeout(() => {
            if (existsState(`${prefix}.filterMode`) && filterMode === getState(`${prefix}.filterMode`).val) {
                setState(`${prefix}.filterMode`, '');
            }
        }, filterResetAfter * 1000);
    }
}

function setup() {
    moment.locale(locale);
    moment.updateLocale(locale, {
        relativeTime: {
            future: translate('in %s'),
            past: translate('since %s'), // Default for past is '%s ago'
            s: translate('a few seconds'),
            ss: translate('%d seconds'),
            m: translate('a minute'),
            mm: translate('%d minutes'),
            h: translate('an hour'),
            hh: translate('%d hours'),
            d: translate('a day'),
            dd: translate('%d days'),
            w: translate('a week'),
            ww: translate('%d weeks'),
            M: translate('a month'),
            MM: translate('%d months'),
            y: translate('a year'),
            yy: translate('%d years')
        }
    });

    // Create states
    if (!existsState(prefix)) { // Check on prefix (the directory)
        const sortItems = [
            {
                text: translate('Name'),
                value: 'name',
                icon: 'sort-alphabetical'
            },
            {
                text: translate('IP address'),
                value: 'ip',
                icon: 'information-variant'
            },
            {
                text: translate('Connected'),
                value: 'connected',
                icon: 'check-network'
            },
            {
                text: translate('Received data'),
                value: 'received',
                icon: 'arrow-down'
            },
            {
                text: translate('Sent data'),
                value: 'sent',
                icon: 'arrow-up'
            },
            {
                text: translate('Experience'),
                value: 'experience',
                icon: 'speedometer'
            },
            {
                text: translate('Uptime'),
                value: 'uptime',
                icon: 'clock-check-outline'
            }
        ];

        const filterItems = [
            {
                text: translate('connected'),
                value: 'connected',
                icon: 'check-network'
            },
            {
                text: translate('disconnected'),
                value: 'disconnected',
                icon: 'network-off'
            },
            {
                text: translate('LAN connection'),
                value: 'lan',
                icon: 'network'
            },
            {
                text: translate('WLAN connection'),
                value: 'wlan',
                icon: 'wifi'
            }
        ];

        const viewTranslations = {
            'Sort by': translate('Sort by'),
            'Filter by': translate('Filter by'),
            'Device': translate('Device')
        };

        createState(`${prefix}.jsonList`, '[]', {name: 'UniFi devices listing: jsonList', type: 'string'});
        createState(`${prefix}.sortMode`, defaultSortMode, {name: 'UniFi device listing: sortMode', type: 'string'});
        createState(`${prefix}.filterMode`, '', {name: 'UniFi device listing: filterMode', type: 'string'});

        // Sorters, filters and some additional translations are saved in states to permit texts localization
        createState(`${prefix}.sortersJsonList`, JSON.stringify(sortItems), {name: 'UniFi device listing: sortersJsonList', type: 'string', read: true, write: false});
        createState(`${prefix}.filtersJsonList`, JSON.stringify(filterItems), {name: 'UniFi device listing: filtersJsonList', type: 'string', read: true, write: false});
        createState(`${prefix}.translations`, JSON.stringify(viewTranslations), {name: 'UniFi device listing: viewTranslations', type: 'string', read: true, write: false});

        if (devicesView) {
            createState(`${prefix}.linksJsonList`, '[]', {name: 'Device links listing: linksJsonList', type: 'string'});
            createState(`${prefix}.selectedUrl`, '', {name: 'Selected device link: selectedUrl', type: 'string'});
        }
    }
}

function translate(enText) {
    const map = { // For translations used https://translator.iobroker.in (that uses Google translator)
        // Sort items
        'Name': {de: 'Name', ru: 'имя', pt: 'Nome', nl: 'Naam', fr: 'Nom', it: 'Nome', es: 'Nombre', pl: 'Nazwa','zh-cn': '名称'},
        'IP address': {de: 'IP Adresse', ru: 'Aйпи адрес', pt: 'Endereço de IP', nl: 'IP adres', fr: 'Adresse IP', it: 'Indirizzo IP', es: 'Dirección IP', pl: 'Adres IP','zh-cn': 'IP地址'},
        'Connected': {de: 'Verbunden', ru: 'Связано', pt: 'Conectado', nl: 'Verbonden', fr: 'Connecté', it: 'Collegato', es: 'Conectado', pl: 'Połączony','zh-cn': '连接的'},
        'Received data': {de: 'Daten empfangen', ru: 'Полученные данные', pt: 'Dados recebidos', nl: 'Ontvangen data', fr: 'Données reçues', it: 'Dati ricevuti', es: 'Datos recibidos', pl: 'Otrzymane dane','zh-cn': '收到资料'},
        'Sent data': {de: 'Daten gesendet', ru: 'Отправленные данные', pt: 'Dados enviados', nl: 'Verzonden gegevens', fr: 'Données envoyées', it: 'Dati inviati', es: 'Datos enviados', pl: 'Wysłane dane','zh-cn': '发送数据'},
        'Experience': {de: 'Erlebnis', ru: 'Опыт', pt: 'Experiência', nl: 'Ervaring', fr: 'Expérience', it: 'Esperienza', es: 'Experiencia', pl: 'Doświadczenie','zh-cn': '经验'},
        'Uptime': {de: 'Betriebszeit', ru: 'Время безотказной работы', pt: 'Tempo de atividade', nl: 'Uptime', fr: 'Disponibilité', it: 'Disponibilità', es: 'Tiempo de actividad', pl: 'Dostępność','zh-cn': '正常运行时间'},
        // Filter Items
        'connected': {de: 'verbunden', ru: 'связано', pt: 'conectado', nl: 'verbonden', fr: 'connecté', it: 'collegato', es: 'conectado', pl: 'połączony','zh-cn': '连接的'},
        'disconnected': {de: 'nicht verbunden', ru: 'отключен', pt: 'desconectado', nl: 'losgekoppeld', fr: 'débranché', it: 'disconnesso', es: 'desconectado', pl: 'niepowiązany','zh-cn': '断开连接'},
        'LAN connection': {de: 'LAN Verbindungen', ru: 'подключение по локальной сети', pt: 'conexão LAN', nl: 'lAN-verbinding', fr: 'connexion LAN', it: 'connessione LAN', es: 'coneccion LAN', pl: 'Połączenie LAN','zh-cn': '局域网连接'},
        'WLAN connection': {de: 'WLAN Verbindungen', ru: 'Соединение WLAN', pt: 'Conexão WLAN', nl: 'WLAN-verbinding', fr: 'Connexion WLAN', it: 'Connessione WLAN', es: 'Conexión WLAN', pl: 'Połączenie WLAN','zh-cn': 'WLAN连接'},
        // Additional view translations
        'Sort by': {de: 'Sortieren nach', ru: 'Сортировать по', pt: 'Ordenar por', nl: 'Sorteer op', fr: 'Trier par', it: 'Ordina per', es: 'Ordenar por', pl: 'Sortuj według', 'zh-cn': '排序方式'},
        'Filter by': {de: 'Filtern nach', ru: 'Сортировать по', pt: 'Filtrar por', nl: 'Filteren op', fr: 'Filtrer par', it: 'Filtra per', es: 'Filtrado por', pl: 'Filtruj według','zh-cn': '过滤'},
        'Device': {de: 'Gerät', ru: 'Устройство', pt: 'Dispositivo', nl: 'Apparaat', fr: 'Dispositif', it: 'Dispositivo', es: 'Dispositivo', pl: 'Urządzenie','zh-cn': '设备'},
        // On/off times
        'online': {de: 'online', ru: 'онлайн', pt: 'conectados', nl: 'online', fr: 'en ligne', it: 'in linea', es: 'en línea', pl: 'online', 'zh-cn': "线上"},
        'offline': {de: 'offline', ru: 'не в сети', pt: 'desligada', nl: 'offline', fr: 'hors ligne', it: 'disconnesso', es: 'desconectado', pl: 'offline', 'zh-cn': "离线"},
        // Relative times
        'in %s': {de: 'in %s', ru: 'через %s', pt: 'em %s', nl: 'in %s', fr: 'en %s', it: 'in %s', es: 'en %s', pl: 'w %s','zh-cn': '在％s中'},
        'since %s': {de: 'seit %s', ru: 'поскольку %s', pt: 'desde %s', nl: 'sinds %s', fr: 'depuis %s', it: 'da %s', es: 'desde %s', pl: 'od %s','zh-cn': '自％s'},
        'a few seconds': {de: 'ein paar Sekunden', ru: 'несколько секунд', pt: 'alguns segundos', nl: 'een paar seconden', fr: 'quelques secondes', it: 'pochi secondi', es: 'unos pocos segundos', pl: 'kilka sekund','zh-cn': '几秒钟'},
        '%d seconds': {de: '%d Sekunden', ru: '%d секунд', pt: '%d segundos', nl: '%d seconden', fr: '%d secondes', it: '%d secondi', es: '%d segundos', pl: '%d sekund','zh-cn': '％d秒'},
        'a minute': {de: 'eine Minute', ru: 'минута', pt: 'um minuto', nl: 'een minuut', fr: 'une minute', it: 'un minuto', es: 'un minuto', pl: 'minutę','zh-cn': '一分钟'},
        '%d minutes': {de: '%d Minuten', ru: '%d минут', pt: '%d minutos', nl: '%d minuten', fr: '%d minutes', it: '%d minuti', es: '%d minutos', pl: '%d minut','zh-cn': '％d分钟'},
        'an hour': {de: 'eine Stunde', ru: 'час', pt: 'uma hora', nl: 'een uur', fr: 'une heure', it: 'un\'ora', es: 'una hora', pl: 'godzina','zh-cn': '一小时'},
        '%d hours': {de: '%d Stunden', ru: '%d часов', pt: '%d horas', nl: '%d uur', fr: '%d heures', it: '%d ore', es: '%d horas', pl: '%d godzin','zh-cn': '％d小时'},
        'a day': {de: 'ein Tag', ru: 'день', pt: 'um dia', nl: 'een dag', fr: 'un jour', it: 'un giorno', es: 'un día', pl: 'dzień','zh-cn': '一天'},
        '%d days': {de: '%d Tage', ru: '%d дней', pt: '%d dias', nl: '%d dagen', fr: '%d jours', it: '%d giorni', es: '%d días', pl: '%d dni','zh-cn': '％d天'},
        'a week': {de: 'eine Woche', ru: 'неделя', pt: 'uma semana', nl: 'een week', fr: 'une semaine', it: 'una settimana', es: 'una semana', pl: 'tydzień','zh-cn': '一周'},
        '%d weeks': {de: '%d Wochen', ru: '%d недель', pt: '%d semanas', nl: '%d weken', fr: '%d semaines', it: '%d settimane', es: '%d semanas', pl: '%d tygodni','zh-cn': '％d周'},
        'a month': {de: 'ein Monat', ru: 'месяц', pt: 'um mês', nl: 'een maand', fr: 'un mois', it: 'un mese', es: 'un mes', pl: 'miesiąc','zh-cn': '一个月'},
        '%d months': {de: '%d Monate', ru: '%d месяцев', pt: '%d meses', nl: '%d maanden', fr: '%d mois', it: '%d mesi', es: '%d meses', pl: '%d miesięcy','zh-cn': '％d个月'},
        'a year': {de: 'ein Jahr', ru: 'год', pt: 'um ano', nl: 'een jaar', fr: 'une année', it: 'un anno', es: 'un año', pl: 'rok','zh-cn': '一年'},
        '%d years': {de: '%d Jahre', ru: '%d лет', pt: '%d anos', nl: '%d jaar', fr: '%d années', it: '%d anni', es: '%d años', pl: '%d lat','zh-cn': '％d年'}
    };

    return (map[enText] || {})[locale] || enText;
}
