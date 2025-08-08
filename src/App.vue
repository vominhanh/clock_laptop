<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue'
import Timer from './components/Timer.vue'
import TaskList from './components/TaskList.vue'
import MusicPlayer from './components/MusicPlayer.vue'
import musicService from './services/musicService.js'

const mode = ref('down') // 'up' | 'down'
const startSeconds = ref(0)
const currentView = ref('timer') // 'timer', 'tasks', 'music'

// Music player state - sync with global service
const musicState = ref({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  title: 'Những Cơn Đau Ngày Đi',
  url: 'https://www.youtube.com/watc',
  thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center'
})

// Separate state for widget visibility
const showMusicWidget = ref(false)

// Provide global music state để các components khác có thể access
provide('musicState', musicState)
provide('musicService', musicService)

// Sync with music service
function updateMusicState(state) {
  musicState.value = { ...musicState.value, ...state }
  // Show widget when music starts playing
  if (state.isPlaying && !showMusicWidget.value) {
    showMusicWidget.value = true
  }
}

onMounted(() => {
  // Initialize with current state
  const currentState = musicService.getState()
  updateMusicState(currentState)
  
  // Show widget if music is already playing
  if (currentState.isPlaying) {
    showMusicWidget.value = true
  }
  
  // Listen for state changes
  musicService.addListener(updateMusicState)
})

onBeforeUnmount(() => {
  musicService.removeListener(updateMusicState)
})

function applyTask(payload) {
  // payload: { task, durationSeconds, start, end }
  mode.value = 'down'
  startSeconds.value = payload.durationSeconds
  currentView.value = 'timer'
}

function onFinished() {
  alert('Hoàn thành!')
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function toggleMusic() {
  musicService.toggle()
}

function closeMusicPlayer() {
  // Chỉ ẩn widget, không pause nhạc
  showMusicWidget.value = false
}

// Music player events
function onMusicPlay() {
  musicService.toggle()
  showMusicWidget.value = true
}

function onMusicPause() {
  musicService.toggle()
}

function onMusicUpdateTime(time) {
  musicService.seekTo(time)
}

function onMusicUpdateInfo(info) {
  musicService.loadAudio(info.url)
  showMusicWidget.value = true
}

// New functions for widget controls
function nextTrack() {
  musicService.nextTrack()
}

function previousTrack() {
  musicService.previousTrack()
}

function fastForward() {
  musicService.fastForward(10)
}

function rewind() {
  musicService.rewind(10)
}
</script>

<template>
  <div class="min-h-screen w-full bg-cover bg-center relative" style="background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop');">
    <!-- Overlay để làm tối nền -->
    <div class="absolute inset-0 bg-black/30"></div>
    
    <!-- YouTube Player Container (hidden) - Global for all pages -->
    <div id="youtube-player" class="hidden"></div>
    
    <!-- Sidebar bên trái -->
    <div class="fixed left-0 top-0 h-full w-20 bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 z-20">
      <!-- Main Menu (Pink M) -->
      <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-xl flex items-center justify-center mb-8 cursor-pointer hover:from-pink-400 hover:to-pink-300 transition-all duration-300 shadow-lg hover:shadow-pink-500/25" @click="currentView = 'timer'">
        <span class="text-white font-bold text-lg">M</span>
      </div>
      
      <!-- Edit/Pencil -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </div>
      
      <!-- Download/Arrow Down -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
      </div>
      
      <!-- Chat/Speech Bubble -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4l4 4 4-4h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
        </svg>
      </div>
      
      <!-- Document/List -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </div>
      
      <!-- Flag -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      </div>
      
      <!-- Heart (Pink) -->
      <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-400 rounded-xl flex items-center justify-center mb-6 cursor-pointer hover:from-pink-400 hover:to-pink-300 transition-all duration-300 shadow-lg hover:shadow-pink-500/25" @click="currentView = 'music'">
        <svg fill="white" viewBox="0 0 24 24" class="w-6 h-6">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <!-- Bell/Notifications -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      </div>
      
      <!-- Small Circle -->
      <div class="w-3 h-3 bg-white/40 rounded-full mb-6"></div>
      
      <!-- People/Users -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V16h-1.5v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z"/>
        </svg>
      </div>
      
      <!-- Clipboard/Tasks -->
      <div class="w-10 h-10 text-white/60 hover:text-white mb-6 cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center" @click="currentView = 'tasks'">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </div>
      
      <!-- Home URL -->
      <div class="mt-auto text-white/40 text-xs text-center px-2 leading-tight">
        https://app.csw.live/home
      </div>
    </div>
    
    <!-- Main content -->
    <div class="ml-20 p-6">
      <!-- Top row -->
      <div class="flex gap-6 mb-6">
        <!-- Task Collection Widget -->
        <div class="glass p-6 rounded-2xl w-80">
          <h3 class="text-xl font-bold mb-4">Tasks</h3>
          <div class="text-center py-8">
            <div class="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg fill="white" viewBox="0 0 24 24" class="w-8 h-8">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
              </svg>
            </div>
            <div class="text-lg font-semibold mb-2">Create Collection</div>
            <div class="text-white/70">Let's Create Your Task Collection</div>
          </div>
        </div>
        
        <!-- Task Progress Widget -->
        <div class="glass p-6 rounded-2xl w-80">
          <h3 class="text-xl font-bold mb-4">Task</h3>
          <div class="flex items-center gap-4 mb-4">
            <div class="text-3xl font-bold">0%</div>
            <div class="flex-1 bg-white/20 rounded-full h-3">
              <div class="bg-pink-500 h-3 rounded-full" style="width: 0%"></div>
            </div>
          </div>
          <div class="text-white/70 mb-2">Completion: 0/2</div>
          <div class="text-white/50 text-sm">Created 2025.08.08</div>
        </div>
      </div>
      
      <!-- Timer View -->
      <div v-if="currentView === 'timer'" class="flex justify-center">
        <Timer :mode="mode" :start-seconds="startSeconds" @finished="onFinished" />
      </div>
      
      <!-- Tasks View -->
      <div v-if="currentView === 'tasks'" class="flex justify-center">
        <TaskList @select="applyTask" />
      </div>
      
      <!-- Music View -->
      <div v-if="currentView === 'music'" class="flex justify-center">
        <MusicPlayer 
          @play="onMusicPlay"
          @pause="onMusicPause"
          @update-time="onMusicUpdateTime"
          @update-info="onMusicUpdateInfo"
        />
      </div>
    </div>
    
    <!-- Music Player Widget (Bottom Right) - Always visible when playing -->
    <div v-if="showMusicWidget" class="fixed bottom-6 right-6 glass p-6 rounded-2xl w-96 z-10 shadow-2xl">
      <!-- Close button -->
      <button @click="closeMusicPlayer" class="absolute top-3 right-3 w-6 h-6 text-white/70 hover:text-white transition-colors">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      
      <!-- Main content -->
      <div class="flex items-center gap-4">
        <!-- Thumbnail -->
        <div class="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg">
          <img :src="musicState.thumbnail" :alt="musicState.title" class="w-full h-full object-cover" />
        </div>
        
        <!-- Song info -->
        <div class="flex-1 min-w-0">
          <div class="font-bold text-white text-lg truncate">{{ musicState.title }}</div>
          <div class="text-white/70 text-sm truncate underline">{{ musicState.url }}</div>
        </div>
        
        <!-- Control buttons -->
        <div class="flex items-center gap-3">
          <!-- Previous -->
          <button @click="previousTrack" class="w-10 h-10 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          
          <!-- Play/Pause -->
          <button @click="toggleMusic" class="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center text-white hover:bg-gray-600 transition-colors shadow-lg">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-6 h-6">
              <path v-if="!musicState.isPlaying" d="M8 5v14l11-7z"/>
              <path v-else d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
            </svg>
          </button>
          
          <!-- Next -->
          <button @click="nextTrack" class="w-10 h-10 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Progress bar and time -->
      <div class="mt-4 flex items-center gap-3">
        <div class="text-sm text-white/70 font-medium w-12">{{ formatTime(musicState.currentTime) }}</div>
        <div class="flex-1 bg-white/20 rounded-full h-2 relative">
          <div class="bg-pink-500 h-2 rounded-full transition-all duration-200 relative" :style="{ width: musicState.duration > 0 ? (musicState.currentTime / musicState.duration * 100) + '%' : '0%' }">
            <!-- Pink dot indicator -->
            <div class="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-pink-500 rounded-full shadow-lg"></div>
          </div>
        </div>
        <div class="text-sm text-white/70 font-medium w-12 text-right">{{ formatTime(musicState.duration) }}</div>
      </div>
      
      <!-- Additional controls -->
      <div class="mt-4 flex items-center justify-between">
        <!-- Left side - Rewind/Fast Forward -->
        <div class="flex items-center gap-2">
          <button @click="rewind" class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          <button @click="fastForward" class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" transform="scale(-1, 1) translate(-24, 0)"/>
            </svg>
          </button>
        </div>
        
        <!-- Right side - Loop/Search/Volume -->
        <div class="flex items-center gap-4">
          <!-- Loop -->
          <button class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          
          <!-- Search -->
          <button class="w-8 h-8 text-white/70 hover:text-white transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          
          <!-- Volume (pink/red) -->
          <button class="w-8 h-8 text-pink-400 hover:text-pink-300 transition-colors flex items-center justify-center">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
