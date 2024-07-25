import {FolderPresenter, ICompleteContentInfo, IContentMediaInfo} from "renderer/presenters/FolderPresenter.js";
import {ref, Ref, computed, nextTick} from 'vue';
import {useI18n} from 'vue-i18n';

export function useFolderNavigation(folderPresenter:FolderPresenter, mediaStationId:number, startFolderId:number, showBackBtn:Ref<boolean>,
                                    titleForBackBtn:Ref<string> ){

    const {t} = useI18n();
    const allContents = ref<{ id: number; title: string; type: string; lightIntensity: number, media: IContentMediaInfo[]
    }[]>([]);
    const allFolders = ref<{ id: number; title: string; type: string }[]>([]);
    const selectedFolderId = ref<number>(startFolderId);
    let activeSearchString:string|null = null;

    const allContentsAndFolders: any = computed(() => {
        // Map contents and add the content icon
        const mappedContents = allContents.value.map(content => ({
            ...content,
            iconName: 'content',
            type: 'content'
        }));

        // Map subFolders and add the subfolder icon
        const mappedSubFolders = allFolders.value.map(folder => ({
            ...folder,
            iconName: 'folder',
            type: 'subFolder'
        }));

        // Concatenate both arrays
        return [...mappedContents, ...mappedSubFolders];
    });

    async function displayFolder(mediaStationId: number, folderId: number): Promise<void> {
        let loadedContents: Map<number, ICompleteContentInfo> = folderPresenter.getAllContentsInFolder(mediaStationId, folderId);
        let loadedSubFolders: Map<number, string> = folderPresenter.getAllSubFoldersInFolder(mediaStationId, folderId);

        if (activeSearchString !== null) {
            await search(activeSearchString);
            return;
        }

        selectedFolderId.value = folderId;

        if (folderId === 0) {
            showBackBtn.value = false;
            titleForBackBtn.value = "";
        } else {
            showBackBtn.value = true;
            titleForBackBtn.value = folderPresenter.getNameOfFolder(mediaStationId, folderId);
        }

        await addAndSortFoldersAndContents(loadedSubFolders, loadedContents);
    }

    async function moveOneFolderUp() {
        const parentFolderId: number = folderPresenter.getIdOfParentFolder(mediaStationId, selectedFolderId.value);
        await displayFolder(mediaStationId, parentFolderId);
    }

    async function search(searchString: string): Promise<void> {
        activeSearchString = searchString;

        if (selectedFolderId.value !== 0) {
            titleForBackBtn.value = t('folder.searchResultsInFolder', {
                name: folderPresenter.getNameOfFolder(mediaStationId, selectedFolderId.value)
            });
        } else
            titleForBackBtn.value = t('folder.searchResultsWithColon');

        const foundContents: Map<number, ICompleteContentInfo> = folderPresenter.findContentsContainingString(mediaStationId, selectedFolderId.value, searchString);

        await addAndSortFoldersAndContents(null, foundContents);
    }

    async function resetSearch(): Promise<void> {
        activeSearchString = null;
        await displayFolder(mediaStationId, selectedFolderId.value);
    }

    async function addAndSortFoldersAndContents(folders: Map<number, string> | null, contents: Map<number, ICompleteContentInfo> | null): Promise<void> {
        let isItemCutOut: boolean;

        allContents.value.length = 0;
        allFolders.value.length = 0;

        await nextTick();

        contents?.forEach((contentInfo: ICompleteContentInfo, key: number) => {
            isItemCutOut = folderPresenter.isContentInClipboard(key);
            allContents.value.push(createContentListEntry(key, contentInfo.name, contentInfo.lightIntensity,
                contentInfo.media, isItemCutOut, !isItemCutOut, !isItemCutOut,
                'content', 'content'));
        });

        folders?.forEach((folderName: string, key: number) => {
            isItemCutOut = folderPresenter.isFolderInClipboard(key);
            allFolders.value.push(createFolderListEntry(key, folderName, isItemCutOut, !isItemCutOut,
                !isItemCutOut, 'subFolder', 'folder'));
        });

        allContents.value.sort(sortContentsByTitleAlphabetically);
        allFolders.value.sort(sortContentsByTitleAlphabetically);
    }

    function createContentListEntry(id: number, name: string, lightIntensity: number, media: IContentMediaInfo[], isCutOut: boolean, isClickable: boolean,
                                    hasOptions: boolean, type: string, icon: string): any {
        return {
            id: id, title: name, lightIntensity: lightIntensity,
            media: media, cut: isCutOut, clickable: isClickable, hasOptions: hasOptions,
            type: type, iconName: icon
        };
    }

    function createFolderListEntry(id: number, title: string, isCutOut: boolean, isClickable: boolean, hasOptions: boolean, type: string, icon: string): any {
        return {
            id: id, title: title, cut: isCutOut, clickable: isClickable,
            hasOptions: hasOptions, type: type, iconName: icon
        };
    }

    function sortContentsByTitleAlphabetically(a: any, b: any): number {
        return a.title.localeCompare(b.title);
    }

    return {
        displayFolder,
        moveOneFolderUp,
        search,
        resetSearch,
        selectedFolderId,
        allContentsAndFolders
    }
}