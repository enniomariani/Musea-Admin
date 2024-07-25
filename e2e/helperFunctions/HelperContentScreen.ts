import {dirname, join} from 'path';
import {fileURLToPath} from "url";

export async function addMediaToMediaPlayerWithId(mediaPlayerId:number, type:string): Promise<void> {
    console.log("Test / Add Media to:", mediaPlayerId, type);

    await $('#item'+ mediaPlayerId.toString() +' #addMediaBtn').click();
    await addMedia(type);
}

export async function removeMediaFromMediaPlayerWithId(mediaPlayerId:number): Promise<void> {
    console.log("Test / Remove media from media player with id:" +  mediaPlayerId)
    await $('#item'+ mediaPlayerId.toString() +' #optionsBtn').click();
    await $('#option0').waitForDisplayed();

    await $('#option0').click();
    await $('#option0').waitForDisplayed({reverse:true});
}

async function addMedia(type:string): Promise<void> {
    const filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(filename);
    let filePath:string = "";

    if(type === "image")
        filePath = join(__dirname, '../testMedia/test.jpeg');
    else if(type === "video")
        filePath = join(__dirname, '../testMedia/test.mp4');

    const fileUpload = await $('#fileInput');
    await browser.execute(
        (el) => el.style.display = 'block',
        fileUpload
    );

    await fileUpload.waitForDisplayed();
    await fileUpload.setValue(filePath);
}

export async function checkMediaEntry(entryId: number, mediaPlayerName:string, fileName: string, mediaType:string | null): Promise<void> {
    let item: string = '#item' + entryId.toString();

    expect(await $(item + ' #title').getText()).toBe(mediaPlayerName);
    expect(await $(item + ' .fileName').getText()).toBe(fileName);

    if(mediaType === "image")
        expect(await $(item + ' #mediaTypeimage')).toBeExisting();
    else if(mediaType === "video")
        expect(await $(item + ' #mediaTypevideo')).toBeExisting();
    else
        expect(await $(item + ' #addMediaBtn').isDisplayed()).toBe(true);
}