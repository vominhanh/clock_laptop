<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'

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
    if (props.mode === 'up') {
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

watch(
  () => props.startSeconds,
  (v) => {
    state.totalSeconds = v
  }
)

onBeforeUnmount(() => clearInterval(intervalId))

const inputMinutes = ref(0)
const inputSeconds = ref(0)

function applyCustomTime() {
  const secs = Math.max(0, Math.floor(inputMinutes.value) * 60 + Math.floor(inputSeconds.value))
  reset(secs)
}
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center gap-8 select-none">
    <div class="text-center">
      <div class="text-[15vw] md:text-[12vw] lg:text-[8vw] leading-none font-bold tracking-wider drop-shadow-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
        {{ timeText }}
      </div>
      <div class="mt-4 text-white/70 text-lg">
        Chế độ: <span class="font-semibold text-pink-400">{{ props.mode === 'up' ? 'Đếm lên' : 'Đếm ngược' }}</span>
      </div>
    </div>

    <div class="glass px-8 py-6 rounded-2xl flex flex-wrap items-center justify-center gap-4">
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-black font-semibold transition-all duration-200 shadow-lg" @click="start">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 inline mr-2">
          <path d="M8 5v14l11-7z"/>
        </svg>
        Bắt đầu
      </button>
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-400 hover:to-yellow-300 text-black font-semibold transition-all duration-200 shadow-lg" @click="pause">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 inline mr-2">
          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
        </svg>
        Tạm dừng
      </button>
      <button class="px-6 py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 font-semibold transition-all duration-200 shadow-lg" @click="reset()">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 inline mr-2">
          <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
        </svg>
        Đặt lại
      </button>

      <div class="flex items-center gap-3 ml-4">
        <input type="number" min="0" class="w-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-center" v-model.number="inputMinutes" placeholder="phút" />
        <span class="text-white/70 font-bold">:</span>
        <input type="number" min="0" class="w-20 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 text-center" v-model.number="inputSeconds" placeholder="giây" />
        <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold transition-all duration-200" @click="applyCustomTime">Áp dụng</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>


