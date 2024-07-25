import {browser} from 'wdio-electron-service';
import {after} from "mocha";
import {
    expectReceivedDeleteMediaCommands, removeAllSavedFiles,
    resetCommandHistory, setupFunctionalMediaStationCommunication, wssExpectedCommands,
} from "./helperFunctions/HelperFunctions.js";
import {
    addMediaToMediaPlayerWithId, checkMediaEntry, removeMediaFromMediaPlayerWithId
} from "./helperFunctions/HelperContentScreen.js";
import {
    exitMediaStation, openMediaPlayerAdmin,
    openMediaStation, restartApp, syncMediaStation
} from "./helperFunctions/HelperMediaStationScreen.js";
import {addMediaPlayer} from "./helperFunctions/HelperMediaPlayerScreen.js";
import {addContent, clickBackBtn} from "./helperFunctions/HelperFolderScreen.js";

process.env.TEST = 'true';

/**
 *
 * GENERAL INFORMATION ABOUT THE TEST-STRUCTURE:
 *
 * - the state of the app remains changed between the tests, except if the describe-text states "New Scenario"
 * - if multiple tests in the same scenario fail: take a look at the first one, it could impact the others!
 */

after("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

before("removeSavedMediaStations", () => {
    removeAllSavedFiles();
});

async function setup(ipController: string, doAddContent: boolean, idReturnedFromMediaPlayerForMedia: number) {
    await setupFunctionalMediaStationCommunication(ipController);

    if (idReturnedFromMediaPlayerForMedia !== null)
        wssExpectedCommands.set("media,put", ["media", "put", idReturnedFromMediaPlayerForMedia.toString()])

    await openMediaPlayerAdmin(0);
    await addMediaPlayer("SecondMediaPlayer", ipController);
    await exitMediaStation();
    await openMediaStation(0);

    if (doAddContent) {
        await addContent("Test-Content 1");
        await addContent("Test-Content 2");

        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();
    }
}

describe("New scenario: add image to content with 2 media-players (one stays empty) and sync, all connections work", () => {
    it('it should add the image and display the icon', async () => {
        await setup("localhost", true, 99);
        await addMediaToMediaPlayerWithId(0, "image");
        await checkMediaEntry(0, "Controller", "test.jpeg", "image");
    });

    it('when clicking sync (controller is reachable) and restart the app, it should have the exact same content-structure as before', async () => {
        await syncMediaStation();

        //restart app, remove all files and set mediastation and controller again
        await restartApp();

        await openMediaStation(0);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        expect(await $('#item0 #mediaIcon0image')).toBeExisting();
        expect(await $('#item1 #title').getText()).toBe("Test-Content 2");
        expect(await $('#item1 #mediaIcon0null')).toBeExisting();

        await $('#item0').click();

        await checkMediaEntry(0, "Controller", "test.jpeg", "image")
        await checkMediaEntry(1, "SecondMediaPlayer", "", null)
    });

    it('go back and add a video to the second content', async () => {
        //move one hierarchy up to the folder-screen
        await clickBackBtn("");

        //select second content
        await $('#item1').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "video");
        await checkMediaEntry(0, "Controller", "test.mp4", "video")
    });

    it('close app without synchronisation, it should synchronise after clicking the mediastation after the restart and have all the changes from before displayed', async () => {
        await restartApp();
        await openMediaStation(0);

        await browser.pause(500);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        expect(await $('#item0 #mediaIcon0image')).toBeExisting();
        expect(await $('#item1 #title').getText()).toBe("Test-Content 2");
        expect(await $('#item1 #mediaIcon0video')).toBeExisting();

        //select the second content
        await $('#item1').click();

        await checkMediaEntry(0, "Controller", "test.mp4", "video");
        await checkMediaEntry(1, "SecondMediaPlayer", "", null);
    });

    it('add an image to the second content', async () => {
        await addMediaToMediaPlayerWithId(1, "image");
        await checkMediaEntry(0, "Controller", "test.mp4", "video");
        await checkMediaEntry(1, "SecondMediaPlayer", "test.jpeg", "image");
    });
});

describe("New scenario: add image and video to BOTH media-players of the content and remove it again (with different steps in between): ", () => {
    it('there should not have been sent an image-delete command, if the image was added and removed before syncing', async () => {
        await setup("localhost", true, 22);

        await addMediaToMediaPlayerWithId(0, "image");
        await addMediaToMediaPlayerWithId(1, "video");

        await removeMediaFromMediaPlayerWithId(0);
        await removeMediaFromMediaPlayerWithId(1);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(0)
    });

    it('there should have been sent two image-delete commands if the image was added, synced, removed both media and synced again', async () => {
        resetCommandHistory();
        await openMediaStation(0);

        //open content
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");
        await addMediaToMediaPlayerWithId(1, "video");

        await syncMediaStation();

        await removeMediaFromMediaPlayerWithId(0);
        await removeMediaFromMediaPlayerWithId(1);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(2);
    });

    it('there should have been sent two image-delete commands if the image and video were added, synced,app closed, reopened, downloaded contents, removed both media and synced again', async () => {
        resetCommandHistory();
        await openMediaStation(0);

        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");
        await addMediaToMediaPlayerWithId(1, "video");

        await syncMediaStation();
        await restartApp();

        await $('#item0').click();
        //wait until the content-station screen is shown
        await $('#addContent').waitForDisplayed({timeout: 15000});

        await $('#item0').click();
        await $('#optionsBtn').waitForDisplayed();

        await removeMediaFromMediaPlayerWithId(0);
        await removeMediaFromMediaPlayerWithId(1);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(2);
    });

    it('there should have been sent two image-delete commands if the image was added, synced, image removed, app closed, reopened, and synced again', async () => {
        resetCommandHistory();
        await openMediaStation(0);

        //open content 0
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        //add image to content
        await addMediaToMediaPlayerWithId(0, "image");
        await addMediaToMediaPlayerWithId(1, "video");

        //sync
        await syncMediaStation();

        //open image-options
        await $('#item0').click();
        await $('#optionsBtn').waitForDisplayed();

        //remove image
        await removeMediaFromMediaPlayerWithId(0);
        await removeMediaFromMediaPlayerWithId(1);

        //restart app
        await restartApp();

        //open mediastation (it should have the state "sync failed" at this point) so it should sync
        await $('#item0').click();
        //wait until the content-station screen is shown
        await $('#addContent').waitForDisplayed({timeout: 15000});

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(2);
    });
});