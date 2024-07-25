import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {IMuseaClient, MuseaClient} from "musea-client/renderer";

export class ModelMain extends EventTarget {
    private _globalSettings:GlobalSettings;
    private _backend:IBackend;
    private _createGlobalSettings:CreateGlobalSettings;
    private _museaClient!:IMuseaClient;

    constructor(createGlobalSettings:CreateGlobalSettings, globalSettings:GlobalSettings, backend:IBackend) {
        super();
        this._backend = backend;
        this._globalSettings = globalSettings;
        this._createGlobalSettings = createGlobalSettings;
    }

    async loadSettings(){
        this._globalSettings = await this._createGlobalSettings.create();

        if(this._globalSettings.errorsInJSON === "")
            console.log("settings.txt loaded successfully - no errors in the settings.txt-file: ", this._globalSettings);
        else
            console.error("Errors in the settings.txt, use default-settings, where there was an error: ", this._globalSettings);
    }

    async initFrameWork(){
        this._museaClient = new MuseaClient(this._globalSettings.pathToDataFolder);
    }

    get museaClient(): IMuseaClient {
        if (!this._museaClient) {
            throw new Error('MediaClientFramework not initialized. Call initFrameWork() first.');
        }
        return this._museaClient;
    }
}