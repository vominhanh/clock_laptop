<script setup>
import { ref } from 'vue'

const emit = defineEmits(['select'])

const tasks = ref([
  { id: 1, title: 'Tập thể dục', start: '06:00', end: '08:00' },
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
  <div class="glass p-4 w-full max-w-xl mx-auto">
    <h2 class="text-xl font-bold mb-3">Task trong ngày</h2>
    <div class="space-y-2 max-h-52 overflow-auto pr-2">
      <div v-for="t in tasks" :key="t.id" class="flex items-center justify-between bg-white/5 px-3 py-2 rounded">
        <div>
          <div class="font-semibold">{{ t.title }}</div>
          <div class="text-white/70 text-sm">{{ t.start }} → {{ t.end }}</div>
        </div>
        <button class="px-3 py-1 rounded bg-cyan-500 text-black font-semibold" @click="pick(t)">Chọn</button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-1 md:grid-cols-4 gap-2">
      <input v-model="newTask.title" class="md:col-span-2 px-3 py-2 rounded bg-slate-800 border border-white/10" placeholder="Tên task" />
      <input v-model="newTask.start" type="time" class="px-3 py-2 rounded bg-slate-800 border border-white/10" />
      <input v-model="newTask.end" type="time" class="px-3 py-2 rounded bg-slate-800 border border-white/10" />
      <button class="md:col-span-4 px-3 py-2 rounded bg-emerald-500 text-black font-semibold" @click="addTask">Thêm task</button>
    </div>
  </div>
</template>

<style scoped>
</style>



