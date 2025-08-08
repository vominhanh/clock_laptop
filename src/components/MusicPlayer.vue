<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'

const url = ref('')
const playing = ref(false)
let audio = null

watch(url, (v) => {
  if (audio) {
    audio.pause()
    audio = null
  }
  if (!v) return
  // Nếu là link YouTube, mở trong window nổi đơn giản
  if (v.includes('youtube.com') || v.includes('youtu.be')) {
    window.open(v, '_blank')
  } else {
    audio = new Audio(v)
    if (playing.value) audio.play()
  }
})

function toggle() {
  playing.value = !playing.value
  if (audio) {
    playing.value ? audio.play() : audio.pause()
  }
}

onBeforeUnmount(() => {
  if (audio) audio.pause()
})
</script>

<template>
  <div class="glass p-4 w-full max-w-xl mx-auto flex items-center gap-2">
    <input v-model="url" placeholder="Dán link nhạc (mp3) hoặc YouTube" class="flex-1 px-3 py-2 rounded bg-slate-800 border border-white/10" />
    <button class="px-3 py-2 rounded bg-pink-500 text-black font-semibold" @click="toggle">{{ playing ? 'Tạm dừng' : 'Phát' }}</button>
  </div>
</template>

<style scoped>
</style>



