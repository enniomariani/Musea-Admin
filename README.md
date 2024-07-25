# Musea-Admin
Die Administrations-Software von [Musea](https://github.com/enniomariani/musea).

## Schnellstart
1. [Programm herunterladen](https://github.com/enniomariani/Musea-Admin/releases)
1. Programm starten

## Einstellungen
Die Einstellungen werden in der Datei `daten/settings.txt` im JSON-Format gespeichert.

| Einstellung | Typ | Standardwert | Beschreibung                                                                                                                                     |
|-------------|-----|--------------|--------------------------------------------------------------------------------------------------------------------------------------------------|
| `Mauszeiger` | Boolean | `false`| Zeigt oder verbirgt den Mauszeiger in der Anwendung                                                                                              |
| `Vollbild` | Boolean | `true`| Startet die Anwendung im Vollbildmodus                                                                                                           |

Wenn die JSON-Datei fehlerhaft ist, werden die Standardwerte verwendet.

## Update
**Vor dem Update**
- Überprüfen ob die letzte Synchronisation erfolgreich war -> falls nicht, **synchronisieren vor dem Update!**
- Proramm schliessen
- Folgende Dateien/Ordner im Ordner ``alter-Programm-Ordner/resources/daten`` sichern (z.B. auf den Desktop kopieren)
  - Datei ``settings.txt``
  - Datei ``savedMediaStations.json``
  - Falls vorhanden: Ordner ``theme``
 
**Update**
- Neues Programm herunterladen
- Altes Programm löschen

**Nach dem Update**
- Alle gesicherten Dateien und Ordner in den Ordner ``resources/daten`` des neuen Programms kopieren (existierende Dateien überschreiben)
- Neues Programm öffnen

## Theme
- Farben, Fonts und ein optionales Logo oben links können über ein Theme definiert werden
- Wenn kein Theme vorhanden ist, wird das Default-Theme ohne Logo verwendet
- Um ein eigenes Theme zu erstellen:
   - Ordner ``theme-default`` kopieren
   - CSS und Fonts anpassen, evtl. Logo in den theme-Ordner kopieren
   - neuen theme-Ordner in theme umbenennen und in den Ordner ``resources/daten`` kopieren  

## Lizenz

Dieses Projekt steht unter der [GNU General Public License v3.0](LICENSE).

Das bedeutet: Der Code darf genutzt, verändert und weitergegeben werden, aber abgeleitete Werke müssen ebenfalls unter GPL-3.0 veröffentlicht werden.
