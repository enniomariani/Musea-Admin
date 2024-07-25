<template>
  <nav class="nav-bar-left">
    <div class="container-top">
      <img v-if="pathToLogo !== ''" :src="pathToLogo" class="logo"/>
      <NavBarExitBtn v-if="hasExitBtn" @click.stop="exitClicked"></NavBarExitBtn>
    </div>
    <div class="container-center">
      <div id="navBarTitle" class="navbar-content">{{ text }}</div>
      <NavBarSyncBtn v-if="hasSyncBtn" @click.stop="syncClicked"></NavBarSyncBtn>
    </div>
    <div class="container-bottom">
      <div id="versionNr" class="version-nr"> {{version}}</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import {defineProps, defineEmits, ref, onMounted} from 'vue';
import NavBarExitBtn from "renderer/views/components/uiElements/btns/NavBarExitBtn.vue";
import NavBarSyncBtn from "renderer/views/components/uiElements/btns/NavBarSyncBtn.vue";

interface Props {
  text: string
  hasExitBtn: boolean
  hasSyncBtn:boolean
  version: string
}
defineProps<Props>();
const emit = defineEmits(['exitClicked', 'syncClicked']);

const pathToLogo = ref("");

onMounted(() => {
  readLogoFromCssVar();
});

function readLogoFromCssVar() {
  const val = getComputedStyle(document.documentElement).getPropertyValue('--logo-path').trim();
  if (val) pathToLogo.value = val.replace(/^["']|["']$/g, '');
}

function exitClicked() {
  emit('exitClicked');
}

function syncClicked() {
  emit('syncClicked');
}

</script>

<style scoped>
.nav-bar-left {
  height: 100%;
  width: 100%;
  padding: 36px 24px;
  display: flex;
  align-items: center;
  flex-direction: column;

  background-color: var(--color-secondary-800);
}

.container-top {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 45px;
}

.logo{
  width: 152px;
  height: 35px;
}

.container-center {
  margin-block: auto;
  flex-grow: 1;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 60px;
}

.container-bottom {
  margin-top: auto;

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.navbar-content {
  color: var(--color-on-primary-800);
  text-align: center;
}

.version-nr{
  color: var(--color-on-primary-800);
}
</style>