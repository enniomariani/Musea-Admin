<template>
  <div class="full-screen-input">
    <div class="header">
      <Icon id="closeBtn" class="close-btn"
            name="close-medium" color-second="var(--color-main)" @click="close"/>
      <div class="infoText">{{ title }}</div>
      <BaseBtn id="saveBtn" class="save-btn" :class="inputText===''?'save-btn--disabled':null" text-color="var(--color-primary-500-base)"
               bg-color="var(--color-primary-800)" bg-color-hover="var(--color-primary-800-hover)" @click.stop="save">
        {{ saveBtnName }}
      </BaseBtn>
    </div>
    <div class="input-wrapper">
      <div class="input-container">
        <input id="inputField" type="text" class="centered-input" v-model="inputText" :placeholder="placeHolderText"
               @keyup.enter="save" @keyup.esc="close" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, defineEmits, defineProps, onMounted} from 'vue';
import BaseBtn from "renderer/views/components/uiElements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Props {
  title: string
  saveBtnName: string
  placeHolderText: string
  text?: string
}
const props = withDefaults(defineProps<Props>(), {text: ''});
const emit = defineEmits(['save', 'close']);

const inputText = ref(props.text);

//set focus to input-field (did not work with Vue-methods unfortunately)
onMounted(() => {
  document.getElementById("inputField")?.focus();
});

function save() {
  if (inputText.value.trim() !== '')
    emit('save', inputText.value);
}

function close() {
  emit('close');
}
</script>

<style scoped>
.full-screen-input {
  width: 100%;
  height: 100%;
  background-color: black;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.header {
  width: 100%;
  height: 100px;
  padding: 0 37px;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.infoText {
  justify-self: center;

  color: var(--color-primary-500-base);
}

.close-btn {
  justify-self: start;
  cursor: pointer;
}

.save-btn {
  justify-self: end;
}

.save-btn--disabled {
  cursor: default !important;
  opacity: 0.4;
}

.input-wrapper {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.input-container {
  width: 422px;
  height: 88px;
  background-color: var(--color-popup);
  border-radius: var(--radius-popup);
  display: flex;
  justify-content: center;
  align-items: center;
}

.centered-input {
  width: 100%;
  height: 24px;
  margin: 32px;
  border: 0;
  padding: 4px;
  font-size: var(--font-size-medium);

  color: var(--color-on-popup);
}
</style>