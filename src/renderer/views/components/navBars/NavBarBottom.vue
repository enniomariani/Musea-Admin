<template>
  <div class="nav-bar">
    <div class="line" />
    <div class="content">
      <div v-if="buttons && buttons.length >= 1 && btnsEnabled"
           :class="buttons && buttons.length > 1?'button-group':null">
        <button v-for="button in buttons" :key="button.id" :class="['button', button.isRed?'button--red':null]"
                :id="button.id" @click="btnClicked(button.id)">
          <Icon :name="button.icon" :color-main="button.isRed?'var(--color-status-red)': undefined"/>
          {{ button.text }}
        </button>
      </div>
      <div class="btn-disabled-text" v-else>
        {{ textBtnsDisabled }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits} from 'vue';
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Button {
  id: string
  icon: string
  text: string
  isRed: boolean
}

interface Props {
  buttons: Button[]
  btnsEnabled: boolean
  textBtnsDisabled?: string
}
defineProps<Props>();
const emit = defineEmits(['btnClicked']);

function btnClicked(id: string) {
  emit('btnClicked', id);
}

</script>

<style scoped>
.nav-bar {
  min-height: 88px;
  width: 100%;
  padding: 0 28px;
  display: flex;
  flex-direction: column;

  background-color: var(--color-background);
}

.content {
  height: 100%;
  min-width: max-content;
  flex-grow: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.line {
  margin-top: auto;
  height: 1px;
  width: 100%;
  background: var(--color-secondary-700);
}

.button-group {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  gap: 20px;
}

.button {
  padding: 27px 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  cursor: pointer;

  border: none;
  color: var(--color-main);
  background-color: rgba(0, 0, 0, 0);
}

.button--red {
  color: var(--color-status-red) !important;
}

.button:hover {
  background-color: var(--color-secondary-700);
}

.btn-disabled-text {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-status-red);
}

</style>