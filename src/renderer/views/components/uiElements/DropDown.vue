<template>
  <div class="dropdown">
    <div class="dropdown-select" :class="{ open: isOpen }" @click.stop="toggleDropdown">
      <span class="dropdown-select--text" :class="{ open: isOpen }">{{ selectedOption }}</span>
      <span class="arrow" :class="{ open: isOpen }">
        <Icon name="icon-nav-arrow-down" :color-second="isOpen ? 'var(--color-secondary-500-base)' : 'var(--color-secondary-800)'"/>
      </span>
    </div>
    <div class="dropdown-options" v-show="isOpen">
      <div v-for="(option, index) in options" class="option" :key="index" @click.stop="selectOption(option)">
        {{ option }}
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {defineEmits, defineProps, ref} from 'vue';
import {useI18n} from 'vue-i18n';
import Icon from "renderer/views/components/uiElements/Icon.vue";

const {t} = useI18n();

interface Props {
  options: string[]
  selectedOption?: string
}
const props = defineProps<Props>();
const emit = defineEmits(['selected']);

let isOpen = ref(false);
let selectedOption = ref();
selectedOption.value = props.selectedOption;

function toggleDropdown() {
  isOpen.value = !isOpen.value;
}

function selectOption(text: string) {
  selectedOption.value = text;
  isOpen.value = false;

  emit('selected', text);
}
</script>

<style scoped>
.dropdown {
  position: relative;
  width: 359px;
}

.dropdown-select {
  padding: 10px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  border: 1px solid var(--color-secondary-800);
  border-radius: var(--radius-default);

  background-color: white;
  cursor: pointer;
}

.dropdown-select.open {
  border: 1px solid var(--color-secondary-500-base);
}

.dropdown-select--text{
  color: var(--color-secondary-800);
}

.dropdown-select--text.open{
  color: var(--color-secondary-500-base);
}

.arrow {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow.open {
  transform: rotate(-180deg); /* Rotate the arrow when open */
}

.dropdown-options {
  position: absolute;
  width: 100%;
  top: calc(100% + 12px); /* Custom distance from select to options */
  padding: 12px 0;

  border: 1px solid var(--color-secondary-500-base);
  border-radius: var(--radius-default);
  background-color: var(--color-secondary-100);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dropdown-options div {
  padding: 5px 12px;
  cursor: pointer;
}

.dropdown-options div:hover {
  background-color: var(--color-secondary-400);
}

.option {
  color: var(--color-on-secondary-100)
}
</style>