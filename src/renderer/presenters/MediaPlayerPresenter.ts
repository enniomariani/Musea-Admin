import {ModelMain} from "renderer/models/ModelMain.js";
import {IConnectionProgress, IMediaPlayerData, MediaPlayerConnectionStatus} from "musea-client/renderer";

export interface IViewMediaPlayer {
    id:number,
    ip:string,
    title:string,
    isController:boolean
}

export class MediaPlayerPresenter {
    private _modelMain:ModelMain;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    getAllMediaPlayers(mediaStationId:number):IViewMediaPlayer[]{
        const loadedData:Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);
        const mediaPlayers: IViewMediaPlayer[] = [];

        for(let [key, player] of loadedData)
            mediaPlayers.push({id: key, ip: player.ip, title: player.name, isController: player.isController});

        return mediaPlayers;
    }

    async connectAndRegisterMediaPlayer(mediaStationId:number,mediaPlayerId:number):Promise<boolean>{
        return this._modelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(mediaStationId, mediaPlayerId);
    }

    async createMediaPlayer(mediaStationId:number, name:string, ip:string):Promise<number>{
        let id:number = await this._modelMain.museaClient.mediaPlayerDataService.createMediaPlayer(mediaStationId, name, ip);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
        return id;
    }

    renameMediaPlayer(mediaStationId:number, mediaPlayerId:number, newName:string):void{
        this._modelMain.museaClient.mediaPlayerDataService.changeName(mediaStationId, mediaPlayerId, newName);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    async changeIpOfMediaPlayer(mediaStationId:number, mediaPlayerId:number, newIp:string, lastSyncSuccesful:boolean, contentsDownloadedInThisSession:boolean):Promise<void>{
        await this._modelMain.museaClient.mediaPlayerDataService.changeIp(mediaStationId, mediaPlayerId, newIp);

        if(mediaPlayerId === 0){
            //only cache the mediastation if the last sync was not succesful OR the contents were downloaded in the actual session.
            //
            // This means:
            // if there is a locally cached version of the mediastation, the change can be made, regardless if the controller
            // is reachable or not, because the most actual version of the contents is local.
            // If the last sync was succesful, this means, that the most actual version of the contents is on the controller
            // if the mediastation would be cached in this case (after restarting the app), there would be a completely empty
            // contents-file on the musea admin-app and this would be sent to the controller on the next sync (overriding everything there)
            const cacheMediaStation: boolean = !lastSyncSuccesful || contentsDownloadedInThisSession;

            if(cacheMediaStation)
                this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
        }
    }

    async checkConnection(ip:string, onProgress:(p: IConnectionProgress) => void):Promise<MediaPlayerConnectionStatus>{
        return this._modelMain.museaClient.mediaPlayerConnectionService.checkConnection(ip, {role:"admin", onProgress:onProgress});
    }
}