export async function addMediaPlayer(name: string, ip: string, closeFirstScreen: boolean = false, closeSecondScreen: boolean = false): Promise<void> {
    console.log("Test / Add Media Player: ", name, " IP: ", ip, " closeFirstScreen: ", closeFirstScreen, " closeSecondScreen: ", closeSecondScreen);

    await $('#addMediaPlayer').click();

    await $('#inputField').setValue(name);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();

    await $('#inputField').setValue(ip);

    if (closeSecondScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();
    await browser.pause(500);

    await $('#infoText').waitForDisplayed({reverse: true});
    console.log("Test / Add Media Player: Media Player added.");
}

export async function renameMediaPlayer(entryId: number, newName: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Rename Media Player: ", entryId, " new Name: ", newName, " closeFirstScreen: ", closeFirstScreen);

    await $('#item' + entryId.toString() + ' #optionsBtn').click();
    await $('#option1').waitForDisplayed();

    await $('#option1').click();
    await $('#option1').waitForDisplayed({reverse: true});

    await $('#inputField').setValue(newName);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();

    await $('#infoText').waitForDisplayed({reverse: true, timeout: 6000});
}

export async function changeIpOfMediaPlayer(entryId: number, newIp: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Change IP of Media Player: ", entryId, " new IP: ", newIp, " closeFirstScreen: ", closeFirstScreen);

    await $('#item' + entryId.toString() + ' #optionsBtn').click();
    await $('#option0').waitForDisplayed();

    await $('#option0').click();
    await $('#option0').waitForDisplayed({reverse: true});

    await $('#inputField').setValue(newIp);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();

    await $('#infoText').waitForDisplayed({reverse: true});
}

export async function checkMediaPlayerEntry(entryId: number, name: string, ip: string, isAppReachable: boolean, isPCreachable: boolean, isController: boolean, optionsEnabled:boolean = true): Promise<void> {
    let item: string = '#item' + entryId.toString();

    expect(await $(item + ' #title').getText()).toBe(name);
    expect(await $(item + ' #ipAddress').getText()).toBe(ip);

    if(isAppReachable)
        expect(await $(item + ' #statusIndicatorApp-green').isExisting()).toBe(true);
    else
        expect(await $(item + ' #statusIndicatorApp-red').isExisting()).toBe(true);

    expect(await $(item + ' #statusIndicatorPC').getAttribute("class")).toContain(isPCreachable ? "circle-green" : "circle-red");
    expect(await $(item + ' #optionsBtn').isDisplayed()).toBe(optionsEnabled);

    expect(await $(item + ' #isController').isExisting()).toBe(isController);
}

export async function waitUntilOptionsHiddenForListEntry(entry:number): Promise<void> {
    const item: string = '#item' + entry.toString();
    // Wait for bottom bar disabled hint to become visible (text for disabled state)
    await browser.waitUntil(async () => {
        return !await $(item + ' #optionsBtn').isDisplayed();
    }, {timeoutMsg: 'Options-Button was not hidden inside timeout for item: ' + entry });
}

export async function waitUntilEditDisabled(): Promise<void> {
    // Wait for bottom bar disabled hint to become visible (text for disabled state)
    await browser.waitUntil(async () => {
        return !await $('#addMediaPlayer').isExisting();
    }, { timeoutMsg: 'Edit did not become disabled for non-controller items' });
}