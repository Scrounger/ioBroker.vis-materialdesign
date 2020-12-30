/**
 * Listings for UniFi devices (to use with Material Design Widgets)
 *
 * Requirements:
 *  - UniFi controller permanently running on your network
 *  - UniFi ioBroker adapter >= 0.5.8 (https://www.npmjs.com/package/iobroker.unifi)
 *  - Library "moment" in the "Additional npm modules" of the javascript.0 adapter configuration
 *  - Some programming skills
 *
 * @license http://www.opensource.org/licenses/mit-license.html  MIT License
 * @author  Scrounger <Scrounger@gmx.net>
 * @author  web4wasch @WEB4WASCH
 * @author  cdellasanta <70055566+cdellasanta@users.noreply.github.com>
 * @link    https://forum.iobroker.net/topic/30875/material-design-widgets-unifi-netzwerk-status
 */

// Script configuration
const statePrefix = '0_userdata.0.vis.NetzwerkDevicesStatus'; // Might be better to use an english statePrefix (e.g. '0_userdata.0.vis.unifiNetworkState'), but then remember to adapt the Views too
const defaultLocale = 'de';

const lastDays = 7;       // Show devices that have been seen in the network within the last X days

const byteUnits = 'SI'; // SI units use the Metric representation based on 10^3 (1'000) as a order of magnitude
                        // IEC units use 2^10 (1'024) as an order of magnitude

const defaultSortMode = 'name'; // Value for default and reset sort
const sortResetAfter = 120;     // Reset sort value after X seconds (0=disabled)
const filterResetAfter = 120;   // Reset filter after X seconds (0=disabled)

const imagesPath = '/vis.0/myImages/networkDevices/'; // Path for images

// Optional: Path prefix for UniFi device images (see getUnifiImage function for deeper information on how to extract it for your network)
// @todo Could take controller host and port from the unifi adapter configuration, but thene there is still the angular subdirectory that needs to be configured ..
const unifiImagesUrlPrefix = 'https://<your-controller-ip-or-host>:<controller-port>/manage/angular/g7989b19/images/devices/';
// const unifiImagesUrlPrefix = null; // Use the 'lan_noImage.png' for all devices
// const unifiImagesUrlPrefix = false; // Use '<device model>.png' from your imagesPath

// Optional: display links into a separate view, instead of new navigation window (set false to disable this feature)
const devicesView = {currentViewState: '0_userdata.0.vis.currentView', devicesViewKey: 1};

const offlineTextSize = 14;
const infoIconSize = 20;
const infoTextSize = 14;
const performances = {
    none: {
        color: 'grey',
        experience: 'speedometer',
        speedLan: 'network-off',
        speedWifi: 'wifi-off'
    },
    good: {
        color: 'green',
        experience: 'speedometer',
        speedLan: 'network',
        speedWifi: 'signal-cellular-3'
    },
    low: {
        color: '#ff9800',
        experience: 'speedometer-medium',
        speedLan: 'network',
        speedWifi: 'signal-cellular-2'
    },
    bad: {
        color: 'FireBrick',
        experience: 'speedometer-slow',
        speedLan: 'network',
        speedWifi: 'signal-cellular-1'
    }
};

// **********************************************************************************************************************************************************************
// Modules: should not need to 'import' them (ref: https://github.com/ioBroker/ioBroker.javascript/blob/c2725dcd9772627402d0e5bc74bf69b5ed6fe375/docs/en/javascript.md#require---load-some-module),
// but to avoid TypeScript inspection errors, doing it anyway ...
// import * as moment from "moment"; // Should work, but typescript raises exception ...
const moment = require('moment');

// Initialization create/delete states, register listeners
// Using my global functions (see global script common-states-handling )
/** For this script to work as standalone, the following 4 functions have been inlined at the end of script,
 *  if you place them in a global script, then you need to uncomment following "declare" statements **/
// declare function runAfterInitialization(callback: CallableFunction): void;
// declare function initializeState(stateId: string, defaultValue: any, common: object, listenerChangeType?: string, listenerCallback?: CallableFunction): void;
// declare function getStateIfExists(stateId: string): any;
// declare function getStateValue(stateId: string): any;

const getLocale = () => getStateValue('0_userdata.0.vis.locale') || defaultLocale;


initializeState(`${statePrefix}.jsonList`, '[]', {name: 'UniFi devices listing: jsonList', type: 'string'});

// Change on sort mode triggers list generation and reset of sort-timer-reset
initializeState(`${statePrefix}.sortMode`, defaultSortMode, {name: 'UniFi device listing: sortMode', type: 'string'}, {change: 'any'}, () => { updateDeviceLists(); resetSortTimer(); });

// Change on filter mode triggers list generation and reset of filter-timer-reset
initializeState(`${statePrefix}.filterMode`, '', {name: 'UniFi device listing: filterMode', type: 'string'}, {change: 'any'}, () => { updateDeviceLists(); resetFilterTimer(); });

// Sorters, filters and some additional translations are saved in states to permit texts localization
initializeState(`${statePrefix}.sortersJsonList`, '{}', {name: 'UniFi device listing: sortersJsonList', type: 'string', read: true, write: false});
initializeState(`${statePrefix}.filtersJsonList`, '{}', {name: 'UniFi device listing: filtersJsonList', type: 'string', read: true, write: false});
initializeState(`${statePrefix}.translations`, '{}', {name: 'UniFi device listing: viewTranslations', type: 'string', read: true, write: false});

if (devicesView) {
    initializeState(`${statePrefix}.linksJsonList`, '[]', {name: 'Device links listing: linksJsonList', type: 'string'});
    initializeState(`${statePrefix}.selectedUrl`, '', {name: 'Selected device link: selectedUrl', type: 'string'}, {change: 'any'}, () => { setState(devicesView.currentViewState, devicesView.devicesViewKey); }); // On selected device change, go to "Devices" view
}

// On locale change, setup correct listings
if (existsState('0_userdata.0.vis.locale')) {
    runAfterInitialization(() => on({id: '0_userdata.0.vis.locale', change: 'ne'}, setup));
}

runAfterInitialization(() => {
    setup();

    // Refresh lists every time the unifi adapter has updated its data
    on('unifi.0.info.connection','any', updateDeviceLists);
});

function setup(): void {
    setTimeLocale();
    setSortItems();
    setFilterItems();
    setViewTranslations();

    // Fill lists
    updateDeviceLists();
}

function updateDeviceLists() {
    const getNote = (idDevice, name, mac, ip) => {
        try {
            return JSON.parse(getStateValue(`${idDevice}.note`) || '{}');
        } catch (ex) {
            console.error(`${name} (ip: ${ip}, mac: ${mac}): ${ex.message}`);
        }

        return {};
    }

    try {
        // Selector help: https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md#---selector
        let devices = $('state[id=unifi\.0\.default\.*\.*\.mac]'); // Query every time function is called (for new devices)
        let deviceList = [];

        for (var i = 0; i <= devices.length - 1; i++) {
            let [,,, deviceType, mac] = devices[i].split('.');

            // Only 'clients' and 'devices' are allowed (not 'alerts' ... can't exclude direclty on selector ...)
            if (!['clients', 'devices'].includes(deviceType)) {
                continue;
            }

            let idDevice = devices[i].replace('.mac', '');
            let unifiDevice = deviceType === 'devices';
            let isWired = getStateValue(`${idDevice}.is_wired`) || unifiDevice;
            let lastSeen = new Date(getStateValue(`${idDevice}.last_seen`));

            // For clients, if lastSeen difference is bigger than lastDays, then skip the device
            if (!unifiDevice && (new Date().getTime() - lastSeen.getTime()) > lastDays * 86400 * 1000) {
                continue;
            }

            // Values for all device types and connection
            let isConnected = getStateValue(`${idDevice}.is_online`) || unifiDevice;
            let ip = getStateValue(`${idDevice}.ip`) || '';
            let name = getStateValue(`${idDevice}.name`) || getStateValue(`${idDevice}.hostname`) || ip || mac;
            let isGuest = getStateValue(`${idDevice}.is_guest`);
            let note = getNote(idDevice, name, mac, ip);
            let received = getStateValue(`${idDevice}.${unifiDevice || !isWired ? '' : 'wired-'}tx_bytes`) || 0;
            let sent = getStateValue(`${idDevice}.${unifiDevice || !isWired ? '' : 'wired-'}rx_bytes`) || 0;
            let uptime = getStateValue(`${idDevice}.uptime`);
            let experience = getStateValue(`${idDevice}.satisfaction`) || (isConnected ? 100 : 0); // For LAN devices I got null as expirience .. file a bug?

            let additionalInfoItems = '';
            const infoItem = (icon, color, text) => `<span style="margin: 0 2px">
                <span class="mdi mdi-${icon}" style="color: ${color}; font-size: ${infoIconSize}px; "></span>
                <span style="color: grey; font-family: RobotoCondensed-LightItalic; font-size: ${infoTextSize}px; margin-left: 2px;">${text}</span>
                </span>`;

            if (unifiDevice) {
                let cpu = getStateValue(`${idDevice}.system-stats.cpu`) || 0;
                let mem = getStateValue(`${idDevice}.system-stats.mem`) || 0;
                let cpuPerformance = !isConnected ? 'none' : (cpu <= 70 ? 'good' : (cpu <= 90 ? 'low' : 'bad'));
                let memPerformance = !isConnected ? 'none' : (mem <= 70 ? 'good' : (mem <= 90 ? 'low' : 'bad'));

                // The icons do not really fit, there is no good option for a "ram memory bank" in https://materialdesignicons.com/
                additionalInfoItems += infoItem(/*'cpu-64-bit'*/ 'memory', performances[cpuPerformance].color, `${cpu}%`);
                additionalInfoItems += infoItem(/*'memory' 'expansion-card-variant'*/ 'sd', performances[memPerformance].color, `${mem}%`);
            } else {
                let experiencePerformance = !isConnected ? 'none' : (experience >= 70 ? 'good' : (experience >= 40 ? 'low' : 'bad'));
                let speedText = '';
                let speedPerformance = 'none';

                if (isWired) {
                    // If exists prefer uptime on switch port
                    uptime = getStateValue(`${idDevice}.uptime_by_usw`) || uptime;

                    let switchMac = getStateValue(`${idDevice}.sw_mac`) || false;
                    let switchPort = getStateValue(`${idDevice}.sw_port`) || false;

                    if (switchMac && switchPort) {
                        let speed = getStateValue(`unifi.0.default.devices.${switchMac}.port_table.port_${switchPort}.speed`) || 0;
                        speedText = speed === 0 ? '' : (speed < 1000 ? (speed + ' Mbit/s') : (speed/1000 + ' Gbit/s'));
                        speedPerformance = !isConnected ? 'none' : (speed == 1000 ? 'good' : 'low');
                    }

                    // Do not consider fiber ports
                    if (switchPort > 24) { // @todo  On some switches the fiber port is already on port 9 .. there are surely better ways to recognise a fiber port
                        // @todo This is legacy code, why are devices connected to fiber ports not of interest?
                        continue; // Skip device
                    }
                } else {
                    let channel = getStateValue(`${idDevice}.channel`);
                    let signal = getStateValue(`${idDevice}.signal`);

                    speedText = channel === null ? '' : (channel > 13 ? '5G' : '2G');
                    speedPerformance = !isConnected ? 'none' : (signal >= -55 ? 'good' : (signal >= -70 ? 'low' : 'bad'));
                }

                additionalInfoItems += infoItem(performances[speedPerformance][isWired ? 'speedLan' : 'speedWifi'], performances[speedPerformance].color, speedText);
                additionalInfoItems += infoItem(performances[experiencePerformance].experience, performances[experiencePerformance].color, `${experience}%`);
            }

            deviceList.push({
                // Visualization data (tplVis-materialdesign-Icon-List)
                statusBarColor: isConnected ? 'green' : 'FireBrick',
                text: isGuest ? `<span class="mdi mdi-account-box" style="color: #ff9800;">${name}</span>` : name,
                subText: `
                    ${ip}
                    <div style="display: flex; flex-direction: row; padding-left: 8px; padding-right: 8px; align-items: center; justify-content: center;">
                        <span style="color: grey; font-size: ${offlineTextSize}px; line-height: 1.3; font-family: RobotoCondensed-LightItalic;">
                            ${translate(isConnected ? 'online' : 'offline')} ${(isConnected ? moment().subtract(uptime, 's') : moment(lastSeen)).fromNow()}
                        </span>
                    </div>
                    <div style="display: flex; flex-direction: row; padding-left: 4px; padding-right: 4px; margin-top: 10px; align-items: center;">
                        <div style="display: flex; flex: 1; text-align: left; align-items: center; position: relative;">
                            ${infoItem('arrow-down', '#44739e', formatBytes(received, byteUnits))}
                            ${infoItem('arrow-up', '#44739e', formatBytes(sent, byteUnits))}
                        </div>                       
                        <div style="display: flex; margin-left: 8px; align-items: center;">
                            ${additionalInfoItems}
                        </div>
                    </div>
                `,
                listType: !note.link ? 'text' : 'buttonLink',
                buttonLink: !note.link ? '' : (['http', 'https'].includes(note.link) ? `${note.link}://${ip}` : note.link),
                image: unifiDevice ? getUnifiImage(getStateValue(`${idDevice}.model`)) : (imagesPath + (note.image ? note.image : ((isWired ? 'lan' : 'wlan') + '_noImage')) + '.png'),
                icon: note.icon || '',

                // Additional data used for list sorting
                name: name,
                ip: ip,
                connected: isConnected,
                received: received,
                sent: sent,
                experience: experience,
                uptime: uptime,
                isWired: isWired,
                isUnifi: unifiDevice
            });
        }

        // Sorting
        let sortMode = getStateValue(`${statePrefix}.sortMode`);

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
                    return a['name'].localeCompare(b['name'], getLocale(), {sensitivity: 'base'});
            }
        });

        if (devicesView) {
            // Create links list (before filtering)
            let linkList = [];

            deviceList.forEach(obj => {
                if (obj.listType === 'buttonLink') {
                    linkList.push({
                        // Visualization data (tplVis-materialdesign-Select)
                        text: obj.name,
                        value: obj.buttonLink,
                        icon: obj.icon
                        /** @todo Add some properties (connected, ip, received, sent, experience, ...)? */
                    });

                    // Change behaviour from 'buttonLink' to 'buttonState',
                    // a listener on the state change of the objectId will trigger the jump to the devices view
                    obj['listType'] = 'buttonState';
                    obj['objectId'] = `${statePrefix}.selectedUrl`;
                    obj['showValueLabel'] = false;
                    obj['buttonStateValue'] = obj.buttonLink;
                    delete obj['buttonLink'];
                }
            });

            let linkListString = JSON.stringify(linkList);

            if (getStateValue(`${statePrefix}.linksJsonList`) !== linkListString) {
                setState(`${statePrefix}.linksJsonList`, linkListString, true);
            }
        }

        // Filtering
        let filterMode = getStateValue(`${statePrefix}.filterMode`) || '';

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
                    case 'unifi':
                        return item.isUnifi;
                    default:
                        return false; // Unknown filter, return no item
                }
            });
        }

        let result = JSON.stringify(deviceList);

        if (getStateValue(`${statePrefix}.jsonList`) !== result) {
            setState(`${statePrefix}.jsonList`, result, true);
        }
    } catch (err) {
        console.error(`[updateDeviceLists] error: ${err.message}`);
        console.error(`[updateDeviceLists] stack: ${err.stack}`);
    }

    log(`Updated lists`, 'debug');
}

let sortTimeoutID;

function resetSortTimer() {
    if (sortResetAfter > 0) {
        this.clearTimeout(sortTimeoutID); // If set then clear previous timer

        sortTimeoutID = this.setTimeout(() => setState(`${statePrefix}.sortMode`, defaultSortMode), sortResetAfter * 1000);
    }
}

let filterTimeoutID;

function resetFilterTimer() {
    if (filterResetAfter > 0) {
        this.clearTimeout(filterTimeoutID); // If set then clear previous timer

        filterTimeoutID = this.setTimeout(() => setState(`${statePrefix}.filterMode`, ''), filterResetAfter * 1000);
    }
}

function setTimeLocale(): void {
    let locale = getLocale();

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
}

function setSortItems(): void {
    setState(
        `${statePrefix}.sortersJsonList`,
        JSON.stringify([
            {
                text: translate('Name'),
                value: 'name',
                icon: 'sort-alphabetical-variant'
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
        ]),
        true
    );
}

function setFilterItems(): void {
    setState(
        `${statePrefix}.filtersJsonList`,
        JSON.stringify([
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
            },
            {
                text: translate('UniFi network devices'),
                value: 'unifi',
                icon: 'router-network'
            }
        ]),
        true
    );
}

function setViewTranslations(): void {
    setState(
        `${statePrefix}.translations`,
        JSON.stringify([
            'Sort by',
            'Filter by',
            'Device'
        ].reduce((o, key) => ({...o, [key]: translate(key)}), {})),
        true
    );
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
        'LAN connection': {de: 'LAN Verbindungen', ru: 'подключение по локальной сети', pt: 'conexão LAN', nl: 'LAN-verbinding', fr: 'connexion LAN', it: 'connessione LAN', es: 'coneccion LAN', pl: 'połączenie LAN','zh-cn': '局域网连接'},
        'WLAN connection': {de: 'WLAN Verbindungen', ru: 'поединение WLAN', pt: 'conexão WLAN', nl: 'WLAN-verbinding', fr: 'connexion WLAN', it: 'connessione WLAN', es: 'conexión WLAN', pl: 'połączenie WLAN','zh-cn': 'WLAN连接'},
        'UniFi network devices': {de: 'UniFi-Netzwerkgeräte', ru: 'Сетевые устройства UniFi', pt: 'Dispositivos de rede UniFi', nl: 'UniFi-netwerkapparaten', fr: 'Périphériques réseau UniFi', it: 'Dispositivi di rete UniFi', es: 'Dispositivos de red UniFi', pl: 'Urządzenia sieciowe UniFi', 'zh-cn': 'UniFi网络设备'},
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

    return (map[enText] || {})[getLocale()] || enText;
}

function formatBytes(bytes, unit?: 'SI' | 'IEC') : string  {
    if (bytes === 0) return 'N/A';

    const orderOfMagnitude = unit === 'SI' ? Math.pow(10, 3) : Math.pow(2, 10);
    const abbreviations = unit === 'SI' ?
        ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'] :
        ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    const i = Math.floor(Math.log(bytes) / Math.log(orderOfMagnitude));

    return parseFloat((bytes / Math.pow(orderOfMagnitude, i)).toFixed(3).substring(0, 4)) + ' ' + abbreviations[i];
}

function getUnifiImage(deviceModel: string): string {
    // For unifi devices, there is no 'note' where an image information can be stored, but we have the
    // device 'model' that provides enough information for the choice of the correct image.
    // The images themselves are on your network, hosted by the UniFi controller for its devices grid view.
    // Example for my 3 device models (extract using developer console: see backround-image of element):
    //  * US16P150: https://10.10.10.5:8443/manage/angular/g7989b19/images/devices/usw/US16/grid.png
    //  * U7LT:     https://10.10.10.5:8443/manage/angular/g7989b19/images/devices/uap/default/grid.png
    //  * UGW3:     https://10.10.10.5:8443/manage/angular/g7989b19/images/devices/ugw/UGW3/grid.png
    // From the divice model we need some insight to get to the image URL, this is provided by the app.css
    // of the Unifi Controller (I used mine with version 5.13.29)
    // Following list is obtained with some reverse engeeniring: downloaded minified app.css, reformatted code with Phpstorm, then regex-replace: "\.unifiDeviceIcon--([^.]+)\.is-grid[^{]+\{\s+background-image: url\("\.\./images/devices/([^"]+)grid\.png\"\)" with "deviceModel['$1'] = '$2';", ant then some additional parsing ..
    const unifiControllerimagesPaths = {BZ2: 'uap/BZ2', BZ2LR: 'uap/BZ2', p2N: 'uap/p2N', U2HSR: 'uap/U2HSR', U2IW: 'uap/U2IW', U2L48: 'uap/BZ2', U2Lv2: 'uap/BZ2', U2M: 'uap/default', U2O: 'uap/U2O', U2S48: 'uap/BZ2', U2Sv2: 'uap/BZ2', U5O: 'uap/U2O', U7E: 'uap/U7E', U7EDU: 'uap/U7EDU', U7Ev2: 'uap/U7E', U7HD: 'uap/default', U7IW: 'uap/U7IW', U7IWP: 'uap/U7IW', U7LR: 'uap/default', U7LT: 'uap/default', U7MP: 'uap/U7O', U7MSH: 'uap/U7MSH', U7NHD: 'uap/U7NHD', U7O: 'uap/U7O', UFLHD: 'uap/UFLHD', U7P: 'uap/default', U7PG2: 'uap/default', U7SHD: 'uap/default', UCMSH: 'uap/default', UCXG: 'uap/default', UHDIW: 'uap/U7IW', ULTE: 'uap/ULTE', UXSDM: 'uap/UXSDM', UXBSDM: 'uap/UXBSDM', UDMB: 'uap/UDMB', UP1: 'uap/UP1', UBB: 'ubb/UBB', UGW3: 'ugw/UGW3', UGW4: 'ugw/UGW4', UGWXG: 'ugw/UGWXG', S216150: 'usw/US16', S224250: 'usw/US24', S224500: 'usw/US24', S248500: 'usw/US48', S248750: 'usw/US48', S28150: 'usw/US8P150', UDC48X6: 'usw/UDC48X6', US16P150: 'usw/US16', US24: 'usw/US24', US24P250: 'usw/US24', US24P500: 'usw/US24', US24PL2: 'usw/US24', US24PRO: 'usw/US24PRO', US24PRO2: 'usw/US24PRO2', US48: 'usw/US48', US48P500: 'usw/US48', US48P750: 'usw/US48', US48PL2: 'usw/US48', US48PRO: 'usw/US48PRO', US48PRO2: 'usw/US48PRO2', US6XG150: 'usw/US6XG150', US8: 'usw/US8', US8P150: 'usw/US8P150', US8P60: 'usw/US8P60', USC8: 'usw/US8', USC8P450: 'usw/USC8P450', USF5P: 'usw/USF5P', USXG: 'usw/USXG', USL8LP: 'usw/USL8LP', USL16LP: 'usw/USL16LP', USL16P: 'usw/USL16P', USL24: 'usw/USL24', USL48: 'usw/USL48', USL24P: 'usw/USL24P', USL48P: 'usw/USL48P', USMINI: 'usw/USMINI', USPRPS: 'usw/USPRPS', UAS: 'uas/UAS', UCK: 'uas/UCK', UCKG2: 'uas/UCKG2', UCKP: 'uas/UCKP', UMAD: 'ua/UMAD', UDM: 'udm/UDM', 'UDM-UAP': 'udm/UDM-UAP', 'UDM-USW': 'udm/UDM-USW', 'UDM-UGW': 'udm/UDM-UGW', UDMSE: 'udm/UDMSE', 'UDMSE-UAP': 'udm/UDM-UAP', 'UDMSE-USW': 'udm/UDM-USW', 'UDMSE-UGW': 'udm/UDM-UGW', UDMPRO: 'udm/UDMPRO', 'UDMPRO-USW': 'udm/UDMPRO-USW', 'UDMPRO-UGW': 'udm/UDMPRO-UGW'};

    // If prefix set to null return the 'lan_noImage.png' for all devices, if set to false return '<device model>.png'
    if (!unifiImagesUrlPrefix) {
        return imagesPath + (unifiImagesUrlPrefix === null ? 'lan_noImage' : deviceModel) + '.png';
    }

    return unifiImagesUrlPrefix + unifiControllerimagesPaths[deviceModel] + '/grid.png';
}

/** Global functions ********************************************************************************/
// My global functions for state and listener initialization
// see doc https://github.com/ioBroker/ioBroker.javascript/blob/master/docs/en/javascript.md#global-functions
const resetStatesOnReload = false; // Enable only when actively developing

let statesInitializing = 0; // Semaphore for runAfterInitialization, handled by initializeState

// Helper function for states setup
function runAfterInitialization(callback) {
    log(`States initializing: ${statesInitializing}`, 'silly');

    if (statesInitializing <= 0) {
        callback();
        return;
    }

    // Important: use timout instead of wait!
    this.setTimeout(() => runAfterInitialization(callback), 100);
}

function initializeState(stateId, defaultValue, common, listenerChangeType?: string, listenerCallback?: CallableFunction) {
    const registerListener = () => {
        if (listenerChangeType) {
            // Register listener only after all states are initialized
            runAfterInitialization(() => {
                on(stateId, listenerChangeType, listenerCallback);
                log(`Registered listener on ${stateId}`, 'debug');
            });
        }
    };
    const myCreateState = () => {
        statesInitializing++;
        log(`myCreateState: increased states initializing: ${statesInitializing}`, 'silly');

        createState(stateId, defaultValue , common, () => {
            log(`Created state ${stateId}`, 'debug');

            registerListener();

            statesInitializing--;
            log(`myCreateState: reduced states initializing: ${statesInitializing}`, 'silly');
        });
    };
    const resetState = () => {
        statesInitializing++;
        log(`resetState: increased states initializing: ${statesInitializing}`, 'silly');

        deleteState(stateId, () => {
            log(`Deleted state ${stateId}`, 'debug');

            myCreateState();

            statesInitializing--;
            log(`resetState: reduced states initializing: ${statesInitializing}`, 'silly');
        });
    }

    if (!existsState(stateId)) {
        myCreateState();
    } else if (resetStatesOnReload) {
        resetState();
    } else {
        registerListener();
    }
}

function getStateIfExists(stateId) {
    // Avoid warning when state does not exists
    if (!existsState(stateId)) {
        return null;
    }

    return getState(stateId);
}

function getStateValue(stateId) {
    return (getStateIfExists(stateId) || {}).val || null;
}
