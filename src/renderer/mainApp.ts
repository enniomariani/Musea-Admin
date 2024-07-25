import {ModelMain} from "renderer/models/ModelMain.js";
import {CreateGlobalSettings} from "renderer/models/globalSettings/CreateGlobalSettings.js";
import {GlobalSettings} from "renderer/models/globalSettings/GlobalSettings.js";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {MediaPlayerPresenter} from "renderer/presenters/MediaPlayerPresenter.js";
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {ContentPresenter} from "renderer/presenters/ContentPresenter.js";
import {InputTimeoutHandler} from "renderer/presenters/handlers/InputTimeoutHandler.js";
import {ClipboardHandler} from "renderer/presenters/handlers/ClipboardHandler.js";

import {App, createApp} from "vue";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import AppRoot from "renderer/views/AppRoot.vue";
import {i18n} from "renderer/views/Texts.js";
import {loadTheme} from "renderer/Theme.js";

import { version } from '../../package.json';

export class MainApp {
    static INPUT_TIMEOUT_SEC:number = 60 * 60;

    private _modelMain:ModelMain;

    private _mediaStationPresenter:MediaStationPresenter;
    private _inactivityPresenter:InactivityPresenter;
    private _mediaPlayerPresenter:MediaPlayerPresenter;
    private _folderPresenter:FolderPresenter;
    private _contentPresenter:ContentPresenter;

    private _inputTimeoutHandler:InputTimeoutHandler;

    private _vueApp: App;

    constructor() {
        this._modelMain = new ModelMain(new CreateGlobalSettings(new GlobalSettings(),window.backend), new GlobalSettings(), window.backend)
        this._inputTimeoutHandler = new InputTimeoutHandler();

        this._inactivityPresenter = new InactivityPresenter(this._inputTimeoutHandler);
        this._mediaStationPresenter = new MediaStationPresenter(this._modelMain);
        this._mediaPlayerPresenter = new MediaPlayerPresenter(this._modelMain);
        this._folderPresenter = new FolderPresenter(this._modelMain, new ClipboardHandler());
        this._contentPresenter = new ContentPresenter(this._modelMain);

        this._vueApp = createApp(AppRoot, {
            mediaStationPresenter: this._mediaStationPresenter,
            folderPresenter: this._folderPresenter,
            mediaPlayerPresenter: this._mediaPlayerPresenter,
            contentPresenter: this._contentPresenter,
            inactivityPresenter: this._inactivityPresenter,

            version: version,
            inputTimeoutSec: MainApp.INPUT_TIMEOUT_SEC
        });
    }

    async start(){
        await loadTheme();

        await this._modelMain.loadSettings();
        await this._modelMain.initFrameWork();

        this._vueApp.use(i18n).mount(document.body);
    }
}