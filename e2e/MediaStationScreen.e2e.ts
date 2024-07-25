import {browser} from 'wdio-electron-service';
import {after} from "mocha";
import {removeAllSavedFiles, setupFunctionalMediaStationCommunication,} from "./helperFunctions/HelperFunctions.js";
import {
    addMediaStation, exitMediaStation, openMediaPlayerAdmin,
    openMediaStation, restartApp
} from "./helperFunctions/HelperMediaStationScreen.js";
import {addMediaPlayer} from "./helperFunctions/HelperMediaPlayerScreen.js";

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

describe('Electron Testing', () => {
    it('should print application title', async () => {
        console.log('Test / First Test: Hello', await browser.getTitle(), 'application!')
    });
});

describe('On the mediastation-screen, adding mediastations: ', () => {
    it('if the user adds a mediaStation it should be displayed on the list', async () => {
        await addMediaStation("Test-Medienstation");
        const firstMediaStationInList = await $('#item0');
        const exists:boolean = await firstMediaStationInList.isExisting();

        expect(exists).toBe(true);
        expect(await firstMediaStationInList.getText()).toBe("Test-Medienstation");
    });

    it('if the user starts adding a mediaStation and aborts the process, the list should not change', async () => {
        await addMediaStation("Test-Medienstation", true);
        const firstMediaStationInList = await $('#item0');
        expect(await firstMediaStationInList.getText()).toBe("Test-Medienstation");

        const secondMediaStationInList = await $('#item1');
        const exists:boolean = await secondMediaStationInList.isExisting();
        expect(exists).toBe(false);
    });

    it('if the user adds a second mediaStation it should also be added', async () => {
        await addMediaStation("Test-Medienstation2");
        const firstMediaStationInList = await $('#item0');
        expect(await firstMediaStationInList.getText()).toBe("Test-Medienstation");

        const secondMediaStationInList = await $('#item1');
        const exists:boolean = await secondMediaStationInList.isExisting();

        expect(exists).toBe(true);
        expect(await secondMediaStationInList.getText()).toBe("Test-Medienstation2");
    });

    it('it should reload the saved mediaStations when the app is restarted', async () => {
        await restartApp();
        const firstMediaStationInList = await $('#item0');
        const exists0:boolean = await firstMediaStationInList.isExisting();
        const secondMediaStationInList = await $('#item1');
        const exists1:boolean = await secondMediaStationInList.isExisting();

        expect(exists0).toBe(true);
        expect(await firstMediaStationInList.getText()).toBe("Test-Medienstation");

        expect(exists1).toBe(true);
        expect(await secondMediaStationInList.getText()).toBe("Test-Medienstation2");
    });
});

describe("on the mediastation-screen, opening the mediaPlayer-admin: ", ()=>{
    it('it should open the mediaPlayer screen if the user clicks on the openMediaPlayer icon', async () => {
        await openMediaPlayerAdmin(0);
        expect(await $('#navBarTitle').getText()).toBe("Test-Medienstation");
    });
});

describe("New Scenario (for each sub-test): on the mediastation-screen, opening the mediastation " , ()=>{
    async function setup(nameMediaStation:string, ipController:string) {
        removeAllSavedFiles();
        await restartApp();

        await addMediaStation(nameMediaStation);
        await openMediaPlayerAdmin(0);
        await addMediaPlayer("Controller", ipController);
        await exitMediaStation();
    }
    it('it should not open it if there is no controller defined', async () => {
        removeAllSavedFiles();
        await restartApp();
        await addMediaStation("Test-Medienstation- second scenario");
        await $('#item0').click();

        await $('#infoText').waitForDisplayed({ reverse: true, timeout: 5000});
        expect(await $('#addMediaStation').isExisting()).toBe(true);
    });

    it('it should not open it if a controller is defined, but it is not reachable', async () => {
        await setup("Test-Medienstation- second scenario", "not-reachable");

        await $('#item0').click();

        await $('#infoText').waitForDisplayed({ reverse: true, timeout: 10000});
        expect(await $('#addMediaStation').isExisting()).toBe(true);
    });

    it('it should open it if a controller is defined and is reachable and returns an empty json', async () => {
        await setupFunctionalMediaStationCommunication()
        await openMediaStation(0);
        expect(await $('#addMediaStation').isExisting()).toBe(false);
    });
});