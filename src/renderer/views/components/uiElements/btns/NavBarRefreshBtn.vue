<template>
  <BaseBtn id="refreshBtn" text-color="var(--color-main)" bg-color="var(--color-secondary-700)"
           bg-color-hover="var(--color-secondary-700-hover)">
    <template v-slot:icon><Icon name="sync"></Icon></template>
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/uiElements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";
</script>