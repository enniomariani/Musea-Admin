import {IContentMediaInfo} from "renderer/presenters/FolderPresenter.js";
import {ModelMain} from "renderer/models/ModelMain.js";
import {
    FileExtension,
    ImageFileExtension,
    IMediaPlayerData, iso6392T,
    MediaType, Subtitle,
    VideoFileExtension
} from 'musea-client/renderer';

export interface ISubtitlePresenter {
    lang: string
    title: string
}

export type SubtitleState  =
| { state: "ok" }
| { state: "wrong-lang-format", subs:ISubtitlePresenter[]};

export class ContentPresenter {
    private _modelMain: ModelMain;

    constructor(modelMain: ModelMain) {
        this._modelMain = modelMain;
    }

    getName(mediaStationId: number, contentId: number): string {
        return this._modelMain.museaClient.contentService.getName(mediaStationId, contentId);
    }

    /**
     * add Video to musea-backend
     *
     * Check if passed subtitles are conform to ISO6392T - if not Video is saved anyway but without the wrongly formatted subtitles
     *
     * @param {number} mediaStationId
     * @param {number} contentId
     * @param {number} mediaPlayerId
     * @param {number} duration
     * @param {string} fileType
     * @param {File} fileInstance
     * @param {string} fileName
     * @param {ISubtitlePresenter[]} subtitles
     * @returns {Promise<SubtitleState>}
     */
    async addVideo(mediaStationId: number, contentId: number, mediaPlayerId: number, duration: number, fileType: string, fileInstance: File, fileName: string, subtitles: ISubtitlePresenter[]): Promise<SubtitleState> {
        let extension: VideoFileExtension;
        let subsForMusea: Subtitle[] = [];
        let wrongSubs:ISubtitlePresenter[] = [];

        if (fileType === "video/mp4")
            extension = FileExtension.VIDEO.MP4;
        else
            throw new Error("Wrong file-type: " + fileType)

        subtitles.forEach((sub) => {
            try {
                const subTitle:Subtitle = {iso6392T:iso6392T(sub.lang), title:sub.title};
                subsForMusea.push(subTitle);
            } catch (e) {
                wrongSubs.push(sub);
            }
        });

        await this._modelMain.museaClient.mediaService.addVideoAndCacheIt(mediaStationId, contentId, mediaPlayerId, duration, extension, fileInstance, fileName, {subtitles:subsForMusea});
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);

        if(wrongSubs.length > 0)
            return {state: "wrong-lang-format", subs: wrongSubs};

        return {state: "ok"};
    }

    async addImage(mediaStationId: number, contentId: number, mediaPlayerId: number, fileType: string, fileInstance: File, fileName: string): Promise<void> {
        let extension: ImageFileExtension;

        if (fileType === "image/jpeg")
            extension = FileExtension.IMAGE.JPEG;
        else if (fileType === "image/png")
            extension = FileExtension.IMAGE.PNG;
        else
            throw new Error("Wrong file-type: " + fileType)

        await this._modelMain.museaClient.mediaService.addImageAndCacheIt(mediaStationId, contentId, mediaPlayerId, extension, fileInstance, fileName);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    async removeMedia(mediaStationId: number, contentId: number, mediaPlayerId: number): Promise<void> {
        await this._modelMain.museaClient.mediaService.deleteMedia(mediaStationId, contentId, mediaPlayerId);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    getAllMediaForContent(mediaStationId: number, contentId: number): Map<number, IContentMediaInfo> {
        let allMediaPlayers: Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);
        let map: Map<number, IContentMediaInfo> = new Map();

        allMediaPlayers.forEach((data: IMediaPlayerData, mediaPlayerId: number) => {
            map.set(mediaPlayerId, {
                id: mediaPlayerId, mediaPlayerName: data.name,
                savedMedia: this._convertMediaTypeForView(this._modelMain.museaClient.mediaService.getMediaType(mediaStationId, contentId, mediaPlayerId)),
                fileName: this._modelMain.museaClient.mediaService.getFileName(mediaStationId, contentId, mediaPlayerId)
            });
        });

        return map;
    }

    private _convertMediaTypeForView(type: string | null): string | null {
        switch (type) {
            case    MediaType.IMAGE:
                return "image";
            case MediaType.VIDEO:
                return "video";
            default:
                return null;
        }
    }
}