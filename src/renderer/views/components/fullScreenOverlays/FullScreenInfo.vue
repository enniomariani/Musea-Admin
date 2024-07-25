<template>
  <div class="full-screen-info">
    <div class="info-container">
      <div class="scroll-container">
        <div id="infoText" class="centered-text">{{ text }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps} from 'vue';

interface Props {
  text: string
}
defineProps<Props>();
</script>

<style scoped>
.full-screen-info {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.info-container {
  width: 500px;
  height: 200px;
  background-color: var(--color-popup);
  border-radius: var(--radius-popup);
  padding: 32px;
  overflow: hidden;
}

.scroll-container {
  max-height: 100%;
  display: flex;
  flex-direction: column-reverse;
  overflow-y: auto;
}

.centered-text {
  line-height: normal;
  word-wrap: break-word;
  white-space: pre-line;

  color: var(--color-on-popup);
}
</style>