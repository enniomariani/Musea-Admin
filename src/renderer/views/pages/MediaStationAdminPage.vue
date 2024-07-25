<template>
  <basePage
      :showOverlays="hasOverlays"
      :info-text="infoText"
      :input-dialog-data="inputDialogData"
      @close-input-dialog="closeAll">
    <template #overlays>
      <component v-if="showOptions" :is="fullScreenOptions" :options="activeRegisteredOptions" :title="optionsOpenForTitle"
                 @close="closeAll"
                 @option-selected="handleSelectedOption"/>
    </template>
    <template #column-1>
      <navBarLeft :has-sync-btn=true @sync-clicked="handleSync" :text="mediaStationPresenter.getName(mediaStationId)"
                  :has-exit-btn=true @exit-clicked="handleExit" :version="version"/>
    </template>
    <template #column-2>
      <navBarTop :has-refresh-btn=true :has-back-btn=false :show-search=false
                 :title="t('mediaPlayer.mediaPlayerAdmin')" @refresh-clicked="handleRefresh"/>
      <mainList v-if="allMediaPlayers" :items="allMediaPlayers" :items-clickable=false
                @options-clicked="handleOpenOptions">
        <template #right-content="{ item, index, itemId }">
          <div id="isController" class="is-controller" v-if="item.isController">Controller</div>
          <div :id="'statusIndicatorApp' + (item.statusApp ? '-green':'-red')">
            <Icon :name="item.statusApp?'ping-media-player':'ping-red-media-player'"></Icon>
          </div>
          <div id="ipAddress" class="ip-address">{{ item.ip }}</div>
          <ConnectionIndicator id="statusIndicatorPC" :is-ok="item.statusPC"/>
        </template>
      </mainList>
      <navBarBottom @btn-clicked="showNewMediaPlayerDialoge"
                    :buttons="[{text: t('mediaPlayer.addMediaPlayer'), icon: 'media-pc-add', id: 'addMediaPlayer', isRed:false}]"
                    :text-btns-disabled="t('mediaPlayer.changesAreOnlyPossibleIfControllerIsReachable')"
                    :btns-enabled="editMediaPlayersEnabled"/>
    </template>
  </basePage>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, onMounted, ref, nextTick} from 'vue';

import BasePage from "renderer/views/pages/BasePage.vue";
import MainList from "renderer/views/components/uiElements/lists/MainList.vue";
import fullScreenOptions from "renderer/views/components/fullScreenOverlays/FullScreenOptions.vue";

import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";
import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";
import NavBarBottom from "renderer/views/components/navBars/NavBarBottom.vue";

import {
  DownloadContentsResult,
  MediaStationPresenter
} from "renderer/presenters/MediaStationPresenter.js";
import {IViewMediaPlayer, MediaPlayerPresenter} from "renderer/presenters/MediaPlayerPresenter.js";
import Icon from "renderer/views/components/uiElements/Icon.vue";

import {useI18n} from 'vue-i18n';
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {useInactivity} from "renderer/views/composables/useInactivity.js";
import {useOverlayManager} from "renderer/views/composables/useOverlayManager.js";
import ConnectionIndicator from "renderer/views/components/uiElements/ConnectionIndicator.vue";
import {useOptions} from "renderer/views/composables/useOptions.js";
import {
  ConnectionStep,
  IConnectionProgress,
  MediaPlayerConnectionStatus,
  StepState
} from "musea-client/renderer";
import {useSync} from "renderer/views/composables/useSync.js";

interface IMediaPlayerView {
  id: number
  ip: string
  title: string
  type: string
  iconName: string
  isController: boolean

  statusApp: boolean
  statusPC: boolean
  hasOptions: boolean
}

interface Props {
  mediaStationPresenter: MediaStationPresenter
  inactivityPresenter: InactivityPresenter
  mediaPlayerPresenter: MediaPlayerPresenter
  mediaStationId: number
  version: string
}

const props = defineProps<Props>();
const emit = defineEmits(['Exit']);
const {t} = useI18n();

//composables
useInactivity(props.inactivityPresenter);
const {infoText, showOptions, closeInfo, hasOverlays, closeAll, openInputDialog, inputDialogData} = useOverlayManager();
const {handleOpenOptions, handleSelectedOption, optionsOpenForId,
  optionsOpenForTitle, registerOption, activeRegisteredOptions} = useOptions(showOptions);
const {sync} = useSync();

registerOption(t('changeIpAddress'), "settings", false, onChangeIpAddress);
registerOption(t('btnRename'), "edit", false, onChangeName, ()=>editMediaPlayersEnabled.value);

const editMediaPlayersEnabled = ref(true);
const selectedMediaPlayer = ref("");
const allMediaPlayers: any = ref<IMediaPlayerView[]>([]);

let newName: string = "";

onMounted(async () => {
  reloadMediaPlayers();
  await checkAllConnections();
});

function reloadMediaPlayers() {
  const raw: IViewMediaPlayer[] = props.mediaPlayerPresenter.getAllMediaPlayers(props.mediaStationId);
  // Preserve existing status flags by id when rebuilding the list
  const prevById = new Map<number, IMediaPlayerView>(
      allMediaPlayers.value.map((a: IMediaPlayerView) => [a.id, a])
  );

  allMediaPlayers.value = raw.map(mediaPlayer => {
    const existing = prevById.get(mediaPlayer.id);
    return {
      id: mediaPlayer.id,
      ip: mediaPlayer.ip,
      title: mediaPlayer.title,
      isController: mediaPlayer.isController,
      iconName: 'media-pc',
      type: 'media-player',
      hasOptions: mediaPlayer.id === 0 ? true : editMediaPlayersEnabled.value,
      statusPC: existing ? existing.statusPC : false,
      statusApp: existing ? existing.statusApp : false
    };
  });
}

function onChangeIpAddress() {
  closeAll();
    openInputDialog(t('changeIpAddress'), t('mediaPlayer.insertNewIpForMediaPlayer'), handleSaveChangedIp);
}

function onChangeName() {
  closeAll();
  openInputDialog(t('mediaPlayer.renameMediaPlayer'), t('mediaPlayer.insertNewNameForMediaPlayer'), handleSaveChangedName, selectedMediaPlayer.value);
}

function handleSaveChangedName(name: string) {
  closeAll();
  props.mediaPlayerPresenter.renameMediaPlayer(props.mediaStationId, optionsOpenForId.value, name);
  reloadMediaPlayers();
}

async function handleSaveChangedIp(newIp: string) {
  closeAll();

  await props.mediaPlayerPresenter.changeIpOfMediaPlayer(props.mediaStationId, optionsOpenForId.value, newIp,
      await props.mediaStationPresenter.wasLastSyncSuccessful(props.mediaStationId), props.mediaStationPresenter.contentsDownloadedInThisSession);
  reloadMediaPlayers();

  if (optionsOpenForId.value === 0)
    await checkAllConnections();
   else {
    infoText.value = "";
    const connectionSuccesfulOpened: boolean = await checkConnectionAndRegister(props.mediaStationId, optionsOpenForId.value, newIp);
    closeInfo(connectionSuccesfulOpened ? 0 : 3000);
  }
}

function showNewMediaPlayerDialoge() {
  openInputDialog(t('mediaPlayer.addMediaPlayer'), t('mediaPlayer.insertNameOfMediaPlayer'), handleSaveName, "",
      t('btnContinue2'));
}

async function handleSaveName(name: string) {
  newName = name;
  closeAll();
  await nextTick();
  openInputDialog(t('mediaPlayer.addMediaPlayer'), t('mediaPlayer.insertIpOfMediaPlayer'), onNewMediaPlayerAdded, "");
  await nextTick();
}

async function onNewMediaPlayerAdded(ip: string) {
  closeAll();

  const newId: number = await props.mediaPlayerPresenter.createMediaPlayer(props.mediaStationId, newName, ip);
  reloadMediaPlayers();
  const connectionSuccessfulOpened: boolean = await checkConnectionAndRegister(props.mediaStationId, newId, ip);
  closeInfo(connectionSuccessfulOpened ? 0 : 3000);
}

async function handleSync() {
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  if(syncStatus) await checkAllConnections();
  closeInfo(syncStatus ? 0 : 3000);
}

async function handleRefresh() {
  await checkAllConnections();
}

async function handleExit() {
  infoText.value = t('exitToMediaStation');
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  infoText.value += t('closeConnectionToMediaPlayers');
  await props.mediaStationPresenter.unregisterAndCloseAllMediaPlayers(props.mediaStationId);
  closeInfo(syncStatus ? 0 : 3000, () => {emit('Exit')});
}

async function checkAllConnections(): Promise<void> {
  let downloadAnswer: DownloadContentsResult;
  let connectionEstablished: boolean;
  let allConnectionsEstablished: boolean = true;

  if (allMediaPlayers.value.length === 0)
    return;

  connectionEstablished = await checkConnectionAndRegister(props.mediaStationId, 0, allMediaPlayers.value[0].ip);

  if (connectionEstablished) {
    editMediaPlayersEnabled.value = true;
    if (await props.mediaStationPresenter.wasLastSyncSuccessful(props.mediaStationId)) {
      infoText.value += t('mediaPlayer.checkConnDownloadAppInformation');
      downloadAnswer = await props.mediaStationPresenter.downloadContents(props.mediaStationId);
      infoText.value += downloadAnswer.status + "\n";
    } else {
      infoText.value += t('mediaPlayer.checkConnControllerConnected');
      await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
    }
  } else {
    allConnectionsEstablished = false;
    editMediaPlayersEnabled.value = false;
  }

  reloadMediaPlayers();
  await nextTick();

  //connect to all other media apps
  for (let mediaPlayer of allMediaPlayers.value) {
    if (mediaPlayer.id === 0)
      continue;

    connectionEstablished = await checkConnectionAndRegister(props.mediaStationId, mediaPlayer.id, mediaPlayer.ip);

    if (!connectionEstablished)
      allConnectionsEstablished = false;
  }

  closeInfo(allConnectionsEstablished ? 0 : 3000);
}

async function checkConnectionAndRegister(mediaStationId: number, mediaPlayerId: number, mediaPlayerIp: string): Promise<boolean> {
  infoText.value += t('mediaPlayer.checkConnTo') + mediaPlayerIp;

  const mediaPlayer: IMediaPlayerView = allMediaPlayers.value.find((app: IMediaPlayerView) => app.id === mediaPlayerId);
  mediaPlayer.statusPC = false;
  mediaPlayer.statusApp = false;

  await nextTick();
  const connectionStatus: MediaPlayerConnectionStatus = await props.mediaPlayerPresenter.checkConnection(mediaPlayerIp, (p: IConnectionProgress) => onConnectionProgress({
    p: p,
    mediaPlayer: mediaPlayer
  }));
  await nextTick();

  if (connectionStatus === MediaPlayerConnectionStatus.Online) {
    infoText.value += t('mediaPlayer.checkConnToRegister');
    const wasRegistrationSuccess: boolean = await props.mediaPlayerPresenter.connectAndRegisterMediaPlayer(mediaStationId, mediaPlayerId);
    mediaPlayer.statusApp = wasRegistrationSuccess;

    infoText.value += wasRegistrationSuccess ? t('mediaPlayer.checkConnToRegisterSuccess') : t('mediaPlayer.checkConnToRegisterFail');
    return wasRegistrationSuccess;
  } else {
    mediaPlayer.statusApp = false;
    return false;
  }
}

function onConnectionProgress({p, mediaPlayer}: { p: IConnectionProgress, mediaPlayer: IMediaPlayerView }): void {
  switch (p.step) {
    case ConnectionStep.IcmpPing:
      onConnectionStep(t('mediaPlayer.checkConnPingPC'), p.state);
      mediaPlayer.statusPC = p.state === StepState.Succeeded;
      mediaPlayer.statusApp = false; //set status of app to false, if it is reachable it will be set to true later
      break;
    case ConnectionStep.TcpConnect:
      onConnectionStep(t('mediaPlayer.checkConnCheckTcp'), p.state);
      break;
    case ConnectionStep.WsPing:
      onConnectionStep(t('mediaPlayer.checkConnWsPing'), p.state);
      break;
    case ConnectionStep.Register:
      onConnectionStep(t('mediaPlayer.checkConnRegistration'), p.state);
      break;
  }
}

function onConnectionStep(startText: string, stepState: StepState): void {
  switch (stepState) {
    case StepState.Started:
      infoText.value += startText;
      break;
    case StepState.Succeeded:
      infoText.value += t('mediaPlayer.checkConnStepOK');
      break;
    case StepState.Failed:
      infoText.value += t('mediaPlayer.checkConnStepFail');
      break;
    default:
      throw new Error("Unknown step state: " + stepState);
  }
}
</script>

<style scoped>
.is-controller {
  color: var(--color-primary-500-base);
  font-size: var(--font-size-medium);
}

.ip-address {
  color: var(--color-main);
  font-size: var(--font-size-medium);
}
</style>