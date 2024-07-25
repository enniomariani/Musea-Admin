import {rmSync, existsSync} from "fs";
import {WebSocketServer} from 'ws';

import {fileURLToPath} from "url";
import {dirname, join} from "path";
import {addMediaStation, exitMediaStation, openMediaPlayerAdmin, restartApp} from "./HelperMediaStationScreen.js";
import {addMediaPlayer} from "./HelperMediaPlayerScreen.js";
import {ConvertNetworkData} from "musea-client/renderer";

let wss: WebSocketServer | null = null;

let temporarySavedContentsJSON: string = "{}";

const filename: string = fileURLToPath(import.meta.url);
const dirNameTests: string = dirname(filename);
const dirNameData: string = join(dirNameTests, "..", "..", "out", "Musea-Admin-win32-x64", "resources", "daten");
const savedMediaStationFilePath: string = join(dirNameData, "savedMediaStations.json");
const savedTempDirMS0: string = join(dirNameData, "0");

export let receivedCommandHistory: (string | Uint8Array)[][] = [];
export let wssExpectedCommands: Map<string, (string | Uint8Array)[]> = new Map();

export function resetCommandHistory(): void {
    receivedCommandHistory = [];
}

export function expectReceivedDeleteMediaCommands(amount: number): void {
    const foundDeleteMediaCommands: number = receivedCommandHistory.filter((command: string[]) => command[0] === "media" && command[1] === "delete").length;
    expect(foundDeleteMediaCommands).toEqual(amount);
}

/**
 * resets everything and sets up network-answer-calls for a working network-connection:
 * - ping returns pong
 * - registration possible returns true
 * - registration returns accepted
 *
 * adds 1 media-player with the passed ip-address
 *
 * and exits the mediastation: start-state is the mediastation-screen
 *
 */
export async function setupFunctionalMediaStationCommunication(ipController: string = "127.0.0.1"): Promise<void> {
    console.log("Test / -- Setup basic mediastation-communiction --");

    temporarySavedContentsJSON = "{}";

    wssExpectedCommands.clear();
    wssExpectedCommands.set("network,ping", ["network", "pong"])
    wssExpectedCommands.set("network,isRegistrationPossible", ["network", "isRegistrationPossible", "yes"])
    wssExpectedCommands.set("network,register,admin", ["network", "registration", "accepted"])

    await initWSS();

    removeAllSavedFiles();
    await restartApp();

    await addMediaStation("MS for e2e-tests");
    await openMediaPlayerAdmin(0);
    await addMediaPlayer("Controller", ipController);
    await exitMediaStation();

    console.log("Test / -- Setup complete --");
}

export async function initWSS(): Promise<void> {
    console.log("Init wss");

    if (wss) {
        wss.close();
        wss = null;
    }

    wss = new WebSocketServer({port: 5000, host: '127.0.0.1'});
    receivedCommandHistory = [];

    wss.on('connection', (ws) => {
        ws.on('message', (data: Buffer) => {
            const dataWithoutChunkInfo: Uint8Array = new Uint8Array(data).slice(2);       //delete the first 2 bytes, because they hold the information in how many chunks the message was sent, which is not important for the tests
            const completeCommand: (string | Uint8Array)[] = ConvertNetworkData.decodeCommand(new Uint8Array(dataWithoutChunkInfo));
            const completeCommandAsStr:string = completeCommand.toString();

            receivedCommandHistory.push(completeCommand);

            console.log("--- Server / received message: ", truncateForLog(completeCommand), " has defined answer: ", wssExpectedCommands.get(completeCommandAsStr));

            if (wssExpectedCommands.has(completeCommandAsStr)) {
                console.log("--- Server / send answer: ", wssExpectedCommands.get(completeCommandAsStr))
                //send answer to musea admin
                ws.send(ConvertNetworkData.encodeCommand(...wssExpectedCommands.get(completeCommandAsStr) as string[]));
                return;
            }

            if (completeCommand.length === 4 && completeCommand[0] === "media" && completeCommand[1] === "put") {
                console.log("--- Server / got media-command! Has expected command? ", wssExpectedCommands.has("media,put"), "send answer: ",wssExpectedCommands.get("media,put") );
                if (wssExpectedCommands.has("media,put"))
                    ws.send(ConvertNetworkData.encodeCommand(...wssExpectedCommands.get("media,put") as string[]));
            }

            //if the received command is a content-PUT-command for the contents, save the contents-json to a temporary json
            if (completeCommand.length === 3 && completeCommand[0] === "contents" && completeCommand[1] === "put") {
                temporarySavedContentsJSON = completeCommand[2].toString();
                console.log("--- Server / set contents on mock-media-player ", temporarySavedContentsJSON)
                //if the received command is a content-GET-command for the contents, send the saved contents-json
            } else if (completeCommand.length === 2 && completeCommand[0] === "contents" && completeCommand[1] === "get") {
                console.log("--- Server / send contents from mock-media-player", temporarySavedContentsJSON)
                ws.send(ConvertNetworkData.encodeCommand("contents", "put", temporarySavedContentsJSON));
            }
        });
    });
}

function truncateForLog(command: (string | Uint8Array)[]): string {
    return command.map(item => {
        if (item instanceof Uint8Array) {
            return item.length > 20 ? `...data(${item.length} bytes)...` : item.toString();
        }
        if (typeof item === 'string' && item.length > 100) {
            return `${item.substring(0, 50)}...data(${item.length} chars)...${item.substring(item.length - 20)}`;
        }
        return item;
    }).toString();
}

export function removeAllSavedFiles() {

    console.log("Test / REMOVE OLD FILES: ", savedMediaStationFilePath, existsSync(savedMediaStationFilePath))

    if (existsSync(savedMediaStationFilePath)) {
        console.log("savedMediaStation-JSON exists,  Delete: ", savedMediaStationFilePath);
        rmSync(savedMediaStationFilePath, {force: true});
    }

    if (existsSync(savedTempDirMS0)) {
        console.log("temporary saved MS exists for MS 0,  Delete: ", savedTempDirMS0);
        rmSync(savedTempDirMS0, {force: true, recursive: true});
    }
}