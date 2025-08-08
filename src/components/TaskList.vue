<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const tasks = ref([
  { id: 1, title: 'Tập thể dục', start: '06:00', end: '08:00' },
  { id: 2, title: 'Học Vue.js', start: '09:00', end: '11:00' },
  { id: 3, title: 'Ăn trưa', start: '12:00', end: '13:00' },
])

const newTask = ref({ title: '', start: '00:00', end: '00:00' })

function addTask() {
  if (!newTask.value.title) return
  const id = Math.max(0, ...tasks.value.map(t => t.id)) + 1
  tasks.value.push({ id, ...newTask.value })
  newTask.value = { title: '', start: '00:00', end: '00:00' }
}

function toSeconds(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 3600 + m * 60
}

function pick(task) {
  const seconds = toSeconds(task.end) - toSeconds(task.start)
  emit('select', { task, durationSeconds: Math.max(0, seconds), start: task.start, end: task.end })
}
</script>

<template>
  <div class="glass p-8 rounded-2xl w-full max-w-2xl mx-auto">
    <h2 class="text-2xl font-bold mb-6 text-center">Task trong ngày</h2>
    
    <div class="space-y-3 max-h-64 overflow-auto pr-2 mb-6">
      <div v-for="t in tasks" :key="t.id" class="flex items-center justify-between bg-white/5 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200">
        <div class="flex-1">
          <div class="font-semibold text-lg">{{ t.title }}</div>
          <div class="text-white/70 text-sm flex items-center gap-2">
            <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>
              <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            {{ t.start }} → {{ t.end }}
          </div>
        </div>
        <button class="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold hover:from-cyan-400 hover:to-cyan-300 transition-all duration-200 shadow-lg" @click="pick(t)">
          <svg fill="currentColor" viewBox="0 0 24 24" class="w-4 h-4 inline mr-1">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Chọn
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
      <input v-model="newTask.title" class="md:col-span-2 px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10 placeholder-white/50" placeholder="Tên task" />
      <input v-model="newTask.start" type="time" class="px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10" />
      <input v-model="newTask.end" type="time" class="px-4 py-3 rounded-xl bg-slate-800/50 border border-white/10" />
      <button class="md:col-span-4 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 text-black font-semibold hover:from-emerald-400 hover:to-emerald-300 transition-all duration-200 shadow-lg" @click="addTask">
        <svg fill="currentColor" viewBox="0 0 24 24" class="w-5 h-5 inline mr-2">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
        Thêm task
      </button>
    </div>
  </div>
</template>

<style scoped>
</style>



