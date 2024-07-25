import {after} from "mocha";
import {
    expectReceivedDeleteMediaCommands,
    removeAllSavedFiles, setupFunctionalMediaStationCommunication, wssExpectedCommands
} from "./helperFunctions/HelperFunctions.js";
import {
    exitMediaStation, openMediaStation, restartApp, syncMediaStation
} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    addContent,
    addFolder, checkFolderEntry,
    clickBackBtn,
    deleteContent, deleteFolder,
    openFolder, renameContent,
    renameFolder
} from "./helperFunctions/HelperFolderScreen.js";
import {addMediaToMediaPlayerWithId} from "./helperFunctions/HelperContentScreen.js";

process.env.TEST = 'true';

/**
 *
 * GENERAL INFORMATION ABOUT THE TEST-STRUCTURE:
 *
 * - the state of the app remains changed between the tests, except if the describe-text states "New Scenario"
 * - if multiple tests in the same scenario fail: take a look at the first one, it could impact the others!
 */

before("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

after("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

describe("New scenario: manage contents: ", () => {
    async function setup() {
        await setupFunctionalMediaStationCommunication();
        await openMediaStation(0);
    }

    it('it should add a content if the user clicks on addContent', async () => {
        await setup();
        await addContent("Test-Content 1");
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        browser.pause();
        expect(await $('#item0 #mediaIcon0null')).toBeExisting();
    });

    it('it should add a second content if the user clicks again on addContent', async () => {
        await addContent("Test-Content 2");
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content 2");
        expect(await $('#item1 #mediaIcon0image')).toBeExisting();
    });

    it('it should NOT add a third content if the user clicks again on addContent and then aborts the process', async () => {
        await addContent("Test-Content 2", true);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content 2");
        expect(await $('#item1 #mediaIconimage')).toBeExisting();
        expect(await $('#item2').isExisting()).toBe(false);
    });

    it('clicking on the first content should open the content screen', async () => {
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed({timeout: 3000});
        expect(await $('#mainTitle').getText()).toBe("Test-Content 1");
        expect(await $('#item0 #title').getText()).toBe("Controller");
        expect(await $('#item0 #addMediaBtn').isExisting()).toBe(true);
    });

    it('deleting content 2 should not affect content 1, but content 2 should be removed from the display-list', async () => {
        await $('#backBtn').click();
        await $('#addContent').waitForDisplayed();

        await deleteContent(1);
        expect(await $('#item1').isExisting()).toBe(false);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
    });

    it('rename content 1, but abort the process', async () => {
        await renameContent(0, "wrong-name", true)
        expect(await $('#item1').isExisting()).toBe(false);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
    });

    it('rename content 1', async () => {
        await renameContent(0, "New Name Test-Content 1")
        expect(await $('#item1').isExisting()).toBe(false);
        expect(await $('#item0 #title').getText()).toBe("New Name Test-Content 1");
    });
});

describe("New scenario: Delete contents and check if delete-image commands are sent correctly: ", () => {
    async function setup(idReturnedFromMediaPlayerForMedia: number | null = null) {
        await setupFunctionalMediaStationCommunication();

        if (idReturnedFromMediaPlayerForMedia !== null)
            wssExpectedCommands.set("media,put", ["media", "put", idReturnedFromMediaPlayerForMedia.toString()])

        await openMediaStation(0);

        console.log("mediastation opened, start adding contents...")

        await addContent("Test-Content 1");
        await addContent("Test-Content 2");
    }

    it('New scenario: there should have been sent an image-delete command if an image was added, synced,app closed, reopened, downloaded contents, the content deleted and synced again', async () => {
        await setup(13);

        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "video");

        await syncMediaStation();
        await restartApp();

        await openMediaStation(0);

        await deleteContent(0);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(1);
    });

    it('New scenario: there should have been sent an image-delete command if the image was added, synced, content removed, app closed, reopened, and synced again', async () => {
        await setup(13);

        //open content 0
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        //add image to content
        await addMediaToMediaPlayerWithId(0, "image");

        //sync
        await syncMediaStation();

        //go back to folder-view
        await $('#backBtn').click();
        await $('#addContent').waitForDisplayed();

        //delete content 0
        await deleteContent(0);

        //restart app
        await restartApp();

        await openMediaStation(0);
        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(1);
    });
});

describe("New scenario: Create, rename and navigate in folders: ", () => {
    async function setup(idReturnedFromMediaPlayerForMedia: number | null = null) {
        removeAllSavedFiles();
        await restartApp();

        console.log("setup wss server: ", idReturnedFromMediaPlayerForMedia)

        await setupFunctionalMediaStationCommunication();
        await openMediaStation(0);
    }

    it('adding a folder: it should be displayed in the list', async () => {
        await setup(13);
        await addFolder("Folder 1");
        expect(await $('#item0 #title').getText()).toBe("Folder 1")
    });

    it('adding a second folder: it should be displayed in the list after the first one', async () => {
        await addFolder("Folder 2");
        await checkFolderEntry(0, "Folder 1");
        await checkFolderEntry(1, "Folder 2");
    });

    it('open folder one should show the title of the opened folder in the nav, the list should be empty', async () => {
        await openFolder(0);
        expect(await $('#mainTitle').getText()).toBe("Folder 1");
        expect(await $('#item0').isExisting()).toBe(false);
        expect(await $('#item1').isExisting()).toBe(false);
    });

    it('add a sub-folder to folder 1', async () => {
        await addFolder("Subfolder 1 of Folder 1");
        expect(await $('#item0').isExisting()).toBe(true)
        await checkFolderEntry(0, "Subfolder 1 of Folder 1");
    });

    it('add a second sub-folder to folder 1', async () => {
        await addFolder("Subfolder 2 of Folder 1");
        await checkFolderEntry(0, "Subfolder 1 of Folder 1");
        await checkFolderEntry(1, "Subfolder 2 of Folder 1");
    });

    it('select sub-folder 2', async () => {
        await openFolder(1);
        expect(await $('#mainTitle').getText()).toBe("Subfolder 2 of Folder 1");
        expect(await $('#item0').isExisting()).toBe(false);
        expect(await $('#item1').isExisting()).toBe(false);
    });

    it('add content to sub-folder 2', async () => {
        await addContent("content in subfolder-2");
        expect(await $('#item0 #title').getText()).toBe("content in subfolder-2");
    });

    it('move up to folder 1', async () => {
        await clickBackBtn("Folder 1");
        expect(await $('#mainTitle').getText()).toBe("Folder 1");
        expect(await $('#item0 #title').getText()).toBe("Subfolder 1 of Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 of Folder 1");
    });

    it('add new sub-folder but abort the process', async () => {
        await addFolder("should not be displayed", true)
        expect(await $('#mainTitle').getText()).toBe("Folder 1");
        expect(await $('#item0 #title').getText()).toBe("Subfolder 1 of Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 of Folder 1");
        expect(await $('#item2').isExisting()).toBe(false);
    });

    it('rename a folder, but abort the process', async () => {
        await renameFolder(0, "name that should not be set", true);
        expect(await $('#mainTitle').getText()).toBe("Folder 1");
        expect(await $('#item0 #title').getText()).toBe("Subfolder 1 of Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 of Folder 1");
        expect(await $('#item2').isExisting()).toBe(false);
    });

    it('rename a folder', async () => {
        await renameFolder(0, "new name sub-folder 1");
        expect(await $('#mainTitle').getText()).toBe("Folder 1");
        expect(await $('#item0 #title').getText()).toBe("new name sub-folder 1");   //comes first because it's alphabetically sorted
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 of Folder 1");
        expect(await $('#item2').isExisting()).toBe(false);
    });

    async function checkIfStructureIsLikeBefore(): Promise<void> {
        expect(await $('#item0 #title').getText()).toBe("Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Folder 2");

        await openFolder(0);

        expect(await $('#item0 #title').getText()).toBe("new name sub-folder 1");   //comes first because it's alphabetically sorted
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 of Folder 1");
        expect(await $('#item2').isExisting()).toBe(false);

        await openFolder(1);

        expect(await $('#item0 #title').getText()).toBe("content in subfolder-2");
    }

    it('close the app, restart and sync: the folder-structure and names should be the same as before', async () => {
        await restartApp();
        await openMediaStation(0);
        await checkIfStructureIsLikeBefore();
    });
});

describe("New scenario: Delete folders: ", () => {
    async function setup(idReturnedFromMediaPlayerForMedia: number | null = null) {
        await setupFunctionalMediaStationCommunication();

        if (idReturnedFromMediaPlayerForMedia !== null)
            wssExpectedCommands.set("media,put", ["media", "put", idReturnedFromMediaPlayerForMedia.toString()])

        await openMediaStation(0);

        await addFolder("Folder 1");
        await addFolder("Folder 2");
        await addFolder("Folder 3");
        await addContent("Content 1");
        await addContent("Content 2");

        await openFolder(2); //should open folder 1, because it is at the first position after the contents
        await addFolder("Subfolder 1 in Folder 1");
        await addFolder("Subfolder 2 in Folder 1");
        await addContent("Content 1 in Folder 1");

        await openFolder(2); //should open Subfolder 2, because it is at the second position after the contents
        await addContent("Content 1 in Subfolder 2");
        await addContent("Content 2 in Subfolder 2");

        //add image to folder 1/ subfolder 2/ content1
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();
        await addMediaToMediaPlayerWithId(0, "image");

        //move to folder 1/ subfolder 2
        await clickBackBtn("Subfolder 2 in Folder 1");

        //add video to folder 1/ subfolder 2/ content2
        await $('#item1').click();
        await $('#addMediaBtn').waitForDisplayed();
        await addMediaToMediaPlayerWithId(0, "video");

        //move to folder 1
        await clickBackBtn("Subfolder 2 in Folder 1");
        await clickBackBtn("Folder 1");

        await openFolder(1); //should open Subfolder 1, because it is at the first position after the content
        await addContent("Content 1 in Subfolder 1");

        //open content 1 in Folder 1
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");

        //move to root folder
        await clickBackBtn("Subfolder 1 in Folder 1");
        await clickBackBtn("Folder 1");
        await clickBackBtn("");

        await syncMediaStation();
    }

    it('deleting the  Folder 2 should remove it from the display list', async () => {
        await setup(13);
        await deleteFolder(3);
        expect(await $('#item3 #title').getText()).toBe("Folder 3");
        expect(await $('#item4').isExisting()).toBe(false);
    });

    it('deleting SubFolder 1 of Folder 1 should update the display list accordingly', async () => {
        await openFolder(2); //should open folder 1, because it is at the first position after the contents
        await deleteFolder(1);
        expect(await $('#item1 #title').getText()).toBe("Subfolder 2 in Folder 1");
        expect(await $('#item2').isExisting()).toBe(false);
    });

    it('syncing should send a delete media command, because there was a content in subfolder 1 with an image', async () => {
        await syncMediaStation();
        expectReceivedDeleteMediaCommands(1)
    });

    it('deleting Folder 1 should update the display list accordingly', async () => {
        await clickBackBtn(""); //move back to root-folder
        await deleteFolder(2);      //should delete folder 1, because there are 2 contents before
        expect(await $('#item2 #title').getText()).toBe("Folder 3");
        expect(await $('#item3').isExisting()).toBe(false);
    });

    it('syncing should send two delete media commands, because there were 2 contents in subfolder 2 with an image and a video', async () => {
        await syncMediaStation();
        expectReceivedDeleteMediaCommands(3);
    });

    it('close the app, restart (contents get downloaded): the folder-structure and names should be the same as before (inclusive the changes from the folder-deletion)', async () => {
        await restartApp();
        await openMediaStation(0);
        expect(await $('#item0 #title').getText()).toBe("Content 1");
        expect(await $('#item1 #title').getText()).toBe("Content 2");
        expect(await $('#item2 #title').getText()).toBe("Folder 3");
        expect(await $('#item3').isExisting()).toBe(false);
    });
});