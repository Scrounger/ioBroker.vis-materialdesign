/************************************************************************************************************************************************************************
Version: 1.0.2
created by Scrounger

Dieses Skript erzeugt json strings um Proxmox Informationen im VIS mit den Material Design Widgets darzustellen
=========================================================================================================================================================================

!!! Voraussetzungen !!!
* Material Design Widgets               >= 0.3.19
* Proxmox                               >= 1.0.2
* Javascript Adapter                    >= 4.6.1
* Javascript Adapter NPM Module:        moment, moment-timezone, moment-duration-format, mathjs
=========================================================================================================================================================================

--- Links ---
* Support:          https://forum.iobroker.net/topic/35296/material-design-widgets-proxmox
* Github:           https://github.com/Scrounger/ioBroker.vis-materialdesign/tree/master/examples/Proxmox

=========================================================================================================================================================================

--- Changelog ---
* 1.0.0:            Initial release
* 1.0.1:            Number decimal format changed
* 1.0.2:            Bug Fix wenn nur ein Datenpunkt für die Temperatur verwendet wird
* 1.0.3:            Einstellung 'iconColor' für icon Farbe hinzugefügt

************************************************************************************************************************************************************************/

// Skript Einstellungen *************************************************************************************************************************************************
let idDatenpunktPrefix = '0_userdata.0'                                                                         // '0_userdata.0' or 'javascript.x'
let idDatenPunktStrukturPrefix = 'vis.MaterialDesignWidgets.Proxmox'                                            // Struktur unter Prefix

let triggerDatenpunkt = "proxmox.0.node_proxmox.uptime";                                                        // Datenpunkt um Skript Ausführung zu triggern (z.B. uptime einer Node)

let cpuAverageLastValues = 60;                                                                                  // Wieviele Werte zur Berechnung der durchschnittlichen CPU Last verwendet werden sollen

let nodesList = [                                                                                               // Node Liste
    {
        idChannel: 'proxmox.0.node_proxmox',                                                                    // id des Channels der Node
        targetChannel: 'promox',                                                                                // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'System',                                                                                         // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/nuc.png',                                                                       // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.10:8006/',                                                                        // Url die aufgerufen wird beim Klick auf den Titel
        showControlButtons: false,                                                                              // Buttons für start, restart, stop anzeigen
        // temperatures: ['linkeddevices.0.System.Temperatur.Core_0', 'linkeddevices.0.System.Temperatur.Core_1'], // Datenpunkte für Temperatur (1 oder 2 Datenpunkte, entfernen wenn nicht benötigt)
        // storages: [                                                                                             // Storage Datenpunkt des Proxmox Adapter anzeigen
        //     {
        //         idChannel: 'proxmox.0.storage_local',                                                           // id des Storage Datenpunkts
        //         text: 'Local',                                                                                  // Text der für den Storage angezeigt werden soll
        //         icon: 'harddisk'                                                                                // Icon das für den Storage angezeigt werden soll
        //     },
        //     {
        //         idChannel: 'proxmox.0.storage_local-lvm',
        //         text: 'LVM',
        //         icon: 'harddisk'
        //     },
        //     {
        //         idChannel: 'proxmox.0.storage_Backup',
        //         text: 'Backup',
        //         icon: 'harddisk'
        //     },
        //     {
        //         idChannel: 'proxmox.0.storage_Mirror',
        //         text: 'Mirror',
        //         icon: 'harddisk'
        //     }
        // ],
        // custom: [                                                                                               // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.proxmox.needrestart.needrestart',                                          // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.proxmox.updates.newPackages',                                              // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.proxmox.updates.lastUpdate',                                               // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     }
        // ]
    }
]

let vmList = [                                                                                                  // LXC / VM Liste
    {
        idChannel: 'proxmox.0.lxc_ioBroker',                                                                    // id des Channels der Node
        targetChannel: 'lxc_ioBroker',                                                                          // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - ioBroker',                                                                                 // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/iobroker.png',                                                                  // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.15:8081/login/index.html?href=%2F',                                               // Url die aufgerufen wird beim Klick auf den Titel
        // custom: [                                                                                               // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.needrestart.needrestart',                                     // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.updates.lastUpdate',                                          // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.folders.backup.container.lastChange',                                  // id des Datenpunktes
        //         secondIds: [                                                                                    // ids für subtext
        //             'linux-control.0.lxc_ioBroker.folders.backup.container.files',
        //             'linux-control.0.lxc_ioBroker.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                             // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                         // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.folders.backup.data.lastChange',                                       // id des Datenpunktes
        //         secondIds: [                                                                                    // ids für subtext
        //             'linux-control.0.lxc_ioBroker.folders.backup.data.files',
        //             'linux-control.0.lxc_ioBroker.folders.backup.data.size'
        //         ],
        //         text: 'Daten Backup',                                                                           // text der angezeigt werden soll
        //         icon: 'file-upload',                                                                            // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.folders.ioBroker.size',                                       // id des Datenpunktes
        //         text: 'Ordnergröße',                                                                            // text der angezeigt werden soll
        //         icon: 'folder-information',                                                                     // icon das angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_ioBroker.folders.npm_cache.size',                                      // id des Datenpunktes
        //         text: 'NPM Cache',                                                                              // text der angezeigt werden soll
        //         icon: 'folder-clock',                                                                           // icon das angezeigt werden soll
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.lxc_NextCloud',                                                                    // id des Channels der Node
        targetChannel: 'lxc_NextCloud',                                                                          // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - Nextcloud',                                                                                 // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/nextcloud-icon.png',                                                             // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.14/index.php/login',                                                               // Url die aufgerufen wird beim Klick auf den Titel
        // custom: [                                                                                                // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_NextCloud.needrestart.needrestart',                                    // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_NextCloud.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_NextCloud.updates.lastUpdate',                                          // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_NextCloud.folders.backup.container.lastChange',                                  // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_NextCloud.folders.backup.container.files',
        //             'linux-control.0.lxc_NextCloud.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                              // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                          // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },          
        //     {
        //         id: 'linux-control.0.lxc_NextCloud.folders.userData.size',                                       // id des Datenpunktes
        //         text: 'Benutzerdaten',                                                                           // text der angezeigt werden soll
        //         icon: 'folder-account',                                                                          // icon das angezeigt werden soll
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.lxc_Waihona',                                                                      // id des Channels der Node
        targetChannel: 'lxc_Waihona',                                                                            // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - Waihona',                                                                                   // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/samba.png',                                                                      // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.12:8000/',                                                                         // Url die aufgerufen wird beim Klick auf den Titel
        // custom: [                                                                                                // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_Waihona.needrestart.needrestart',                                    // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_Waihona.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_Waihona.updates.lastUpdate',                                          // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_Waihona.folders.backup.container.lastChange',                                    // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_Waihona.folders.backup.container.files',
        //             'linux-control.0.lxc_Waihona.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                              // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                          // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.lxc_MySql',                                                                        // id des Channels der Node
        targetChannel: 'lxc_MySql',                                                                              // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - MySql',                                                                                     // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/MySql.png',                                                                      // Bild das im Titel angezeigt werden soll
        // custom: [                                                                                                // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_MySql.needrestart.needrestart',                                    // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_MySql.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_MySql.updates.lastUpdate',                                             // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_MySql.folders.backup.container.lastChange',                                      // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_MySql.folders.backup.container.files',
        //             'linux-control.0.lxc_MySql.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                              // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                          // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_MySql.folders.backup.data.lastChange',                                          // id des Datenpunktes
        //         secondIds: [                                                                                    // ids für subtext
        //             'linux-control.0.lxc_MySql.folders.backup.data.files',
        //             'linux-control.0.lxc_MySql.folders.backup.data.size'
        //         ],
        //         text: 'Daten Backup',                                                                           // text der angezeigt werden soll
        //         icon: 'file-upload',                                                                            // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_MySql.folders.database.size',                                           // id des Datenpunktes
        //         text: 'Datenbank',                                                                               // text der angezeigt werden soll
        //         icon: 'database',                                                                                // icon das angezeigt werden soll
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.lxc_piHole',                                                                       // id des Channels der Node
        targetChannel: 'lxc_piHole',                                                                             // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - piHole',                                                                                    // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/pihole.png',                                                                     // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.11/admin/',                                                                        // Url die aufgerufen wird beim Klick auf den Titel
        // custom: [                                                                                                // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_piHole.needrestart.needrestart',                                    // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_piHole.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_piHole.updates.lastUpdate',                                          // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_piHole.folders.backup.container.lastChange',                            // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_piHole.folders.backup.container.files',
        //             'linux-control.0.lxc_piHole.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                              // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                          // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_piHole.folders.backup.data.lastChange',                                // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_piHole.folders.backup.data.files',
        //             'linux-control.0.lxc_piHole.folders.backup.data.size'
        //         ],
        //         text: 'Daten Backup',                                                                           // text der angezeigt werden soll
        //         icon: 'file-upload',                                                                            // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_piHole.folders.database.size',                                          // id des Datenpunktes
        //         text: 'Datenbank',                                                                               // text der angezeigt werden soll
        //         icon: 'database',                                                                                // icon das angezeigt werden soll
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.lxc_devBroker',                                                                    // id des Channels der Node
        targetChannel: 'lxc_devBroker',                                                                          // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'LXC - devBroker',                                                                                 // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/devBroker.png',                                                                  // Bild das im Titel angezeigt werden soll
        url: 'https://10.25.1.17:8081/login/index.html?href=%2F',                                                // Url die aufgerufen wird beim Klick auf den Titel
        // custom: [                                                                                                // andere Datenpunkte (nicht vom Proxmox Adapter) die mit aufgelistet werden sollen. Falls nicht benötigt, Array löschen
        //     {
        //         id: 'linux-control.0.lxc_devBroker.needrestart.needrestart',                                    // id des Datenpunktes
        //         text: 'Neustart notwendig',                                                                     // text der angezeigt werden soll
        //         icon: 'restart',                                                                                // icon das angezeigt werden soll
        //         type: 'boolean',                                                                                // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_devBroker.updates.newPackages',                                         // id des Datenpunktes
        //         text: 'Updates',                                                                                // text der angezeigt werden soll
        //         icon: 'package-down',                                                                           // icon das angezeigt werden soll
        //         type: 'number',                                                                                 // welche Funktion verwendet werden soll
        //         attention: true                                                                                 // ob Attention Farbe angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_devBroker.updates.lastUpdate',                                          // id des Datenpunktes
        //         text: 'letztes Update',                                                                         // text der angezeigt werden soll
        //         icon: 'package-up',                                                                             // icon das angezeigt werden soll
        //         type: 'timestamp',                                                                     // welche Funktion verwendet werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_devBroker.folders.backup.container.lastChange',                                  // id des Datenpunktes
        //         secondIds: [                                                                                     // ids für subtext
        //             'linux-control.0.lxc_devBroker.folders.backup.container.files',
        //             'linux-control.0.lxc_devBroker.folders.backup.container.size'
        //         ],
        //         text: 'LXC Backup',                                                                              // text der angezeigt werden soll
        //         icon: 'backup-restore',                                                                          // icon das angezeigt werden soll
        //         type: 'timestamp'
        //     },
        //     {
        //         id: 'linux-control.0.lxc_devBroker.folders.ioBroker.size',                                       // id des Datenpunktes
        //         text: 'Ordnergröße',                                                                             // text der angezeigt werden soll
        //         icon: 'folder-information',                                                                      // icon das angezeigt werden soll
        //     },
        //     {
        //         id: 'linux-control.0.lxc_devBroker.folders.npm_cache.size',                                      // id des Datenpunktes
        //         text: 'NPM Cache',                                                                               // text der angezeigt werden soll
        //         icon: 'folder-clock',                                                                            // icon das angezeigt werden soll
        //     }
        // ]
    },
    {
        idChannel: 'proxmox.0.qemu_RaspberryMatic',                                                              // id des Channels der Node
        targetChannel: 'qemu_RaspiMatic',                                                                        // id unter der der json string für das Table Widget gespeichert werden soll
        name: 'VM - RaspiMatic',                                                                                 // name der als Titel angezeigt werden soll
        image: '/vis.0/myImages/raspberrymatic.png',                                                             // Bild das im Titel angezeigt werden soll
        url: 'http://10.25.1.16/login.htm',                                                                      // Url die aufgerufen wird beim Klick auf den Titel
    },
]

let fontSizePrimary = 20;
let fontSizeSecondary = 16;
let fontSizeTertiary = 14;
let fontSizeQuinary = 11;

let fontFamilyPrimary = 'Roboto,sans-serif';
let fontFamilySecondary = 'RobotoCondensed-Regular';
let fontFamilyTertiary = 'RobotoCondensed-Light';
let fontFamilyQuaternary = 'RobotoCondensed-LightItalic';

let colorPrimary = '#44739e';
let colorSecondary = 'gray';
let colorTertiary = '#44739e';

let colorOnline = 'green';
let colorOffline = 'FireBrick';


let colorGood = 'green';
let colorMedium = 'gold';
let colorBad = 'FireBrick';

let iconColor = '#44739e'
let iconAttentionColor = '#f27935';

let colCount = 24;                                                                                              // Anzahl der Spalten die im Widget eingestellt sind (+1 weil 0 im VIS Editor mitzählt)
let colSpanIcon = 3;                                                                                            // Anzahl der Spalten die für das icon verwendet werden soll
let colSpanText = 8;                                                                                            // Anzahl der Spalten die für den Text verwendet werden soll
let colSpanValueText = colCount - colSpanIcon - colSpanText;

let rowHeight = 32;

let styleValue = `font-size: ${fontSizeTertiary}px; text-align: right; margin-right: 8px; font-family: ${fontFamilyTertiary}; color: ${colorTertiary};`
let styleText = `font-size: ${fontSizeSecondary}px; text-align: left; font-family: ${fontFamilySecondary}; color: ${colorPrimary}; height: ${rowHeight}px; line-height: ${rowHeight}px; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;`
let styleButtonText = `font-size: ${fontSizeSecondary}px; text-align: left; font-family: ${fontFamilyTertiary}; color: ${colorPrimary}; margin-left: 2px; margin-right: 2px;`

let iconLayout = {
    type: "materialdesignicon",
    mdwIconSize: 26,
    colspan: colSpanIcon,
    cellStyleAttrs: 'text-overflow: unset'
}

let textLayout = {
    type: "html",
    width: "100%",
    cellStyleAttrs: 'padding-left: 2px;',
    colspan: colSpanText
}

let valueTextLayout = {
    type: "html",
    width: "100%",
    colspan: colSpanValueText,
}

let progressBarLayout = {
    type: "progress",
    width: "100%",
    height: `${rowHeight}px`,
    showValueLabel: true,
    textAlign: "end",
    colorProgress: colorGood,
    colorOneCondition: 69,
    colorOne: colorMedium,
    colorTwoCondition: 89,
    colorTwo: colorBad,
    progressRounded: false,
    verticalAlign: 'top',
    textFontSize: fontSizeTertiary,
    textFontFamily: fontFamilyTertiary,
    colspan: colSpanValueText
}

let progressBarCpuLayout = {
    type: "progress",
    width: "100%",
    height: `${rowHeight / 2}px`,
    showValueLabel: true,
    textAlign: "end",
    colorProgress: colorGood,
    colorOneCondition: 69,
    colorOne: colorMedium,
    colorTwoCondition: 89,
    colorTwo: colorBad,
    progressRounded: false,
    textFontSize: fontSizeTertiary,
    textFontFamily: fontFamilyTertiary,
    colspan: colSpanValueText
}

let temperatureMaxValue = 90;
let progressBarTemperaturLayout = {
    type: "progress",
    width: "100%",
    min: 0,
    max: temperatureMaxValue,
    showValueLabel: true,
    textAlign: "end",
    colorProgress: colorGood,
    colorOneCondition: 59 / temperatureMaxValue * 100,
    colorOne: colorMedium,
    colorTwoCondition: 69 / temperatureMaxValue * 100,
    colorTwo: colorBad,
    progressRounded: false,
    textFontSize: fontSizeTertiary,
    textFontFamily: fontFamilyTertiary,
    colspan: colSpanValueText,
    valueLabelStyle: 'progressCustom'
}

let buttonControlLayout = {
    type: "buttonState",
    width: "100%",
    height: "40px",
    buttonStyle: "text",
    vibrateOnMobilDevices: 50,
    iconPosition: "left",
    iconHeight: "20",
    labelWidth: "",
    autoLockAfter: 5,
    lockEnabled: true,
    lockIconColor: "FireBrick",
}

let statusSeperator = {
    type: "html",
    width: "100%",
    colspan: colCount
}

let iconButtonControlLayout = {
    type: "buttonState_icon",
    width: `${rowHeight}px`,
    height: `${rowHeight}px`,
    imageColor: colorPrimary,
    vibrateOnMobilDevices: "50",
    autoLockAfter: "5",
    lockIconTop: "32",
    lockIconLeft: "30",
    lockIconSize: "12",
    lockIconColor: "red",
    lockFilterGrayscale: "30",
    image: "update",
    iconHeight: "26",
    lockEnabled: true,
    lockIconBackground: "white",
    lockBackgroundSizeFactor: "1.1"
}
// **********************************************************************************************************************************************************************

//import
const mathjs = require("mathjs");
const moment = require("moment");
const momentDurationFormatSetup = require("moment-duration-format");
moment.locale("de");

// Trigger
on({ id: triggerDatenpunkt, change: 'any' }, updateData);

function updateData() {

    for (const node of nodesList) {
        updateVm(node, true);
    }

    for (const vm of vmList) {
        updateVm(vm);
    }
}

function updateVm(vm, isNode = false) {
    try {
        let table = [];

        if (existsObject(`${vm.idChannel}`)) {
            let channel = getObject(`${vm.idChannel}`)

            if (channel && channel.common && channel.common.name) {
                let row = {};

                if (vm.url) {
                    row.button = {
                        type: "buttonLink",
                        href: vm.url,
                        openNewWindow: true,
                        width: "100%",
                        height: "46px",
                        buttonStyle: "text",
                        vibrateOnMobilDevices: "50",
                        iconPosition: "right",
                        image: vm.image,
                        iconHeight: "40",
                        labelWidth: "100",
                        buttontext: `<div style="font-family: ${fontFamilyPrimary}; font-size: ${fontSizePrimary}px; font-weight: 500; letter-spacing: .0125em; text-decoration: inherit; text-align: left;">${vm.name}</div>`,
                        colspan: colCount,
                    }
                } else {
                    row.title = {
                        type: "html",
                        width: "100%",
                        height: "46px",
                        html: `<div style="display: flex; padding: 0 8px 0 8px; align-items: center;">
                                    <div style="flex: 1; font-family: ${fontFamilyPrimary}; font-size: ${fontSizePrimary}px; color: ${colorPrimary}; font-weight: 500; letter-spacing: .0125em; text-decoration: inherit; text-align: left;">${vm.name}</div>
                                    <img class="materialdesign-icon-image" src="${vm.image}" style="width: auto; height: 40px; ;">
                                </div>`,
                        colspan: colCount,
                        cellStyleAttrs: 'height: 49px;'
                    }
                }

                table.push(row)
            }

            table.push({
                seperator: {
                    type: "html",
                    width: "100%",
                    cellStyleAttrs: 'top: -3px; position: relative;',
                    html: `<hr style="color: ${colorPrimary}; background-color: ${colorPrimary}; border-width: 0; height: 2px; margin-top: 0; margin-bottom: 0;">`,
                    colspan: colCount
                }
            })
        } else {
            logDpNotExist(vm.targetChannel, `${vm.idChannel}`);
        }

        generateUptimeRow(`${vm.idChannel}.uptime`, table, vm)

        if (vm.custom && vm.custom.length > 0) {
            for (const dp of vm.custom) {
                generateCustomRow(dp, table, vm);
            }
        }

        generateProgressBarCpuRow(`${vm.idChannel}.cpu`, table, vm, isNode);

        generateProgressBarTemperatures(vm.temperatures, table, vm);

        if (!isNode) {
            generateProgressBarRow(`${vm.idChannel}.mem_lev`, table, vm, "memory", 'Arbeitsspeicher', getUsedOfText(`${vm.idChannel}.mem`, `${vm.idChannel}.maxmem`, vm.targetChannel));
            generateProgressBarRow(`${vm.idChannel}.disk_lev`, table, vm, "harddisk", 'Local', getUsedOfText(`${vm.idChannel}.disk`, `${vm.idChannel}.maxdisk`, vm.targetChannel));
        } else {
            generateProgressBarRow(`${vm.idChannel}.memory.used_lev`, table, vm, "memory", 'Arbeitsspeicher', getUsedOfText(`${vm.idChannel}.memory.used`, `${vm.idChannel}.memory.total`, vm.targetChannel));
            generateProgressBarRow(`${vm.idChannel}.swap.used_lev`, table, vm, "folder-swap", 'SWAP', getUsedOfText(`${vm.idChannel}.swap.used`, `${vm.idChannel}.swap.total`, vm.targetChannel));

            if (vm.storages) {
                for (const storage of vm.storages) {
                    generateProgressBarRow(`${storage.idChannel}.used_lev`, table, vm, storage.icon, storage.text, getUsedOfText(`${storage.idChannel}.used`, `${storage.idChannel}.total`, vm.targetChannel));
                }
            }
        }

        // generateStatusBar(`${vm.idChannel}.status`, table, vm, 'top: 3px; position: relative;');

        table.push({
            seperator: Object.assign({
                html: `<hr style="background: transparent; border-width: 0; height: 1px;margin-top: 0; margin-bottom: 0;">`,
            }, statusSeperator)
        })



        if (vm.showControlButtons || vm.showControlButtons === undefined) {
            let btnIds = [];
            let btnRow = {};

            if (existsObject(`${vm.idChannel}.start`)) {
                btnIds.push({ id: `${vm.idChannel}.start`, text: 'start' });
            }

            if (existsObject(`${vm.idChannel}.reboot`)) {
                btnIds.push({ id: `${vm.idChannel}.reboot`, text: 'neustart' });
            }

            if (existsObject(`${vm.idChannel}.shutdown`)) {
                btnIds.push({ id: `${vm.idChannel}.shutdown`, text: 'stop' });
            }

            for (var i = 0; i <= btnIds.length - 1; i++) {
                let id = btnIds[i].id;

                btnRow[`btn${i}`] = Object.assign(
                    {
                        oid: id,
                        value: true,
                        buttontext: `<div style="${styleButtonText}">${btnIds[i].text}</div>`,
                        image: "play-circle-outline",
                        colspan: colCount / btnIds.length
                    }, buttonControlLayout);
            }
            table.push(btnRow);
        }

        // generateStatusBar(`${vm.idChannel}.status`, table, vm, 'top: -3px; position: relative;');

        mySetState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.${isNode ? 'node' : 'vm'}.${vm.targetChannel}.jsonTable`, JSON.stringify(table), 'string', 'JSON string für Tabellen Widget');

    } catch (ex) {
        console.error(`[updateVm - ${vm.targetChannel}] error: ${ex.message}, stack: ${ex.stack}`);
    }
}



function generateUptimeRow(id, table, vm) {
    let row = {};

    row.icon = Object.assign({ mdwIcon: "clock-check-outline", mdwIconColor: iconColor }, iconLayout)
    row.text = Object.assign({ html: `<div style="${styleText}">Betriebszeit</div>` }, textLayout);

    if (existsState(id)) {
        let duration = moment.duration(getState(id).val * 1000);
        let durationText = duration.format('D [Tage] h [Std. und] m [Min.]');
        if (duration.asDays() <= 2) {
            durationText = duration.format('D [Tag] h [Std. und] m [Min.]');
        }

        row.value = Object.assign({ html: `<div style="${styleValue}">${durationText}</div>` }, valueTextLayout);
    } else {
        logDpNotExist(vm.targetChannel, id);
        row.value = Object.assign({ html: `<div style="${styleValue}; color: red;">N/A</div>` }, valueTextLayout);
    }

    table.push(row);
}

function generateCustomRow(dp, table, vm) {
    let row = {};
    row.icon = Object.assign({ mdwIcon: dp.icon, mdwIconColor: iconColor }, iconLayout);

    if (!dp.secondIds) {
        row.text = Object.assign({ html: `<div style="${styleText}">${dp.text}</div>` }, textLayout);
    } else {
        let secondText = [];
        for (const id of dp.secondIds) {
            if (existsState(id)) {
                let obj = getObject(id);

                let unit = '';
                if (obj && obj.common && obj.common.unit) {
                    unit = ' ' + obj.common.unit;
                }

                secondText.push(getState(id).val + unit);
            } else {
                logDpNotExist(vm.targetChannel, id);
                secondText.push('N/A');
            }
        }

        row.text = Object.assign({ html: getHtmlTwoLines(dp.text, secondText.join(', ')) }, textLayout);
    }

    if (existsState(dp.id)) {
        let val = getState(dp.id).val;
        let obj = getObject(dp.id);

        let unit = '';
        if (obj && obj.common && obj.common.unit) {
            unit = obj.common.unit
        }

        if (!dp.type) {
            if (obj.common && obj.common.type === 'number') {
                row.value = Object.assign({ html: `<div style="${styleValue}">${formatValue(val, undefined, '.,')} ${unit}</div>` }, valueTextLayout);
            } else {
                row.value = Object.assign({ html: `<div style="${styleValue}">${val} ${unit}</div>` }, valueTextLayout);
            }
        } else if (dp.type === 'timestamp') {
            row.value = Object.assign({ html: `<div style="${styleValue}">${getFormattedTimeStamp(val)}</div>` }, valueTextLayout);
        } else if (dp.type === 'timestampInSeconds') {
            row.value = Object.assign({ html: `<div style="${styleValue}">${getFormattedTimeStamp(val * 1000)}</div>` }, valueTextLayout);
        } else if (dp.type === 'boolean') {
            row.value = Object.assign({ html: `<div style="${styleValue}">${val ? 'ja' : 'nein'}</div>` }, valueTextLayout);

            if (dp.attention && val) {
                row.icon = Object.assign({ mdwIcon: dp.icon, mdwIconColor: iconAttentionColor }, iconLayout);
            }
        } else if (dp.type === 'number') {
            row.value = Object.assign({ html: `<div style="${styleValue}">${val > 0 ? `${val} ${unit}` : 'nein'}</div>` }, valueTextLayout);

            if (dp.attention && val > 0) {
                row.icon = Object.assign({ mdwIcon: dp.icon, mdwIconColor: iconAttentionColor }, iconLayout);
            }
        }

    } else {
        logDpNotExist(vm.targetChannel, dp.id);
        row.value = Object.assign({ html: `<div style="${styleValue}; color: red;">N/A</div>` }, valueTextLayout);
    }

    table.push(row);
}

function generateProgressBarTemperatures(idList, table, vm) {
    if (idList && idList.length > 0) {
        let row = {};

        row.icon = Object.assign({ mdwIcon: "thermometer", rowspan: idList.length, mdwIconColor: iconColor }, iconLayout);
        row.text = Object.assign({ html: `<div style="${styleText}">Temperatur</div>`, rowspan: idList.length }, textLayout);

        if (idList[0] && existsState(idList[0])) {
            row.progressBar = Object.assign({ oid: idList[0], valueLabelCustom: '[#value] °C', textColor: colorTertiary, verticalAlign: 'bottom', height: `${rowHeight / idList.length}px`, cellStyleAttrs: `line-height: ${rowHeight / idList.length}px; padding-bottom: 0;` }, progressBarTemperaturLayout);
        } else {
            logDpNotExist(vm.targetChannel, idList[0]);
            row.progressBar = Object.assign({ valueLabelCustom: 'N/A', textColor: colorTertiary, verticalAlign: 'bottom', height: `${rowHeight / idList.length}px`, cellStyleAttrs: `line-height: ${rowHeight / idList.length}px; padding-bottom: 0;` }, progressBarTemperaturLayout);
        }

        table.push(row);

        if (idList.length === 2) {
            if (idList[1] && existsState(idList[1])) {
                table.push({ temp: Object.assign({ oid: idList[1], valueLabelCustom: '[#value] °C', textColor: colorTertiary, verticalAlign: 'bottom', height: `${rowHeight / idList.length}px`, cellStyleAttrs: `line-height: ${rowHeight / idList.length}px; padding-bottom: 0;` }, progressBarTemperaturLayout) });
            } else {
                logDpNotExist(vm.targetChannel, idList[1]);
                table.push({ temp: Object.assign({ valueLabelCustom: 'N/A', textColor: colorTertiary, verticalAlign: 'bottom', height: `${rowHeight / idList.length}px`, cellStyleAttrs: `line-height: ${rowHeight / idList.length}px; padding-bottom: 0;` }, progressBarTemperaturLayout) });
            }
        }
    }
}

function generateProgressBarCpuRow(id, table, vm, isNode = false) {
    let row = {};
    row.icon = Object.assign({ mdwIcon: "cpu-64-bit", rowspan: 2, mdwIconColor: iconColor }, iconLayout);
    row.text = Object.assign({ html: `<div style="${styleText}">CPU</div>`, rowspan: 2 }, textLayout);

    if (existsState(id)) {
        calculateCpuAverage(vm.targetChannel, getState(id).val, isNode);
        let cpuAverageId = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.${isNode ? 'node' : 'vm'}.${vm.targetChannel}.cpuAverage`

        row.progressBar = Object.assign({ oid: id, textColor: colorTertiary, verticalAlign: 'bottom', cellStyleAttrs: `line-height: ${rowHeight / 2}px; padding-bottom: 0;` }, progressBarCpuLayout);

        table.push(row);

        if (existsState(cpuAverageId)) {
            table.push({ cpu: Object.assign({ oid: cpuAverageId, valueLabelStyle: 'progressCustom', valueLabelCustom: 'Ø [#value] %', textColor: colorTertiary, verticalAlign: 'top', cellStyleAttrs: `line-height: ${rowHeight / 2}px; padding-top: 0;` }, progressBarCpuLayout) });
        } else {
            logDpNotExist(vm.targetChannel, cpuAverageId);
            table.push({ cpu: Object.assign({ valueLabelStyle: 'progressCustom', valueLabelCustom: 'N/A', textColor: 'red', verticalAlign: 'top', cellStyleAttrs: `line-height: ${rowHeight / 2}px; padding-top: 0;` }, progressBarCpuLayout) });
        }

    } else {
        logDpNotExist(vm.targetChannel, id);

        row.progressBar = Object.assign({ valueLabelStyle: 'progressCustom', valueLabelCustom: 'N/A', textColor: 'red', verticalAlign: 'bottom', cellStyleAttrs: `line-height: ${rowHeight / 2}px; padding-bottom: 0;` }, progressBarCpuLayout);
        table.push(row);

        table.push({ cpu: Object.assign({ valueLabelStyle: 'progressCustom', valueLabelCustom: 'N/A', textColor: 'red', verticalAlign: 'top', cellStyleAttrs: `line-height: ${rowHeight / 2}px; padding-top: 0;` }, progressBarCpuLayout) });
    }
}

function generateProgressBarRow(id, table, vm, icon, textOne, textTwo) {
    let row = {};
    row.icon = Object.assign({ mdwIcon: icon, mdwIconColor: iconColor }, iconLayout);

    if (existsState(id)) {
        row.text = Object.assign({ html: getHtmlTwoLines(textOne, textTwo) }, textLayout);

        row.progressBar = Object.assign({ oid: id, textColor: colorTertiary }, progressBarLayout);
    } else {
        logDpNotExist(vm.targetChannel, id);
        row.text = Object.assign({ html: `<div style="${styleText}">${textOne}</div>` }, textLayout);
        row.progressBar = Object.assign({ valueLabelStyle: 'progressCustom', valueLabelCustom: 'N/A', textColor: 'red', }, progressBarLayout);
    }

    table.push(row);
}

function generateStatusBar(id, table, vm, cellStyleAttrs) {
    if (getObject(id)) {
        let statusColor = getState(id).val === 'running' ? colorOnline : colorOffline;
        table.push({
            seperator: Object.assign({
                cellStyleAttrs: cellStyleAttrs,
                html: `<hr style="background: linear-gradient(90deg, transparent 0%, ${statusColor} 30%, ${statusColor} 50%, ${statusColor} 70%, transparent 100%); border-width: 0; height: 1px;margin-top: 0; margin-bottom: 0;">`,
            }, statusSeperator)
        })
    } else {
        logDpNotExist(vm.targetChannel, id);
    }

}

function getFormattedTimeStamp(val) {
    let now = moment();
    let daysDiff = now.startOf('day').diff(moment(val).startOf('day'), 'days');

    let timeFormated = moment(val).format('ddd DD.MM. - HH:mm');
    if (daysDiff === 0) {
        timeFormated = `Heute - ${moment(val).format('HH:mm')}`;
    } else if (daysDiff === 1) {
        timeFormated = `Gestern - ${moment(val).format('HH:mm')}`;
    } else if (daysDiff > 1 && daysDiff <= 6) {
        timeFormated = `vor ${daysDiff} Tagen - ${moment(val).format('HH:mm')}`;
    } else if (daysDiff === 7) {
        timeFormated = `vor einer Woche - ${moment(val).format('HH:mm')}`;
    }

    return timeFormated;
}

function calculateCpuAverage(targetChannel, val, isNode = false) {
    let id = `${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.${isNode ? 'node' : 'vm'}.${targetChannel}.cpuLastValues`;

    try {
        if (existsState(id)) {
            let letzteWerte = getState(id).val;

            letzteWerte = letzteWerte.toString().split(',');

            if (val > 0) {
                letzteWerte.unshift(val);
            } else {
                letzteWerte.unshift(0);
            }

            if (letzteWerte.length > cpuAverageLastValues) {
                letzteWerte.splice(cpuAverageLastValues);
            }

            setState(id, letzteWerte.join(','), true);

            let sum = 0;
            for (const value of letzteWerte) {
                sum = sum + parseFloat(value);
            }

            mySetState(`${idDatenpunktPrefix}.${idDatenPunktStrukturPrefix}.${isNode ? 'node' : 'vm'}.${targetChannel}.cpuAverage`, mathjs.round(sum / letzteWerte.length, 0), 'number', 'Durchschnittle CPU Last');
        } else {
            mySetState(id, val.toString(), 'string', 'Durchschnittle CPU Last letzte 60 Werte');
        }

    } catch (err) {
        console.error(`[calculateCpuAverage] '${id}' - error: ${err.message}, stack: ${err.stack}`);
    }
}

function mySetState(id, val, type, name, write = false) {
    if (existsState(id)) {
        setState(id, val, true);
    } else {
        createState(id, {
            'name': name,
            'type': type,
            'read': true,
            'write': write
        }, function () {
            setState(id, val, true);
        });
    }
}

function getUsedOfText(usedId, totalId, targetChannel) {
    let text = 'N/A'

    let used = existsState(usedId) ? getState(usedId).val : logDpNotExist(targetChannel, usedId);
    let total = existsState(totalId) ? getState(totalId).val : logDpNotExist(targetChannel, totalId);

    if (used && total) {
        text = `${formatValue(used / 1024, 2, '.,')} GB / ${formatValue(total / 1024, 0, '.,')} GB`
    }

    return text;
}

function getHtmlTwoLines(text1, text2) {
    return `<div style="font-size: ${fontSizeSecondary}px; text-align: left; font-family: ${fontFamilySecondary}; color: ${colorPrimary}; line-height: 1.2; white-space: nowrap; text-overflow: ellipsis; overflow: hidden;">${text1}</div>
            <div style="font-size: ${fontSizeQuinary}px; text-align: left; font-family: ${fontFamilyQuaternary}; color: ${colorSecondary}; line-height: 1.2">${text2}</div>`
}

function logDpNotExist(target, id) {
    console.warn(`[updateVm - ${target}] datapoint '${id}' not exist!`);
}

// Bei JS Start ausführen
updateData();
