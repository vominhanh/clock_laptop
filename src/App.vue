<script setup>
import { ref } from 'vue'
import Timer from './components/Timer.vue'
import TaskList from './components/TaskList.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const mode = ref('up') // 'up' | 'down'
const startSeconds = ref(0)

function applyTask(payload) {
  // payload: { task, durationSeconds, start, end }
  mode.value = 'down'
  startSeconds.value = payload.durationSeconds
}

function onFinished() {
  alert('Hoàn thành!')
}
</script>

<template>
  <div class="min-h-screen w-full bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=2070&auto=format&fit=crop');">
    <div class="min-h-screen w-full bg-black/40">
      <div class="container mx-auto p-4 flex flex-col gap-6">
        <div class="flex justify-between items-center">
          <div class="glass px-3 py-2 flex items-center gap-2">
            <button :class="['px-3 py-1 rounded font-semibold', mode==='up' ? 'bg-cyan-500 text-black' : 'bg-slate-700']" @click="mode='up'">Đếm lên</button>
            <button :class="['px-3 py-1 rounded font-semibold', mode==='down' ? 'bg-cyan-500 text-black' : 'bg-slate-700']" @click="mode='down'">Đếm ngược</button>
          </div>
        </div>

        <Timer :mode="mode" :start-seconds="startSeconds" @finished="onFinished" />

        <TaskList @select="applyTask" />

        <MusicPlayer />
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
