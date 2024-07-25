import {after} from "mocha";
import {removeAllSavedFiles, setupFunctionalMediaStationCommunication} from "./helperFunctions/HelperFunctions.js";
import {exitMediaStation, openMediaStation, restartApp,} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    addContent, addFolder, clearClipboard,
    clickBackBtn, cutContent, cutFolder, openFolder, pasteItem,
} from "./helperFunctions/HelperFolderScreen.js";

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

async function setup() {
    await setupFunctionalMediaStationCommunication();

    await openMediaStation(0);

    //initial content/folder-structure:
    await addContent("Test-Content-Cut 1");
    await addContent("Test-Content-Cut 2");
    await addContent("Test-Content-Cut 3");
    await addFolder("Test-Folder 1");
    await addFolder("Test-Folder 2");
    await addFolder("Test-Folder 3");
}

describe("New scenario: cut and paste contents: ", () => {
    it('should insert a content in a sub-folder', async () => {
        await setup();
        await cutContent(0);
        await openFolder(4);
        await pasteItem();
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
        await clickBackBtn("");
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item1 #title').getText()).toBe("Test-Content-Cut 3");
        expect(await $('#item2 #title').getText()).toBe("Test-Folder 1");

        //structure now:
        // content 2
        // content 3
        // folder 1
        // folder 2
        // -- content 1
        // folder 3
    });

    it('should insert another content in the same sub-folder', async () => {
        await cutContent(1);
        await openFolder(3);
        await pasteItem();
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content-Cut 3");
        await clickBackBtn("");
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item1 #title').getText()).toBe("Test-Folder 1");
        expect(await $('#item2 #title').getText()).toBe("Test-Folder 2");

        //structure now:
        // content 2
        // folder 1
        // folder 2
        // -- content 1
        // -- content 3
        // folder 3
    });

    it('should cut the first content again and move it into another sub-folder', async () => {
        await openFolder(2);
        await cutContent(0);
        await clickBackBtn("");
        await openFolder(3);
        await pasteItem();
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");  //inside folder Test-Folder 3
        await clickBackBtn("");
        await openFolder(2);
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 3"); //inside folder Test-Folder 2
        await clickBackBtn("");

        //structure now:
        // content 2
        // folder 1
        // folder 2
        // -- content 3
        // folder 3
        // -- content 1
    });

    it('restart the app and check if everything was correctly sent and received again', async () => {
        await exitMediaStation();
        await restartApp();
        await openMediaStation(0);
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item1 #title').getText()).toBe("Test-Folder 1");
        expect(await $('#item2 #title').getText()).toBe("Test-Folder 2");
        expect(await $('#item3 #title').getText()).toBe("Test-Folder 3");
        await openFolder(2);
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 3");
        await clickBackBtn("");
        await openFolder(3);
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
    });
});

describe("New scenario: cut and paste folders: ", () => {
    it('should insert a folder in a sub-folder', async () => {
        await setup();
        await openFolder(3);
        await addContent("Sub-Content Folder 1");
        await clickBackBtn("");

        //structure now:
        // content 1
        // content 2
        // content 3
        // folder 1
        // -- Sub-Content 1
        // folder 2
        // folder 3

        await cutFolder(3);
        await openFolder(4);
        await pasteItem();
        await clickBackBtn("");

        //structure now:
        // content 1
        // content 2
        // content 3
        // folder 2
        // -- folder 1
        // ---- Sub-Content 1
        // folder 3

        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item2 #title').getText()).toBe("Test-Content-Cut 3");
        expect(await $('#item3 #title').getText()).toBe("Test-Folder 2");
        expect(await $('#item4 #title').getText()).toBe("Test-Folder 3");
        await openFolder(3);
        expect(await $('#item0 #title').getText()).toBe("Test-Folder 1");
        await openFolder(0);
        expect(await $('#item0 #title').getText()).toBe("Sub-Content Folder 1");
    });

    it('move folder 3 into folder 1', async () => {
        await clickBackBtn("Test-Folder 2");
        await clickBackBtn("");
        await cutFolder(4);
        await openFolder(3);
        await openFolder(0);
        await pasteItem();

        //structure now:
        // content 1
        // content 2
        // content 3
        // folder 2
        // -- folder 1
        // ---- Sub-Content 1
        // ---- folder 3

        expect(await $('#item0 #title').getText()).toBe("Sub-Content Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Folder 3");
        await clickBackBtn("Test-Folder 2");
        expect(await $('#item0 #title').getText()).toBe("Test-Folder 1");
        await clickBackBtn("");

        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item2 #title').getText()).toBe("Test-Content-Cut 3");
        expect(await $('#item3 #title').getText()).toBe("Test-Folder 2");
    });

    it('if a folder is cut out it should not be able to paste it inside itself', async () => {
        await cutFolder(3);
        await $('#item3').click();

        browser.pause(200);

        //should stay on the highest level because the folder-click did nothing
        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");

        await clearClipboard();

        await openFolder(3);    //now it should work because the folder we are clicking is no longer cut out
        expect(await $('#item0 #title').getText()).toBe("Test-Folder 1");

        //structure now:
        // content 1
        // content 2
        // content 3
        // folder 2
        // -- folder 1
        // ---- Sub-Content 1
        // ---- folder 3
    });

    it('restart the app and check if everything was correctly sent and received again', async () => {
        await exitMediaStation();
        await restartApp();
        await openMediaStation(0);

        //structure now:
        // content 1
        // content 2
        // content 3
        // folder 2
        // -- folder 1
        // ---- Sub-Content 1
        // ---- folder 3

        expect(await $('#item0 #title').getText()).toBe("Test-Content-Cut 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Content-Cut 2");
        expect(await $('#item2 #title').getText()).toBe("Test-Content-Cut 3");
        expect(await $('#item3 #title').getText()).toBe("Test-Folder 2");
        await openFolder(3);
        expect(await $('#item0 #title').getText()).toBe("Test-Folder 1");
        await openFolder(0);

        expect(await $('#item0 #title').getText()).toBe("Sub-Content Folder 1");
        expect(await $('#item1 #title').getText()).toBe("Test-Folder 3");
    });
});