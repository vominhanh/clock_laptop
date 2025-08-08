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
  <div class="w-full h-full flex flex-col items-center justify-center gap-8 select-none">
    <div class="text-center">
      <div class="text-[20vw] leading-none font-bold tracking-wider drop-shadow-lg">
        {{ timeText }}
      </div>
      <div class="mt-2 text-white/70 text-lg">
        Chế độ: <span class="font-semibold">{{ props.mode === 'up' ? 'Đếm lên' : 'Đếm ngược' }}</span>
      </div>
    </div>

    <div class="glass px-6 py-4 flex flex-wrap items-center justify-center gap-3">
      <button class="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold" @click="start">Bắt đầu</button>
      <button class="px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black font-semibold" @click="pause">Tạm dừng</button>
      <button class="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 font-semibold" @click="reset()">Đặt lại</button>

      <div class="flex items-center gap-2 ml-4">
        <input type="number" min="0" class="w-20 px-2 py-1 rounded bg-slate-800 border border-white/10" v-model.number="inputMinutes" placeholder="phút" />
        <span>:</span>
        <input type="number" min="0" class="w-20 px-2 py-1 rounded bg-slate-800 border border-white/10" v-model.number="inputSeconds" placeholder="giây" />
        <button class="px-3 py-1 rounded bg-emerald-500 text-black font-semibold" @click="applyCustomTime">Áp dụng</button>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
</style>


