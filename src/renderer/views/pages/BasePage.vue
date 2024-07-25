<template>
  <div id="page">
    <div class="overlays" v-if="showOverlays">
      <component v-if="infoText !== ''"
                 :is="fullScreenInfo"
                 :text="infoText"/>
      <component
          v-if="inputDialogData && inputDialogData.show"
          :is="fullScreenInput"
          @save="inputDialogData.onComplete"
          @close="emit('CloseInputDialog')"
          :title="inputDialogData.title"
          :save-btn-name="inputDialogData.saveBtnName"
          :place-holder-text="inputDialogData.placeHolderText"
          :text="inputDialogData.text"
      />
      <slot name="overlays"></slot>
    </div>
    <div class="main-content">
      <div class="column-1">
        <slot name="column-1"></slot>
      </div>
      <div class="column-2">
        <slot name="column-2"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits} from 'vue';
import fullScreenInfo from "renderer/views/components/fullScreenOverlays/FullScreenInfo.vue";
import fullScreenInput from "renderer/views/components/fullScreenOverlays/FullScreenInput.vue";
import {IInputDialogData} from "renderer/views/composables/useOverlayManager.js";

interface Props {
  showOverlays: boolean
  infoText: string
  inputDialogData?:IInputDialogData
}
defineProps<Props>();
const emit = defineEmits(['CloseInputDialog']);
</script>

<style scoped>
#page {
  height: 100vh;
  width: 100vw;
  display: flex;
}

.overlays {
  position: fixed;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000;
}

.main-content {
  position: absolute;
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
}

.column-1 {
  flex-shrink: 0;
  width: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.column-2 {
  width: 100%;
  height: 100%;
  flex-grow: 1; /* Takes up more space compared to column-1 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>