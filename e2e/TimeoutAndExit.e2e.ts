import {after} from "mocha";
import {removeAllSavedFiles, setupFunctionalMediaStationCommunication} from "./helperFunctions/HelperFunctions.js";
import {openMediaPlayerAdmin, openMediaStation} from "./helperFunctions/HelperMediaStationScreen.js";
import {
    advanceVirtualTime,
    disableVirtualTime,
    getCDPSession,
    setVirtualTime
} from "./helperFunctions/HelperSkipTime.js";
import {CDPSession} from "puppeteer-core";

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
}

describe("Check if timeout to exit to main-screen after X seconds work", () => {
    it('should exit from the folder screen', async () => {
        await setup();
        await openMediaStation(0);

        const start:number = new Date(2021, 3, 14).getTime(); // 2021-04-14 local
        const cdpSession:CDPSession = await getCDPSession();
        await setVirtualTime(start, cdpSession);

        // Sanity check
        await browser.execute(() => Date.now());

        await advanceVirtualTime(30 * 60 * 1000, cdpSession);
        await browser.pause(100);
        await advanceVirtualTime(30 * 60 * 1000, cdpSession);       //after 60 minutes, the station should be logged out --> see main-app file for time

        expect(await $('#infoText').isExisting()).toBe(true);

        await advanceVirtualTime(10 * 1000 + 200, cdpSession);      //the info-text should be displayed this long
        await disableVirtualTime(cdpSession);
        expect(await $('#addMediaStation').isExisting()).toBe(true);
    });

    it('should exit from the mediastation-admin screen', async () => {
        await setup();
        await openMediaPlayerAdmin(0);

        const start:number = new Date(2021, 3, 14).getTime(); // 2021-04-14 local
        const cdpSession:CDPSession = await getCDPSession();
        await setVirtualTime(start, cdpSession);

        // Sanity check
        await browser.execute(() => Date.now());

        await advanceVirtualTime(30 * 60 * 1000, cdpSession);
        await browser.pause(100);
        await advanceVirtualTime(30 * 60 * 1000, cdpSession);       //after 60 minutes, the station should be logged out --> see main-app file for time

        expect(await $('#infoText').isExisting()).toBe(true);

        await advanceVirtualTime(10 * 1000 + 200, cdpSession);      //the info-text should be displayed this long
        await disableVirtualTime(cdpSession);
        expect(await $('#addMediaStation').isExisting()).toBe(true);
    });
});