<template>
  <div class="full-screen-options">
    <div class="window-container">
      <div class="title-container">
        <div id="title" class="title">{{ title }}</div>
          <Icon name="icon-close" class="close-btn" @click.stop="close"/>
      </div>
      <div class="options-container">
        <div :id="'option' + index" v-for="(option, index) in options" :key="index"
             class="option" @click.stop="handleOptionClick(option.text)">
          <Icon v-if="option.icon" :name="option.icon" :color-main="option.isRed?'var(--color-status-red)':
           'var(--color-on-popup)'" />
          <div v-if="!option.dropDownOptions" id="option-text" :class="[option.isRed? 'option-text--red': 'option-text']">{{ option.text }}</div>
          <div v-else id="dropdown" class="dropdown-option" v-show="option.dropDownOptions">
            <div id="dropdown-text" class="dropdown-label" @click.stop >{{ option.text }}</div>
            <component v-if="option.dropDownOptions" :is="DropDown" :options="option.dropDownOptions"
                       :selected-option="option.selectedOption" @selected="handleDropDownClick"/>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, defineProps} from 'vue';

import DropDown from "renderer/views/components/uiElements/DropDown.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Option{
  isRed:boolean
  text:string
  icon:string
  dropDownOptions?:any
  selectedOption?:string
  any?:any
}

interface Props {
  title: string
  options: Option[]
}
defineProps<Props>();
const emit = defineEmits(['close', 'optionSelected', 'dropDownSelected']);

function close() {
  emit('close');
}

function handleDropDownClick(optionSelected:string){
  emit('dropDownSelected', optionSelected);
}

function handleOptionClick(text:string) {
  emit('optionSelected', text);
}
</script>

<style scoped>
.full-screen-options {
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.window-container {
  width: 422px;
  background-color: var(--color-popup);
  border-radius: var(--radius-popup);
}

.title-container {
  padding: 32px;
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-secondary-300);
}

.title {
  color: var(--color-on-popup);
}

.close-btn {
  cursor: pointer;
}

.options-container {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.option-text{
  color: var(--color-on-popup);
}

.option-text--red {
  color: var(--color-status-red);
}

.dropdown-label{
  cursor: auto;
  color: var(--color-on-popup);
}

.dropdown-option {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>