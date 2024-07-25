<template>
  <BasePage
      :show-overlays="hasOverlays"
      :info-text="infoText"
      :input-dialog-data="inputDialogData"
      @close-input-dialog="closeAll">
    <template #overlays>
      <component v-if="showOptions" :is="fullScreenOptions" :options=activeRegisteredOptions :title="optionsOpenForTitle"
                 @close="closeAll" @option-selected="handleSelectedOption"/>
    </template>
    <template #column-1>
      <NavBarLeft :text="$t('appName')" :version="version" :has-sync-btn=false :has-exit-btn=false />
    </template>
    <template #column-2>
      <navBarTop title="" :has-refresh-btn=true :has-back-btn=false :show-search=false
                 @refresh-clicked="handleRefresh"/>
      <MainList v-if="mediaStations" :items="mediaStations" @item-clicked="onTryToOpenMediaStation"
                :items-clickable=true @options-clicked="handleOpenOptions">
        <template #right-content="{ item, index, itemId }">
          <div v-if="!item.wasSyncSuccessful" :id="'syncFailed'+item.id" class="sync-failed">
            {{ t('lastSyncFailed') }}
          </div>
          <ConnectionIndicator :is-ok="item.status"/>
          <Icon id="openMediaPlayer" name="settings" @click.stop="handleOpenAdmin(itemId)"/>
        </template>
      </mainList>
      <navBarBottom @btn-clicked="showNewMSDialog"
                    :buttons="[{text: t('mediaStation.addMediaStation'), icon: 'mediastation-add', id:'addMediaStation', isRed:false}]"
                    :btns-enabled="true"/>
    </template>
  </BasePage>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, onMounted, nextTick} from 'vue';
import {
  DownloadContentsResult,
  DownloadContentsStatus,
  IViewMediastation,
  MediaStationPresenter
} from "renderer/presenters/MediaStationPresenter.js";

import {useI18n} from 'vue-i18n';

import BasePage from "renderer/views/pages/BasePage.vue";
import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";
import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";
import NavBarBottom from "renderer/views/components/navBars/NavBarBottom.vue";
import MainList from "renderer/views/components/uiElements/lists/MainList.vue";
import fullScreenOptions from "renderer/views/components/fullScreenOverlays/FullScreenOptions.vue";
import {useOverlayManager} from "renderer/views/composables/useOverlayManager.js";
import {useOptions} from "renderer/views/composables/useOptions.js";
import ConnectionIndicator from "renderer/views/components/uiElements/ConnectionIndicator.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";
import {useSync} from "renderer/views/composables/useSync.js";

interface IMediaStationView {
  id: number
  title: string
  iconName: string
  status: boolean
  type: string
  cut:boolean
  hasOptions: boolean
  clickable: boolean
  wasSyncSuccessful: boolean
}

interface Props {
  mediaStationPresenter: MediaStationPresenter
  inputTimeoutSec:number
  showTimeOutInfo:boolean
  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['OpenMediaStationAdmin', 'OpenMediaStation']);
const {t} = useI18n();

//composables
const {infoText, showOptions, closeInfo, hasOverlays, closeAll, openInputDialog, inputDialogData} = useOverlayManager();
const {handleOpenOptions, handleSelectedOption, optionsOpenForId,
  optionsOpenForTitle, registerOption, activeRegisteredOptions} = useOptions(showOptions);
const {sync} = useSync();

registerOption(t('btnRename'), "edit", false, onRenameMediaStation);

let mediaStationSyncStatus: Map<number, boolean> = new Map();
let mediaStations = ref<IMediaStationView[]>([]);

onMounted(async () => {
  await loadMediaStations();
  await checkOnlineStatus(!props.showTimeOutInfo);

  if(props.showTimeOutInfo)
    onTimeout();
});

function onTimeout():void{
  infoText.value = t('mediaStationTimeOutPartOne') + (Math.round(props.inputTimeoutSec / 60 *  100) / 100).toString()
      + t('mediaStationTimeOutPartTwo');

  setTimeout(() => {
    infoText.value = "";
  }, 10000);
}

async function loadMediaStations(): Promise<void> {
  const raw: IViewMediastation[] = await props.mediaStationPresenter.loadSavedMediaStations();

  mediaStationSyncStatus = new Map();

  for (let i: number = 0; i < raw.length; i++) {
    let mediaStation: IViewMediastation = raw[i];
    mediaStationSyncStatus.set(mediaStation.id, await props.mediaStationPresenter.wasLastSyncSuccessful(mediaStation.id));
  }

  // Preserve existing status flags by id when rebuilding the list
  const prevById = new Map<number, IMediaStationView>(
      mediaStations.value.map((a:IMediaStationView) => [a.id, a])
  );

  mediaStations.value = raw.map(mediaStation => {
    const existing = prevById.get(mediaStation.id);
    return {
      id: mediaStation.id,
      title: mediaStation.title,
      iconName: 'mediastation',
      type: 'mediaStation',
      cut: false,
      hasOptions: true,
      clickable: true,
      wasSyncSuccessful: mediaStationSyncStatus.get(mediaStation.id) as boolean,
      status: existing ? existing.status : false,
    };
  });
}

function onRenameMediaStation() {
  closeAll();

    openInputDialog(t('mediaStation.renameMediaStation'), t('mediaStation.insertNewNameOfMediaStation'), handleSaveChangedName,
        optionsOpenForTitle.value);
}

async function handleSaveChangedName(name: string) {
  closeAll();
  await props.mediaStationPresenter.renameMediaStation(optionsOpenForId.value, name);
  await loadMediaStations();
}

function showNewMSDialog() {
  openInputDialog(t('mediaStation.addMediaStation'), t('mediaStation.insertNameOfMediaStation'), handleSaveNewMS);
}

async function handleSaveNewMS(name: string) {
  closeAll();
  await props.mediaStationPresenter.createMediaStation(name);
  await loadMediaStations();
}

function handleOpenAdmin(itemId: number) {
  emit('OpenMediaStationAdmin', itemId);
}

async function checkOnlineStatus(closeInfoAfterAll:boolean = true): Promise<void> {
  infoText.value = t('mediaStation.infoCheckOnlineStateOfMediaStations');

  for (const [key, item] of Object.entries(mediaStations.value))
    await updateMediaStationStatus(item as IMediaStationView);

  if(closeInfoAfterAll)
    closeInfo(1000);
}

async function updateMediaStationStatus(mediaStation: IMediaStationView) {
  infoText.value += t('mediaStation.checkMediaStation') + mediaStation.title + "...";
  await nextTick();
  const status: boolean = await props.mediaStationPresenter.checkOnlineStatusOfAllMediaPlayers(mediaStation.id);
  const original:IMediaStationView | undefined = mediaStations.value.find((ms:IMediaStationView) => ms.id === mediaStation.id);

  if (original)
    original.status = status;

  infoText.value += status ? t('mediaStation.mediaStationReachable') : t('mediaStation.mediaStationNotReachable');
}

async function onTryToOpenMediaStation(mediaStationId: number): Promise<void> {
  const lastSyncWasSuccessful: boolean = await props.mediaStationPresenter.wasLastSyncSuccessful(mediaStationId);

  if (lastSyncWasSuccessful) {
    infoText.value = t('mediaStation.checkConnectionToController');
    const downloadAnswer: DownloadContentsResult = await props.mediaStationPresenter.downloadContents(mediaStationId);
    const key: string = toDownloadMessageKey(downloadAnswer.status);
    let msg: string = t(key);

    if (downloadAnswer.status === DownloadContentsStatus.NoResponseFromController)
      msg += downloadAnswer.params?.ip;

    infoText.value += msg;

    if (downloadAnswer.status === DownloadContentsStatus.Success || downloadAnswer.status === DownloadContentsStatus.NoContentsOnController) {
      setTimeout(async () => {
        await onOpenMediaStation(mediaStationId);
      }, 500);
    } else {
      setMediaStationStatus(mediaStationId, false)
      closeInfo(1000);
    }

  } else {
    infoText.value = t('lastSyncFailedRetry');
    const syncSuccessful: boolean = await sync(props.mediaStationPresenter, mediaStationId, infoText, t);

    if (syncSuccessful)
      await onOpenMediaStation(mediaStationId);
    else {
      setMediaStationStatus(mediaStationId, false)
      closeInfo(1000);
    }
  }
}

function toDownloadMessageKey(status: DownloadContentsStatus): string {
  switch (status) {
    case DownloadContentsStatus.Success:
      return 'download.success'
    case DownloadContentsStatus.NoContentsOnController:
      return 'download.noContentsOnController'
    case DownloadContentsStatus.NoControllerIp:
      return 'download.noControllerIp'
    case DownloadContentsStatus.NoResponseFromController:
      return 'download.noResponseFromController'
    case DownloadContentsStatus.Other:
      return 'download.other'
  }
}

async function onOpenMediaStation(mediaStationId: number): Promise<void> {
  infoText.value = "";
  await props.mediaStationPresenter.connnectAndRegisterAllMediaPlayers(mediaStationId);
  emit('OpenMediaStation', mediaStationId);
}

function setMediaStationStatus(mediaStationId: number, status: boolean): void {
  let mediaStationEntry = mediaStations.value.find(mediaStation => mediaStation.id === mediaStationId);

  if(mediaStationEntry)
    mediaStationEntry.status = status;
}

async function handleRefresh() {
  await checkOnlineStatus();
}
</script>

<style scoped>
.sync-failed {
  color: var(--color-status-red);
  font-size: var(--font-size-medium);
}
</style>