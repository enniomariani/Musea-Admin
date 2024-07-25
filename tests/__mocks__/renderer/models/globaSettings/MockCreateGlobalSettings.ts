import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings";

export class MockCreateGlobalSettings extends CreateGlobalSettings {

    create: jest.Mock;

    constructor() {
        const mockBackend = {} as IBackend;

        super(new GlobalSettings(), mockBackend);

        this.create = jest.fn();
    }
}