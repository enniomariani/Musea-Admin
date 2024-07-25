<template>
  <Suspense>
    <MediaStationPage v-if="activeScreen === Screen.MediaStation" :media-station-presenter="mediaStationPresenter"
                      :show-time-out-info="showTimeOutInfo"
                      :version="version" :input-timeout-sec="inputTimeoutSec" @open-media-station="onOpenMediaStation"
                      @open-media-station-admin="onOpenMediaStationAdmin"></MediaStationPage>
    <MediaStationAdminPage v-if="activeScreen === Screen.MediaStationAdmin"
                           :media-station-presenter="mediaStationPresenter"
                           :media-player-presenter="mediaPlayerPresenter"
                           :inactivity-presenter="inactivityPresenter"
                           :media-station-id="selectedMediaStationId" :version="version"
                           @exit="onExitMediaStation"></MediaStationAdminPage>
    <FolderPage v-if="activeScreen === Screen.Folder"
                :selected-folder-id="selectedFolderId"
                :search-string="actualFolderSearchString"
                :media-station-presenter="mediaStationPresenter"
                :inactivity-presenter="inactivityPresenter"
                :folder-presenter="folderPresenter"
                :media-station-id="selectedMediaStationId" :version="version"
                @exit="onExitMediaStation" @open-content="onOpenContent"></FolderPage>
    <ContentPage v-if="activeScreen === Screen.Content"
                 :media-station-presenter="mediaStationPresenter"
                 :inactivity-presenter="inactivityPresenter"
                 :folder-presenter="folderPresenter"
                 :content-presenter="contentPresenter"
                 :media-station-id="selectedMediaStationId"
                 :content-id="selectedContentId"
                 :version="version"
                 @exit="onExitMediaStation"
                 @back="onBackFromContent"></ContentPage>
  </Suspense>
</template>

<script setup lang="ts">
import {MediaStationPresenter} from "renderer/presenters/MediaStationPresenter.js";
import {FolderPresenter} from "renderer/presenters/FolderPresenter.js";
import {InactivityPresenter} from "renderer/presenters/InactivityPresenter.js";
import {ContentPresenter} from "renderer/presenters/ContentPresenter.js";
import {MediaPlayerPresenter} from "renderer/presenters/MediaPlayerPresenter.js";
import MediaStationPage from "renderer/views/pages/MediaStationPage.vue";
import MediaStationAdminPage from "renderer/views/pages/MediaStationAdminPage.vue";
import FolderPage from "renderer/views/pages/FolderPage.vue";
import ContentPage from "renderer/views/pages/ContentPage.vue";
import {nextTick, onMounted, ref} from "vue";

enum Screen {
  MediaStation, MediaStationAdmin, Folder, Content
}

interface Props {
  mediaStationPresenter: MediaStationPresenter
  inactivityPresenter: InactivityPresenter
  mediaPlayerPresenter: MediaPlayerPresenter
  folderPresenter: FolderPresenter
  contentPresenter: ContentPresenter

  inputTimeoutSec: number
  version: string
}
const props = defineProps<Props>();

const activeScreen = ref(Screen.MediaStation);
const showTimeOutInfo = ref(false);

const selectedMediaStationId = ref();
const selectedFolderId = ref();
const selectedContentId = ref();

const actualFolderSearchString = ref<string | null>(null);

onMounted((() => {
  props.inactivityPresenter.init(props.inputTimeoutSec, onInputTimeout);
  props.inactivityPresenter.setResetGuard(() => !props.mediaStationPresenter.isSyncing);
}));

function onOpenMediaStation(mediaStationId: number): void {
  selectedMediaStationId.value = mediaStationId;
  selectedFolderId.value = 0;
  activeScreen.value = Screen.Folder;

  props.inactivityPresenter.resetAndStart();
}

function onOpenContent(folderId: number, contentId: number, actualSearchString: string | null): void {
  selectedFolderId.value = folderId;
  selectedContentId.value = contentId;
  actualFolderSearchString.value = actualSearchString;

  activeScreen.value = Screen.Content;
}

function onBackFromContent(): void {
  activeScreen.value = Screen.Folder;
}

function onOpenMediaStationAdmin(mediaStationId: number): void {
  selectedMediaStationId.value = mediaStationId;
  activeScreen.value = Screen.MediaStationAdmin;
  props.inactivityPresenter.resetAndStart();
}

async function onExitMediaStation(): Promise<void> {
  actualFolderSearchString.value = null;
  props.inactivityPresenter.stop();
  activeScreen.value = Screen.MediaStation;
}

async function onInputTimeout(): Promise<void> {
  showTimeOutInfo.value = true;
  await nextTick();
  activeScreen.value = Screen.MediaStation;
}

</script>