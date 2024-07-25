<template>
  <div :id="'mediaIcon' + media.id + media.savedMedia" class="media">
    <Icon v-if="media.savedMedia === 'image'" name="file-image-2"  />
    <Icon v-else-if="media.savedMedia === 'video'" name="file-video-2" />
    <Icon v-else name="file-blank-2" />
    <div class="text-box">
      <div ref="titleRef" class="main-title">{{ media.mediaPlayerName }}</div>
      <div ref="subTitleRef" class="sub-title" :title="media.fileName">{{media.fileName}}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineProps, onMounted, ref, nextTick} from 'vue';
import Icon from "renderer/views/components/uiElements/Icon.vue";

interface Media{
  id: number
  savedMedia:string
  mediaPlayerName:string
  fileName:string
}

interface Props {
  media: Media
}
const props = defineProps<Props>();

const titleRef = ref(null);
const subTitleRef = ref();

onMounted( async () => {
  await nextTick(); // wait until the DOM + Vue updates + styles

  requestAnimationFrame(() => {
    if (titleRef.value && subTitleRef.value) {
      subTitleRef.value.style.width = getTextWidth(props.media.mediaPlayerName) ;
    }
  });
});

function getTextWidth(textStr:string) {
  let text = document.createElement("span");
  document.body.appendChild(text);

  text.style.height = 'auto';
  text.style.width = 'auto';
  text.style.position = 'absolute';
  text.style.whiteSpace = 'no-wrap';
  text.innerHTML = textStr;

  let width = Math.ceil(text.clientWidth);

  document.body.removeChild(text);

  return (width * 1.5).toString() + "px";
}

</script>

<style scoped>
.media {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.text-box{
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.main-title{
  color: var(--color-main);
}

.sub-title{
  white-space: nowrap;
  overflow:hidden;
  text-overflow: ellipsis;

  color: var(--color-secondary-500-base);
  font-size: 12px;
}
</style>