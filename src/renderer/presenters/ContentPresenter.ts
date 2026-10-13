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

export interface IVideoPropsPresenter{
    mediaStationId: number
    contentId: number
    mediaPlayerId: number
    duration: number
    fileType: string
    fileInstance: File
    fileName: string
    subtitles: ISubtitlePresenter[]
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
     * @param {IVideoPropsPresenter} videoProps
     * @returns {Promise<SubtitleState>}
     */
    async addVideo(videoProps:IVideoPropsPresenter): Promise<SubtitleState> {
        let extension: VideoFileExtension;
        let subsForMusea: Subtitle[] = [];
        let wrongSubs:ISubtitlePresenter[] = [];

        if (videoProps.fileType === "video/mp4")
            extension = FileExtension.VIDEO.MP4;
        else
            throw new Error("Wrong file-type: " + videoProps.fileType)

        videoProps.subtitles.forEach((sub) => {
            try {
                const subTitle:Subtitle = {iso6392T:iso6392T(sub.lang), title:sub.title};
                subsForMusea.push(subTitle);
            } catch (e) {
                wrongSubs.push(sub);
            }
        });

        await this._modelMain.museaClient.mediaService.addVideoAndCacheIt(videoProps.mediaStationId, videoProps.contentId, videoProps.mediaPlayerId,
            videoProps.duration, extension, videoProps.fileInstance, videoProps.fileName, {subtitles:subsForMusea});
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(videoProps.mediaStationId);

        if(wrongSubs.length > 0)
            return {state: "wrong-lang-format", subs: wrongSubs};

        return {state: "ok"};
    }

    /**
     * check if the passed subtitles are in the correct format for musea-client (lang-attribute must be in ISO6392-T format)
     *
     * @param {ISubtitlePresenter[]} subtitles
     * @returns {SubtitleState}
     */
    checkSubs(subtitles: ISubtitlePresenter[]): SubtitleState{
        let subsForMusea: Subtitle[] = [];
        let wrongSubs:ISubtitlePresenter[] = [];

        subtitles.forEach((sub) => {
            try {
                const subTitle:Subtitle = {iso6392T:iso6392T(sub.lang), title:sub.title};
                subsForMusea.push(subTitle);
            } catch (e) {
                wrongSubs.push(sub);
            }
        });

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