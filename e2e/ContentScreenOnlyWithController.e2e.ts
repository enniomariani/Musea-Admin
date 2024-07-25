import {after} from "mocha";
import {
    expectReceivedDeleteMediaCommands,
    removeAllSavedFiles, resetCommandHistory,
    setupFunctionalMediaStationCommunication, wssExpectedCommands
} from "./helperFunctions/HelperFunctions.js";
import {
    addMediaToMediaPlayerWithId,
    removeMediaFromMediaPlayerWithId
} from "./helperFunctions/HelperContentScreen.js";
import {
    exitMediaStation, openMediaStation, restartApp, syncMediaStation
} from "./helperFunctions/HelperMediaStationScreen.js";
import {addContent} from "./helperFunctions/HelperFolderScreen.js";

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

async function setupWSServer(idReturnedFromMediaPlayerForMedia: number | null): Promise<void> {
    console.log("Setup wss server: ", idReturnedFromMediaPlayerForMedia)

    resetCommandHistory();
    await setupFunctionalMediaStationCommunication();

    if (idReturnedFromMediaPlayerForMedia !== null)
        wssExpectedCommands.set("media,put", ["media", "put", idReturnedFromMediaPlayerForMedia.toString()])
}

async function setup(idReturnedFromMediaPlayerForMedia: number | null) {
    await setupWSServer(idReturnedFromMediaPlayerForMedia);

    await openMediaStation(0);

    await addContent("Test-Content 1");
    await addContent("Test-Content 2");

    await $('#item0').click();
    await $('#addMediaBtn').waitForDisplayed();
}

describe("New scenario: add image to content and sync, all connections work: ", () => {
    it('it should add the image and display the icon', async () => {
        await setup( 99);
        await addMediaToMediaPlayerWithId(0, "image");
        expect(await $('#item0 #title').getText()).toBe("Controller");
        expect(await $('#item0 #mediaTypeimage')).toBeExisting();
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

        expect(await $('#item0 #title').getText()).toBe("Controller");
        expect(await $('#item0 #mediaTypeimage')).toBeExisting();
    });

    it('go back and add a video to the second content', async () => {
        //move one hierarchy up to the folder-screen
        await $('#backBtn').click();
        await $('#addContent').waitForDisplayed();

        //select second content
        await $('#item1').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "video");
        expect(await $('#item0 #title').getText()).toBe("Controller");
        expect(await $('#item0 #mediaTypevideo')).toBeExisting();
    });

    it('close app without synchronisation, it should synchronise after clicking the mediastation after the restart and have all the changes from before displayed', async () => {
        await syncMediaStation();

        await restartApp();
        await openMediaStation(0);
        expect(await $('#item0 #title').getText()).toBe("Test-Content 1");
        expect(await $('#item0 #mediaIcon0image')).toBeExisting();
        expect(await $('#item1 #title').getText()).toBe("Test-Content 2");
        expect(await $('#item1 #mediaIcon0video')).toBeExisting();

        //select the second content
        await $('#item1').click();

        expect(await $('#item0 #title').getText()).toBe("Controller");
        expect(await $('#item0 #mediaTypevideo')).toBeExisting();
    });
});

describe("New scenario: add image to content and sync, image cannot be sent/received: ", () => {
    it('it should display "sync failed" on the mediastation', async () => {
        await setup(null);
        await addMediaToMediaPlayerWithId(0, "image");

        await exitMediaStation(990000);

        try{
            await $('#item0 #syncFailed0').waitForDisplayed();
        } catch(e){
            console.log('Test / FAILURE STATE:');
            console.log('Test / #item0 exists:', await $('#item0').isExisting());
            console.log('Test / #item0 is displayed:', await $('#item0').isDisplayed());
            console.log('Test / #item0 text:', await $('#item0').getText());

            throw e;
        }

        await browser.pause(500);

        console.log("Test / Check sync failed: ", await $('#item0').isDisplayed(), await $('#item0 #syncFailed0').isDisplayed())

        expect(await $('#item0 #syncFailed0').isDisplayed()).toBe(true);
    });

    it('it should successfully sync if the media-player is reachable now', async () => {
        wssExpectedCommands.set("media,put", ["media", "put", "33"]);
        await restartApp();
        await openMediaStation(0);
        expect(await $('#addContent').isDisplayed()).toBe(true);
    });
});

describe("New scenario: add image to content and remove it again (with different steps in between): ", () => {
    it('there should not have been sent an image-delete command, if the image was added and removed before syncing', async () => {
        await setup(22);

        await addMediaToMediaPlayerWithId(0, "image");
        await removeMediaFromMediaPlayerWithId(0);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(0);
    });

    it('there should have been sent an image-delete command if the image was added, synced, removed and synced again', async () => {
        resetCommandHistory();
        await openMediaStation(0);

        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");
        await syncMediaStation();

        await removeMediaFromMediaPlayerWithId(0);
        await exitMediaStation();

        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(1);
    });

    it('there should have been sent an image-delete command if the image was added, synced,app closed, reopened, downloaded contents, removed the image and synced again', async () => {
        resetCommandHistory()
        await openMediaStation(0);

        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");

        await syncMediaStation();
        await restartApp();

        await $('#item0').click();
        //wait until the content-station screen is shown
        await $('#addContent').waitForDisplayed({timeout: 15000});

        await $('#item0').click();
        await $('#optionsBtn').waitForDisplayed();

        await removeMediaFromMediaPlayerWithId(0);

        await exitMediaStation();
        expect(await $('#syncFailed').isExisting()).toBe(false);
        expectReceivedDeleteMediaCommands(1);
    });

    it('there should have been sent an image-delete command if the image was added, synced, image removed, app closed, reopened, and synced again', async () => {
        resetCommandHistory();

        await openMediaStation(0);

        //open content 0
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");
        await syncMediaStation();
        await removeMediaFromMediaPlayerWithId(0);

        await restartApp();
        await openMediaStation(0);
        expect(await $('#item0 #mediaIcon0null')).toBeExisting();
        expectReceivedDeleteMediaCommands(1);
    });

    it('add image, remove it and add the same image again should work (there was a bug that this did not work)', async () => {
        //open content 0
        await $('#item0').click();
        await $('#addMediaBtn').waitForDisplayed();

        await addMediaToMediaPlayerWithId(0, "image");
        await removeMediaFromMediaPlayerWithId(0);
        await addMediaToMediaPlayerWithId(0, "image");
        expect(await $('#item0 #mediaTypeimage')).toBeExisting();
    });
});