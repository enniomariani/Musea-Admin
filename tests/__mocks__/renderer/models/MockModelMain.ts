import {ModelMain} from "renderer/models/ModelMain.js";
import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MockMuseaClient} from "musea-client/mocks";

export class MockModelMain extends ModelMain {

    loadSettings: jest.Mock;
    initFrameWork: jest.Mock;

    private _mockMuseaClient: MockMuseaClient = new MockMuseaClient();

    constructor() {
        const mockBackend = {} as IBackend;

        super(
            new CreateGlobalSettings(new GlobalSettings(), mockBackend),
            new GlobalSettings(),
            mockBackend
        );

        // Override methods with jest mocks
        this.loadSettings = jest.fn();
        this.initFrameWork = jest.fn();
    }

    override get museaClient(): MockMuseaClient {
        return this._mockMuseaClient;
    }
}