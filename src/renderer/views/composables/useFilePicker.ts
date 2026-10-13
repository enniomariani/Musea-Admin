import {Ref} from 'vue';
import {useI18n} from 'vue-i18n';
import { createFile, MP4BoxBuffer } from "mp4box";

export interface ISubtitle{
    lang:string
    title:string
}

export interface IMediaInfo{
    mediaPlayerId: number
    fileType: string
    fileInstance: File
    fileName: string
}

// Reads only the metadata (moov box) of an MP4 and returns its subtitle tracks.
async function getSubtitleTracks (file: File):Promise<any[] | undefined>  {
    const mp4 = createFile();
    const chunk:number = 1024 * 1024;
    let tracks: any[] | undefined, error: unknown;

    // Fires as soon as mp4box has parsed the moov box (track info),
    // before the media data itself is read.
    mp4.onReady = (info) => (tracks = info.subtitleTracks);
    mp4.onError = (e) => (error = e);

    // Feed the file in chunks and stop as soon as the metadata is parsed.
    for (let pos = 0; tracks === undefined && !error && pos < file.size; ) {
        // file.slice() is lazy: only this byte range is read from disk.
        const buf = await file.slice(pos, pos + chunk).arrayBuffer();

        // fromArrayBuffer tags the chunk with its position in the file (fileStart),
        // so mp4box knows where it belongs.
        // appendBuffer returns the next offset mp4box wants. If moov is at the end,
        // it skips over the huge mdat and jumps straight there.
        //when the whole moov box was parsed, appendBuffer calls onReady() and passes the info
        pos = mp4.appendBuffer(MP4BoxBuffer.fromArrayBuffer(buf, pos));
    }
    mp4.flush();

    if (error) throw error;
    return tracks;
};

export function useFilePicker(infoText: Ref<string>,
                              onAddImage: (mediaInfo:IMediaInfo) => Promise<void>,
                              onAddVideo: (mediaInfo:IMediaInfo, duration: number, subtitles:ISubtitle[]) => Promise<void>) {

    const {t} = useI18n();

    async function handleOpenFile(id: number) {
        let input: HTMLInputElement;
        let idToLoadNewMedia: number;
        let file: File | null, files: File[] | null, video: HTMLVideoElement, url: string;

        idToLoadNewMedia = id;

        input = document.createElement('input');
        input.accept = "image/png, image/jpeg, video/mp4";
        input.type = 'file';
        input.id = 'fileInput';
        input.style.display = 'none';
        document.body.appendChild(input);

        const onChange = async () => {
            try {
                if (!input.files) {
                    infoText.value = "";
                    return;
                }
                files = Array.from(input.files);

                if (files.length > 0) {
                    file = files[0];

                    infoText.value = t('content.openFile') + file.name;
                    infoText.value += t('content.loadingFile');


                    if (file.type === "video/mp4") {
                        const tracks:any[] | undefined = await getSubtitleTracks(file);
                        let subtitles:ISubtitle[] = [];
                        let duration: number | null = null;

                        if(tracks) {
                            tracks.forEach((track) => {
                                const sub: ISubtitle = {lang: track.language, title: track.name};
                                subtitles.push(sub);
                            });
                        }

                        url = URL.createObjectURL(file);
                        video = document.createElement("video");
                        video.preload = "metadata";

                        const onLoadedMetaData = async () => {
                            duration = video.duration;
                            video.removeEventListener("loadedmetadata", onLoadedMetaData);
                            video.src = "";
                            URL.revokeObjectURL(url);
                            files = null;
                            await onAddVideo({mediaPlayerId: idToLoadNewMedia, fileType: file!.type, fileInstance: file!, fileName: file!.name}, duration as number, subtitles);
                        };

                        video.addEventListener("loadedmetadata", onLoadedMetaData);
                        video.src = url;
                    } else
                        await onAddImage({mediaPlayerId: idToLoadNewMedia, fileType: file.type, fileInstance: file, fileName: file.name});
                } else
                    infoText.value = "";
            } finally {
                // Clean up this input instance
                input.removeEventListener('change', onChange);
                if (input.parentNode) input.parentNode.removeChild(input);
            }
        };

        input.addEventListener('change', onChange, {once: true});
        input.click();
    }

    return {handleOpenFile}
}