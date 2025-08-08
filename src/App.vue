<script setup>
import { ref } from 'vue'
import Timer from './components/Timer.vue'
import TaskList from './components/TaskList.vue'
import MusicPlayer from './components/MusicPlayer.vue'

const mode = ref('up') // 'up' | 'down'
const startSeconds = ref(0)
const currentView = ref('timer') // 'timer', 'tasks', 'music'

function applyTask(payload) {
  // payload: { task, durationSeconds, start, end }
  mode.value = 'down'
  startSeconds.value = payload.durationSeconds
  currentView.value = 'timer'
}

function onFinished() {
  alert('Hoàn thành!')
}
</script>

<template>
  <div class="min-h-screen w-full bg-cover bg-center relative" style="background-image: url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop');">
    <!-- Overlay để làm tối nền -->
    <div class="absolute inset-0 bg-black/30"></div>
    
    <!-- Sidebar bên trái -->
    <div class="fixed left-0 top-0 h-full w-16 bg-gradient-to-b from-gray-900/90 to-gray-800/90 backdrop-blur-sm border-r border-white/10 flex flex-col items-center py-6 z-20">
      <!-- Tasks -->
      <div class="w-10 h-10 bg-pink-500 rounded-lg flex items-center justify-center mb-6 cursor-pointer" @click="currentView = 'tasks'">
        <span class="text-white font-bold text-sm">M</span>
      </div>
      
      <!-- Pen -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
        </svg>
      </div>
      
      <!-- Heart -->
      <div class="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mb-4 cursor-pointer">
        <svg fill="white" viewBox="0 0 24 24" class="w-4 h-4">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>
      
      <!-- Document -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      </div>
      
      <!-- People -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01 1l-1.7 2.26V16h-1.5v6h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v6h1.5v7h4z"/>
        </svg>
      </div>
      
      <!-- Circle -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10"/>
        </svg>
      </div>
      
      <!-- Flag -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>
        </svg>
      </div>
      
      <!-- Music -->
      <div class="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center mb-4 cursor-pointer" @click="currentView = 'music'">
        <svg fill="white" viewBox="0 0 24 24" class="w-4 h-4">
          <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
        </svg>
      </div>
      
      <!-- Bell -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
        </svg>
      </div>
      
      <!-- Profile -->
      <div class="w-8 h-8 text-white/70 hover:text-white mb-4 cursor-pointer">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        </svg>
      </div>
      
      <!-- Home URL -->
      <div class="mt-auto text-white/50 text-xs text-center px-2">
        https://app.csw.live/home
      </div>
    </div>
    
    <!-- Main content -->
    <div class="ml-16 p-6">
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
        <MusicPlayer />
      </div>
    </div>
    
    <!-- Music Player Widget (Bottom Right) -->
    <div class="fixed bottom-6 right-6 glass p-4 rounded-2xl w-80 z-10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
          <svg fill="white" viewBox="0 0 24 24" class="w-6 h-6">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
        </div>
        <div class="flex-1">
          <div class="font-semibold">Những Cơn Đau Ngày Đi</div>
          <div class="text-white/70 text-sm">https://www.youtube.com/watc</div>
        </div>
        <div class="flex items-center gap-2">
          <button class="w-8 h-8 text-white/70 hover:text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>
          <button class="w-8 h-8 text-white/70 hover:text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </button>
          <button class="w-8 h-8 text-white/70 hover:text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
          <button class="w-8 h-8 text-white/70 hover:text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
          <button class="w-8 h-8 text-white/70 hover:text-white">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <div class="text-sm text-white/70">01:03</div>
        <div class="flex-1 bg-white/20 rounded-full h-1">
          <div class="bg-pink-500 h-1 rounded-full" style="width: 28%"></div>
        </div>
        <div class="text-sm text-white/70">03:46</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
