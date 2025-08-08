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
const playlist = ref([])
const currentIndex = ref(-1)
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
  playlist.value = state.playlist || []
  currentIndex.value = state.currentIndex || -1
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

function fastForward() {
  musicService.fastForward(10)
}

function rewind() {
  musicService.rewind(10)
}

function nextTrack() {
  musicService.nextTrack()
}

function previousTrack() {
  musicService.previousTrack()
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
  <div class="glass p-8 rounded-2xl w-full max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Music Player</h2>
    
    <div class="flex items-center gap-4 mb-6">
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
    
    <!-- Player Controls -->
    <div v-if="url" class="space-y-4">
      <!-- Progress Bar -->
      <div class="flex items-center gap-3">
        <span class="text-sm text-white/70 w-12">{{ formatTime(currentTime) }}</span>
        <div class="flex-1 bg-white/20 rounded-full h-2 cursor-pointer" @click="seekTo($event.offsetX / $event.target.offsetWidth * duration)">
          <div class="bg-pink-500 h-2 rounded-full transition-all duration-200" :style="{ width: duration > 0 ? (currentTime / duration * 100) + '%' : '0%' }"></div>
        </div>
        <span class="text-sm text-white/70 w-12">{{ formatTime(duration) }}</span>
      </div>
      
      <!-- Control Buttons -->
      <div class="flex items-center justify-center gap-4">
        <!-- Previous Track -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors" @click="previousTrack">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <!-- Rewind -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors" @click="rewind">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        
        <!-- Loop -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors" @click="toggleLoop" :class="{ 'text-pink-400': loop }">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        
        <!-- Play/Pause -->
        <button class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors" @click="toggle">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
            <path v-if="!playing" d="M8 5v14l11-7z"/>
            <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>
        
        <!-- Fast Forward -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors" @click="fastForward">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1, 1) translate(-24, 0)"/>
          </svg>
        </button>
        
        <!-- Next Track -->
        <button class="w-10 h-10 text-white/70 hover:text-white transition-colors" @click="nextTrack">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>
      
      <!-- Auto Next Toggle -->
      <div class="flex items-center justify-center gap-2">
        <button class="w-8 h-8 text-white/70 hover:text-white transition-colors" @click="toggleAutoNext" :class="{ 'text-pink-400': autoNext }">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
        </button>
        <span class="text-sm text-white/70">Tự động chuyển bài</span>
      </div>
      
      <!-- Volume Control -->
      <div class="flex items-center gap-3">
        <button class="w-8 h-8 text-white/70 hover:text-white transition-colors" @click="toggleMute">
          <svg fill="currentColor" viewBox="0 0 24 24" :class="{ 'text-red-400': muted }">
            <path v-if="muted" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>
            <path v-else d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
          </svg>
        </button>
        <div class="flex-1 bg-white/20 rounded-full h-2">
          <div class="bg-pink-500 h-2 rounded-full transition-all duration-200" :style="{ width: muted ? '0%' : volume + '%' }"></div>
        </div>
        <input type="range" min="0" max="100" v-model="volume" @input="setVolume($event.target.value)" class="w-20" />
      </div>
    </div>
    
    <!-- Playlist -->
    <div v-if="playlist.length > 0" class="mt-6">
      <h3 class="text-lg font-bold mb-4">Playlist ({{ playlist.length }} bài)</h3>
      <div class="max-h-64 overflow-auto space-y-2">
        <div v-for="(track, index) in playlist" :key="index" 
             class="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200"
             :class="{ 'bg-pink-500/20 border border-pink-500/50': index === currentIndex }">
          <!-- Thumbnail -->
          <div class="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 mr-3">
            <img :src="track.thumbnail" :alt="track.title" class="w-full h-full object-cover" />
          </div>
          
          <!-- Track info -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-lg truncate">{{ track.title || `Bài ${index + 1}` }}</div>
            <div class="text-white/70 text-sm truncate">{{ track.url }}</div>
          </div>
          
          <!-- Controls -->
          <div class="flex items-center gap-2">
            <button class="px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold hover:from-cyan-400 hover:to-cyan-300 transition-all duration-200" @click="playTrack(index)">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
            <button class="px-3 py-1 rounded-lg bg-gradient-to-r from-red-500 to-red-400 text-black font-semibold hover:from-red-400 hover:to-red-300 transition-all duration-200" @click="removeFromPlaylist(index)">
              <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-6 text-center text-white/70">
      <p>• Dán link YouTube để phát trực tiếp (ví dụ: https://www.youtube.com/watch?v=VIDEO_ID)</p>
      <p>• Dán link mp3 để phát trực tiếp</p>
      <p>• Nhấn "Thêm vào Playlist" để thêm bài hát vào danh sách</p>
      <p>• Sử dụng nút Next/Previous để chuyển bài</p>
      <p>• Sử dụng nút tua để tua nhanh/lùi 10 giây</p>
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



