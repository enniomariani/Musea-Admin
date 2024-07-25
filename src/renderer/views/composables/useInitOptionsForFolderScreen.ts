import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {useI18n} from 'vue-i18n';
import {Ref} from 'vue';

export function useInitOptionsForFolderScreen (mediaStationId:number, optionsOpenForId:Ref<number>,
                                               folderPresenter:FolderPresenter, registerDropDownOption:Function,
                                               registerOption:Function, allContentsAndFolders:Ref<any[]>) {

    const {t} = useI18n();
    const lightIntensityMapping = new Map<number, string>();
    lightIntensityMapping.set(0, t('folder.lightIntensity.low'));
    lightIntensityMapping.set(1, t('folder.lightIntensity.medium'));
    lightIntensityMapping.set(2, t('folder.lightIntensity.high'));

    function initContentFolderOptions(onCut:Function, onRename:Function, onDelete:Function):void{
        registerDropDownOption(t('folder.lightIntensityLabel'), "delete", handleChangeLightIntensity,
            [lightIntensityMapping.get(0)!, lightIntensityMapping.get(1)!, lightIntensityMapping.get(2)!],
            (id:number, title:string, type:string) => {
                const content = allContentsAndFolders.value.find((f: any) => f.type === "content" && f.id === id);
                const lightStr: string = lightIntensityMapping.get(content?.lightIntensity as number) as string;
                return lightStr;
            },
            (id:number, title:string, type:string) => type === "content");
        registerOption(t('folder.optionCut'), "cut", false, onCut);
        registerOption(t('btnRename'), "edit", false, onRename);
        registerOption(t('btnDelete'), "delete", true, onDelete);
    }

    async function handleChangeLightIntensity(text: string) {
        const key: number | undefined = findKeyForValue(lightIntensityMapping, text);
        folderPresenter.changeLightIntensityForContent(mediaStationId, optionsOpenForId.value, key as number);
    }

    function findKeyForValue(map: Map<number, string>, searchValue: string): number | undefined {
        for (const [key, value] of map.entries())
            if (value === searchValue)
                return key;

        return undefined;
    }

    return{
        initContentFolderOptions
    }
}