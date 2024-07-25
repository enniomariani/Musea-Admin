<template>
  <div class="nav-bar-top">
    <div class="content">
      <div class="left-side">
        <NavBarBackBtn :has-button="hasBackBtn" :text="title" @click.stop="backClicked"></NavBarBackBtn>
      </div>
      <div class="right-side">
        <NavBarRefreshBtn v-if="hasRefreshBtn" @click.stop="refreshClicked"></NavBarRefreshBtn>
        <div v-if="showSearch" class="search-container">
          <SearchInput ref="searchInputRef" :default-text="$t('defaultTextSearch')" text-color="var(--color-secondary-500-base)"
                       bg-color="var(--color-secondary-800)" bg-color-hover="var(--color-secondary-800-hover)"
                       @abort="handleAbortSearch" @search="handleSearch" @onFocus="handleSearchFocus"/>
        </div>
      </div>
    </div>
    <div class="line"></div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, ref, watch, nextTick} from 'vue';
import NavBarBackBtn from "renderer/views/components/uiElements/btns/NavBarBackBtn.vue";
import NavBarRefreshBtn from "renderer/views/components/uiElements/btns/NavBarRefreshBtn.vue";
import SearchInput from "renderer/views/components/uiElements/SearchInput.vue";

interface Props {
  title: string
  hasRefreshBtn: boolean
  hasBackBtn: boolean
  showSearch: boolean
}
const props = defineProps<Props>();
const emit = defineEmits(['backClicked', 'refreshClicked', 'search', 'abortSearch']);

defineExpose({setFocusToSearchField, getActualSearchString});

let searchInputRef = ref();

function getActualSearchString():string | null{
  return searchInputRef.value?.getSearchValue();
}

function setFocusToSearchField(searchString: string | null = null){
  if(searchString !== null)
    searchInputRef.value?.setSearchValue(searchString);

  searchInputRef.value?.setFocus();
}

function backClicked() {
  emit('backClicked');
}

function refreshClicked() {
  emit('refreshClicked');
}

function handleSearch(searchString: string) {
  emit('search', searchString);
}

function handleAbortSearch() {
  emit('abortSearch');
}

function handleSearchFocus() {
  emit('search', searchInputRef.value?.getSearchValue());
}
</script>

<style scoped>
.nav-bar-top {
  min-height: 100px;
  width: 100%;
  padding: 0 28px;
  display: flex;
  flex-direction: column;

  background-color: var(--color-background);
}

.content {
  min-width: max-content;
  flex-grow: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.line {
  width: 100%;
  height: 1px;
  margin-bottom: 0;
  background: var(--color-secondary-700);
}

.left-side {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 12px;
}

.right-side {
  width: 100%;

  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
}

.search-container {
  min-width: 100px;
  max-width: 327px;
  flex: 0 1 327px;
}
</style>