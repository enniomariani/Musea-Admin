<template>
  <svg
      v-if="svgRaw"
      ref="iconRef"
      v-bind="svgAttrs"
      v-html="svgInner"
  />
</template>

<script setup lang="ts">
import {computed, defineProps, ref, watch, onMounted, nextTick} from 'vue'

interface Props {
  name: string
  colorMain?: string
  colorSecond?: string
}
const props = defineProps<Props>();

const pathToIcons:string = "images/icons/";

// Load raw SVGs as text
const modules = import.meta.glob("@assets/images/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

let lastColorMain: string | null;
let lastColorSecond: string | null;

onMounted(()=>{
  repaintColors();

  lastColorMain = props.colorMain ? props.colorMain : null;
  lastColorSecond = props.colorSecond ? props.colorSecond : null;
});

const svgRaw = computed<string | null>(() => {
  const key:string = "/public/" + pathToIcons + (props.name ?? "") + ".svg";
  return (modules as Record<string, string>)[key] ?? null
})

// Extract attributes from raw svg root
const svgAttrs = computed<Record<string, string>>(() => {
  if (!svgRaw.value) return {}
  try {
    const doc = new DOMParser().parseFromString(svgRaw.value, "image/svg+xml")
    const root = doc.documentElement
    if (!root || root.tagName.toLowerCase() !== "svg") return {}
    const attrs: Record<string, string> = {}
    for (const a of Array.from(root.attributes)) attrs[a.name] = a.value
    return attrs
  } catch {
    return {}
  }
})

// Extract inner content only
const svgInner = computed<string>(() => {
  if (!svgRaw.value) return ""
  try {
    const doc = new DOMParser().parseFromString(svgRaw.value, "image/svg+xml")
    const root = doc.documentElement
    return (!root || root.tagName.toLowerCase() !== "svg") ? "" : root.innerHTML
  } catch {
    return ""
  }
})

const iconRef = ref<SVGSVGElement | null>(null)

// Fixed palettes we replace (designer-provided whites / darks)
const WHITES = ['white', '#fff', '#ffffff', '#FFF', '#FFFFFF']
const DARKS = ['#202020', '#231F20', '#000', '#000000', 'black', 'Black']

// Target colors with fallback to CSS var
const mainColor = computed(() => props.colorMain ?? 'var(--color-main)')
const SecondaryColor = computed(() => props.colorSecond ?? 'var(--color-btn-secondary)')

// Unique suffix per component instance to scope <defs> IDs and url(#...) refs
let uidCounter = 0
const uid = `i-${Math.random().toString(36).slice(2)}-${++uidCounter}`

// Scope IDs and any url(#...) or #id references so multiple icons don’t collide
function scopeSvgIds() {
  const root = iconRef.value
  if (!root) return

  // Map original id -> scoped id
  const idMap = new Map<string, string>()
  root.querySelectorAll<HTMLElement>('[id]').forEach((el) => {
    const original = el.getAttribute('id')
    if (!original) return
    // Avoid double-scoping
    if (original.endsWith(`__${uid}`)) return
    const scoped = `${original}__${uid}`
    idMap.set(original, scoped)
    el.setAttribute('id', scoped)
  })

  if (idMap.size === 0) return

  // Attributes that can hold references to IDs
  const refAttrs:string[] = [
    'fill', 'stroke', 'filter', 'clip-path', 'mask',
    'marker-start', 'marker-mid', 'marker-end',
    'href', 'xlink:href'
  ]

  const urlRefRegex = /url\(#([^)]+)\)/g
  const hashOnlyRegex = /^#(.+)$/

  // Replace references in attributes
  root.querySelectorAll<HTMLElement>('*').forEach((el) => {
    for (const attr of refAttrs) {
      const val = el.getAttribute(attr)
      if (!val) continue
      let newVal = val

      // url(#id) -> url(#id__uid)
      newVal = newVal.replace(urlRefRegex, (m, id) => {
        const mapped = idMap.get(id)
        return mapped ? `url(#${mapped})` : m
      })

      // href / xlink:href may be just "#id"
      const hashMatch = newVal.match(hashOnlyRegex)
      if (hashMatch) {
        const id = hashMatch[1]
        const mapped = idMap.get(id)
        if (mapped) newVal = `#${mapped}`
      }

      if (newVal !== val) el.setAttribute(attr, newVal)
    }

    // Also patch inline style attributes that might contain url(#...)
    const styleVal = el.getAttribute('style')
    if (styleVal && styleVal.includes('url(#')) {
      let newStyle = styleVal
      newStyle = newStyle.replace(urlRefRegex, (m, id) => {
        const mapped = idMap.get(id)
        return mapped ? `url(#${mapped})` : m
      })
      if (newStyle !== styleVal) el.setAttribute('style', newStyle)
    }
  })
}

// Replace exact color-hash values inside the inline SVG
function applyPaletteMapping() {
  const root = iconRef.value
  if (!root) return

  const paint = (attr: 'fill' | 'stroke', hexes: string[], color: string) => {
    for (const hex of hexes) {
      root.querySelectorAll<SVGElement>(`[${attr}="${hex}"]`).forEach(el => {
        el.setAttribute(attr, color)
        ;(el as any).style && ((el as any).style[attr] = color)
      })
    }
  }

  let colorsMain: string[] = WHITES;
  let colorsSecond: string[] = DARKS;

  if (lastColorMain)
    colorsMain.push(lastColorMain);

  if (lastColorSecond)
    colorsSecond.push(lastColorSecond);

  // Only exact matches; does not affect fill="none" or gradients
  paint('fill', colorsMain, mainColor.value)
  paint('stroke', colorsMain, mainColor.value)
  paint('fill', colorsSecond, SecondaryColor.value)
  paint('stroke', colorsSecond, SecondaryColor.value)
}

// Re-scope and re-apply when icon or colors change
watch(
    [() => props.name, () => props.colorMain, () => props.colorSecond],
    async () => {
      await nextTick(); //necesary if name + colors change: icon changes + after that repaint the colors
      repaintColors();
    },
    {immediate: true}
)

function repaintColors(){
  if(!svgRaw.value){
    console.error("Icon not found: ", pathToIcons + props.name + ".svg");
    return;
  }

  scopeSvgIds();
  applyPaletteMapping();

  if (props.colorMain)
    lastColorMain = props.colorMain;

  if (props.colorSecond)
    lastColorSecond = props.colorSecond;
}
</script>