<script setup>
import { onBeforeUnmount, onMounted, ref, watch, inject } from 'vue'

const emit = defineEmits(['play', 'pause', 'update-time', 'update-info'])

// Inject global music service
const musicService = inject('musicService')

const url = ref('')
const playing = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(100)
const muted = ref(false)
const loop = ref(false)
const autoNext = ref(true)

// Sync with global service
function updateLocalState(state) {
  playing.value = state.isPlaying
  currentTime.value = state.currentTime
  duration.value = state.duration
  volume.value = state.volume
  muted.value = state.muted
  loop.value = state.loop
  url.value = state.url
  autoNext.value = state.autoNext !== undefined ? state.autoNext : true
}

onMounted(() => {
  // Initialize with current state
  const currentState = musicService.getState()
  updateLocalState(currentState)
  
  // Listen for state changes
  musicService.addListener(updateLocalState)
})

onBeforeUnmount(() => {
  musicService.removeListener(updateLocalState)
})

watch(url, (v) => {
  if (v) {
    musicService.loadAudio(v)
  }
})

function toggle() {
  musicService.toggle()
}

function toggleMute() {
  musicService.toggleMute()
}

function toggleLoop() {
  musicService.toggleLoop()
}

function setVolume(newVolume) {
  musicService.setVolume(newVolume)
}

function seekTo(time) {
  musicService.seekTo(time)
}

function rewind() {
  musicService.rewind(10)
}

function fastForward() {
  musicService.fastForward(10)
}

function toggleAutoNext() {
  musicService.toggleAutoNext()
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}
</script>

<template>
  <div class="glass p-8 rounded-2xl w-full max-w-2xl mx-auto shadow-2xl">
    <h2 class="text-2xl font-bold mb-6 text-center text-white">Music Player</h2>
    
    <!-- URL Input Section -->
    <div class="flex items-center gap-4 mb-6">
      <div class="flex-1">
        <input 
          v-model="url" 
          placeholder="https://www.youtube.com/" 
          class="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-200" 
        />
      </div>
      <button 
        class="px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-pink-400 text-black font-semibold hover:from-pink-400 hover:to-pink-300 transition-all duration-200 shadow-lg flex items-center gap-2" 
        @click="toggle"
      >
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path v-if="!playing" d="M8 5v14l11-7z"/>
          <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        {{ playing ? 'II Tạm dừng' : 'Phát' }}
      </button>
    </div>
    
    <!-- Player Controls -->
    <div v-if="url" class="space-y-6">
      <!-- Progress Bar -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-white/70 w-12 font-medium">{{ formatTime(currentTime) }}</span>
        <div class="flex-1 bg-white/20 rounded-full h-2 cursor-pointer relative" @click="seekTo($event.offsetX / $event.target.offsetWidth * duration)">
          <div class="bg-pink-500 h-2 rounded-full transition-all duration-200 relative" :style="{ width: duration > 0 ? (currentTime / duration * 100) + '%' : '0%' }">
            <!-- Pink dot indicator -->
            <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-pink-500 rounded-full shadow-lg"></div>
          </div>
        </div>
        <span class="text-sm text-white/70 w-12 font-medium text-right">{{ formatTime(duration) }}</span>
      </div>
      
      <!-- Control Buttons -->
      <div class="flex items-center justify-center gap-4">
        <!-- Rewind -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors flex items-center justify-center" @click="rewind">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        
        <!-- Loop -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors flex items-center justify-center" @click="toggleLoop" :class="{ 'text-pink-400': loop }">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        
        <!-- Play/Pause -->
        <button class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors shadow-lg" @click="toggle">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
            <path v-if="!playing" d="M8 5v14l11-7z"/>
            <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        
        <!-- Fast Forward -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors flex items-center justify-center" @click="fastForward">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1, 1) translate(-24, 0)"/>
          </svg>
        </button>
      </div>
      
      <!-- Auto Next Toggle -->
      <div class="flex items-center justify-center gap-2">
        <button class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center" @click="toggleAutoNext" :class="{ 'text-pink-400': autoNext }">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        <span class="text-sm text-white/70">Tự động chuyển bài</span>
      </div>
      
      <!-- Volume Control -->
      <div class="flex items-center gap-3">
        <button class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center" @click="toggleMute" :class="{ 'text-red-400': muted }">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path v-if="muted" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            <path v-else d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <div class="flex-1 bg-white/20 rounded-full h-2 relative">
          <div class="bg-pink-500 h-2 rounded-full transition-all duration-200" :style="{ width: muted ? '0%' : volume + '%' }"></div>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          v-model="volume" 
          @input="setVolume($event.target.value)" 
          class="w-20" 
        />
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="mt-8 text-center text-white/70 space-y-2">
      <p class="text-sm">• Dán link YouTube để phát trực tiếp (ví dụ: https://www.youtube.com/watch?v=VIDEO_ID)</p>
      <p class="text-sm">• Dán link mp3 để phát trực tiếp</p>
      <p class="text-sm">• Sử dụng nút tua để tua nhanh/lùi 10 giây</p>
      <p class="text-sm">• Sử dụng nút loop để lặp lại bài hát</p>
    </div>
  </div>
</template>

<style scoped>
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

input[type="range"]::-webkit-slider-track {
  background: rgba(255, 255, 255, 0.2);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  background: #ec4899;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  cursor: pointer;
}

input[type="range"]::-moz-range-track {
  background: rgba(255, 255, 255, 0.2);
  height: 8px;
  border-radius: 4px;
}

input[type="range"]::-moz-range-thumb {
  background: #ec4899;
  height: 16px;
  width: 16px;
  border-radius: 50%;
  cursor: pointer;
  border: none;
}
</style>



