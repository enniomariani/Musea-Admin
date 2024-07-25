<template>
  <div class="back-btn">
    <button v-if="hasButton" id="backBtn" class="btn" @click="btnClicked()">
      <Icon name="icon-nav-arrow-left" />
    </button>
    <div id="mainTitle" class="title" v-if="text !== null && text !== ''">{{ text }}</div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits} from 'vue';
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Props {
  text: string
  hasButton:boolean
}
defineProps<Props>();
const emit = defineEmits(['onClick']);

function btnClicked() {
  emit('onClick');
}

</script>

<style scoped>
.back-btn{
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;

  gap: 12px;
}

.btn {
  width: 32px;
  height: 32px;

  display: flex;
  justify-content: center;
  align-items: center;

  cursor: pointer;
  border: none;
  background-color: rgba(0, 0, 0, 0);
}

.title {
  color: var(--color-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>