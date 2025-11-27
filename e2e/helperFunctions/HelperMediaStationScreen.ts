import {advanceVirtualTime, disableVirtualTime, getCDPSession, setVirtualTime} from "./HelperSkipTime.js";
import {CDPSession} from "puppeteer-core";

export async function addMediaStation(name: string, closeBeforeSaving: boolean = false): Promise<void> {
    await $('#addMediaStation').click();
    await $('#inputField').setValue(name);

    console.log("Test / Create new media station: ", name)

    if (closeBeforeSaving)
        await $('#closeBtn').click();
    else
        await $('#saveBtn').click();
}

export async function openMediaStation(id: number): Promise<void> {
    console.log("Test / Open Mediastation: ", id);

    await $('#item' + id.toString()).waitForDisplayed();
    //open mediastation
    await $('#item' + id.toString()).click();
    //wait until the content-station screen is shown
    await $('#addContent').waitForDisplayed();
}

export async function openMediaPlayerAdmin(mediaStationId: number): Promise<void> {
    console.log("Test / Open media-player Admin for MS-ID: ", mediaStationId)

    await $('#item' + mediaStationId.toString() + ' #openMediaPlayer').click();

    //wait until the media-player screen is shown
    if (await $('#addMediaStation').isDisplayed())
        await $('#addMediaStation').waitForDisplayed({reverse: true});

    await $('#infoText').waitForDisplayed({reverse: true});
}

export async function exitMediaStation(skipTime: number | null = null): Promise<void> {
    console.log("Test / Exit Mediastation. Skip time:", skipTime);

    let usingVirtualTime: boolean = false;
    let cdpSession: CDPSession | null = null;

    if (skipTime !== null) {
        cdpSession = await getCDPSession();
        usingVirtualTime = await setVirtualTime(new Date(2021, 3, 14).getTime(), cdpSession);
    }

    // Add wait for clickable (ensures click will work)
    await $('#exitBtn').waitForClickable({ timeout: 60000 });
    await $('#exitBtn').click();

    // Give click time to register (CI needs more time)
    await browser.pause(process.env.CI === 'true' ? 2000 : 500);

    if (cdpSession !== null && skipTime !== null && usingVirtualTime) {
        await advanceVirtualTime(skipTime, cdpSession);
        await disableVirtualTime(cdpSession);
    }

    try {
        await $('#addMediaStation').waitForDisplayed();
    } catch (e) {
        console.log('Test / FAILURE STATE:');
        console.log('Test / #addMediaStation exists:', await $('#addMediaStation').isExisting());
        console.log('Test / #exitBtn still exists:', await $('#exitBtn').isExisting());
        throw e;
    }

    try{
        await $('#item0').waitForDisplayed();
    } catch(e){
        console.log('Test / FAILURE STATE:');
        console.log('Test / #addMediaStation exists:', await $('#addMediaStation').isExisting());
        console.log('Test / #exitBtn still exists:', await $('#exitBtn').isExisting());
        console.log('Test / #item0 exists:', await $('#item0').isExisting());
        console.log('Test / #item0 is displayed:', await $('#item0').isDisplayed());
        throw e;
    }

    console.log("Test / Mediastation left.");
}

export async function syncMediaStation(): Promise<void> {
    console.log("Test / Sync MediaStation. Does sync-button exist? ", await $('#syncBtn').isExisting());

    await $('#syncBtn').click();

    //wait until the media-station screen is shown
    await $('#infoText').waitForDisplayed({reverse: true});
    console.log("Test / Sync MediaStation complete.");
}

export async function restartApp(): Promise<void> {
    console.log("Test / Restart App");
    await browser.reloadSession();
    await $('#addMediaStation').waitForDisplayed();
}