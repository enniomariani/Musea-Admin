import {beforeEach, describe, expect, it, jest} from "@jest/globals";
import {
    DownloadContentsResult, DownloadContentsStatus,
    IViewMediastation,
    MediaStationPresenter
} from "renderer/presenters/MediaStationPresenter.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";
import {ContentDownloadStatus, IMediaPlayerData} from "musea-client/renderer";

let presenter:MediaStationPresenter;
let mockModelMain:MockModelMain;

const allMediaPlayers:Map<number, IMediaPlayerData> = new Map();
allMediaPlayers.set(0, {ip:"192.168.0.1", name:"media-player 1", isController: true});
allMediaPlayers.set(1, {ip:"192.168.0.2", name:"media-player 2", isController: false});

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new MediaStationPresenter(mockModelMain);
});


describe("loadSavedMediaStations() ", () => {
    it("should map loaded stations to view models with incremental ids starting at 0 and status=false", async () => {
        const map = new Map<string, string>();
        // key: stationName, value: controllerIp (insertion order preserved)
        map.set("Zweite Station", "192.168.0.2");
        map.set("Erste Station", "127.0.0.1");
        mockModelMain.museaClient.mediaStationService.loadMediaStations.mockResolvedValueOnce(map);

        const result:IViewMediastation[] = await presenter.loadSavedMediaStations();

        expect(result).toHaveLength(2);
        expect(result[0]).toStrictEqual({ id: 0, title: "Zweite Station" });
        expect(result[1]).toStrictEqual({ id: 1, title: "Erste Station" });
    });

    it("should return an empty array when no stations are saved", async () => {
        const empty = new Map<string, string>();
        mockModelMain.museaClient.mediaStationService.loadMediaStations.mockResolvedValueOnce(empty);
        const result:IViewMediastation[] = await presenter.loadSavedMediaStations();
        expect(result).toStrictEqual([]);
    });
});


describe("connnectAndRegisterAllMediaPlayers() ", ()=>{
    const mediaStationId:number = 1;

    it("should call connectAndRegisterToMediaPlayer for all media players in the mediastation",async ()=>{
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockImplementation((id:number)=>{
            if(id === mediaStationId)
                return allMediaPlayers;
            else
                return null;
        })

        await presenter.connnectAndRegisterAllMediaPlayers(mediaStationId);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledTimes(2);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledWith(1, 0);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.connectAndRegisterToMediaPlayer).toHaveBeenCalledWith(1, 1);
    });
});

describe("unregisterAndCloseAllMediaPlayers() ", ()=>{
    const mediaStationId:number = 1;
    it("should call unregisterAndCloseMediaPlayer for all media players in the mediastation",async ()=>{
        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockImplementation((id:number)=>{
            if(id === mediaStationId)
                return allMediaPlayers;
            else
                return null;
        })

        await presenter.unregisterAndCloseAllMediaPlayers(mediaStationId);

        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledTimes(2);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledWith(1, 0);
        expect(mockModelMain.museaClient.mediaPlayerConnectionService.unregisterAndCloseMediaPlayer).toHaveBeenCalledWith(1, 1);
    });
});

describe("wasLastSyncSuccessful() ", ()=>{
    it("should pass false if museaClient.isMediaStationCached returns true", async ()=>{
        mockModelMain.museaClient.mediaStationService.isMediaStationCached.mockImplementationOnce(async (id:number) =>{
            return id === 12;
        })

        let answer:boolean = await presenter.wasLastSyncSuccessful(12);
        expect(answer).toBe(false);
    });

    it("should pass true if museaClient.isMediaStationCached returns false", async ()=>{
        mockModelMain.museaClient.mediaStationService.isMediaStationCached.mockImplementationOnce(async (id:number) =>{
            return id === 12;
        })

        let answer:boolean = await presenter.wasLastSyncSuccessful(8);
        expect(answer).toBe(true);
    });
});

describe("createMediaSTation() ", ()=>{
    it("should call museaClient.createMediaStation with the parameter passed", async ()=>{
        const name:string ="mediaStationName";

        await presenter.createMediaStation(name);
        expect(mockModelMain.museaClient.mediaStationService.createMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.createMediaStation).toHaveBeenCalledWith(name);
    });

    it("should return the number it got from the museaClient", async ()=>{
        const name:string ="mediaStationName";
        let answer:number;
        mockModelMain.museaClient.mediaStationService.createMediaStation.mockResolvedValueOnce(10);

        answer = await presenter.createMediaStation(name);
        expect(answer).toBe(10);
    });
});

describe("checkOnlineStatusOfAllMediaPlayers() ", ()=>{
    const mediaStationId:number = 1;

    it("should return the value of museaClient.checkOnlineStatusOfAllMediaPlayers",async ()=>{
        let answer:boolean;
        mockModelMain.museaClient.mediaPlayerConnectionService.checkOnlineStatusOfAllMediaPlayers.mockImplementation(async (id:number)=>{
            return id === mediaStationId;
        })

        answer = await presenter.checkOnlineStatusOfAllMediaPlayers(mediaStationId);
        expect(answer).toBe(true);
    });
});

describe("renameMediaStation() ", ()=>{
    const mediaStationId:number = 1;

    it("should call museaClient.changeName for the mediastation", ()=>{

        presenter.renameMediaStation(mediaStationId,  "newname");
        expect(mockModelMain.museaClient.mediaStationService.renameMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.renameMediaStation).toHaveBeenCalledWith(mediaStationId,  "newname");
    });
});

describe("downloadContents() ", ()=>{
    const ip:string = "127.0.0.1"

    it("should return DownloadContentsStatus.Success if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_SUCCESS", async ()=>{
        let answer:DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        })
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.Success, ip: ip});

        answer = await presenter.downloadContents(1);
        expect(answer.status).toBe(DownloadContentsStatus.Success);
    });

    it("should return DownloadContentsStatus.NoContentsOnController if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_CONTENTS_ON_CONTROLLER", async ()=>{
        let answer:DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        })
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.SuccessNoContentsOnController, ip: ip});

        answer = await presenter.downloadContents(1);
        expect(answer.status).toBe(DownloadContentsStatus.NoContentsOnController);
    });

    it("should return DownloadContentsStatus.NoControllerIp if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_CONTROLLER_IP", async ()=>{
        let answer:DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.FailedNoControllerIp, ip: ""});

        answer = await presenter.downloadContents(1);
        expect(answer.status).toBe(DownloadContentsStatus.NoControllerIp);
    });

    it("should return DownloadContentsStatus.NoControllerIp if mediaStationDataService.getControllerIp returns null", async ()=>{
        let answer:DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return null;
        })

        answer = await presenter.downloadContents(1);
        expect(answer.status).toBe(DownloadContentsStatus.NoControllerIp);
    });

    it("should return DownloadContentsStatus.NoResponseFromController + ip-address if downloadContentsOfMediaStation returns CONTENT_DOWNLOAD_FAILED_NO_RESPONSE_FROM", async ()=>{
        let answer:DownloadContentsResult;
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        })
        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.FailedNoResponseFrom, ip: ip});

        answer = await presenter.downloadContents(1);
        expect(answer.status).toBe(DownloadContentsStatus.NoResponseFromController);
        expect(answer.params).not.toBe(null);
        expect(answer.params?.ip).toBe(ip);
    });

    it("should set contentsDownloadedInThisSession to true if museaClient returns NoContentsOnController", async ()=>{
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        });

        expect(presenter.contentsDownloadedInThisSession).toBe(false);

        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.SuccessNoContentsOnController, ip: ip});

         await presenter.downloadContents(1);
        expect(presenter.contentsDownloadedInThisSession).toBe(true);
    });

    it("should set contentsDownloadedInThisSession to true if museaClient returns Success", async ()=>{
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        });

        expect(presenter.contentsDownloadedInThisSession).toBe(false);

        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.Success, ip: ip});

        await presenter.downloadContents(1);
        expect(presenter.contentsDownloadedInThisSession).toBe(true);
    });

    it("should set contentsDownloadedInThisSession to true if museaClient returns failed", async ()=>{
        mockModelMain.museaClient.mediaStationService.getControllerIp.mockImplementationOnce(()=>{
            return ip;
        });

        expect(presenter.contentsDownloadedInThisSession).toBe(false);

        mockModelMain.museaClient.mediaStationService.downloadContents.mockResolvedValueOnce({status: ContentDownloadStatus.FailedNoResponseFrom, ip: ip});

        await presenter.downloadContents(1);
        expect(presenter.contentsDownloadedInThisSession).toBe(false);
    });
});

describe("getName() ", () => {
    const mediaStationId: number = 1;

    it("should return the name it got from the museaClient", () => {
        let name:string = "newName";
        let answer:string
        mockModelMain.museaClient.mediaStationService.getMediaStationName.mockReturnValue(name);

        answer = presenter.getName(mediaStationId);
        expect(answer).toStrictEqual(name);
    });
});

describe("sync() ", () => {
    const mediaStationId: number = 1;
    const progressReporter = jest.fn();

    it("should call the museaClient.sync method with the passed arguments", async () => {
        await presenter.sync(mediaStationId, progressReporter);
        expect(mockModelMain.museaClient.mediaStationService.syncMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.syncMediaStation).toHaveBeenCalledWith(mediaStationId, progressReporter);
    });

    it("should retrun the result of museaClient.sync", async () => {
        mockModelMain.museaClient.mediaStationService.syncMediaStation.mockResolvedValueOnce(true);
        const answer:boolean = await presenter.sync(mediaStationId, progressReporter);
        expect(answer).toBe(true);
    });

    it("should set isSyncing to true while syncing and false after the method", async () => {
        expect(presenter.isSyncing).toBe(false);
        mockModelMain.museaClient.mediaStationService.syncMediaStation.mockImplementationOnce(async ()=>{
            expect(presenter.isSyncing).toBe(true);
            return true;
        });
        await presenter.sync(mediaStationId, progressReporter);
        expect(presenter.isSyncing).toBe(false);
    });
});