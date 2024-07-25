import {Browser, CDPSession} from "puppeteer-core";

export async function getCDPSession():Promise<CDPSession> {
    const pptr:Browser = await browser.getPuppeteer();
    // ensure a renderer page exists
    const pages = await pptr.pages();
    if (!pages.length) throw new Error('No renderer page found yet');
    const page = pages[0]; // pick the correct window if you have multiple
    return await page.target().createCDPSession();
}

export async function setVirtualTime(dateMs: number, client:CDPSession):Promise<boolean> {
    console.log("Test / Set virtual time to: ", dateMs, " ms");

    try {
        await client.send('Emulation.setVirtualTimePolicy', {
            policy: 'pause',
            initialVirtualTime: dateMs
        });
        return true;
    } catch (error) {
        console.warn('Virtual time not supported, falling back to real time:', error);
        return false;
    }
}

export async function advanceVirtualTime(ms: number, client:CDPSession):Promise<void> {
    console.log("Test / Advance virtual time by: ", ms, " ms");

    // Use "advance" to move time forward; here you can specify starvation count
    await client.send('Emulation.setVirtualTimePolicy', {
        policy: 'advance',
        budget: ms,
        maxVirtualTimeTaskStarvationCount: 900000
    });
}

export async function disableVirtualTime(client:CDPSession): Promise<void> {
    console.log("Test / Disable virtual time");

    // Method 1: Try to disable by setting policy without initialVirtualTime
    try {
        await client.send('Emulation.setVirtualTimePolicy', {
            policy: 'pauseIfNetworkFetchesPending'
            // Explicitly NOT setting initialVirtualTime
        });
    } catch (e) {
        console.warn('Failed to reset virtual time policy:', e);
    }

    // Method 2: Detach and recreate the CDP session (more thorough)
    // This is the nuclear option that definitely clears virtual time
    try {
        await client.detach();
    } catch (e) {
        console.warn('Failed to detach CDP session:', e);
    }
}