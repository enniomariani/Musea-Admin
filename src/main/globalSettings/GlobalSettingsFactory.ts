import {GlobalSetting} from "main/globalSettings/GlobalSetting.js";


export class GlobalSettingsFactory{

    //names of global settings
    static IS_FULLSCREEN:string = "isFullScreen";
    static MOUSE_ENABLED:string = "mouseEnabled";

    constructor() {}

    /**
     * creates an array of GlobalSetting-objects
     * @returns {GlobalSetting[]}
     */
    static getGlobalSettings(){
        let settings = [];
        settings.push(new GlobalSetting("Vollbild", GlobalSettingsFactory.IS_FULLSCREEN, GlobalSetting.TYPE_BOOLEAN, true));
        settings.push(new GlobalSetting("Mauszeiger", GlobalSettingsFactory.MOUSE_ENABLED, GlobalSetting.TYPE_BOOLEAN, false));

        return settings
    }
}