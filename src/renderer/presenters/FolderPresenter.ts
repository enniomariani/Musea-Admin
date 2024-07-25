import {ClipboardHandler, ClipboardItemTypes, IClipboardEntry} from "renderer/presenters/handlers/ClipboardHandler.js";
import {IMediaPlayerData, MediaType} from "musea-client/renderer";
import {ModelMain} from "renderer/models/ModelMain.js";

export interface IContentMediaInfo{
    id:number
    mediaPlayerName:string
    savedMedia:string|null
    fileName:string|null
}

export interface ICompleteContentInfo{
    name:string
    lightIntensity:number
    media:IContentMediaInfo[];
}

export class FolderPresenter {
    private _modelMain: ModelMain;
    private _clipBoardHandler:ClipboardHandler;

    constructor(modelMain: ModelMain, clipBoardController:ClipboardHandler) {
        this._modelMain = modelMain;
        this._clipBoardHandler = clipBoardController;
    }

    createFolder(mediaStationId:number, parentFolderId:number, name:string):number{
        let id:number = this._modelMain.museaClient.folderService.createFolder(mediaStationId, parentFolderId, name);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
        return id;
    }

    getNameOfFolder(mediaStationId:number, folderId:number):string{
        return this._modelMain.museaClient.folderService.getName(mediaStationId, folderId);
    }

    renameFolder(mediaStationId:number, folderId:number, newName:string):void{
        this._modelMain.museaClient.folderService.changeName(mediaStationId, folderId,newName);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    getIdOfParentFolder(mediaStationId:number, folderId:number):number{
        return this._modelMain.museaClient.folderService.getIdOfParentFolder(mediaStationId, folderId);
    }

    getFolderIdOfContent(mediaStationId:number, contentId:number):number{
        return this._modelMain.museaClient.contentService.getFolderId(mediaStationId, contentId);
    }

    handleCutFolder(folderId: number):void {
        this._clipBoardHandler.cut(folderId, ClipboardItemTypes.Folder);
    }

    handleCutContent(contentId: number):void {
        this._clipBoardHandler.cut(contentId, ClipboardItemTypes.Content);
    }

    isContentInClipboard(id:number):boolean{
        return this._clipBoardHandler.isContentInClipboard(id);
    }

    isFolderInClipboard(id:number):boolean{
        return this._clipBoardHandler.isFolderInClipboard(id);
    }

    handlePaste(mediaStationId:number, targetFolderId: number):void {
        const cutItem:IClipboardEntry|null = this._clipBoardHandler.getCutItem();

        if (!cutItem)
            return;

        if(cutItem.type === ClipboardItemTypes.Folder)
            this._modelMain.museaClient.folderService.changeParentFolder(mediaStationId, cutItem.id, targetFolderId);
        else if(cutItem.type === ClipboardItemTypes.Content)
            this._modelMain.museaClient.contentService.changeFolder(mediaStationId, cutItem.id, targetFolderId);

        this._clipBoardHandler.clear();
    }

    handleClearClipboard():void{
        this._clipBoardHandler.clear();
    }

    findContentsContainingString(mediaStationId:number, folderId:number, namePart:string):Map<number, ICompleteContentInfo>{
        let allContents:Map<number, string> = this._modelMain.museaClient.folderService.findContentsByNamePart(mediaStationId, folderId, namePart);

        return this._convertContentsToViewFriendlyFormat(mediaStationId, allContents);
    }

    createContent(mediaStationId:number, folderId:number, name:string):number{
        let id:number = this._modelMain.museaClient.contentService.createContent(mediaStationId, folderId, name);

        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);

        return id;
    }

    async deleteContent(mediaStationId:number, folderId:number, contentId:number):Promise<void>{
        await this._modelMain.museaClient.contentService.deleteContent(mediaStationId, folderId, contentId);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    async deleteFolder(mediaStationId:number, folderId:number):Promise<void>{
        await this._modelMain.museaClient.folderService.deleteFolder(mediaStationId, folderId);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    renameContent(mediaStationId:number, contentId:number, newName:string):void{
        this._modelMain.museaClient.contentService.changeName(mediaStationId, contentId,newName);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    changeLightIntensityForContent(mediaStationId:number, contentId:number, newIntensity:number):void{
        this._modelMain.museaClient.contentService.changeLightIntensity(mediaStationId, contentId,newIntensity);
        this._modelMain.museaClient.mediaStationService.cacheMediaStation(mediaStationId);
    }

    getAllContentsInFolder(mediaStationId: number, folderId: number): Map<number, ICompleteContentInfo> {
        let allContents:Map<number, string> = this._modelMain.museaClient.folderService.getAllContentsInFolder(mediaStationId, folderId);

        return this._convertContentsToViewFriendlyFormat(mediaStationId, allContents);
    }

    getAllSubFoldersInFolder(mediaStationId: number, parentFolderId: number): Map<number, string> {
        return this._modelMain.museaClient.folderService.getAllSubFoldersInFolder(mediaStationId, parentFolderId);
    }

    private _convertContentsToViewFriendlyFormat(mediaStationId:number, contents:Map<number, string>):Map<number, ICompleteContentInfo>{
        let allMediaPlayers: Map<number, IMediaPlayerData> = this._modelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers(mediaStationId);
        let map:Map<number, ICompleteContentInfo> = new Map();

        contents.forEach((name:string, contentId:number)=>{
            const allMedia:IContentMediaInfo[] = [];

            allMediaPlayers.forEach((data:IMediaPlayerData, mediaPlayerId:number)=>{
                allMedia.push({id: mediaPlayerId, mediaPlayerName: data.name, fileName: this._modelMain.museaClient.mediaService.getFileName(mediaStationId,contentId, mediaPlayerId ),
                    savedMedia: this._convertMediaTypeForView(this._modelMain.museaClient.mediaService.getMediaType(mediaStationId,contentId, mediaPlayerId ))});
            });

            map.set(contentId, {name: name, media: allMedia, lightIntensity: this._modelMain.museaClient.contentService.getLightIntensity(mediaStationId, contentId)});
        });

        return map;
    }

    private _convertMediaTypeForView(type:string | null):string|null{
        switch(type){
            case    MediaType.IMAGE:
                return "image";
            case MediaType.VIDEO:
                return "video";
            default:
                return null;
        }
    }
}