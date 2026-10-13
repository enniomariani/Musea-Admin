<template>
  <div class="base-pop-up">
    <div class="window-container">
      <div class="slot">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.base-pop-up {
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
  box-sizing: border-box;
  background-color: var(--color-popup);
  border-radius: var(--radius-popup);
}

.slot{
  padding: 32px;
}
</style>