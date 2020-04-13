/************************************************************************************************************************************************************************
Version: 1.0.0
created by Scrounger

Dieses Skript erzeugt json strings um Wetter Informationen im VIS mit den Material Design Widgets darzustellen
=========================================================================================================================================================================

!!! Voraussetzungen !!!
* Material Design Widgets               >= 0.3.0
* DasWetter                             >= 2.8.1
* weatherunderground                    >= 3.2.1
* Pollenflug                            >= 1.0.4
* Javascript Adapter                    >= 4.0.0
* Javascript Adapter NPM Module:        moment, moment-timezone, moment-duration-format, chroma-js
=========================================================================================================================================================================

--- Links ---
* Support:          tbd
* Github:           tbd

=========================================================================================================================================================================

--- Changelog ---
* 1.0.0:            Initial release

************************************************************************************************************************************************************************/

// Skript Einstellungen *************************************************************************************************************************************************
let dasWetter_Tage = 5;                                                                                         // Anzahl der Tage für Adapter DasWetter die angezeigt werden soll

let idDatenpunktPrefix = '0_userdata.0'                                                                         // '0_userdata.0' or 'javascript.x'
let idDatenPunktStrukturPrefix = 'vis.MaterialDesignWidgets.Wetter'                                             // Struktur unter Prefix

let idSensor_Temperatur = 'linkeddevices.0.Sensoren.Temperatur.Aussen.Temperatur'                               // Temperatur des eigenen Sensor
let idSensor_Luftfeuchtigkeit = 'linkeddevices.0.Sensoren.Temperatur.Aussen.Luftfeuchtigkeit'                   // Luftfeuchtigkeit des eigenen Sensor

let color_graph_temperatur_verlauf = [                                                                          // Farben für Charts - Temperaturverlauf, value = Temperatur
    { value: -20, color: '#5b2c6f' },
    { value: 0, color: '#2874a6' },
    { value: 14, color: '#73c6b6' },
    { value: 22, color: '#008000' },
    { value: 27, color: '#FFA500' },
    { value: 35, color: '#FF0000' }
]

let color_graph_regenwahrscheinlichkeit = '#0d47a1';                                                            // Farbe Charts - Regenwahrscheinlichkeit
let color_graph_niederschlag = '#6dd600';                                                                       // Farbe Charts - Niederschlag

let idPollenFlugRegion = 'pollenflug.0.region#112.summary'                                                      // Id des Summary Channels deiner Region
let pollenFlugFarben = ['#57bb8a', '#94bd77', '#d4c86a', '#e9b861', '#e79a69', '#dd776e', 'red']                // Farben für die Pollenflug darstellung (Werte 0 - 6)
let pollenFlugText = ['keine', 'kaum', 'gering', 'mäßig', 'mittel', 'hoch', 'stark']                            // Texte für die Pollenflug darstellung (Werte 0 - 6)
// **********************************************************************************************************************************************************************


// Fortgeschrittene Einstellungen ***************************************************************************************************************************************
let idIconList_Vorschau = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Vorschau.IconList`;              // Datenpunkt für IconList Widget Vorschau
let idIconList_Vorschau_Chart = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Vorschau.Chart`;              // Datenpunkt für IconList Widget Vorschau

let idDialogSchalter = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Dialog.Day_`                        // Schalter Datenpunkt für Dialog Widget Luftfeuchtigkeit (wird pro Tag erzeugt mit angehängter Nummer)

let idDatum = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.DatumFormat.Day_`                            // Datenpunkt für Formatierung Datum (wird pro Tag erzeugt mit angehängter Nummer)
let idTemperatur = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Temperatur.Day_`                        // Datenpunkt für List Widget Temperatur (wird pro Tag erzeugt mit angehängter Nummer)
let idNiederschlag = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Niederschlag.Day_`                    // Datenpunkt für List Widget Niederschlag (wird pro Tag erzeugt mit angehängter Nummer)
let idLuftfeuchtigkeit = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Luftfeuchtigkeit.Day_`            // Datenpunkt für List Widget Luftfeuchtigkeit (wird pro Tag erzeugt mit angehängter Nummer)
let idWindgeschwindigkeit = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Windgeschwindigkeit.Day_`      // Datenpunkt für List Widget Windgeschwindigkeit (wird pro Tag erzeugt mit angehängter Nummer)
let idWindrichtung = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Windrichtung.Day_`                    // Datenpunkt für List Widget Windrichtung (wird pro Tag erzeugt mit angehängter Nummer)
let idLuftdruck = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Luftdruck.Day_`                          // Datenpunkt für List Widget Luftdruck (wird pro Tag erzeugt mit angehängter Nummer)
let idSchneefallgrenze = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Schneefallgrenze.Day_`            // Datenpunkt für List Widget Schneefallgrenze (wird pro Tag erzeugt mit angehängter Nummer)
let idSonne = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Sonne.Day_`                                  // Datenpunkt für List Widget Sonne (wird pro Tag erzeugt mit angehängter Nummer)
let idMond = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Mond.Day_`                                    // Datenpunkt für List Widget Mond (wird pro Tag erzeugt mit angehängter Nummer)

let idBewolkung = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Aktuell.Bewolkung`                       // Datenpunkt für List Widget Bewölkung (nur aktuell)
let idUvIndex = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Aktuell.UV-Index`                          // Datenpunkt für List Widget UV-Index (nur aktuell)
let idSonneneinstrahlung = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Aktuell.Sonneneinstrahlung`     // Datenpunkt für List Widget idSonneneinstrahlung (nur aktuell)
let idMeineSensoren = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Aktuell.MeineSensoren`               // Datenpunkt für List Widget idSonneneinstrahlung (nur aktuell)

let idChart = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Chart.Day_`                                  // Datenpunkt für Chart Widget Werte des Tages (wird pro Tag erzeugt mit angehängter Nummer)

let idPollenflug = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.Pollenflug.Day_`                        // Datenpunkt Pollenflug für Bar Chart Widget (wird für heute und morgen erzeugt)
// **********************************************************************************************************************************************************************

// import
const chromaJs = require("chroma-js");
const moment = require("moment");
moment.locale("de");

let temperaturGradientColors = getGradientColors(-20, 40, color_graph_temperatur_verlauf);

// Trigger
on({ id: "system.adapter.daswetter.0.alive", change: "any" }, createData);

// Trigger eigener Sensor
on({ id: "idSensor_Temperatur" }, createData);

function createData() {
    try {
        console.log("create Data für Das Wetter");
        let currentHour = moment().format('H');
        let vorschauIconList = [];

        for (var i = 1; i <= dasWetter_Tage; i++) {
            let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${i}`;

            if (existsState(`${idDasWetter}.day_name`)) {
                vorschauIconList.push(createVorschauIconListItem(i));

                createDatumFormatierung(i);
                createNiederschlag(i, currentHour);
                createLuftfeuchtigkeit(i);
                createTemperatur(i);
                createWindgeschwindigkeit(i);
                createWindrichtung(i);
                createLuftdruck(i);
                createSchneefallgrenze(i);
                createSonne(i);
                createMond(i);

                createPollenFlug(i);

                createCharts(i);

                mySetState(`${idDialogSchalter}${i}`, false, 'boolean', `Schalter um Dialog für Tag ${i} anzuzeigen`);
            } else {
                console.warn(`Keine Daten für Tag ${i} vorhanden! Reduziere die Anzahl der Tage im Skript, dann wird keine Warnmeldung mehr angezeigt!`);
            }
        }

        // Werte die es nur für heute bzw. aktuell gibt
        createBewolkung();
        createUvIndex();
        createSonneneinstrahlung();
        createEigeneSensoren();

        // Wochen Vorschau Graph erstellen
        createVorschauGraph(dasWetter_Tage);

        // IconList Widget Vorschau
        mySetState(idIconList_Vorschau, JSON.stringify(vorschauIconList), 'string', 'Vorschau Wetter für IconList Widget');

    } catch (err) {
        console.error(`[createData] error: ${err.message}`);
        console.error(`[createData] stack: ${err.stack}`);
    }
}

function createEigeneSensoren() {
    let listForWidget = [];

    if (existsState(idSensor_Temperatur)) {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState(idSensor_Temperatur).val, 1), ' °C',
                    formatValue(getState(idSensor_Luftfeuchtigkeit).val, 0), ' %'
                )
            }
        )
    }

    mySetState(`${idMeineSensoren}`, JSON.stringify(listForWidget), 'string', `Werte eigener Sensoren aktuell für List Widget`);
}

function createSonneneinstrahlung() {
    let listForWidget = [];
    listForWidget.push(
        {
            rightText: getRightText(
                formatValue(getState(`weatherunderground.0.forecast.current.solarRadiation`).val, 0), ' w/m²',
            )
        }
    )

    mySetState(`${idSonneneinstrahlung}`, JSON.stringify(listForWidget), 'string', `Sonneneinstrahlung aktuell für List Widget`);
}

function createUvIndex() {
    let listForWidget = [];
    listForWidget.push(
        {
            rightText: getRightText(
                formatValue(getState(`weatherunderground.0.forecast.current.UV`).val, 0), ''
            )
        }
    )

    mySetState(`${idUvIndex}`, JSON.stringify(listForWidget), 'string', `UV-Index aktuell für List Widget`);
}

function createBewolkung() {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_1`;

    let listForWidget = [];
    listForWidget.push(
        {
            rightText: getRightText(
                formatValue(getState(`${idDasWetter}.current.clouds_value`).val, 0), ' %'
            )
        }
    )

    mySetState(`${idBewolkung}`, JSON.stringify(listForWidget), 'string', `Bewölkung aktuell für List Widget`);
}

function createDatumFormatierung(day){
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let datum = getState(`${idDasWetter}.day_value`).val;

    let formatiertesDatum = moment(datum).format("LL");

    mySetState(`${idDatum}${day}`, formatiertesDatum, 'string', `Formatiertes Datum Tag ${day} für Bar Chart Widget`);
}

function createPollenFlug(day) {
    let barData = [];

    if (day === 1) {
        let idDp = `${idPollenFlugRegion}.json_index_today`;
        generateData(idDp);
    } else if (day === 2) {
        let idDp = `${idPollenFlugRegion}.json_index_tomorrow`;
        generateData(idDp);
    }

    function generateData(idDp) {
        if (existsState(idDp)) {
            let data = JSON.parse(getState(idDp).val);

            if (data && data.length > 0) {
                for (const pollenInfo of data) {
                    barData.push(
                        {
                            label: pollenInfo.Pollen,
                            value: pollenInfo.Riskindex + 1,
                            dataColor: pollenFlugFarben[pollenInfo.Riskindex],
                            valueText: pollenFlugText[pollenInfo.Riskindex]
                        }
                    )
                }
            }

            mySetState(`${idPollenflug}${day}`, JSON.stringify(barData), 'string', `Pollenflug Tag ${day} für Bar Chart Widget`);
        } else {
            console.warn(`Datapoint '${idDp}' not exist!`);
        }
    }
}

function createSchneefallgrenze(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let idWeatherUnderground = `weatherunderground.0.forecast.${day - 1}d`;

    let listForWidget = [];
    let grenze = formatValue(getState(`${idDasWetter}.snowline_value`).val, 0)

    let menge = 0;
    if (existsState(`${idWeatherUnderground}.snowAllDay`)) {
        menge = getState(`${idWeatherUnderground}.snowAllDay`).val;
    }

    listForWidget.push(
        {
            rightText: getRightText(
                grenze > 0 ? grenze : '-', grenze > 0 ? ' m' : '',
                menge > 0 ? menge : '', menge > 0 ? ' cm' : ''
            )
        }
    )

    mySetState(`${idSchneefallgrenze}${day}`, JSON.stringify(listForWidget), 'string', `Schneefallgrenze Tag ${day} für List Widget`);
}


function createSonne(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    listForWidget.push(
        {
            rightText: `
                <div style="color: gray; height: 13px; font-size: 10px; font-family: RobotoCondensed-Light; margin-top: 2px;">Aufgang</div>
                <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
                    <div style="color: #44739e; font-size: 24px; font-family: RobotoCondensed-Regular;">${getState(`${idDasWetter}.sun_in`).val}</div>
                </div>`
        }

    )
    listForWidget.push(
        {
            rightText: `
            <div style="color: gray; height: 13px; font-size: 10px; font-family: RobotoCondensed-Light; margin-top: 2px;">Untergang</div>
            <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
                <div style="color: #44739e; font-size: 24px; font-family: RobotoCondensed-Regular;">${getState(`${idDasWetter}.sun_out`).val}</div>
            </div>`
        }
    )

    mySetState(`${idSonne}${day}`, JSON.stringify(listForWidget), 'string', `Mond Infos Tag ${day} für List Widget`);
}

function createMond(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    listForWidget.push(
        {
            rightText: `
                <div style="color: gray; height: 13px; font-size: 10px; font-family: RobotoCondensed-Light; margin-top: 2px;">Aufgang</div>
                <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
                    <div style="color: #44739e; font-size: 24px; font-family: RobotoCondensed-Regular;">${getState(`${idDasWetter}.moon_in`).val}</div>
                </div>`
        }

    )
    listForWidget.push(
        {
            rightText: `
            <div style="color: gray; height: 13px; font-size: 10px; font-family: RobotoCondensed-Light; margin-top: 2px;">Untergang</div>
            <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
                <div style="color: #44739e; font-size: 24px; font-family: RobotoCondensed-Regular;">${getState(`${idDasWetter}.moon_out`).val}</div>
            </div>`
        }
    )

    let Beleuchtung = '';
    let lumi = getState(`${idDasWetter}.moon_desc`).val;

    if (lumi.includes('abneh')) {
        Beleuchtung = `<div>
                        <span class="mdi mdi-arrow-down-bold materialdesign-icon-image"></span>
                        ${getState(`${idDasWetter}.moon_lumi`).val}
                    </div>`
    } else {
        Beleuchtung = `<div>
                        <span class="mdi mdi-arrow-up-bold materialdesign-icon-image"></span>
                        ${getState(`${idDasWetter}.moon_lumi`).val}
                    </div>`
    }

    mySetState(`${idMond}${day}`, JSON.stringify(listForWidget), 'string', `Mond Infos Tag ${day} für List Widget`);

    mySetState(`${idMond}${day}_lumi`, Beleuchtung, 'string', `Mond Beleuchtung Tag ${day} für Html Widget`);
}


function createLuftdruck(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    if (day === 1) {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState('weatherunderground.0.forecast.current.pressure').val, 0), '', '', '<font color="#44739e">mbar</font>'
                )
            }
        )
    } else {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState(`${idDasWetter}.pressure_value`).val, 0), ' mbar'
                )
            }
        )
    }
    mySetState(`${idLuftdruck}${day}`, JSON.stringify(listForWidget), 'string', `Luftdruck Tag ${day} für List Widget`);
}

function createWindrichtung(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let idWeatherUnderground = `weatherunderground.0.forecast.${day - 1}d`;

    let listForWidget = [];
    if (day === 1) {
        listForWidget.push(
            {
                rightText: getRightText(
                    getState('weatherunderground.0.forecast.current.windDirection').val, ''
                )
            }
        )
    } else {
        if (existsState(`${idWeatherUnderground}.windDirection`)) {
            listForWidget.push(
                {
                    rightText: getRightText(
                        formatValue(getState(`${idWeatherUnderground}.windDirection`).val, 0), ' km/h'
                    )
                }
            )
        }
    }
    mySetState(`${idWindrichtung}${day}`, JSON.stringify(listForWidget), 'string', `Windgeschwindigkeit Tag ${day} für List Widget`);

}

function createWindgeschwindigkeit(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    if (day === 1) {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState('weatherunderground.0.forecast.current.wind').val, 0), ' km/h',
                    `Böen ${formatValue(getState('weatherunderground.0.forecast.current.windGust').val, 0)}`, ' km/h'
                )
            }
        )
    } else {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState(`${idDasWetter}.wind_value`).val, 0), ' km/h',
                    `Böen ${formatValue(getState(`${idDasWetter}.windgusts_value`).val, 0)}`, ' km/h'
                )
            }
        )
    }

    mySetState(`${idWindgeschwindigkeit}${day}`, JSON.stringify(listForWidget), 'string', `Windgeschwindigkeit Tag ${day} für List Widget`);
}

function createTemperatur(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    if (day === 1) {
        let temp = getState(`weatherunderground.0.forecast.current.temp`).val;
        let feeled = getState(`weatherunderground.0.forecast.current.feelsLike`).val;

        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(temp, 1), '°C',
                    (temp !== feeled) ? `gefühlt ${formatValue(feeled, 1)}` : undefined, '°C'
                )
            }
        )
    } else {
        listForWidget.push(
            {
                rightText: getRightText(
                    formatValue(getState(`${idDasWetter}.tempmax_value`).val, 1), '°C',
                    `Nachts ${formatValue(getState(`${idDasWetter}.tempmin_value`).val, 1)}`, '°C'
                )
            }
        )
    }

    mySetState(`${idTemperatur}${day}`, JSON.stringify(listForWidget), 'string', `Temperatur Tag ${day} für List Widget`);
}

function createLuftfeuchtigkeit(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;

    let listForWidget = [];
    if (day === 1) {
        // Aktuelle Daten nehmen
        listForWidget.push(
            {
                rightText: getRightText(
                    getState(`weatherunderground.0.forecast.current.relativeHumidity`).val, ' %',
                )
            }
        )
    } else {
        listForWidget.push(
            {
                rightText: getRightText(
                    getState(`${idDasWetter}.humidity_value`).val, ' %',
                )
            }
        )
    }

    mySetState(`${idLuftfeuchtigkeit}${day}`, JSON.stringify(listForWidget), 'string', `Luftfeuchtigkeit Tag ${day} für List Widget`);
}

function createNiederschlag(day, currentHour) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let idWeatherUnderground = `weatherunderground.0.forecast.${day - 1}d`;

    let listForWidget = [];

    if (day === 1) {
        // Aktuelle Daten nehmen
        listForWidget.push(
            {
                rightText: getRightText(
                    getState(`weatherunderground.0.forecastHourly.0h.precipitationChance`).val, ' %',
                    formatValue(getState(`weatherunderground.0.forecast.current.precipitationHour`).val, 1), ' mm'
                )
            }
        )
    } else {
        if (existsState(`${idWeatherUnderground}.precipitationChance`)) {
            // Weahterundergound Daten vorhanden
            listForWidget.push(
                {
                    rightText: getRightText(
                        getState(`${idWeatherUnderground}.precipitationChance`).val, ' %',
                        formatValue(getState(`${idWeatherUnderground}.precipitationAllDay`).val, 1), ' mm'
                    )
                }
            )
        } else {
            // Daten von DasWetter nehemen
            listForWidget.push(
                {
                    rightText: getRightText(
                        getState(`${idDasWetter}.rain_value`).val, ' mm',
                    )
                }
            )
        }
    }

    mySetState(`${idNiederschlag}${day}`, JSON.stringify(listForWidget), 'string', `Niederschlag Tag ${day} für List Widget`);
}

function getRightText(val1, unitVal1, val2 = undefined, unitVal2 = undefined) {
    return `
            <div style="display: flex; align-items: flex-end; justify-content: flex-end;">
                <div style="color: #44739e; font-size: 30px; font-family: RobotoCondensed-Regular;">${val1}</div>
                <div style="color: #44739e; font-size: 16px; font-family: RobotoCondensed-Regular; margin-left: 2px; margin-bottom: 4px;">${unitVal1}</div>
            </div>
            ${(val2 !== undefined) ? `<div style="color: gray; height: 13px; font-size: 12px; font-family: RobotoCondensed-Light; margin-top: 2px;">${val2}${unitVal2}</div>` : ''}`
}

function createCharts(day) {
    let nowHour = moment().format("H");                                                 // für Weatherunderground da .0h immer jetzt ist

    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let idWeatherUndergroundHourly = `weatherunderground.0.forecastHourly`;
    let idWeatherUndergroundDaily = `weatherunderground.0.forecast.${day - 1}d`;

    let chart = {};
    let graphs = [];
    let axisLabels = [];

    let niederschlag = [];
    let niederschlagMaxVal = 0;

    let temperatur = [];
    let temperaturColors = [];
    let temperaturAxisMax = 0;
    let temperaturAxisMin = 100;

    let regenWahrscheinlichkeit = [];

    //prüfen für wieviele Stunden DasWetter Vorschaudaten hat
    let maxHours = 0;
    if (existsState(`${idDasWetter}.Hour_24.hour_value`)) {
        maxHours = 24;
    } else if (existsState(`${idDasWetter}.Hour_8.hour_value`)) {
        maxHours = 8;
    } else {
        console.warn(`[createDayNiederschlagBarChart] Day ${day} hat keine Vorschaudaten für 24h bzw 8h!`);
    }

    for (var i = 1; i <= maxHours; i++) {
        let hour = parseFloat(getState(`${idDasWetter}.Hour_${i}.hour_value`).val.replace(':00'));

        if ((maxHours === 24) || maxHours === 8) {
            axisLabels.push(`${hour}h`);
        } else {
            axisLabels.push('');
        }


        // Niederschlag Menge
        let niederschlagVal = getState(`${idDasWetter}.Hour_${i}.rain_value`).val;
        if (day === 1) {
            let dp = `${idWeatherUndergroundHourly}.${hour - nowHour}h.precipitation`
            if (existsState(dp)) niederschlagVal = getState(dp).val
        } else {
            let dp = `${idWeatherUndergroundHourly}.${hour + 24 - nowHour}h.precipitation`
            if (day === 2 && existsState(dp)) niederschlagVal = getState(dp).val
        }

        if (niederschlagVal > niederschlagMaxVal) {
            niederschlagMaxVal = niederschlagVal;
        }
        niederschlag.push(niederschlagVal);


        // Temperatur
        let temperaturVal = getState(`${idDasWetter}.Hour_${i}.temp_value`).val;
        if (day === 1) {
            let dp = `${idWeatherUndergroundHourly}.${hour - nowHour}h.temp`
            if (existsState(dp)) temperaturVal = getState(dp).val
        } else {
            let dp = `${idWeatherUndergroundHourly}.${hour + 24 - nowHour}h.temp`
            if (day === 2 && existsState(dp)) temperaturVal = getState(dp).val
        }

        if (temperaturVal > temperaturAxisMax) {
            temperaturAxisMax = temperaturVal;
        }
        if (temperaturVal < temperaturAxisMin) {
            temperaturAxisMin = temperaturVal;
        }
        temperatur.push(temperaturVal);
        temperaturColors.push(temperaturGradientColors.getColorByValue(temperaturVal));


        // Regenwahrscheinlichkeit
        if (existsState(`${idWeatherUndergroundDaily}.precipitationChance`)) {
            let regenwahrscheinlichkeitVal = getState(`${idWeatherUndergroundDaily}.precipitationChance`).val
            if (day === 1) {
                let dp = `${idWeatherUndergroundHourly}.${hour - nowHour}h.precipitationChance`;
                if (existsState(dp)) regenwahrscheinlichkeitVal = getState(dp).val
            } else {
                let dp = `${idWeatherUndergroundHourly}.${hour + 24 - nowHour}h.precipitationChance`
                if (day === 2 && existsState(dp)) regenwahrscheinlichkeitVal = getState(dp).val
            }

            regenWahrscheinlichkeit.push(regenwahrscheinlichkeitVal);
        }
    }

    graphs.push(
        {
            data: temperatur,
            type: 'line',
            color: 'gray',
            legendText: 'Temperatur',
            line_pointSizeHover: 5,
            line_pointSize: 0,
            line_Tension: 0.3,
            yAxis_show: false,
            yAxis_gridLines_show: false,
            yAxis_gridLines_ticks_length: 5,
            yAxis_min: (temperaturAxisMin < 5) ? Math.ceil((temperaturAxisMin - 5) / 5) * 5 : 0,
            yAxis_max: Math.ceil((temperaturAxisMax + 5) / 5) * 5,
            yAxis_step: 5,
            yAxis_position: 'left',
            yAxis_appendix: ' °C',
            yAxis_zeroLineWidth: 0.1,
            yAxis_zeroLineColor: 'black',
            displayOrder: 0,
            tooltip_AppendText: ' °C',
            datalabel_backgroundColor: temperaturColors,
            datalabel_color: 'white',
            datalabel_offset: -10,
            datalabel_fontFamily: 'RobotoCondensed-Light',
            datalabel_fontSize: 12,
            datalabel_borderRadius: 6,
            datalabel_steps: (temperatur.length > 8) ? 2 : 1,
            line_PointColor: temperaturColors,
            line_PointColorBorder: temperaturColors,
            line_PointColorHover: temperaturColors,
            line_PointColorBorderHover: temperaturColors,
            use_gradient_color: true,
            gradient_color: color_graph_temperatur_verlauf,
            use_line_gradient_fill_color: true,
            line_gradient_fill_color: temperaturGradientColors.getGradientWithOpacity(40)
        }
    )

    if (regenWahrscheinlichkeit.length > 0) {
        graphs.push(
            {
                data: regenWahrscheinlichkeit,
                type: 'line',
                color: color_graph_regenwahrscheinlichkeit,
                legendText: 'Regenwahrscheinlichkeit',
                line_UseFillColor: true,
                line_pointSize: 0,
                line_pointSizeHover: 5,
                yAxis_min: 0,
                yAxis_max: 100,
                yAxis_maxSteps: 10,
                yAxis_position: 'left',
                yAxis_gridLines_show: false,
                yAxis_gridLines_border_show: false,
                yAxis_zeroLineWidth: 0.1,
                yAxis_zeroLineColor: 'black',
                yAxis_appendix: ' %',
                displayOrder: 1,
                tooltip_AppendText: ' %',
                datalabel_show: false,
            }
        )
    }

    if (niederschlagMaxVal > 0) {
        graphs.push(
            {
                data: niederschlag,
                type: 'bar',
                color: color_graph_niederschlag,
                legendText: 'Niederschlag',
                yAxis_min: 0,
                yAxis_max: Math.ceil((niederschlagMaxVal + 5) / 5) * 5,
                yAxis_maxSteps: 10,
                yAxis_position: 'right',
                yAxis_gridLines_show: false,
                yAxis_appendix: ' mm',
                yAxis_gridLines_border_show: false,
                yAxis_zeroLineWidth: 0.1,
                yAxis_zeroLineColor: 'black',
                displayOrder: 1,
                tooltip_AppendText: ' mm',
                datalabel_show: false,
            }
        )
    }

    chart = {
        axisLabels: axisLabels,
        graphs: graphs
    }

    mySetState(`${idChart}${day}`, JSON.stringify(chart), 'string', `Tag ${day} für Chart Widget`);
}

function createVorschauGraph(maxDays) {

    let chart = {};
    let graphs = [];

    let axisLabels = []

    let temperaturMax = [];
    let temperaturMin = [];
    let temperaturMaxColors = [];
    let temperaturMinColors = [];
    let temperaturAxisMax = 0;
    let temperaturAxisMin = 100;

    let regenWahrscheinlichkeit = [];

    let niederschlag = [];
    let niederschlagMaxVal = 0;

    for (var day = 1; day <= maxDays; day++) {
        let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
        let idWeatherUnderground = `weatherunderground.0.forecast.${day - 1}d`;

        if (existsState(`${idDasWetter}.day_name`)) {
            axisLabels.push((day === 1) ? 'Heute' : getState(`${idDasWetter}.day_name`).val)

            // Temperatur Max 
            let temperaturMaxVal = getState(`${idDasWetter}.tempmax_value`).val;
            if (temperaturMaxVal > temperaturAxisMax) {
                temperaturAxisMax = temperaturMaxVal;
            }
            if (temperaturMaxVal < temperaturAxisMin) {
                temperaturAxisMin = temperaturMaxVal;
            }
            temperaturMax.push(temperaturMaxVal);
            temperaturMaxColors.push(temperaturGradientColors.getColorByValue(temperaturMaxVal));

            // Temperatur Min 
            let temperaturMinVal = getState(`${idDasWetter}.tempmin_value`).val;
            if (temperaturMinVal > temperaturAxisMax) {
                temperaturAxisMax = temperaturMinVal;
            }
            if (temperaturMinVal < temperaturAxisMin) {
                temperaturAxisMin = temperaturMinVal;
            }
            temperaturMin.push(temperaturMinVal);
            temperaturMinColors.push(temperaturGradientColors.getColorByValue(temperaturMinVal));

            // Niederschlag Menge
            let niederschlagVal = getState(`${idDasWetter}.rain_value`).val;

            if (niederschlagVal > niederschlagMaxVal) {
                niederschlagMaxVal = niederschlagVal;
            }
            niederschlag.push(niederschlagVal);

            //Regenwahrscheinlichkeit
            if (existsState(`${idWeatherUnderground}.precipitationChance`)) {
                regenWahrscheinlichkeit.push(getState(`${idWeatherUnderground}.precipitationChance`).val);
            } else {
                regenWahrscheinlichkeit.push(0);
            }
        } else {
            console.warn(`[createVorschauGraph] Keine Daten für Tag ${day} vorhanden! Reduziere die Anzahl der Tage im Skript, dann wird keine Warnmeldung mehr angezeigt!`);
        }
    }

    graphs.push(
        {
            data: temperaturMax,
            type: 'line',
            legendText: 'max. Temperatur',
            line_pointSizeHover: 5,
            line_pointSize: 0,
            line_Tension: 0.3,
            yAxis_id: 0,
            yAxis_show: false,
            yAxis_gridLines_show: false,
            yAxis_gridLines_ticks_length: 5,
            yAxis_min: (temperaturAxisMin < 5) ? Math.ceil((temperaturAxisMin - 5) / 5) * 5 : 0,
            yAxis_max: Math.ceil((temperaturAxisMax + 5) / 5) * 5,
            yAxis_step: 5,
            yAxis_position: 'left',
            yAxis_appendix: ' °C',
            yAxis_zeroLineWidth: 0.1,
            yAxis_zeroLineColor: 'black',
            displayOrder: 0,
            tooltip_AppendText: ' °C',
            datalabel_backgroundColor: temperaturMaxColors,
            datalabel_color: 'white',
            datalabel_offset: -10,
            datalabel_fontFamily: 'RobotoCondensed-Light',
            datalabel_fontSize: 12,
            datalabel_borderRadius: 6,
            line_PointColor: temperaturMaxColors,
            line_PointColorBorder: temperaturMaxColors,
            line_PointColorHover: temperaturMaxColors,
            line_PointColorBorderHover: temperaturMaxColors,
            use_gradient_color: true,
            line_FillBetweenLines: '+1',
            gradient_color: color_graph_temperatur_verlauf,
            use_line_gradient_fill_color: true,
            line_gradient_fill_color: temperaturGradientColors.getGradientWithOpacity(40)
        }
    )

    graphs.push(
        {
            data: temperaturMin,
            type: 'line',
            legendText: 'min. Temperatur',
            line_pointSizeHover: 5,
            line_pointSize: 0,
            line_Tension: 0.3,
            yAxis_id: 0,
            yAxis_show: false,
            yAxis_gridLines_show: false,
            yAxis_gridLines_ticks_length: 5,
            yAxis_min: (temperaturAxisMin < 5) ? Math.ceil((temperaturAxisMin - 5) / 5) * 5 : 0,
            yAxis_max: Math.ceil((temperaturAxisMax + 5) / 5) * 5,
            yAxis_step: 5,
            yAxis_position: 'left',
            yAxis_appendix: ' °C',
            yAxis_zeroLineWidth: 0.1,
            yAxis_zeroLineColor: 'black',
            displayOrder: 0,
            tooltip_AppendText: ' °C',
            datalabel_backgroundColor: temperaturMinColors,
            datalabel_color: 'white',
            datalabel_offset: -10,
            datalabel_fontFamily: 'RobotoCondensed-Light',
            datalabel_fontSize: 12,
            datalabel_borderRadius: 6,
            line_PointColor: temperaturMinColors,
            line_PointColorBorder: temperaturMinColors,
            line_PointColorHover: temperaturMinColors,
            line_PointColorBorderHover: temperaturMinColors,
            use_gradient_color: true,
            gradient_color: color_graph_temperatur_verlauf
        }
    )

    graphs.push(
        {
            data: regenWahrscheinlichkeit,
            type: 'line',
            color: color_graph_regenwahrscheinlichkeit,
            legendText: 'Regenwahrscheinlichkeit',
            line_UseFillColor: true,
            line_pointSize: 0,
            line_pointSizeHover: 5,
            yAxis_min: 0,
            yAxis_max: 100,
            yAxis_maxSteps: 10,
            yAxis_position: 'left',
            yAxis_gridLines_show: false,
            yAxis_gridLines_border_show: true,
            yAxis_distance: 10,
            yAxis_zeroLineWidth: 0.1,
            yAxis_zeroLineColor: 'black',
            yAxis_appendix: ' %',
            displayOrder: 1,
            tooltip_AppendText: ' %',
            datalabel_show: false,
        }
    )

    if (niederschlagMaxVal > 0) {
        graphs.push(
            {
                data: niederschlag,
                type: 'bar',
                color: color_graph_niederschlag,
                legendText: 'Niederschlag',
                yAxis_min: 0,
                yAxis_max: Math.ceil((niederschlagMaxVal + 5) / 5) * 5,
                yAxis_maxSteps: 10,
                yAxis_position: 'right',
                yAxis_gridLines_show: false,
                yAxis_appendix: ' mm',
                yAxis_gridLines_border_show: false,
                yAxis_distance: 10,
                yAxis_zeroLineWidth: 0.1,
                yAxis_zeroLineColor: 'black',
                displayOrder: 1,
                tooltip_AppendText: ' mm',
                datalabel_show: false,
            }
        )
    }

    chart = {
        axisLabels: axisLabels,
        graphs: graphs
    }

    mySetState(`${idIconList_Vorschau_Chart}`, JSON.stringify(chart), 'string', `Vorschau Chart`);
}

function createVorschauIconListItem(day) {
    let idDasWetter = `daswetter.0.NextHours.Location_1.Day_${day}`;
    let idWeatherUnderground = `weatherunderground.0.forecast.${day - 1}d`;

    let title = (day === 1) ? 'Heute' : getState(`${idDasWetter}.day_name`).val

    let regenWahrscheinlichkeit = existsState(`${idWeatherUnderground}.precipitationChance`) ? `${getState(`${idWeatherUnderground}.precipitationChance`).val} %` : '-';
    let niederschlagTag = existsState(`${idWeatherUnderground}.precipitationDay`) ? (getState(`${idWeatherUnderground}.precipitationDay`).val !== null) ? getState(`${idWeatherUnderground}.precipitationDay`).val : 0 : getState(`${idDasWetter}.rain_value`).val;
    let niederschlagNacht = existsState(`${idWeatherUnderground}.precipitationNight`) ? getState(`${idWeatherUnderground}.precipitationNight`).val : null;

    let niederschlag = (niederschlagNacht !== null) ? `${niederschlagTag.toString().replace('.', ',')} / ${niederschlagNacht.toString().replace('.', ',')} mm` : `${niederschlagTag} mm`;

    return {
        text: `
                    <div style="margin: 0 4px; text-align: center;">${title}
                        <div style="height: 1px; background: #44739e;"></div>
                        <div style="color: grey; font-size: 11px; font-family: RobotoCondensed-Light; white-space: break-spaces; margin-top: 5px; text-align: center;">${getState(`${idDasWetter}.symbol_desc`).val}</div>
                        <div style="color: #44739e; font-family: RobotoCondensed-Regular; font-size: 16px; margin-top: 5px; text-align: center;">${getState(`${idDasWetter}.tempmax_value`).val}°C &nbsp; | &nbsp; ${getState(`${idDasWetter}.tempmin_value`).val}°C</div>
                        <div style="color: grey; font-size: 11px; font-family: RobotoCondensed-Light; white-space: break-spaces; margin-top: 5px; text-align: center;">${regenWahrscheinlichkeit}</div>
                    </div>`,
        image: getState(`${idDasWetter}.iconURL`).val,
        subText: `
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Luftfeuchtigkeit</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.humidity_value`).val} %</div>
                        </div>                 
                        <div style="display: flex; align-items: flex-start; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Regen</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${niederschlag}</div>
                        </div>
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Wind</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.wind_value`).val} km/h</div>
                        </div>
                     
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Luftdruck</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.pressure_value`).val} hPa</div>
                        </div>
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Schneefall</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.snowline_value`).val} m</div>
                        </div>
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Sonnenaufgang</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.sun_in`).val}</div>
                        </div>
                        <div style="display: flex; align-items: center; margin: 0 4px;">
                            <div style="flex: 1;text-align: left;font-family: RobotoCondensed-Light; font-size: 11px;">Sonnenuntergang</div>
                            <div style="color: gray; font-family: RobotoCondensed-LightItalic; font-size: 10px;">${getState(`${idDasWetter}.sun_out`).val}</div>
                        </div>                        
                            `,
        listType: (day === 1) ? "text" : "buttonState",
        objectId: `${idDialogSchalter}${day}`,
        buttonStateValue: "true",
        "showValueLabel": "false"
    }
}

// Bei JS Start prüfen
createData();


function getGradientColors(min, max, colorValArray) {
    let delta = max - min;

    let chromaColors = []
    let chromaDomains = [];

    for (const item of colorValArray) {
        chromaColors.push(item.color);
        chromaDomains.push(item.value / delta);
    }
    let chroma = chromaJs.scale(chromaColors).domain(chromaDomains);

    return {
        getColorByValue: function (val) {
            if (val > max) {
                return chroma(1).hex();
            } else if (val < min) {
                return chroma(0).hex();
            } else {
                return chroma(val / delta).hex();
            }
        },
        getGradientWithOpacity: function (opacity) {
            colorValArray.forEach(item => {
                item.color = chromaJs(item.color).alpha(opacity / 100).hex();
            });
            return colorValArray;
        }
    }
}

function mySetState(id, val, type, name) {
    if (existsState(id)) {
        setState(id, val, true);
    } else {
        createUserStates(idDatenpunktPrefix, false, [
            id, {
                'name': name,
                'type': type,
                'read': true,
                'write': true
            }
        ], function () {
            setState(id, val, true);
        });
    }
}


/**
 * Create states under 0_userdata.0 or javascript.x
 * Current Version:     https://github.com/Mic-M/iobroker.createUserStates
 * Support:             https://forum.iobroker.net/topic/26839/
 * Autor:               Mic (ioBroker) | Mic-M (github)
 * Version:             1.1 (26 January 2020)
 * Example:             see https://github.com/Mic-M/iobroker.createUserStates#beispiel
 * -----------------------------------------------
 * PLEASE NOTE: Per https://github.com/ioBroker/ioBroker.javascript/issues/474, the used function setObject() 
 *              executes the callback PRIOR to completing the state creation. Therefore, we use a setTimeout and counter. 
 * -----------------------------------------------
 * @param {string} where          Where to create the state: '0_userdata.0' or 'javascript.x'.
 * @param {boolean} force         Force state creation (overwrite), if state is existing.
 * @param {array} statesToCreate  State(s) to create. single array or array of arrays
 * @param {object} [callback]     Optional: a callback function -- This provided function will be executed after all states are created.
 */
function createUserStates(where, force, statesToCreate, callback = undefined) {

    const WARN = false; // Only for 0_userdata.0: Throws warning in log, if state is already existing and force=false. Default is false, so no warning in log, if state exists.
    const LOG_DEBUG = false; // To debug this function, set to true
    // Per issue #474 (https://github.com/ioBroker/ioBroker.javascript/issues/474), the used function setObject() executes the callback 
    // before the state is actual created. Therefore, we use a setTimeout and counter as a workaround.
    const DELAY = 50; // Delay in milliseconds (ms). Increase this to 100, if it is not working.

    // Validate "where"
    if (where.endsWith('.')) where = where.slice(0, -1); // Remove trailing dot
    if ((where.match(/^((javascript\.([1-9][0-9]|[0-9]))$|0_userdata\.0$)/) == null)) {
        log('This script does not support to create states under [' + where + ']', 'error');
        return;
    }

    // Prepare "statesToCreate" since we also allow a single state to create
    if (!Array.isArray(statesToCreate[0])) statesToCreate = [statesToCreate]; // wrap into array, if just one array and not inside an array

    // Add "where" to STATES_TO_CREATE
    for (let i = 0; i < statesToCreate.length; i++) {
        let lpPath = statesToCreate[i][0].replace(/\.*\./g, '.'); // replace all multiple dots like '..', '...' with a single '.'
        lpPath = lpPath.replace(/^((javascript\.([1-9][0-9]|[0-9])\.)|0_userdata\.0\.)/, '') // remove any javascript.x. / 0_userdata.0. from beginning
        lpPath = where + '.' + lpPath; // add where to beginning of string
        statesToCreate[i][0] = lpPath;
    }

    if (where != '0_userdata.0') {
        // Create States under javascript.x
        let numStates = statesToCreate.length;
        statesToCreate.forEach(function (loopParam) {
            if (LOG_DEBUG) log('[Debug] Now we are creating new state [' + loopParam[0] + ']');
            let loopInit = (loopParam[1]['def'] == undefined) ? null : loopParam[1]['def']; // mimic same behavior as createState if no init value is provided
            createState(loopParam[0], loopInit, force, loopParam[1], function () {
                numStates--;
                if (numStates === 0) {
                    if (LOG_DEBUG) log('[Debug] All states processed.');
                    if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                        if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                        return callback();
                    } else {
                        return;
                    }
                }
            });
        });
    } else {
        // Create States under 0_userdata.0
        let numStates = statesToCreate.length;
        let counter = -1;
        statesToCreate.forEach(function (loopParam) {
            counter += 1;
            if (LOG_DEBUG) log('[Debug] Currently processing following state: [' + loopParam[0] + ']');
            if (($(loopParam[0]).length > 0) && (existsState(loopParam[0]))) { // Workaround due to https://github.com/ioBroker/ioBroker.javascript/issues/478
                // State is existing.
                if (WARN && !force) log('State [' + loopParam[0] + '] is already existing and will no longer be created.', 'warn');
                if (!WARN && LOG_DEBUG) log('[Debug] State [' + loopParam[0] + '] is already existing. Option force (=overwrite) is set to [' + force + '].');
                if (!force) {
                    // State exists and shall not be overwritten since force=false
                    // So, we do not proceed.
                    numStates--;
                    if (numStates === 0) {
                        if (LOG_DEBUG) log('[Debug] All states successfully processed!');
                        if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                            if (LOG_DEBUG) log('[Debug] An optional callback function was provided, which we are going to execute now.');
                            return callback();
                        }
                    } else {
                        // We need to go out and continue with next element in loop.
                        return; // https://stackoverflow.com/questions/18452920/continue-in-cursor-foreach
                    }
                } // if(!force)
            }

            // State is not existing or force = true, so we are continuing to create the state through setObject().
            let obj = {};
            obj.type = 'state';
            obj.native = {};
            obj.common = loopParam[1];
            setObject(loopParam[0], obj, function (err) {
                if (err) {
                    log('Cannot write object for state [' + loopParam[0] + ']: ' + err);
                } else {
                    if (LOG_DEBUG) log('[Debug] Now we are creating new state [' + loopParam[0] + ']')
                    let init = null;
                    if (loopParam[1].def === undefined) {
                        if (loopParam[1].type === 'number') init = 0;
                        if (loopParam[1].type === 'boolean') init = false;
                        if (loopParam[1].type === 'string') init = '';
                    } else {
                        init = loopParam[1].def;
                    }
                    setTimeout(function () {
                        setState(loopParam[0], init, true, function () {
                            if (LOG_DEBUG) log('[Debug] setState durchgeführt: ' + loopParam[0]);
                            numStates--;
                            if (numStates === 0) {
                                if (LOG_DEBUG) log('[Debug] All states processed.');
                                if (typeof callback === 'function') { // execute if a function was provided to parameter callback
                                    if (LOG_DEBUG) log('[Debug] Function to callback parameter was provided');
                                    return callback();
                                }
                            }
                        });
                    }, DELAY + (20 * counter));
                }
            });
        });
    }
}