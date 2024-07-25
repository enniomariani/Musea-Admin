import {beforeEach, describe, expect, it} from "@jest/globals";
import {
    FolderPresenter,
    ICompleteContentInfo,
    IContentMediaInfo
} from "renderer/presenters/FolderPresenter.js";
import {ClipboardItemTypes} from "renderer/presenters/handlers/ClipboardHandler.js";
import {MockClipboardHandler} from "__mocks__/renderer/presenters/handlers/MockClipboardHandler.js";
import {MockModelMain} from "__mocks__/renderer/models/MockModelMain.js";
import {IMediaPlayerData, MediaType} from "musea-client/renderer";

let presenter: FolderPresenter;
let mockModelMain: MockModelMain;
let mockClipboardHandler: MockClipboardHandler;

beforeEach(() => {
    mockModelMain = new MockModelMain();
    mockClipboardHandler = new MockClipboardHandler();
    presenter = new FolderPresenter(mockModelMain, mockClipboardHandler);
});

// Utility functions to create mock data
const createMediaPlayerData = (ip: string, name: string, isController: boolean): IMediaPlayerData => ({
    ip,
    name,
    isController,
});

const createCompleteContentInfo = (name: string, lightIntensity:number, mediaInfo: IContentMediaInfo[]): ICompleteContentInfo => ({
    name,
    media: mediaInfo,
    lightIntensity: lightIntensity
});


const setupMockData = () => {
    const mediaPlayerData1 = createMediaPlayerData("0.0.0.1", "test", true);
    const mediaPlayerData2 = createMediaPlayerData("0.0.0.2", "test2", false);

    const completeContentInfo1 = createCompleteContentInfo("content1", 2,[
        { id: 0, mediaPlayerName: mediaPlayerData1.name, savedMedia: "image", fileName: "fileNameX" },
        { id: 1, mediaPlayerName: mediaPlayerData2.name, savedMedia: null, fileName: null  },
    ]);

    const completeContentInfo2 = createCompleteContentInfo("content2", 1,[
        { id: 0, mediaPlayerName: mediaPlayerData1.name, savedMedia: "video", fileName: "fileNameZ"  },
        { id: 1, mediaPlayerName: mediaPlayerData2.name, savedMedia: "image", fileName: "fileNameA"  },
    ]);

    const expectedResult = new Map<number, ICompleteContentInfo>([
        [0, completeContentInfo1],
        [1, completeContentInfo2],
    ]);

    const allMediaPlayers = new Map<number, IMediaPlayerData>([
        [0, mediaPlayerData1],
        [1, mediaPlayerData2],
    ]);

    const allContents = new Map<number, string>([
        [0, "content1"],
        [1, "content2"],
    ]);

    return { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 };
};

describe("getAllContentsInFolder() ", () => {

    it("should return a correctly formated map with data from mediaPlayerDataService.getAllMediaPlayers and folderService.getAllContentsInFolder", () => {
        const { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 } = setupMockData();

        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);
        mockModelMain.museaClient.folderService.getAllContentsInFolder.mockReturnValue(allContents);

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return MediaType.VIDEO;
                else if(mediaPlayerId === 1)
                    return MediaType.IMAGE;
            }
        });

        mockModelMain.museaClient.mediaService.getFileName.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return "fileNameX";
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return "fileNameZ";
                else if(mediaPlayerId === 1)
                    return "fileNameA";
            }
        });

        mockModelMain.museaClient.contentService.getLightIntensity.mockImplementation((mediaStationId:number, contentId:number) =>{
            if(contentId === 0)
                return 2;
            else if(contentId === 1)
                return 1;
        });

        let receivedData = presenter.getAllContentsInFolder(2, 0);
        expect(receivedData).toStrictEqual(expectedResult);
    });
});

describe("findContentsContainingString() ", () => {

    it("should return a correctly formated map with data from mediaPlayerService.getAllMediaPlayers and folderService.findContentsByNamePart", () => {
        const { allMediaPlayers, allContents, expectedResult, completeContentInfo1, completeContentInfo2 } = setupMockData();

        mockModelMain.museaClient.mediaPlayerDataService.getAllMediaPlayers.mockReturnValue(allMediaPlayers);
        mockModelMain.museaClient.folderService.findContentsByNamePart.mockReturnValue(allContents);

        mockModelMain.museaClient.mediaService.getMediaType.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return MediaType.IMAGE;
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return MediaType.VIDEO;
                else if(mediaPlayerId === 1)
                    return MediaType.IMAGE;
            }
        });

        mockModelMain.museaClient.mediaService.getFileName.mockImplementation((mediaStationId:number, contentId:number, mediaPlayerId:number) => {
            if(contentId === 0){
                if(mediaPlayerId === 0)
                    return "fileNameX";
                else if(mediaPlayerId === 1)
                    return null;
            }else if(contentId === 1){
                if(mediaPlayerId === 0)
                    return "fileNameZ";
                else if(mediaPlayerId === 1)
                    return "fileNameA";
            }
        });

        mockModelMain.museaClient.contentService.getLightIntensity.mockImplementation((mediaStationId:number, contentId:number) =>{
            if(contentId === 0)
                return 2;
            else if(contentId === 1)
                return 1;
        });

        let receivedData = presenter.findContentsContainingString(2, 0, "searchString");
        expect(receivedData).toStrictEqual(expectedResult);
    });
});

describe("getAllSubFoldersInFolder() ", () => {

    it("should return the map it got from museaClient.getAllSubFoldersInFolder", () => {
        const  allSubFolders:Map<number, string> = new Map();
        allSubFolders.set(0, "sub-folder 1")
        allSubFolders.set(1, "sub-folder 2")
        allSubFolders.set(2, "sub-folder 3X")

        mockModelMain.museaClient.folderService.getAllSubFoldersInFolder.mockImplementation((mediastationId:number, parentFolderId:number)=>{
            if(mediastationId === 2 && parentFolderId === 0)
                return allSubFolders;
            else
                return undefined;
        });

        let receivedData = presenter.getAllSubFoldersInFolder(2, 0);
        expect(receivedData).toStrictEqual(receivedData);
    });
});

describe("createContent() ", () => {
    const mediaStationId: number = 1;

    it("should call the museaClient.createContent method with the passed arguments", () => {
        presenter.createContent(mediaStationId, 12, "contentname");
        expect(mockModelMain.museaClient.contentService.createContent).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.contentService.createContent).toHaveBeenCalledWith(mediaStationId, 12, "contentname");
    });

    it("should return the number it got from the museaClient", () => {
        let answer: number;
        let expectecdAnswer: number = 12;
        mockModelMain.museaClient.contentService.createContent.mockReturnValueOnce(expectecdAnswer);

        answer = presenter.createContent(mediaStationId, 12, "contentname");
        expect(answer).toBe(expectecdAnswer);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments", () => {
        presenter.createContent(mediaStationId, 12, "contentname");
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("getNameOfFolder() ", () => {
    const mediaStationId: number = 1;

    it("should return the name it got from the museaClient", () => {
        mockModelMain.museaClient.folderService.getName.mockImplementation((mediaStationIdLocal:number, folderIdLocal:number)=>{
            if(mediaStationIdLocal === mediaStationId && folderIdLocal == 10)
                return "folderName";
            else
                return null;
        })

        let answer:string = presenter.getNameOfFolder(mediaStationId, 10);
        expect(answer).toBe("folderName");
    });
});

describe("renameContent() ", () => {
    const mediaStationId: number = 1;
    const newName:string ="newContentName";

    it("should change the name in the museaClient", () => {
        presenter.renameContent(mediaStationId, 2, newName);
        expect(mockModelMain.museaClient.contentService.changeName).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.contentService.changeName).toHaveBeenCalledWith(mediaStationId,2, newName);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments", () => {
        presenter.renameContent(mediaStationId, 12, newName);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("changeLightIntensityForContent() ", () => {
    const mediaStationId: number = 1;
    const newIntensity:number =3;

    it("should change the name in the museaClient", () => {
        presenter.changeLightIntensityForContent(mediaStationId, 2, newIntensity);
        expect(mockModelMain.museaClient.contentService.changeLightIntensity).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.contentService.changeLightIntensity).toHaveBeenCalledWith(mediaStationId,2, newIntensity);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments", () => {
        presenter.changeLightIntensityForContent(mediaStationId, 12, newIntensity);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("deleteContent() ", () => {
    const mediaStationId: number = 1;

    it("should call deleteContent in the museaClient", async () => {
        await presenter.deleteContent(mediaStationId, 2, 3);
        expect(mockModelMain.museaClient.contentService.deleteContent).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.contentService.deleteContent).toHaveBeenCalledWith(mediaStationId,2, 3);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments",async () => {
        await presenter.deleteContent(mediaStationId, 12, 3);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("deleteFolder() ", () => {
    const mediaStationId: number = 1;

    it("should call deleteFolder in the museaClient", async () => {
        await presenter.deleteFolder(mediaStationId, 2);
        expect(mockModelMain.museaClient.folderService.deleteFolder).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.folderService.deleteFolder).toHaveBeenCalledWith(mediaStationId,2);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments",async () => {
        await presenter.deleteFolder(mediaStationId, 12);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("createFolder() ", () => {
    const mediaStationId: number = 1;

    it("should call the museaClient.createFolder method with the passed arguments", () => {
        presenter.createFolder(mediaStationId, 12, "folderName");
        expect(mockModelMain.museaClient.folderService.createFolder).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.folderService.createFolder).toHaveBeenCalledWith(mediaStationId, 12, "folderName");
    });

    it("should return the number it got from the museaClient", () => {
        let answer: number;
        let expectecdAnswer: number = 12;
        mockModelMain.museaClient.folderService.createFolder.mockReturnValueOnce(expectecdAnswer);

        answer = presenter.createFolder(mediaStationId, 12, "folderName");
        expect(answer).toBe(expectecdAnswer);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments", () => {
        presenter.createFolder(mediaStationId, 12, "contentname");
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("renameFolder() ", () => {
    const mediaStationId: number = 1;
    const newName:string ="newFolderName";

    it("should change the name in the museaClient", () => {
        presenter.renameFolder(mediaStationId, 2, newName);
        expect(mockModelMain.museaClient.folderService.changeName).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.folderService.changeName).toHaveBeenCalledWith(mediaStationId,2, newName);
    });

    it("should call the museaClient.cacheMediaStation method with the correct arguments", () => {
        presenter.renameFolder(mediaStationId, 12, newName);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledTimes(1);
        expect(mockModelMain.museaClient.mediaStationService.cacheMediaStation).toHaveBeenCalledWith(mediaStationId);
    });
});

describe("getIdOfParentFolder() ", () => {
    const mediaStationId: number = 1;

    it("should return the id it got from the museaClient", () => {
        mockModelMain.museaClient.folderService.getIdOfParentFolder.mockImplementation((mediaStationIdLocal:number, folderIdLocal:number)=>{
            if(mediaStationIdLocal === mediaStationId && folderIdLocal == 10)
                return 20;
            else
                return null;
        })

        let answer:number = presenter.getIdOfParentFolder(mediaStationId, 10);
        expect(answer).toBe(20);
    });
});

describe("getFolderIdOfContent() ", () => {
    const mediaStationId: number = 1;

    it("should return the id it got from the museaClient", () => {
        mockModelMain.museaClient.contentService.getFolderId.mockImplementation((mediaStationIdLocal:number, folderIdLocal:number)=>{
            if(mediaStationIdLocal === mediaStationId && folderIdLocal == 10)
                return 20;
            else
                return null;
        })

        let answer:number = presenter.getFolderIdOfContent(mediaStationId, 10);
        expect(answer).toBe(20);
    });
});

it('handleCutFolder should call cut with Folder type', () => {
    presenter.handleCutFolder(123);
    expect(mockClipboardHandler.cut).toHaveBeenCalledWith(123, ClipboardItemTypes.Folder);
});

it('handleCutContent should call cut with Content type', () => {
    presenter.handleCutContent(456);
    expect(mockClipboardHandler.cut).toHaveBeenCalledWith(456, ClipboardItemTypes.Content);
});

it('isContentInClipboard should delegate call', () => {
    mockClipboardHandler.isContentInClipboard.mockReturnValue(true);
    expect(presenter.isContentInClipboard(5)).toBe(true);
    expect(mockClipboardHandler.isContentInClipboard).toHaveBeenCalledWith(5);
});

it('isFolderInClipboard should delegate call', () => {
    mockClipboardHandler.isFolderInClipboard.mockReturnValue(false);
    expect(presenter.isFolderInClipboard(7)).toBe(false);
    expect(mockClipboardHandler.isFolderInClipboard).toHaveBeenCalledWith(7);
});

describe('handlePaste', () => {
    it('should do nothing if clipboard is empty', () => {
        mockClipboardHandler.getCutItem.mockReturnValue(null);
        presenter.handlePaste(1, 2);
        expect(mockModelMain.museaClient.folderService.changeParentFolder).not.toHaveBeenCalled();
        expect(mockModelMain.museaClient.contentService.changeFolder).not.toHaveBeenCalled();
        expect(mockClipboardHandler.clear).not.toHaveBeenCalled();
    });

    it('should paste folder and clear clipboard', () => {
        mockClipboardHandler.getCutItem.mockReturnValue({ id: 10, type: ClipboardItemTypes.Folder });
        presenter.handlePaste(100, 200);

        expect(mockModelMain.museaClient.folderService.changeParentFolder).toHaveBeenCalledWith(100, 10, 200);
        expect(mockModelMain.museaClient.contentService.changeFolder).not.toHaveBeenCalled();
        expect(mockClipboardHandler.clear).toHaveBeenCalled();
    });

    it('should paste content and clear clipboard', () => {
        mockClipboardHandler.getCutItem.mockReturnValue({ id: 42, type: ClipboardItemTypes.Content });
        presenter.handlePaste(7, 8);

        expect(mockModelMain.museaClient.contentService.changeFolder).toHaveBeenCalledWith(7, 42, 8);
        expect(mockModelMain.museaClient.folderService.changeParentFolder).not.toHaveBeenCalled();
        expect(mockClipboardHandler.clear).toHaveBeenCalled();
    });
});

it('handleClearClipboard should call clear()', () => {
    presenter.handleClearClipboard();
    expect(mockClipboardHandler.clear).toHaveBeenCalled();
});