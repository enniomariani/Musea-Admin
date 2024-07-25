<template>
  <div class="main-list-container">
    <div class="main-list">
      <div :id="'item' + index" v-for="(item, index) in items" :key="index"
           :class="['list-item', itemsClickable && item.clickable ? 'list-item--selectable' : 'list-item--not-selectable',
        index === selectedItemIndex ? 'list-item--selected' : '']"
           @click="itemsClickable && item.clickable !== false ? handleItemClick(index, item.id, item.title, item.type): null">
        <div :class="['left-side', item.cut ? 'list-item--cut' : '']">
          <Icon :name="item.iconName"></Icon>
          <div class="title" id="title" :title="item.title">{{ item.title }}</div>
        </div>
        <div :class="['right-side', item.cut ? 'list-item--cut' : '']">
          <!-- Slot for custom content on the right side -->
          <slot name="right-content" :item="item" :index="index" :item-id="item.id"></slot>
          <div v-if="atLeastOneItemHasOptions" class="options-icon">
            <Icon id="optionsBtn" v-if="item.hasOptions" name="more-options"
                  @click.stop="handleOptionsClick(item.id, item.title, item.type)"></Icon>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, defineProps, defineEmits, defineExpose, computed} from 'vue';
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Item {
  id: number
  title: string
  type: string
  hasOptions: boolean
  iconName: string
  cut: boolean
  clickable: boolean

  [key: string]: any;
}

interface Props {
  items: Item[]
  itemsClickable: boolean
}
const props = defineProps<Props>();
const emit = defineEmits(['item-clicked', 'options-clicked']);
defineExpose({selectItem});

const selectedItemIndex = ref();

const atLeastOneItemHasOptions = computed(() => {
  return props.items.some(item => item.hasOptions);
});

function selectItem(itemId: number) {
  const index = props.items.findIndex(item => item.id === itemId);
  if (index !== -1)
    selectedItemIndex.value = index; // Update the selected index
  else
    selectedItemIndex.value = null;
}

function handleItemClick(index: number, id: number, title: string, type: string) {
  //only emit click if item is not already selected
  if (selectedItemIndex.value !== null && selectedItemIndex.value === index)
    return;

  emit('item-clicked', id, title, type);
}

function handleOptionsClick(itemId: number, title: string, type: string) {
  emit('options-clicked', itemId, title, type);
}

</script>

<style scoped>
.main-list-container {
  width: 100%;
  height: 100%;
  padding: 40px 56px;
  flex-grow: 1;

  display: flex;
  flex-direction: column;

  overflow-x: hidden;
  overflow-y: auto;

  background-color: var(--color-background);
}

::-webkit-scrollbar {
  width: 10px;
}

::-webkit-scrollbar-track {
  background: var(--color-secondary-100);
  border-radius: 6.6px;
  cursor: pointer;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: var(--color-secondary-500-base);
  border-radius: 6.6px;
  cursor: pointer;
}

/* Handle on hover */
::-webkit-scrollbar-thumb:hover {
  background: var(--color-secondary-600);
}

.main-list {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.list-item {
  width: 100%;
  padding: 20px 8px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--color-secondary-700);
  transition: background-color 0.2s;
}

.list-item--selected {
  background-color: var(--color-secondary-700);
}

.list-item--cut {
  opacity: 0.15;
}

.list-item--selectable {
  cursor: pointer;
}

.list-item--not-selectable {
  cursor: default;
}

.list-item:hover {
  background-color: var(--color-secondary-700);
}

.left-side {
  flex-grow: 1;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 12px;
}

.title {
  max-width: 100%;
  flex-grow: 1;

  color: var(--color-main);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow:hidden;
}

.right-side {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
}

.options-icon {
  width: 32px;
  height: 32px;
  cursor: pointer;
}
</style>
