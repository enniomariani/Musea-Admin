import {ref, computed} from 'vue';
import {useI18n} from 'vue-i18n';

export interface IInputDialogData {
    show: boolean;
    title: string;
    saveBtnName: string;
    placeHolderText: string;
    text:string;
    onComplete: (name: string) => void;
}

export function useOverlayManager() {
    const {t} = useI18n();
    const infoText = ref("");
    const showOptions = ref(false);
    const selectedItemName = ref("");

    const inputDialogData = ref<IInputDialogData>({
        show: false,
        title: '',
        saveBtnName: '',
        placeHolderText: '',
        text: '',
        onComplete: (name: string) => {},
    });

    const hasOverlays = computed(() =>
        infoText.value !== '' || showOptions.value || inputDialogData.value.show
    );

    function openInputDialog(title:string, placeHolderText: string, onComplete: (name: string) => void,  text:string = "", saveBtnName: string = t('btnSave')): void {
        inputDialogData.value = {
            show: true, title: title, placeHolderText: placeHolderText, text:text,
            saveBtnName: saveBtnName, onComplete: onComplete
        };
    }

    function closeAll() {
        showOptions.value = false;
        inputDialogData.value.show = false;
        closeInfo(0);
    }

    function closeInfo(timeoutMS: number = 0, onComplete?: () => void) {
        if (timeoutMS === 0) {
            infoText.value = "";
            onComplete?.();
            return;
        }

        setTimeout(() => {
            infoText.value = "";
            onComplete?.();
        }, timeoutMS);
    }

    return {
        hasOverlays,

        openInputDialog,
        inputDialogData,

        showOptions,
        selectedItemName,

        infoText,
        closeInfo,
        closeAll
    };
}