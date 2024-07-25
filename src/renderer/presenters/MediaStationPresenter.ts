import {ModelMain} from "renderer/models/ModelMain.js";
import {
    ContentDownloadStatus,
    IContentDownloadResult,
    IMediaPlayerData,
    ProgressReporter
} from "musea-client/renderer";

export interface IViewMediastation {
    id: number,
    title: string
}

export enum DownloadContentsStatus {
    Success = 'success',
    NoContentsOnController = 'noContentsOnController',
    NoControllerIp = 'noControllerIp',
    NoResponseFromController = 'noResponseFromController',
    Other = 'other'
}

export type DownloadContentsResult = {
    status: DownloadContentsStatus
    params?: { ip?: string; mediaStationId?: number; raw?: string }
}

export class MediaStationPresenter {
    private _modelMain: ModelMain;
    private _isSyncing:boolean = false;
    private _contentsDownloadedInThisSession: boolean = false;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    async wasLastSyncSuccessful(mediaStationId:number):Promise<boolean>{
        return !await this._modelMain.museaClient.mediaStationService.isMediaStationCached(mediaStationId);
    }

    async checkOnlineStatusOfAllMediaPlayers(mediaStationId:number):Promise<boolean>{
        return await this._modelMain.museaClient.mediaPlayerConnectionService.checkOnlineStatusOfAllMediaPlayers(mediaStationId);
    }

    async loadSavedMediaStations(): Promise<IViewMediastation[]> {
        const loadedMediaStationMetaData:Map<string, string> = await this._modelMain.museaClient.mediaStationService.loadMediaStations();
        const mediaStations: IViewMediastation[] = [];

        let stationId:number = 0;

        loadedMediaStationMetaData.forEach((controllerIp: string, stationName: string) => {
            mediaStations.push({id: stationId, title: stationName});
            stationId++;
        });

        return mediaStations;
    }

    async createMediaStation(name: string): Promise<number> {
        return await this._modelMain.museaClient.mediaStationService.createMediaStation(name);
    }

    async renameMediaStation(mediaStationId:number, newName:string):Promise<void>{
        await this._modelMain.museaClient.mediaStationService.renameMediaStation(mediaStationId, newName);
    }

    getName(mediaStationId: number): string {
        return this._modelMain.museaClient.mediaStationService.getMediaStationName(mediaStationId);
    }

    async sync(mediaStationId:number, progressReporter:ProgressReporter):Promise<boolean>{
        this._isSyncing = true;
        const syncResult:boolean = await this._modelMain.museaClient.mediaStationService.syncMediaStation(mediaStationId, progressReporter);
        this._isSyncing = false;
        return syncResult;
    }

    async connnectAndRegisterAllMediaPlayers(mediaStationId: number):Promise<void>{
        let allMediaPlayers:Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);

        for (let [key, mediaPlayerData] of allMediaPlayers)
            await this._modelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer(mediaStationId, key);
    }

    async unregisterAndCloseAllMediaPlayers(mediaStationId: number): Promise<void> {
        let allMediaPlayers: Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);

        for (let [key, mediaPlayerData] of allMediaPlayers)
            await this._modelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer(mediaStationId, key);
    }

    async downloadContents(mediaStationId: number): Promise<DownloadContentsResult> {
        let answer: IContentDownloadResult = await this._modelMain.museaClient.mediaStationService.downloadContents(mediaStationId, true);
        let ip: string | null = this._modelMain.museaClient.mediaStationService.getControllerIp(mediaStationId);
        let answerForView: DownloadContentsResult;

        if (!ip) {
            answerForView = {status: DownloadContentsStatus.NoControllerIp};
            return answerForView;
        }

        switch (answer.status) {
            case    ContentDownloadStatus.Success:
                answerForView = {status: DownloadContentsStatus.Success};
                break;
            case    ContentDownloadStatus.SuccessNoContentsOnController:
                answerForView = {status: DownloadContentsStatus.NoContentsOnController};
                break;
            case ContentDownloadStatus.FailedNoControllerIp:
                answerForView = {status: DownloadContentsStatus.NoControllerIp};
                break;
            case ContentDownloadStatus.FailedNoResponseFrom:
                answerForView = {status: DownloadContentsStatus.NoResponseFromController,
                    params: {ip: ip}};
                break;
            default:
                answerForView = {status: DownloadContentsStatus.Other,
                    params: {raw: answer.status}};
                break;
        }

        if (answerForView.status === DownloadContentsStatus.NoContentsOnController || answerForView.status === DownloadContentsStatus.Success)
            this._contentsDownloadedInThisSession = true;
        else
            this._contentsDownloadedInThisSession = false;

        return answerForView;
    }

    get isSyncing(): boolean {
        return this._isSyncing;
    }

    get contentsDownloadedInThisSession(): boolean {
        return this._contentsDownloadedInThisSession;
    }
}