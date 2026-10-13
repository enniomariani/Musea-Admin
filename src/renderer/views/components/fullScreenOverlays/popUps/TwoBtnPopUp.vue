<template>
  <BasePopUp>
    <div class="title-container">
      <div id="title" class="title">{{ title }}</div>
    </div>
    <div class="btn-container">
      <BaseBtn id="btnYes" :text-color="highlightBtn === 'yes'?'rgba(var(--color-status-red-rgb), 1)': 'var(--color-on-secondary-50)'"
               :bg-color="highlightBtn === 'yes'?'rgba(var(--color-status-red-rgb), 0.1)': 'var(--color-secondary-50)'"
               :bg-color-hover="highlightBtn === 'yes'?'rgba(var(--color-status-red-rgb), 0.2)': 'var(--color-secondary-100)'" gap-text-to-icon="6px"
               @click.stop="handleClickYes">
        <template v-slot:icon>
          <Icon  name="check-small" :color-main="highlightBtn === 'yes'?'var(--color-status-red)': 'var(--color-on-secondary-50)'"/>
        </template>
        {{ btnTextYes }}
      </BaseBtn>
      <BaseBtn id="btnNo" :text-color="highlightBtn === 'no'?'rgba(var(--color-status-red-rgb), 1)': 'var(--color-on-secondary-50)'"
               :bg-color="highlightBtn === 'no'?'rgba(var(--color-status-red-rgb), 0.1)': 'var(--color-secondary-50)'"
               :bg-color-hover="highlightBtn === 'no'?'var(--color-status-red-rgb), 0.2)': 'var(--color-secondary-100)'" gap-text-to-icon="6px"
               @click.stop="handleClickNo">
        <template v-slot:icon>
          <Icon  name="abort-small" :color-main="highlightBtn === 'no'?'var(--color-status-red)': 'var(--color-on-secondary-50)'"/>
        </template>
        {{ btnTextNo }}
      </BaseBtn>
    </div>
  </BasePopUp>
</template>

<script setup lang="ts">
import BasePopUp from "renderer/views/components/fullScreenOverlays/popUps/BasePopUp.vue";
import BaseBtn from "renderer/views/components/uiElements/btns/BaseBtn.vue";
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Props {
  title: string
  btnTextYes: string
  iconYes: string
  btnTextNo: string
  iconNo: string
  highlightBtn: string
}
defineProps<Props>();
const emit = defineEmits(['yes', 'no']);

function handleClickYes() {
  emit('yes');
}

function handleClickNo() {
  emit('no');
}

</script>

<style scoped>

.title-container{
  padding-bottom: 32px;

  display:flex;
  justify-content:space-between;
  border-bottom: 1px solid var(--color-secondary-300);
}

.title{
  white-space: pre-line;
  color: var(--color-on-popup);
}

.btn-container {
  padding-top: 32px;
  display: flex;
  gap: 12px;
}
</style>