import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {Ref, ref} from 'vue';

export function useClipboard(folderPresenter:FolderPresenter,mediaStationId:number, selectedFolderId:Ref<number>, idToCut:Ref<number>) {

    const hasItemsInClipBoard = ref<string|null>(null);

    function cut(type:string){
        if (type === "content") {
            folderPresenter.handleCutContent(idToCut.value);
            hasItemsInClipBoard.value = "content";
        } else if (type === "subFolder") {
            folderPresenter.handleCutFolder(idToCut.value);
            hasItemsInClipBoard.value = "folder";
        }
    }

    function paste(){
        if(hasItemsInClipBoard.value === null)
            return;

        folderPresenter.handlePaste(mediaStationId, selectedFolderId.value);
        hasItemsInClipBoard.value = null;
    }

    function clearClipboard(){
        folderPresenter.handleClearClipboard();
        hasItemsInClipBoard.value = "";
    }

    return{
        cut,
        paste,
        clearClipboard,
        hasItemsInClipBoard,
    }
}