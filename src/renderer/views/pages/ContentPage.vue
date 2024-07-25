<template>
  <basePage
      :show-overlays="hasOverlays"
      :info-text="infoText">
    <template #overlays>
      <component v-if="showOptions" :is="fullScreenOptions" :options=activeRegisteredOptions :title="optionsOpenForTitle"
                 @close="closeAll" @option-selected="handleSelectedOption"/>
    </template>
    <template #column-1>
      <navBarLeft :has-sync-btn="true"
                  @sync-clicked="handleSync"
                  :text="mediaStationPresenter.getName(mediaStationId)"
                  :has-exit-btn="true"
                  @exit-clicked="handleExit"
                  :version="version"/>
    </template>
    <template #column-2>
      <navBarTop :has-refresh-btn=false :has-back-btn=true :show-search=false
                 @back-clicked="handleBack" :title="contentPresenter.getName(mediaStationId, contentId)"/>
      <mainList :items="allMedia" :items-clickable="false" @options-clicked="handleOpenOptions">
        <template #right-content="{ item, index, itemId }">
          <div class="fileName">{{ item.fileName }}</div>
          <div :id="'mediaType' + item.mediaType" class="icon">
            <Icon v-if="item.mediaType === 'image'" name="file-image-2"/>
            <Icon v-else-if="item.mediaType === 'video'" name="file-video-2"/>
          </div>
          <AddMediaBtn v-if="item.mediaType === null" @click.stop="handleOpenFile(item.id)" />
        </template>
      </mainList>
    </template>
  </basePage>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, onMounted, ref, nextTick} from 'vue';

import fullScreenOptions from "renderer/views/components/fullScreenOverlays/FullScreenOptions.vue";

import NavBarLeft from "renderer/views/components/navBars/NavBarLeft.vue";
import NavBarTop from "renderer/views/components/navBars/NavBarTop.vue";

import MainList from "renderer/views/components/uiElements/lists/MainList.vue";
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {FolderPresenter, IContentMediaInfo} from "renderer/presenters/FolderPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {ContentPresenter} from "renderer/presenters/ContentPresenter.js";
import {useI18n} from 'vue-i18n';
import Icon from "renderer/views/components/uiElements/Icon.vue";
import {useInactivity} from "renderer/views/composables/useInactivity.js";
import {useOverlayManager} from "renderer/views/composables/useOverlayManager.js";
import AddMediaBtn from "renderer/views/components/uiElements/btns/AddMediaBtn.vue";
import {useFilePicker} from "renderer/views/composables/useFilePicker.js";
import {useOptions} from "renderer/views/composables/useOptions.js";
import BasePage from "renderer/views/pages/BasePage.vue";
import {useSync} from "renderer/views/composables/useSync.js";

const {t} = useI18n();

interface Props {
  mediaStationId: number
  contentId: number
  mediaStationPresenter: MediaStationPresenter
  folderPresenter: FolderPresenter
  contentPresenter: ContentPresenter
  inactivityPresenter: InactivityPresenter
  version: string
}
const props = defineProps<Props>();
const emit = defineEmits(['Exit', 'Back']);

//use composables
useInactivity(props.inactivityPresenter);
const {infoText, showOptions, closeInfo, hasOverlays, closeAll} = useOverlayManager();
const {handleOpenFile} = useFilePicker(infoText, addMedia);
const {handleOpenOptions, handleSelectedOption, optionsOpenForId,
  optionsOpenForTitle, registerOption, activeRegisteredOptions} = useOptions(showOptions);
const {sync} = useSync();

const allMedia = ref<{
  id: number;
  title: string;
  type: string,
  mediaType: string | null,
  fileName: string | null,
  iconName: string,
  hasOptions: boolean,
  cut:boolean,
  clickable:boolean
}[]>([]);

registerOption(t('content.deleteMedia'), "delete", true, handleDeleteMedia);

onMounted(() => {
  updateMedia();
});

async function updateMedia(): Promise<void> {
  const loadedMedia: Map<number, IContentMediaInfo> = props.contentPresenter.getAllMediaForContent(props.mediaStationId, props.contentId);

  allMedia.value = [];
  await nextTick();
  loadedMedia.forEach((mediaInfo: IContentMediaInfo, key: number) => {
    allMedia.value.push({
      id: key, title: mediaInfo.mediaPlayerName, type: 'media',
      mediaType: mediaInfo.savedMedia, fileName: mediaInfo.fileName,
      iconName: 'media-pc', hasOptions: mediaInfo.savedMedia !== null,
      cut:false, clickable:false
    });
  });
}

async function handleSync() {
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  closeInfo(syncStatus?0:3000);
}

async function handleDeleteMedia() {
  closeAll();
  await props.contentPresenter.removeMedia(props.mediaStationId, props.contentId, optionsOpenForId.value);
  await updateMedia();
}

async function addMedia(mediaPlayerId: number, fileType: string, fileInstance: File, fileName: string, duration: number) {
  infoText.value += t('content.cachingFile');

  if (fileType === "image/png" || fileType === "image/jpeg")
    await props.contentPresenter.addImage(props.mediaStationId, props.contentId, mediaPlayerId, fileType, fileInstance, fileName);
   else if (fileType === "video/mp4")
    await props.contentPresenter.addVideo(props.mediaStationId, props.contentId, mediaPlayerId, duration, fileType, fileInstance, fileName);

  infoText.value = "";
  await updateMedia();
}

function handleBack() {
  emit('Back');
}

async function handleExit() {
  infoText.value = t('exitToMediaStation');
  const syncStatus: boolean = await sync(props.mediaStationPresenter, props.mediaStationId, infoText, t);
  infoText.value += t('closeConnectionToMediaPlayers');
  await props.mediaStationPresenter.unregisterAndCloseAllMediaPlayers(props.mediaStationId);
  closeInfo(syncStatus?0:3000, () => emit('Exit'));
}
</script>

<style scoped>
.icon {
  width: 32px;
  height: 32px;
}

.fileName {
  color: var(--color-main);
}
</style>