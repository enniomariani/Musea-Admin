import {before, after} from "mocha";
import {
    removeAllSavedFiles, wssExpectedCommands,
    setupFunctionalMediaStationCommunication, resetCommandHistory, receivedCommandHistory
} from "./helperFunctions/HelperFunctions.ts";
import {
    exitMediaStation, openMediaPlayerAdmin,
    openMediaStation, restartApp, syncMediaStation
} from "./helperFunctions/HelperMediaStationScreen.ts";
import {
    addMediaPlayer, changeIpOfMediaPlayer, checkMediaPlayerEntry, renameMediaPlayer,
    waitUntilEditDisabled, waitUntilOptionsHiddenForListEntry
} from "./helperFunctions/HelperMediaPlayerScreen.ts";
import {addFolder, checkFolderEntry} from "./helperFunctions/HelperFolderScreen.ts";

/**
 *
 * GENERAL INFORMATION ABOUT THE TEST-STRUCTURE:
 *
 * - the state of the app remains changed between the tests, except if the describe-text states "New Scenario"
 * - if multiple tests in the same scenario fail: take a look at the first one, it could impact the others!
 */

process.env.TEST = 'true';

/**
 * add a mediastation to the main-screen and open the media-player view of it
 */
async function setup():Promise<void> {
    removeAllSavedFiles();
    await restartApp();

    await setupFunctionalMediaStationCommunication();
    resetCommandHistory();
}

before("removeAllSavedFilesAndFolders", () => {
    removeAllSavedFiles();
});

after("removeAllSavedFilesAndFolders", () => {
    removeAllSavedFiles();
});

describe('Add media players (controller reachable): ', () => {
    it('if the user adds a mediaPlayer it should be displayed on the list with the tag Controller and the correct IP-address', async () => {
        await setup();
        await openMediaPlayerAdmin(0);
        await checkMediaPlayerEntry(0, "Controller", "127.0.0.1", true, true, true)
    });

    it('if the user adds a mediaPlayer and aborts it after the FIRST screen, the displayed list should not change', async () => {
        await addMediaPlayer("Test-App2", "", true);
        await checkMediaPlayerEntry(0, "Controller", "127.0.0.1", true, true, true);
        expect(await $('#item1').isExisting()).toBe(false);
    });

    it('if the user adds a mediaPlayer and aborts it after the SECOND screen, the displayed list should not change', async () => {
        await addMediaPlayer("Test-App2", "not-reachable-ip-2", true, true);
        await checkMediaPlayerEntry(0, "Controller", "127.0.0.1", true, true, true)
        expect(await $('#item1').isExisting()).toBe(false);
        expect(await $('#closeBtn').isDisplayed()).toBe(false);
    });

    it('if the user adds a second mediaPlayer it should be displayed on the list WITHOUT the tag Controller and the not-reachable icons because it has a not valid ip', async () => {
        await addMediaPlayer("Test-MediaPlayer2", "not-reachable-ip2");

        //wait until the information-window about the connection is hidden again
        await $('#infoText').waitForDisplayed({timeout: 6000, reverse: true});

        await checkMediaPlayerEntry(0, "Controller", "127.0.0.1", true, true, true)
        await checkMediaPlayerEntry(1, "Test-MediaPlayer2", "not-reachable-ip2", false, false, false)
    });

    it('if the user adds a third app and registration is not possible, it shoulb be added with a red status-icon, however ip = green', async () => {
        wssExpectedCommands.set("network,isRegistrationPossible", ["network", "isRegistrationPossible", "no"])

        await addMediaPlayer("Test-MediaPlayer3", "127.0.0.1");

        //wait until the information-window about the connection is hidden again
        await $('#infoText').waitForDisplayed({timeout: 6000, reverse: true});

        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", false, true, false);
    });

    it('after clicking the refresh-button: the same status-icons should be displayed as before (except app 1 and 3 are also reachable now)', async () => {
        wssExpectedCommands.set("network,isRegistrationPossible", ["network", "isRegistrationPossible", "yes"])

        await $('#refreshBtn').click();
        await $('#infoText').isExisting();

        //wait until the information-window about the connection is hidden again
        await $('#infoText').waitForDisplayed({reverse: true});

        //necessary, otherwise this element was not updated in the DOM before the tests
        await browser.waitUntil(
            async () => await $('#item2 #statusIndicatorApp-green').isExisting(),
            {
                timeout: 6000, // Maximum wait time in milliseconds
                timeoutMsg: "element was not changed in the specified time!!"
            }
        );

        await checkMediaPlayerEntry(0, "Controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "Test-MediaPlayer2", "not-reachable-ip2", false, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });
});

describe('add a folder to test at the end if the sync did not overrwrite something', () => {
    it('add the folder', async () => {
        await exitMediaStation();
        await openMediaStation(0);
        await addFolder("test-folder");
        await syncMediaStation();

        await checkFolderEntry(0, "test-folder");

        await exitMediaStation();
    });
});

describe('renaming media-players: ', () => {
    it('renaming controller and media-player 2: changes should be displayed in the list', async () => {
        await openMediaPlayerAdmin(0);
        await renameMediaPlayer(0, "New controller")
        await renameMediaPlayer(1, "New media-player2 name")

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "not-reachable-ip2", false, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });

    it('renaming media-player 2, but abort it, no changes should have been made', async () => {
        await renameMediaPlayer(2, "New media-player3 name", true)

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "not-reachable-ip2", false, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });
});

describe('changing ips of media-players: ', () => {
    it('changing ip of media-player 2 but aborting it should change nothing', async () => {
        await changeIpOfMediaPlayer(2, "new IP!!!", true)

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "not-reachable-ip2", false, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });

    it('changing IP of media-player 2 to 127.0.0.1 should show that ping is possible', async () => {
        await changeIpOfMediaPlayer(1, "127.0.0.1")

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });

    it('changing IP of controller to an unreachable ip should disable changes for all media-players (except the controller)', async () => {
        await changeIpOfMediaPlayer(0, "unreachable-ip");

        await waitUntilEditDisabled();
        await waitUntilOptionsHiddenForListEntry(1);

        await checkMediaPlayerEntry(0, "New controller", "unreachable-ip", false, false, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false, false);

        expect(await $('#addMediaPlayer').isExisting()).toBe(false);
    });
});

describe('Now we have unsynced changes and the controller is not reachable: ', () => {
    it('restarting the app and opening the media-player window should display the same state as before', async () => {
        await restartApp();
        await openMediaPlayerAdmin(0);

        await checkMediaPlayerEntry(0, "New controller", "unreachable-ip", false, false, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false, false);

        expect(await $('#addMediaPlayer').isExisting()).toBe(false);
    });

    it('changing the controller-ip to 127.0.0.1 again...', async () => {
        await changeIpOfMediaPlayer(0, "127.0.0.1");

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });

    it('restarting the app should display the same state', async () => {
        await restartApp();
        await openMediaPlayerAdmin(0);

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);
    });

    it('because of the newly reachable controller, the contents should have been synced now', async () => {
        await restartApp();
        expect(await $('#syncFailed0').isExisting()).toBe(false);
    });
});

describe('Now simulate that the controller is not reachable after restarting the app: ', () => {
    it('restarting the app and opening the media-player window should display the same state as before', async () => {
        wssExpectedCommands.set("network,ping", ["network", "pingu"])
        wssExpectedCommands.set("network,register,admin", ["network", "registration", "rejected"])

        await restartApp();
        await openMediaPlayerAdmin(0);

        await checkMediaPlayerEntry(0, "Controller-App not reachable", "127.0.0.1", false, true, true);
        expect(await $('#item1').isExisting()).toBe(false);
        expect(await $('#item2').isExisting()).toBe(false);

        expect(await $('#addMediaPlayer').isExisting()).toBe(false);
    });

    it('refreshing when the controller is reachable again should show all other media-players again', async () => {
        wssExpectedCommands.set("network,ping", ["network", "pong"])
        wssExpectedCommands.set("network,register,admin", ["network", "registration", "accepted"])

        await restartApp();
        await openMediaPlayerAdmin(0);

        await checkMediaPlayerEntry(0, "New controller", "127.0.0.1", true, true, true);
        await checkMediaPlayerEntry(1, "New media-player2 name", "127.0.0.1", true, true, false);
        await checkMediaPlayerEntry(2, "Test-MediaPlayer3", "127.0.0.1", true, true, false);

        expect(await $('#addMediaPlayer').isExisting()).toBe(true);
    });
});

describe('check if folder is still here: ', () => {
    it('check folder', async () => {
        await restartApp();
        await openMediaStation(0);
        await checkFolderEntry(0, "test-folder");
    });
});

describe('New scenario: 1 mediastation, 1 controller (127.0.0.1) and 1 media-player (127.0.0.1): ', () => {
    it('after pressing the end-button, the controller should get the disconnect-commands (here we have only a controller)', async () => {
        await setup();

        await openMediaPlayerAdmin(0);
        resetCommandHistory();
        await exitMediaStation();

        //take a look at the console and search for this string to check why it did not work
        console.log("all received commands: ", receivedCommandHistory)

        //only one command is expected, because after the first unregister-command, the app closes the connection to the app
        //in the e2e-tests, all apps point to localhost/127.0.0.1, so after sending the first command, the other commands are not sent
        //additionally: after exiting the MS, all apps are checked for reachability, but should be disconnected at the end also
        expect(receivedCommandHistory[receivedCommandHistory.length - 1]).toEqual(['network', 'disconnect']);
    });

    it('after pressing the end-button, the mediastation should be synchronised and then NOT show the label syncFailed', async () => {
        await openMediaPlayerAdmin(0);
        await addMediaPlayer("Media-Player2", "127.0.0.1");

        await exitMediaStation();

        const foundContentsPutCommand: boolean = receivedCommandHistory.some((command: string[]) => command[0] === "contents" && command[1] === "put");

        expect(foundContentsPutCommand).toEqual(true);
        expect(await $('#syncFailed0').isExisting()).toBe(false);
    });

    it('after pressing the end-button, the mediastation should NOT be synchronised (because registration is rejected) and then show the label syncFailed', async () => {
        await openMediaPlayerAdmin(0);
        wssExpectedCommands.set("network,register,admin", ["network", "registration", "rejected"])
        await addMediaPlayer("Media-Player3", "127.0.0.1");
        await exitMediaStation();

        await $('#item0 #syncFailed0').waitForDisplayed();

        expect(await $('#item0 #syncFailed0').isExisting()).toBe(true);
    });
});