import { Ref} from 'vue';
import {useI18n} from 'vue-i18n';

export function useFilePicker(infoText:Ref<string>, onAddMedia:(mediaPlayerId: number, fileType: string, fileInstance: File, fileName: string, duration: number) => Promise<void>) {

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

                    let duration: number | null = null;

                    if (file.type === "video/mp4") {
                        url = URL.createObjectURL(file);
                        video = document.createElement("video");
                        video.preload = "metadata";

                        const onLoadedMetaData = async () => {
                            duration = video.duration;
                            video.removeEventListener("loadedmetadata", onLoadedMetaData);
                            video.src = "";
                            URL.revokeObjectURL(url);
                            files = null;
                            await onAddMedia(idToLoadNewMedia, file!.type, file!, file!.name, duration as number);
                        };

                        video.addEventListener("loadedmetadata", onLoadedMetaData);
                        video.src = url;
                    } else
                        await onAddMedia(idToLoadNewMedia, file.type, file, file.name, null as unknown as number);
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