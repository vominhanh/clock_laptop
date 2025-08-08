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
  <div class="glass p-8 rounded-2xl w-full max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Music Player</h2>
    
    <div class="flex items-center gap-4">
      <div class="flex-1">
        <input v-model="url" placeholder="Dán link nhạc (mp3) hoặc YouTube" class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 placeholder-white/50" />
      </div>
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-black font-semibold hover:from-pink-400 hover:to-pink-300 transition-all duration-200 shadow-lg" @click="toggle">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 inline mr-2">
          <path v-if="!playing" d="M8 5v14l11-7z"/>
          <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        {{ playing ? 'Tạm dừng' : 'Phát' }}
      </button>
    </div>
    
    <div class="mt-6 text-center text-white/70">
      <p>• Dán link YouTube để mở trong tab mới</p>
      <p>• Dán link mp3 để phát trực tiếp</p>
    </div>
  </div>
</template>

<style scoped>
</style>



