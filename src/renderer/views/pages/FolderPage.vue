<template>
  <basePage
      :showOverlays="hasOverlays"
      :info-text="infoText"
      :input-dialog-data="inputDialogData"
      @close-input-dialog="closeAll">
    <template #overlays>
      <component v-if="showOptions"
                 :is="fullScreenOptions"
                 :options=activeRegisteredOptions
                 :title="optionsOpenForTitle"
                 @close="onCloseOptions"
                 @option-selected="handleSelectedOption"
                 @drop-down-selected="handleSelectedDropDown"/>
    </template>
    <template #column-1>
      <navBarLeft :has-sync-btn=true @sync-clicked="handleSync"
                  :text="props.mediaStationPresenter.getName(props.mediaStationId)"
                  :has-exit-btn=true @exit-clicked="handleExit" :version="version"/>
    </template>
    <template #column-2>
      <navBarTop ref="navBarTopRef" :has-refresh-btn=false :has-back-btn="showBackBtn" :title="titleForBackBtn" :show-search=true
                 @back-clicked="moveOneFolderUp" @search="handleSearch" @abort-search="handleAbortSearch"/>
      <mainList :items="allContentsAndFolders" :items-clickable=true @item-clicked="handleOpenItem"
                @options-clicked="handleOpenOptions">
        <template #right-content="{ item, index, itemId }">
          <div v-for="media in item.media" :key="media.id">
            <mediaPlayerItem :media="media"/>
          </div>
        </template>
      </mainList>
      <navBarBottom @btn-clicked="handleBottomBtnClick" :buttons="activeBottomButtons" :btns-enabled="showBottomBtns"/>
    </template>
  </basePage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, computed, onMounted} from 'vue';

import MainList from "renderer/views/components/uiElements/lists/MainList.vue";
import fullScreenOptions from "renderer/views/components/fullScreenOverlays/FullScreenOptions.vue";

import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";
import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";
import NavBarBottom from "renderer/views/components/navBars/NavBarBottom.vue";

import MediaPlayerItem from "renderer/views/components/uiElements/lists/MediaPlayerItem.vue";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {useI18n} from 'vue-i18n';
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {useInactivity} from "renderer/views/composables/useInactivity.js";
import {useOverlayManager} from "renderer/views/composables/useOverlayManager.js";
import {useOptions} from "renderer/views/composables/useOptions.js";
import {useClipboard} from "renderer/views/composables/useClipboard.js";
import {useFolderNavigation} from "renderer/views/composables/useFolderNavigation.js";
import {useInitOptionsForFolderScreen} from "renderer/views/composables/useInitOptionsForFolderScreen.js";
import BasePage from "renderer/views/pages/BasePage.vue";
import {useSync} from "renderer/views/composables/useSync.js";

interface Props {
  mediaStationId: number
  selectedFolderId: number
  searchString: string | null
  mediaStationPresenter: MediaStationPresenter
  folderPresenter: FolderPresenter
  inactivityPresenter: InactivityPresenter
  version: string
}

const props = defineProps<Props>();
const emit = defineEmits(['Exit', 'OpenContent']);
const {t} = useI18n();

const showBackBtn = ref(false);
const titleForBackBtn = ref("");
const navBarTopRef = ref();

//composables
const {search, resetSearch, allContentsAndFolders, displayFolder, selectedFolderId, moveOneFolderUp} =
    useFolderNavigation(props.folderPresenter, props.mediaStationId, props.selectedFolderId, showBackBtn, titleForBackBtn);
useInactivity(props.inactivityPresenter);
const {infoText, showOptions, closeInfo, hasOverlays, closeAll, openInputDialog, inputDialogData} = useOverlayManager();
const {
  handleOpenOptions, handleSelectedOption, optionsOpenForId, optionsOpenForType,
  optionsOpenForTitle, registerOption, registerDropDownOption, activeRegisteredOptions, handleSelectedDropDown
} = useOptions(showOptions);
const {initContentFolderOptions} = useInitOptionsForFolderScreen(props.mediaStationId, optionsOpenForId, props.folderPresenter,
    registerDropDownOption, registerOption, allContentsAndFolders);
const {cut, paste, clearClipboard, hasItemsInClipBoard} =
    useClipboard(props.folderPresenter, props.mediaStationId, selectedFolderId, optionsOpenForId);
const {sync} = useSync();

initContentFolderOptions(handleCut, handleRename, handleDelete)
let showBottomBtns = ref(true);

const addButtons = [
  {text: t('folder.addBtnContent'), icon: 'add-content', id: 'addContent', isRed: false},
  {text: t('folder.addBtnFolder'), icon: 'add-folder', id: 'addFolder', isRed: false}
];

const pasteButtonsContent = [
  {text: t('folder.pasteBtnContent'), icon: 'paste-content', id: 'pasteItem', isRed: false},
  {text: t('btnAbort'), icon: 'abort', id: 'abort', isRed: true}
];

const pasteButtonsFolder = [
  {text: t('folder.pasteBtnFolder'), icon: 'paste-folder', id: 'pasteItem', isRed: false},
  {text: t('btnAbort'), icon: 'abort', id: 'abort', isRed: true}
];

const activeBottomButtons = computed(() => {
      switch (hasItemsInClipBoard.value) {
        case "content":
          return pasteButtonsContent;
        case "folder":
          return pasteButtonsFolder;
        default:
          return addButtons;
      }
    }
);

onMounted(async () => {
  await displayFolder(props.mediaStationId, props.selectedFolderId);

  if(props.searchString !== null)
    navBarTopRef.value.setFocusToSearchField(props.searchString);
});

async function handleCut() {
  cut(optionsOpenForType.value);
  await displayFolder(props.mediaStationId, selectedFolderId.value);

  onCloseOptions();
}

function handleBottomBtnClick(btnId: string) {
  if (btnId === "addContent")
    openInputDialog(t('folder.addContentTitle'), t('folder.placeholderContentName'), handleSaveNewContent);
  else if (btnId === "addFolder")
    openInputDialog(t('folder.addFolderTitle'), t('folder.placeholderFolderName'), handleSaveNewFolder);
  else if (btnId === "pasteItem") {
    paste();
    displayFolder(props.mediaStationId, selectedFolderId.value);
  } else if (btnId === "abort") {
    clearClipboard();
    displayFolder(props.mediaStationId, selectedFolderId.value);
  }
}

async function handleSaveNewFolder(name: string) {
  closeAll();
  props.folderPresenter.createFolder(props.mediaStationId, selectedFolderId.value, name);
  await displayFolder(props.mediaStationId, selectedFolderId.value);
}

async function handleSaveNewContent(name: string) {
  closeAll();
  props.folderPresenter.createContent(props.mediaStationId, selectedFolderId.value, name);
  await displayFolder(props.mediaStationId, selectedFolderId.value);
}

async function handleOpenItem(id: number, name: string, type: string) {
  if (type === "content"){
    clearClipboard();
    emit('OpenContent', props.folderPresenter.getFolderIdOfContent(props.mediaStationId, id),
        id, navBarTopRef.value.getActualSearchString());
  }
  else if (type === "subFolder")
    await displayFolder(props.mediaStationId, id);
}

function handleRename() {
  closeAll();

  if (optionsOpenForType.value === "content")
    openInputDialog(t('folder.renameContentTitle'), t('folder.placeholderNewContentName'), handleSaveChangedName,
        optionsOpenForTitle.value);
  else if (optionsOpenForType.value === "subFolder")
    openInputDialog(t('folder.renameFolderTitle'), t('folder.placeholderNewFolderName'), handleSaveChangedName,
        optionsOpenForTitle.value);
}

async function handleSaveChangedName(name: string) {
  if (optionsOpenForType.value === "content")
    props.folderPresenter.renameContent(props.mediaStationId, optionsOpenForId.value, name);
  else if (optionsOpenForType.value === "subFolder")
    props.folderPresenter.renameFolder(props.mediaStationId, optionsOpenForId.value, name);

  await displayFolder(props.mediaStationId, selectedFolderId.value);

  onCloseOptions();
}

async function handleDelete() {
  onCloseOptions();

  if (optionsOpenForType.value === "content")
    await props.folderPresenter.deleteContent(props.mediaStationId,
        props.folderPresenter.getFolderIdOfContent(props.mediaStationId, optionsOpenForId.value), optionsOpenForId.value);
  else if (optionsOpenForType.value === "subFolder")
    await props.folderPresenter.deleteFolder(props.mediaStationId, optionsOpenForId.value);

  await displayFolder(props.mediaStationId, selectedFolderId.value);
}

function onCloseOptions() {
  closeAll();

  if(navBarTopRef.value.getActualSearchString() !== null)
    navBarTopRef.value.setFocusToSearchField();
}

async function handleSearch(searchString: string) {
  showBottomBtns.value = false;
  showBackBtn.value = false;
  await search(searchString);
}

async function handleAbortSearch() {
  showBottomBtns.value = true;
  await resetSearch();
}

async function handleSync() {
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  closeInfo(syncStatus ? 0 : 3000);
}

async function handleExit() {
  clearClipboard();
  infoText.value = t('exitToMediaStation');
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  infoText.value += t('closeConnectionToMediaPlayers');
  await props.mediaStationPresenter.unregisterAndCloseAllMediaPlayers(props.mediaStationId);
  closeInfo(syncStatus ? 0 : 3000, () => emit('Exit'));
}
</script>