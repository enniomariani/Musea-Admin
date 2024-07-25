<template>
  <BaseBtn id="addMediaBtn" text-color="var(--color-on-secondary-800)" bg-color="var(--color-secondary-800)"
           bg-color-hover="var(--color-secondary-800-hover">
    <template v-slot:icon><Icon  name="tag-plus"/></template>
    {{ $t('content.addMedia') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/uiElements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";
</script>