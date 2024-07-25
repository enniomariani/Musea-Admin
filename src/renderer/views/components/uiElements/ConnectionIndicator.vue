<template>
  <div :class="['status-indicator', isOk ? 'circle-green' : 'circle-red']"></div>
</template>

<script setup lang="ts">
interface Props {
  isOk:boolean
}
defineProps<Props>();
</script>

<style scoped>
.circle-red {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-status-red);
}

.circle-green {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-status-green);
}
</style>