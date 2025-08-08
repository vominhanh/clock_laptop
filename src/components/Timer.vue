<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch, onMounted } from 'vue'

// Props: initial time in seconds and mode: 'up' or 'down'
const props = defineProps({
  startSeconds: { type: Number, default: 0 },
  mode: { type: String, default: 'up' }, // 'up' | 'down'
})

const emit = defineEmits(['finished', 'update:time'])

const state = reactive({
  totalSeconds: props.startSeconds,
  running: false,
})

const isFullscreen = ref(false)
const currentMode = ref(props.mode || 'down')

let intervalId = null

const timeText = computed(() => {
  const minutes = Math.floor(state.totalSeconds / 60)
  const seconds = state.totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

function start() {
  if (state.running) return
  state.running = true
  intervalId = setInterval(() => {
    if (currentMode.value === 'up') {
      state.totalSeconds += 1
      emit('update:time', state.totalSeconds)
    } else {
      if (state.totalSeconds > 0) {
        state.totalSeconds -= 1
        emit('update:time', state.totalSeconds)
      } else {
        finish()
      }
    }
  }, 1000)
}

function pause() {
  if (!state.running) return
  state.running = false
  clearInterval(intervalId)
}

function reset(toSeconds) {
  pause()
  state.totalSeconds = typeof toSeconds === 'number' ? toSeconds : props.startSeconds
}

function finish() {
  pause()
  emit('finished')
}

function toggleFullscreen() {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.body.style.overflow = 'hidden'
    // Request fullscreen for the entire screen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen()
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen()
    }
  } else {
    document.body.style.overflow = 'auto'
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen()
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen()
    }
  }
}

function switchMode(newMode) {
  currentMode.value = newMode
  reset()
}

watch(
  () => props.startSeconds,
  (v) => {
    state.totalSeconds = v
  }
)

watch(
  () => props.mode,
  (v) => {
    currentMode.value = v || 'down'
  }
)

onMounted(() => {
  // Listen for fullscreen changes
  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
      // User exited fullscreen
      isFullscreen.value = false
      document.body.style.overflow = 'auto'
    }
  }

  // Handle keyboard events
  const handleKeydown = (event) => {
    if (event.key === 'Escape' && isFullscreen.value) {
      toggleFullscreen()
    }
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  document.addEventListener('msfullscreenchange', handleFullscreenChange)
  document.addEventListener('keydown', handleKeydown)

  // Store cleanup function
  const cleanup = () => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('msfullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
  }

  // Cleanup on unmount
  onBeforeUnmount(() => {
    cleanup()
    clearInterval(intervalId)
    document.body.style.overflow = 'auto'
  })
})

const inputMinutes = ref(0)
const inputSeconds = ref(0)

function applyCustomTime() {
  const secs = Math.max(0, Math.floor(inputMinutes.value) * 60 + Math.floor(inputSeconds.value))
  reset(secs)
}
</script>

<template>
  <!-- Fullscreen Mode -->
  <div v-if="isFullscreen" class="fixed inset-0 bg-gradient-to-br from-black via-gray-900 to-black z-50 flex flex-col items-center justify-center animate-in fade-in duration-500">
    <!-- Exit Fullscreen Button -->
    <button 
      @click="toggleFullscreen" 
      class="absolute top-8 right-8 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm hover:scale-110 border border-white/20 shadow-2xl hover:shadow-white/20 z-10 group"
      title="Thoát fullscreen (ESC)"
    >
      <svg fill="currentColor" viewBox="0 0 24 24" class="w-8 h-8 group-hover:rotate-90 transition-transform duration-300">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
    
    <!-- Timer Display -->
    <div class="text-center">
      <div class="text-[25vw] leading-none font-bold tracking-wider drop-shadow-2xl animate-in slide-in-up duration-1000 bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
        {{ timeText }}
      </div>
      <div class="mt-12 text-white/70 text-3xl animate-in slide-in-up duration-1000 delay-300">
        Chế độ: <span class="font-semibold text-pink-400">{{ currentMode === 'up' ? 'Đếm lên' : 'Đếm ngược' }}</span>
      </div>
    </div>
  </div>

  <!-- Normal Mode -->
  <div v-else class="w-full flex flex-col items-center justify-center gap-8 select-none">
    <!-- Main Timer Display -->
    <div class="text-center">
      <div class="text-[15vw] md:text-[12vw] lg:text-[8vw] leading-none font-bold tracking-wider drop-shadow-2xl bg-gradient-to-r from-white via-pink-100 to-white bg-clip-text text-transparent">
        {{ timeText }}
      </div>
      <div class="mt-6 text-white/70 text-xl">
        Chế độ: <span class="font-semibold text-pink-400">{{ currentMode === 'up' ? 'Đếm lên' : 'Đếm ngược' }}</span>
      </div>
    </div>

    <!-- Mode Selection -->
    <div class="glass px-6 py-4 rounded-2xl flex items-center gap-4 shadow-2xl">
      <span class="text-white font-semibold">Chế độ:</span>
      <button 
        @click="switchMode('up')" 
        class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
        :class="currentMode === 'up' 
          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-black' 
          : 'bg-white/10 text-white hover:bg-white/20'"
      >
        Đếm lên
      </button>
      <button 
        @click="switchMode('down')" 
        class="px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg"
        :class="currentMode === 'down' 
          ? 'bg-gradient-to-r from-pink-500 to-pink-400 text-black' 
          : 'bg-white/10 text-white hover:bg-white/20'"
      >
        Đếm ngược
      </button>
    </div>

    <!-- Control Panel -->
    <div class="glass px-8 py-8 rounded-2xl flex flex-wrap items-center justify-center gap-6 shadow-2xl">
      <!-- Main Controls -->
      <div class="flex items-center gap-4">
        <button 
          class="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold transition-all duration-200 shadow-lg flex items-center gap-2" 
          @click="start"
          :disabled="state.running"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Bắt đầu
        </button>
        
        <button 
          class="px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold transition-all duration-200 shadow-lg flex items-center gap-2" 
          @click="pause"
          :disabled="!state.running"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
          Tạm dừng
        </button>
        
        <button 
          class="px-8 py-4 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 font-semibold transition-all duration-200 shadow-lg flex items-center gap-2" 
          @click="reset()"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
          </svg>
          Đặt lại
        </button>

        <!-- Fullscreen Button -->
        <button 
          @click="toggleFullscreen" 
          class="px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-400 hover:from-purple-400 hover:to-purple-300 text-black font-semibold transition-all duration-200 shadow-lg flex items-center gap-2"
        >
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5">
            <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
          Fullscreen
        </button>
      </div>

      <!-- Custom Time Input -->
      <div class="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
        <div class="flex items-center gap-3">
          <input 
            type="number" 
            min="0" 
            class="w-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-center text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-200" 
            v-model.number="inputMinutes" 
            placeholder="phút" 
          />
          <span class="text-white/70 font-bold text-xl">:</span>
          <input 
            type="number" 
            min="0" 
            class="w-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-center text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all duration-200" 
            v-model.number="inputSeconds" 
            placeholder="giây" 
          />
        </div>
        <button 
          class="px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold transition-all duration-200 shadow-lg hover:from-emerald-400 hover:to-emerald-300" 
          @click="applyCustomTime"
        >
          Áp dụng
        </button>
      </div>
    </div>

    <!-- Status Indicator -->
    <div class="flex items-center gap-3 text-white/70">
      <div class="w-3 h-3 rounded-full" :class="state.running ? 'bg-green-400 animate-pulse' : 'bg-gray-400'"></div>
      <span class="font-medium">{{ state.running ? 'Đang chạy' : 'Đã dừng' }}</span>
    </div>
  </div>
</template>

<style scoped>
</style>


