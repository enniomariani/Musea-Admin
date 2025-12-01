import { createI18n } from 'vue-i18n'

export const i18n = createI18n({
    legacy: false,
    locale: 'de',
    fallbackLocale: 'de',
    messages: {
        de: {
            appName: 'Musea Admin',

            //sync-related strings
            startSync: 'Starte Synchronisierung...',
            nothingToSync: 'Medienstation ist auf dem aktuellen Stand.\n',
            connectToController: '\nVerbinde mit Controller...',
            sendContentsJSON: '\nSende contents.json',
            contentsJSONsent: '\nGesendet!',
            syncFinished: '\nSynchronisations-Prozess beendet.',
            mediaPlayerConnectingWith: 'Verbinde mit: ',
            mediaPlayerConnectionStatus: 'Verbindungsstatus: ',
            mediaPlayerLoadMedia: 'Lade Medium: ',
            mediaPlayerSendMedia: 'Sende Medium',
            mediaPlayerSendMediaSuccess: 'OK',
            mediaPlayerSendMediaFailed: 'Fehlgeschlagen!',
            mediaPlayerDeleteMedia: 'Lösche Medium mit ID: ',
            syncFailed: 'Synchronisierung fehlgeschlagen.',
            lastSyncFailedRetry: 'Letzte Synchronisierung fehlgeschlagen. Versuche es erneut...\n',
            lastSyncFailed: '[Letzte Synchronisierung fehlgeschlagen.]',

            //download contents
            download: {
                success: "Die Inhalte wurden erfolgreich heruntergeladen.",
                noContentsOnController: "Es sind noch keine Inhalte auf dem Controller.",
                noControllerIp: "Es ist kein Controller definiert.",
                noResponseFromController: "Der Controller kann nicht erreicht werden: ",
                other: "Unbekannte Antwort."
            },

            mediaStation:{
                infoCheckOnlineStateOfMediaStations: 'Überprüfe Verbindung zu den Medienstationen:',
                checkConnectionToController: 'Überprüfe Verbindung zum Controller...\n\n',
                checkMediaStation: '\n\nStation: ',
                mediaStationReachable: ' OK',
                mediaStationNotReachable: ' Fehlgeschlagen!',

                addMediaStation: 'Medienstation hinzufügen',
                renameMediaStation: 'Medienstation umbenennen',
                insertNameOfMediaStation: 'Name der Medienstation eingeben',
                insertNewNameOfMediaStation: 'Neuen Namen der Medienstation eingeben',
            },

            //media-player-admin screen
            mediaPlayer:{
                mediaPlayerAdmin: 'Verwaltung',

                addMediaPlayer: 'Medien Player hinzufügen',
                insertNameOfMediaPlayer: 'Name des Medien Players eingeben',
                insertIpOfMediaPlayer: 'IP-Adresse des Medien Players eingeben',
                renameMediaPlayer: 'Medien Player umbenennen',
                insertNewNameForMediaPlayer: 'Neuen Namen des Medien Players eingeben',
                insertNewIpForMediaPlayer: 'Neue IP-Adresse des Medien Players eingeben',
                changesAreOnlyPossibleIfControllerIsReachable:'Änderungen an anderen Medien Playern sind nur möglich, wenn der Controller erreichbar ist.',

                checkConnDownloadAppInformation: '\n\nLade Informationen der anderen Medien Player herunter... ',
                checkConnControllerConnected: '\n\nController neu verbunden, synchronisiere...',
                checkConnTo: 'Überprüfe Verbindung zu: ',
                checkConnToRegister: '\n Registriere... ',
                checkConnToRegisterSuccess: 'OK. Medien Player gesperrt.',
                checkConnToRegisterFail: 'Fehlgeschlagen!',
                checkConnPingPC: '\nMedien Player wird angepingt... ',
                checkConnCheckTcp: '\nBaue Verbindung zum Medien Player auf... ',
                checkConnWsPing: '\nSende Test-Kommando zum Medien Player... ',
                checkConnRegistration: '\nÜberprüfe ob Registrierung möglich ist... ',
                checkConnStepOK: 'OK',
                checkConnStepFail: 'Fehlgeschlagen!',
            },

            folder: {
                addContentTitle: 'Content hinzufügen',
                addFolderTitle: 'Ordner hinzufügen',
                renameContentTitle: 'Content umbenennen',
                renameFolderTitle: 'Ordner umbenennen',

                placeholderContentName: 'Name des Contents eingeben',
                placeholderFolderName: 'Name des Ordners eingeben',
                placeholderNewContentName: 'Neuen Namen des Contents eingeben',
                placeholderNewFolderName: 'Neuen Namen des Ordners eingeben',

                optionCut: 'Ausschneiden',
                lightIntensityLabel: 'Licht-Intensität: ',
                lightIntensity: {
                    low: 'Niedrig',
                    medium: 'Mittel',
                    high: 'Hoch'
                },

                addBtnContent: 'Content hinzufügen',
                addBtnFolder: 'Ordner hinzufügen',
                pasteBtnContent: 'Content einfügen',
                pasteBtnFolder: 'Ordner einfügen',

                searchResultsWithColon: 'Suchergebnisse: ',
                searchResultsInFolder: 'Suchergebnisse im Ordner "{name}": '
            },

            content:{
                addMedia: 'Medium hinzufügen',
                deleteMedia: 'Medium löschen',
                openFile: 'Öffne Datei: ',
                loadingFile: '\nDatei wird geladen...',
                cachingFile: '\nDatei wird zwischengespeichert...'
            },

            //exit to media-station
            closeConnectionToMediaPlayers: 'Offene Verbindungen zu Medien Playern werden geschlossen...',
            reallyCloseMediastation: 'Die Medienstation verlassen und freigeben?',
            exitToMediaStation: 'Medienstation wird freigegeben...\n',

            //buttons / drop-down buttons
            btnEndAndFree: 'Beenden & Freigeben',
            changeIpAddress: 'IP-Adresse ändern',
            btnSync: 'Synchronisieren',
            btnAbort: 'Abbrechen',
            btnSave: 'Speichern',
            btnRename: 'Umbenennen',
            btnNo: 'Nein',
            btnYes: 'Ja',
            btnDelete: 'Löschen',
            btnContinue: 'Fortfahren',
            btnContinue2: 'Weiter',

            defaultTextSearch: 'Suchen',

            mediaStationTimeOutPartOne: 'Länger als ',
            mediaStationTimeOutPartTwo: ' Minuten keine Eingabe, Medienstation wird beendet und freigegeben.',
        }
    }
})