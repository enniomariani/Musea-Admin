import {beforeEach, describe, expect, it} from "@jest/globals";
import {IViewMediaPlayer, MediaPlayerPresenter} from "renderer/presenters/MediaPlayerPresenter.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";
import {IMediaPlayerData, MediaPlayerConnectionStatus} from "musea-client/renderer";

let presenter:MediaPlayerPresenter;
let mockModelMain:MockModelMain;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new MediaPlayerPresenter(mockModelMain);
});

describe("createMediaPlayer() ", ()=>{
    const name:string ="mediaPlayerName";
    const ip:string ="127.0.0.1";
    const mediaStationId:number = 1;

    it("should call museaClient.createMediaPlayer with the parameter passed", async ()=>{

        await presenter.createMediaPlayer(mediaStationId, name, ip);
        expect(mockModelMain.museaClient.mediaPlayerDataService.createMediaPlayer).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaPlayerDataService.createMediaPlayer).toHaveBeenCalledWith(mediaStationId, name, ip);
    });

    it("should return the number it got from the museaClient", async ()=>{
        let answer:number;
        mockModelMain.museaClient.mediaPlayerDataService.createMediaPlayer.mockReturnValueOnce(10);

        answer = await presenter.createMediaPlayer(mediaStationId, name, ip);
        expect(answer).toBe(10);
    });

    it("should call museaClient.cacheMediaStation with the correct parameter", async ()=>{

        await presenter.createMediaPlayer(mediaStationId, name, ip);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("renameMediaPlayer() ", ()=>{
    const mediaStationId:number = 1;

    it("should call museaClient.changeName for the mediaPlayer", ()=>{
        presenter.renameMediaPlayer(mediaStationId, 2, "newname");
        expect(mockModelMain.museaClient.mediaPlayerDataService.changeName).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaPlayerDataService.changeName).toHaveBeenCalledWith(mediaStationId, 2, "newname");
    });

    it("should call museaClient.cacheMediaStation with the correct parameter", ()=>{
        presenter.renameMediaPlayer(mediaStationId, 1, "newName");
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("changeIpOfMediaPlayer() ", ()=>{
    const mediaStationId:number = 1;

    it("should call museaClient.changeIp for the mediaPlayer", async ()=>{
        await presenter.changeIpOfMediaPlayer(mediaStationId, 1, "newIp", true, false);
        expect(mockModelMain.museaClient.mediaPlayerDataService.changeIp).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaPlayerDataService.changeIp).toHaveBeenCalledWith(mediaStationId, 1, "newIp");
    });

    it("should call museaClient.cacheMediaStation with the correct parameter, if contentsDownloadedInThisSession is true and lastSyncSuccesful false and media-player-id 0", async ()=>{
        await presenter.changeIpOfMediaPlayer(mediaStationId, 0, "newIp", false, true);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });

    it("should call museaClient.cacheMediaStation, if contentsDownloadedInThisSession is false and contentsDownloaded is false", async ()=>{
        await presenter.changeIpOfMediaPlayer(mediaStationId, 0, "newIp", false, false);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });

    it("should not call museaClient.cacheMediaStation, if lastsyncsuccesful and contentsDownloaded are true", async ()=>{
        await presenter.changeIpOfMediaPlayer(mediaStationId, 0, "newIp", true, true);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });

    it("should not call museaClient.cacheMediaStation, if mediapp-id is higher than 0", async ()=>{
        await presenter.changeIpOfMediaPlayer(mediaStationId, 3, "newIp", false, true);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(0);
    });
});

describe("checkConnection() ", ()=>{
    it("should call museaClient.checkConnection with the parameter passed", async ()=>{
        const onProgress = jest.fn();
        mockModelMain.museaClient.mediaPlayerConnectionService.checkConnection.mockResolvedValueOnce(MediaPlayerConnectionStatus.Online);

        const result:string = await presenter.checkConnection("test-ip", onProgress);

        expect(mockModelMain.museaClient.mediaPlayerConnectionService.checkConnection).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.checkConnection).toHaveBeenCalledWith("test-ip", {role:"admin", onProgress:onProgress});
        expect(result).toBe(MediaPlayerConnectionStatus.Online);
    });
});

describe("getAllMediaPlayers() ", ()=>{
    it("should call museaClient.getAllMediaPlayers with the parameter passed", ()=>{
        let returnedMediaPlayers:Map<number, IMediaPlayerData> = new Map();
        returnedMediaPlayers.set(0, {ip:"0.0.0.1", name: "test", isController: false});
        returnedMediaPlayers.set(1, {ip:"0.0.0.2", name: "test2", isController: true});
        const expectedResult:IViewMediaPlayer[] = [
            {id: 0, ip:"0.0.0.1", title: "test", isController: false},
            {id: 1, ip:"0.0.0.2", title: "test2", isController: true},
        ];
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValueOnce(returnedMediaPlayers);

        const result:IViewMediaPlayer[] = presenter.getAllMediaPlayers(0);

        expect(result).toEqual(expectedResult);
    });
});

describe("connectAndRegisterMediaPlayer() ", ()=>{
    const mediaPlayerId:number = 2;
    const mediaStationId:number = 1;

    it("should call museaClient.connectAndRegisterToMediaPlayer with the parameter passed", async ()=>{
        await presenter.connectAndRegisterMediaPlayer(mediaStationId, mediaPlayerId);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledWith(mediaStationId, mediaPlayerId);
    });

    it("should return true if it got true from the museaClient",async ()=>{
        let answer:boolean;
        mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer.mockReturnValueOnce(new Promise(resolve => resolve(true)));

        answer = await presenter.connectAndRegisterMediaPlayer(mediaStationId, mediaPlayerId);
        expect(answer).toBe(true);
    });
});