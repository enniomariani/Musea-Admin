<template>
  <BaseBtn id="exitBtn" :text-color="'var(--color-status-red)'" bg-color="rgba(var(--color-status-red-rgb), 0.1)"
           bg-color-hover="rgba(var(--color-status-red-rgb), 0.2)">
    <template v-slot:icon><Icon  name="icon-nav-arrow-left" color-main="var(--color-status-red)"/></template>
    {{ $t('btnEndAndFree') }}
  </BaseBtn>
</template>

<script setup lang="ts">
import BaseBtn from "renderer/views/components/uiElements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";
</script>