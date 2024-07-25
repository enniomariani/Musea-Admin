<template>
  <div class="search-field">
    <Icon class="search-icon" name="search" color-main="var(--color-secondary-500-base)"/>
    <input ref="searchFieldRef" id="searchField" class="input" :class="searchString?'input--inputColor': null"
           type="text"
           :placeholder="defaultText"
           spellcheck="false" @input="handleInput" v-model="searchString"
           @keydown.esc="handleClose" @focus="handleInputFocus"/>
    <Icon class="close-btn" v-if="showClose" @click.stop="handleClose"
          name="close" color-main="var(--color-secondary-500-base)"/>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, ref, defineProps, defineExpose} from 'vue';
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Props {
  defaultText: string
  bgColor: string
  bgColorHover: string
  textColor: string
}
defineProps<Props>();
const emit = defineEmits(['search', 'abort', 'onFocus']);
defineExpose({setSearchValue, setFocus, reset, getSearchValue});

const searchFieldRef = ref();
const showClose = ref(false);
const searchString = defineModel();

function setSearchValue(string: string) {
  searchString.value = string;
  showClose.value = true;
}

function reset() {
  searchString.value = "";
  showClose.value = false;
}

function getSearchValue() {
  if(!showClose.value) return null;   //if the close-button is not shown, the search-field is not active

  return searchString.value? searchString.value: "";
}

function setFocus() {
  searchFieldRef.value.focus();
  showClose.value = true;
}

function handleInput() {
  emit('search', searchString.value);
}

function handleClose() {
  showClose.value = false;
  searchString.value = "";
  searchFieldRef.value.blur();

  emit('abort');
}

function handleInputFocus() {
  showClose.value = true;
  emit('onFocus');
}

</script>

<style scoped>
.search-field {
  width: 100%;
  padding: 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: v-bind(bgColor);
  border-radius: var(--radius-default);
}

.search-field:hover {
  background: v-bind(bgColorHover);
}

.search-icon{
  flex-shrink: 0;
}

.input {
  width: 100%;
  height: 100%;

  background: none;
  color: var(--color-secondary-500-base);

  border: none;
}

.input:focus {
  outline: none;
}

.input--inputColor {
  color: v-bind(textColor) !important;
}

.close-btn {
  cursor: pointer;
}
</style>