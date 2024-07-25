<template>
  <button class="btn">
    <div v-if="$slots.icon" class="icon" :class="!$slots.default?'icon-solo':null"><slot name="icon"></slot></div>
    <div v-if="$slots.default" class="text" :class="!$slots.icon?'text-solo':null"><slot></slot></div>
  </button>
</template>

<script setup lang="ts">
import {defineProps, ref} from 'vue';

interface Props {
  textColor:string
  bgColor:string
  bgColorHover:string
  gapTextToIcon?:string
}
const props = defineProps<Props>();

const paddingLeft = ref(props.gapTextToIcon?props.gapTextToIcon:"0");
</script>

<style scoped>
.btn {
  display: flex;
  justify-content: center;
  align-items: center;

  border: none;
  border-radius: var(--radius-default);

  cursor: pointer;

  white-space: nowrap;
  background: v-bind(bgColor);
}

.btn:hover {
  background-color: v-bind(bgColorHover);
}

.text{
  padding: 10px 14px 10px v-bind(paddingLeft);

  display: flex;
  justify-content: center;
  align-items: center;

  color: v-bind(textColor);
  font-size: var(--font-size-medium);
}

.text-solo{
  padding: 10px 14px !important;
}

.icon{
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-solo{
  padding: 6px 3px !important;
}
</style>