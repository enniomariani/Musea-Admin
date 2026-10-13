import {beforeEach, describe, expect, it} from "@jest/globals";
import {
    ContentPresenter,
    ISubtitlePresenter,
    IVideoPropsPresenter,
    SubtitleState
} from "renderer/presenters/ContentPresenter.js";
import {IContentMediaInfo} from "renderer/presenters/FolderPresenter.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";
import {IMediaPlayerData, iso6392T, MediaType, Subtitle} from "musea-client/renderer";

let presenter:ContentPresenter;
let mockModelMain: MockModelMain;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    presenter = new ContentPresenter(mockModelMain);
});

// Utility functions to create mock data
const createMediaPlayerData = (ip: string, name: string, isController: boolean): IMediaPlayerData => ({
    ip,
    name,
    isController,
});

const setupMockData = () => {
    const mediaPlayerData1:IMediaPlayerData = createMediaPlayerData("0.0.0.1", "test", true);
    const mediaPlayerData2:IMediaPlayerData = createMediaPlayerData("0.0.0.2", "test2", false);

    const contentMediaInfo1: IContentMediaInfo = {
        id: 0, mediaPlayerName: mediaPlayerData1.name, savedMedia: "image", fileName: "fileNameXY"
    }

    const contentMediaInfo2: IContentMediaInfo = {
        id: 1, mediaPlayerName: mediaPlayerData2.name, savedMedia: null, fileName: null
    }

    const expectedResult = new Map<number, IContentMediaInfo>;
    expectedResult.set(0, contentMediaInfo1);
    expectedResult.set(1, contentMediaInfo2);

    const allMediaPlayers = new Map<number, IMediaPlayerData>([
        [0, mediaPlayerData1],
        [1, mediaPlayerData2],
    ]);


    return { allMediaPlayers, expectedResult };
};

describe("getName() ", () => {
    const mediaStationId: number = 1;

    it("should return the name it got from the museaClient", () => {
        mockModelMain.museaClient.contentService.getName.mockImplementation((mediaStationIdLocal:number, contentId:number)=>{
            if(mediaStationIdLocal === mediaStationId && contentId == 10)
                return "contentName";
            else
                return null;
        })

        const answer:string = presenter.getName(mediaStationId, 10);
        expect(answer).toBe("contentName");
    });
});

describe("getAllMediaForContent() ", () => {
    it("should return a correctly formated map with data from mediaPlayerService.getAllMediaPlayers and mediaService.getMediaType", () => {
        const { allMediaPlayers, expectedResult} = setupMockData();

        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }
        });

        mockModelMain.museaClient.mediaService.getFileName.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return "fileNameXY";
                else if(mediaPlayerId === 1)
                    return null;
            }
        });

        let receivedData = presenter.getAllMediaForContent(2, 0);
        expect(receivedData).toStrictEqual(expectedResult);
    });
});

describe("addImage() ", () => {
    const mediaStationId: number = 1;
    const contentId: number = 3;
    const mediaPlayerId: number = 1;
    const fileName:string = "fileNameImage.xy";
    const fileInstance:File = new File([], fileName);

    it("should call the museaClient.addImageAndCacheIt with correct parameters and extension if filetype is image/jpeg", async () => {
        await presenter.addImage(mediaStationId, contentId, mediaPlayerId, "image/jpeg", fileInstance, fileName);
        expect(mockModelMain.museaClient.mediaService.addImageAndCacheIt).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaService.addImageAndCacheIt).toHaveBeenCalledWith(mediaStationId, contentId, mediaPlayerId, "jpeg", fileInstance, fileName);
    });

    it("should call the museaClient.addImageAndCacheIt with correct parameters and extension if filetype is image/jpeg", async () => {
        await presenter.addImage(mediaStationId, contentId, mediaPlayerId, "image/png", fileInstance, fileName);
        expect(mockModelMain.museaClient.mediaService.addImageAndCacheIt).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaService.addImageAndCacheIt).toHaveBeenCalledWith(mediaStationId, contentId, mediaPlayerId, "png", fileInstance, fileName);
    });

    it("should call the museaClient.cacheMediaStation with correct mediastation-id",async  () => {
        await presenter.addImage(mediaStationId, contentId, mediaPlayerId, "image/png", fileInstance, fileName);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });

    it("should throw an error if a wrong filetype is passed", async () => {
        await expect(presenter.addImage(mediaStationId, contentId, mediaPlayerId, "imageX/png", fileInstance, fileName)).rejects.toThrow(Error("Wrong file-type: imageX/png"))
    });
});

describe("addVideo() ", () => {
    let videoProps:IVideoPropsPresenter ={
        mediaStationId: 1,
        contentId: 3,
        mediaPlayerId: 1,
        subtitles: [{lang: "deu", title: "Deutsch"}, {lang: "eng", title: "Englisch"}],
        fileName: "fileName.xy",
        fileInstance: new File([], "fileName.xy"),
        duration: 102,
        fileType: "video/mp4"
    }

    it("should call the museaClient.addVideoAndCacheIt with correct parameters and extension if filetype is video/mp4", async () => {
        const correctlyMappedSubs:Subtitle[] = [{iso6392T: iso6392T("deu"), title: "Deutsch"}, {iso6392T: iso6392T("eng"), title: "Englisch"}];
        await presenter.addVideo(videoProps);
        expect(mockModelMain.museaClient.mediaService.addVideoAndCacheIt).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaService.addVideoAndCacheIt).toHaveBeenCalledWith(videoProps.mediaStationId, videoProps.contentId,
            videoProps.mediaPlayerId, videoProps.duration, "mp4", videoProps.fileInstance, videoProps.fileName, {subtitles: correctlyMappedSubs});
    });

    it("should return state OK if subtitles have the correct format", async () => {
        const state:SubtitleState = await presenter.addVideo(videoProps);
        expect(state).toEqual({state: "ok"});
    });

    it("should return \"wrong-lang-format\", and wrongly formatted subs ", async () => {
        videoProps.subtitles = [{lang: "deut", title: "Deutsch"}, {lang: "eng", title: "Englisch"}];
        const state:SubtitleState = await presenter.addVideo(videoProps);
        expect(state).toEqual({state: "wrong-lang-format", subs: [{lang: "deut", title: "Deutsch"}]});
    });

    it("should call the museaClient.cacheMediaStation with correct mediastation-id",async  () => {
        await presenter.addVideo(videoProps);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(videoProps.mediaStationId);
    });

    it("should throw an error if a wrong filetype is passed", async () => {
        videoProps.fileType = "video/mp6";
        await expect(presenter.addVideo(videoProps)).rejects.toThrow(Error("Wrong file-type: video/mp6"))
    });
});

describe("checkSubs() ", () => {
    let subtitles:ISubtitlePresenter[] =  [{lang: "deu", title: "Deutsch"}, {lang: "eng", title: "Englisch"}];

    it("should return state OK if subtitles have the correct format", () => {
        const state:SubtitleState = presenter.checkSubs(subtitles);
        expect(state).toEqual({state: "ok"});
    });

    it("should return \"wrong-lang-format\", and wrongly formatted subs ", () => {
        subtitles = [{lang: "deut", title: "Deutsch"}, {lang: "eng", title: "Englisch"}];
        const state:SubtitleState = presenter.checkSubs(subtitles);
        expect(state).toEqual({state: "wrong-lang-format", subs: [{lang: "deut", title: "Deutsch"}]});
    });
});

describe("removeMedia() ", () => {
    const mediaStationId: number = 1;
    const contentId:number = 20;
    const mediaPlayerId:number = 1;

    it("should call the museaClient.deleteMedia method with the passed arguments",async () => {
        await presenter.removeMedia(mediaStationId, contentId, mediaPlayerId);
        expect(mockModelMain.museaClient.mediaService.deleteMedia).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaService.deleteMedia).toHaveBeenCalledWith(mediaStationId, contentId, mediaPlayerId);
    });

    it("should call the museaClient.cacheMediaStation with correct mediastation-id",async  () => {
        await presenter.removeMedia(mediaStationId, contentId, mediaPlayerId);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});