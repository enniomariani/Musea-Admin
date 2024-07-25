import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {ModelMain} from "renderer/models/ModelMain.js";
import {MockCreateGlobalSettings} from "__mocks__/renderer/models/globaSettings/MockCreateGlobalSettings";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings";

const mockBackend: jest.Mocked<IBackend> = {
    loadSettings: jest.fn()
};

let globalSettings:GlobalSettings;
let mockCreateGlobalSettings: MockCreateGlobalSettings;
let modelMain:ModelMain;

beforeEach(() => {
    globalSettings = new GlobalSettings();
    mockCreateGlobalSettings = new MockCreateGlobalSettings();
    modelMain = new ModelMain(mockCreateGlobalSettings, globalSettings, mockBackend)
});

describe("method loadSettings() ", () =>{
    it("should call createGlobalSettings.create() of ", async() =>{
        mockCreateGlobalSettings.create.mockResolvedValue(globalSettings);
        globalSettings.errorsInJSON = "";
        await modelMain.loadSettings();
        expect(mockCreateGlobalSettings.create).toHaveBeenCalledTimes(1);
    });

    it("should print an error if the property globalSettings.errorsInJSON returned from createGlobalSettings.create is not null", async() =>{
        globalSettings.errorsInJSON = "ERROR";
        mockCreateGlobalSettings.create.mockResolvedValue(globalSettings);

        let logSpy = jest.spyOn(global.console, 'error');

        await modelMain.loadSettings();
        expect(logSpy).toHaveBeenCalledTimes(1);
    });
});