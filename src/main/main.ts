
import {app, BrowserWindow, ipcMain} from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join} from 'path';

import {CreateWindow} from "main/CreateWindow.js";
import {GlobalSettingsFactory} from "main/globalSettings/GlobalSettingsFactory.js";
import {InitSettings} from "main/globalSettings/InitSettings.js";
import {MuseaClientMain} from "musea-client/main";
import {LoadJSON} from "./LoadJSON.js";

/**
 * the main.ts is loaded by electron and has access to file-system, etc.
 * if a BrowserWindow is created, HTML and js can be loaded in the window (for example the renderer.ts)
 *
 */

//size of main-window
const windowWidth:number = 1920;
const windowHeight:number = 1080;

const filename:string = fileURLToPath(import.meta.url);
const _rootDirName:string = dirname(filename);

//the NODE_ENV-variable is set before starting the app to "development", if the app is running on
//the development-system
const environment:string | undefined = process.env.NODE_ENV;

let allSettingsByName:any;

let initSettings:InitSettings = new InitSettings();

let mainWindow:BrowserWindow;
let museaClientMain:MuseaClientMain;

app.whenReady().then(async () => {
    //this is necessary because the path to the data-folder is in public_html/daten in the dev-environment but
    //in the resources-folder in the production-environment. If in the production-env nothing is specified as path, it looks in the asar-package
    const pathToDataFolder:string = environment === 'development' ? join(_rootDirName, '..', 'daten\\') :
        join(process.resourcesPath, '\\daten\\');

    allSettingsByName = initSettings.init(pathToDataFolder);

    ipcMain.handle('app:load-theme', (event, args) => {
        let loadJSON: LoadJSON = new LoadJSON();
        return loadJSON.loadJSONSync(join(pathToDataFolder, 'theme', 'theme.json'));
    });

    ipcMain.handle('app:get-resource-path', (event:Electron.IpcMainInvokeEvent, relativePath: string) => {
        console.log("get res-path: ", process.resourcesPath, pathToDataFolder, relativePath)
        return join(join(pathToDataFolder, ".."), relativePath);
    });

    const createWindow:CreateWindow = new CreateWindow(windowWidth, windowHeight,allSettingsByName[GlobalSettingsFactory.IS_FULLSCREEN],
        join(_rootDirName, 'preload.js'));
    console.log("Main: load settings-file...");


    console.log("Main: create window...");
    mainWindow = await createWindow.init(!allSettingsByName[GlobalSettingsFactory.MOUSE_ENABLED],
        join(_rootDirName, '..','index.html'),environment === 'development');

    console.log("MAIN WINDOW: ", mainWindow)

    museaClientMain = new MuseaClientMain(pathToDataFolder);
    museaClientMain.init();

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            createWindow.close();
            app.quit();
        }
    });

    console.log("Main: start-process finished.");
});