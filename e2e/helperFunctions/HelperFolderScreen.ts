import type {ChainablePromiseElement} from 'webdriverio';
//the options-menu is a drop-down menu with multiple options. They are called by index. If a new option is included, other indeces may
//change their position. This can be done globally for the helper-functions in this file with the following contants:

//folder-options
const OPTION_MENU_FOLDER_POS_CUT: string = "0";
const OPTION_MENU_FOLDER_POS_RENAME: string = "1";
const OPTION_MENU_FOLDER_POS_DELETE: string = "2";

//content-options
const OPTION_MENU_CONTENT_POS_CUT: string = "1";
const OPTION_MENU_CONTENT_POS_RENAME: string = "2";
const OPTION_MENU_CONTENT_POS_DELETE: string = "3";

export async function addContent(name: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Add content: ", name, " closeFirstScreen: ", closeFirstScreen);
    await $('#addContent').click();

    await $('#inputField').setValue(name);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();

    await $('#infoText').waitForDisplayed({reverse: true, timeout: 6000});
}

export async function addFolder(name: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Add folder: ", name, " closeFirstScreen: ", closeFirstScreen);

    await $('#addFolder').click();
    await $('#inputField').setValue(name);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();
    await $('#infoText').waitForDisplayed({reverse: true, timeout: 6000});
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} itemIdInList
 * @returns {Promise<void>}
 */
export async function openFolder(itemIdInList: number): Promise<void> {
    console.log("Test / Open Folder. Id of folder in the list: ", itemIdInList);

    let folderName: string = await $('#item' + itemIdInList.toString() + ' #title').getText();

    await $('#item' + itemIdInList.toString()).click();

    await browser.waitUntil(async () => {
        return await $('#mainTitle').getText() === folderName
    });
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @param {string} newName
 * @param {boolean} closeFirstScreen
 * @returns {Promise<void>}
 */
export async function renameFolder(id: number, newName: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Rename Folder with id:", id, "new name:", newName, "closeFirstScreen:", closeFirstScreen);

    await _clickOptionMenuBtn(id, OPTION_MENU_FOLDER_POS_RENAME);

    await $('#inputField').setValue(newName);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();
    await $('#infoText').waitForDisplayed({reverse: true, timeout: 6000});
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @param {string} newName
 * @param {boolean} closeFirstScreen
 * @returns {Promise<void>}
 */
export async function renameContent(id: number, newName: string, closeFirstScreen: boolean = false): Promise<void> {
    console.log("Test / Rename Content with id:", id, "new name:", newName, "closeFirstScreen:", closeFirstScreen);

    await _clickOptionMenuBtn(id, OPTION_MENU_CONTENT_POS_RENAME);

    await $('#inputField').setValue(newName);

    if (closeFirstScreen) {
        await $('#closeBtn').click();
        return;
    }

    await $('#saveBtn').click();
    await $('#infoText').waitForDisplayed({reverse: true, timeout: 6000});
}

export async function clickBackBtn(parentFolderName: string): Promise<void> {
    console.log("Test / Click Back Button. Back-Button exists? ", await $('#backBtn').isExisting(), "Parent folder name: ", parentFolderName);

    await $('#backBtn').click();

    if (parentFolderName == "")
        await $('#mainTitle').waitForDisplayed({reverse: true});
    else
        await browser.waitUntil(async () => {
            return await $('#mainTitle').getText() === parentFolderName
        });
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteContent(id: number): Promise<void> {
    console.log("Test / Delete Content with id:", id);

    await _clickOptionMenuBtn(id, OPTION_MENU_CONTENT_POS_DELETE);
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function deleteFolder(id: number): Promise<void> {
    console.log("Test / Delete Folder with id:", id);

    await _clickOptionMenuBtn(id, OPTION_MENU_FOLDER_POS_DELETE);
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function cutContent(id: number): Promise<void> {
    console.log("Test / Cut Content with id:", id);

    await _clickOptionMenuBtn(id, OPTION_MENU_CONTENT_POS_CUT);
}

/**
 * the id is the list-item-id (including all contents and folders)
 * @param {number} id
 * @returns {Promise<void>}
 */
export async function cutFolder(id: number): Promise<void> {
    console.log("Test / Cut Folder with id:", id);

    await _clickOptionMenuBtn(id, OPTION_MENU_FOLDER_POS_CUT);
}

export async function pasteItem(): Promise<void> {
    console.log("Test / Paste cutted item");

    const pasteBtn: ReturnType<WebdriverIO.Browser["$"]> = $('#pasteItem');
    await pasteBtn.click();
    await pasteBtn.waitForExist({reverse: true});
}

export async function clearClipboard(): Promise<void> {
    console.log("Test / Clear Clipboard");

    const abortBtn: ReturnType<WebdriverIO.Browser["$"]> = $('#abort');
    await abortBtn.click();
    await abortBtn.waitForExist({reverse: true});
}

export async function checkFolderEntry(entryId: number, name: string): Promise<void> {
    let item: string = '#item' + entryId.toString();

    expect(await $(item + ' #title').getText()).toBe(name);
    expect(await $(item + ' #optionsBtn').isDisplayed()).toBe(true);
}

async function _clickOptionMenuBtn(id: number, positionInMenu: string): Promise<void> {
    const dropDownBtn: ReturnType<WebdriverIO.Browser["$"]> = $('#option' + positionInMenu);
    await $('#item' + id.toString() + ' #optionsBtn').click();
    await dropDownBtn.waitForDisplayed();

    await dropDownBtn.click();
    await dropDownBtn.waitForExist({reverse: true});
}