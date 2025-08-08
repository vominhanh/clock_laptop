// Global Music Service
class MusicService {
  constructor() {
    this.audio = null
    this.youtubePlayer = null
    this.youtubeInterval = null
    this.isPlaying = false
    this.currentTime = 0
    this.duration = 0
    this.volume = 100
    this.muted = false
    this.loop = false
    this.url = ''
    this.title = ''
    this.thumbnail = ''
    this.listeners = new Set()
    
    // Playlist management
    this.playlist = []
    this.currentIndex = -1
    this.autoNext = true
    
    // Load YouTube API
    this.loadYouTubeAPI()
  }

  loadYouTubeAPI() {
    if (window.YT) {
      return
    }
    
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)
    
    window.onYouTubeIframeAPIReady = () => {
      // Kiểm tra xem có bài nào đang chờ load không
      if (this.url && this.url.includes('youtube.com')) {
        this.loadAudio(this.url)
      }
    }
  }

  extractVideoId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  createYouTubePlayer(videoId) {
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy()
    }
    
    // Kiểm tra YouTube API đã sẵn sàng chưa
    if (!window.YT || !window.YT.Player) {
      setTimeout(() => {
        this.createYouTubePlayer(videoId)
      }, 1000)
      return
    }
    
    this.youtubePlayer = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        rel: 0,
        showinfo: 0
      },
      events: {
        onReady: (event) => {
          this.duration = event.target.getDuration()
          const videoTitle = event.target.getVideoData().title || 'YouTube Video'
          this.title = videoTitle
          this.thumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`
          
          // Cập nhật title trong playlist
          this.updatePlaylistTrackTitle(this.url, videoTitle)
          
          this.notifyListeners()
          if (this.isPlaying) {
            event.target.playVideo()
          }
        },
        onStateChange: (event) => {
          if (event.data === window.YT.PlayerState.PLAYING) {
            this.isPlaying = true
            this.startTimeTracking()
            this.notifyListeners()
          } else if (event.data === window.YT.PlayerState.PAUSED) {
            this.isPlaying = false
            this.stopTimeTracking()
            this.notifyListeners()
          } else if (event.data === window.YT.PlayerState.ENDED) {
            if (this.loop) {
              event.target.playVideo()
            } else if (this.autoNext && this.playlist.length > 0) {
              this.nextTrack()
            } else {
              this.isPlaying = false
              this.stopTimeTracking()
              this.notifyListeners()
            }
          }
        }
      }
    })
  }

  // Cập nhật title của track trong playlist
  updatePlaylistTrackTitle(url, title) {
    const trackIndex = this.playlist.findIndex(track => track.url === url)
    if (trackIndex !== -1) {
      this.playlist[trackIndex].title = title
      this.notifyListeners()
    }
  }

  startTimeTracking() {
    this.youtubeInterval = setInterval(() => {
      if (this.youtubePlayer && this.youtubePlayer.getCurrentTime) {
        this.currentTime = this.youtubePlayer.getCurrentTime()
        this.notifyListeners()
      }
    }, 1000)
  }

  stopTimeTracking() {
    if (this.youtubeInterval) {
      clearInterval(this.youtubeInterval)
      this.youtubeInterval = null
    }
  }

  loadAudio(url) {
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy()
      this.youtubePlayer = null
    }
    this.stopTimeTracking()
    
    this.url = url
    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractVideoId(url)
      if (videoId) {
        this.createYouTubePlayer(videoId)
        // Cập nhật title và thumbnail trong playlist nếu có
        this.updatePlaylistTrackInfo(url, videoId)
      }
    } else {
      this.audio = new Audio(url)
      this.audio.addEventListener('loadedmetadata', () => {
        this.duration = this.audio.duration
        this.title = 'Audio File'
        this.thumbnail = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100&h=100&fit=crop&crop=center'
        this.notifyListeners()
      })
      this.audio.addEventListener('timeupdate', () => {
        this.currentTime = this.audio.currentTime
        this.notifyListeners()
      })
      this.audio.addEventListener('ended', () => {
        if (this.loop) {
          this.audio.currentTime = 0
          this.audio.play()
        } else if (this.autoNext && this.playlist.length > 0) {
          this.nextTrack()
        } else {
          this.isPlaying = false
          this.notifyListeners()
        }
      })
      if (this.isPlaying) this.audio.play()
    }
  }

  // Cập nhật thông tin track trong playlist
  updatePlaylistTrackInfo(url, videoId) {
    const trackIndex = this.playlist.findIndex(track => track.url === url)
    if (trackIndex !== -1) {
      // Cập nhật thumbnail
      this.playlist[trackIndex].thumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`
      this.notifyListeners()
    }
  }

  // Playlist management
  addToPlaylist(url, title = '', thumbnail = '') {
    // Nếu là YouTube URL, tự động lấy video ID để tạo thumbnail
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractVideoId(url)
      if (videoId) {
        // Tạo thumbnail URL từ video ID
        const autoThumbnail = `https://img.youtube.com/vi/${videoId}/default.jpg`
        this.playlist.push({ url, title: title || 'YouTube Video', thumbnail: thumbnail || autoThumbnail })
      } else {
        this.playlist.push({ url, title: title || 'YouTube Video', thumbnail })
      }
    } else {
      this.playlist.push({ url, title: title || 'Audio File', thumbnail })
    }
    
    if (this.currentIndex === -1) {
      this.currentIndex = 0
      // Tự động load bài đầu tiên vào playlist
      this.loadAudio(url)
    }
    this.notifyListeners()
  }

  removeFromPlaylist(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.playlist.splice(index, 1)
      if (this.currentIndex >= this.playlist.length) {
        this.currentIndex = Math.max(0, this.playlist.length - 1)
      }
      this.notifyListeners()
    }
  }

  clearPlaylist() {
    this.playlist = []
    this.currentIndex = -1
    this.notifyListeners()
  }

  // Kiểm tra YouTube player đã sẵn sàng chưa
  isYouTubePlayerReady() {
    return this.youtubePlayer && 
           this.youtubePlayer.playVideo && 
           typeof this.youtubePlayer.playVideo === 'function' &&
           this.youtubePlayer.getPlayerState &&
           this.youtubePlayer.getPlayerState() !== -1
  }

  // Force play current track
  forcePlay() {
    if (this.isYouTubePlayerReady()) {
      this.youtubePlayer.playVideo()
      this.isPlaying = true
      this.notifyListeners()
    } else if (this.audio) {
      this.audio.play()
      this.isPlaying = true
      this.notifyListeners()
    } else {
      // No player available to force play
    }
  }

  nextTrack() {
    if (this.playlist.length > 0) {
      // Nếu chưa có bài nào đang phát, bắt đầu từ bài đầu tiên
      if (this.currentIndex === -1) {
        this.currentIndex = 0
      } else {
        this.currentIndex = (this.currentIndex + 1) % this.playlist.length
      }
      
      const track = this.playlist[this.currentIndex]
      
      // Lưu trạng thái playing hiện tại
      const wasPlaying = this.isPlaying
      
      // Load bài mới
      this.loadAudio(track.url)
      
      // Tự động phát nếu đang trong trạng thái playing
      if (wasPlaying) {
        // Đợi một chút để YouTube player được tạo
        setTimeout(() => {
          if (this.isYouTubePlayerReady()) {
            this.youtubePlayer.playVideo()
          } else if (this.audio) {
            this.audio.play()
          } else {
            // Retry after another second
            setTimeout(() => {
              if (this.isYouTubePlayerReady()) {
                this.youtubePlayer.playVideo()
              } else if (this.audio) {
                this.audio.play()
              } else {
                this.forcePlay()
              }
            }, 1000)
          }
        }, 1000)
      }
    }
  }

  previousTrack() {
    if (this.playlist.length > 0) {
      // Nếu chưa có bài nào đang phát, bắt đầu từ bài cuối
      if (this.currentIndex === -1) {
        this.currentIndex = this.playlist.length - 1
      } else {
        this.currentIndex = this.currentIndex <= 0 ? this.playlist.length - 1 : this.currentIndex - 1
      }
      const track = this.playlist[this.currentIndex]
      
      // Lưu trạng thái playing hiện tại
      const wasPlaying = this.isPlaying
      
      this.loadAudio(track.url)
      // Tự động phát nếu đang trong trạng thái playing
      if (wasPlaying) {
        setTimeout(() => {
          if (this.isYouTubePlayerReady()) {
            this.youtubePlayer.playVideo()
          } else if (this.audio) {
            this.audio.play()
          } else {
            // Retry after another second
            setTimeout(() => {
              if (this.isYouTubePlayerReady()) {
                this.youtubePlayer.playVideo()
              } else if (this.audio) {
                this.audio.play()
              }
            }, 1000)
          }
        }, 1000)
      }
    }
  }

  playTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentIndex = index
      const track = this.playlist[index]
      
      // Lưu trạng thái playing hiện tại
      const wasPlaying = this.isPlaying
      
      this.loadAudio(track.url)
      // Tự động phát nếu đang trong trạng thái playing
      if (wasPlaying) {
        setTimeout(() => {
          if (this.isYouTubePlayerReady()) {
            this.youtubePlayer.playVideo()
          } else if (this.audio) {
            this.audio.play()
          } else {
            // Retry after another second
            setTimeout(() => {
              if (this.isYouTubePlayerReady()) {
                this.youtubePlayer.playVideo()
              } else if (this.audio) {
                this.audio.play()
              }
            }, 1000)
          }
        }, 1000)
      }
    }
  }

  toggleAutoNext() {
    this.autoNext = !this.autoNext
    this.notifyListeners()
  }

  toggle() {
    this.isPlaying = !this.isPlaying
    
    if (this.youtubePlayer) {
      if (this.isPlaying) {
        this.youtubePlayer.playVideo()
      } else {
        this.youtubePlayer.pauseVideo()
      }
    } else if (this.audio) {
      if (this.isPlaying) {
        this.audio.play()
      } else {
        this.audio.pause()
      }
    }
    
    this.notifyListeners()
  }

  toggleMute() {
    this.muted = !this.muted
    if (this.youtubePlayer) {
      if (this.muted) {
        this.youtubePlayer.mute()
      } else {
        this.youtubePlayer.unMute()
      }
    } else if (this.audio) {
      this.audio.muted = this.muted
    }
    this.notifyListeners()
  }

  toggleLoop() {
    this.loop = !this.loop
    this.notifyListeners()
  }

  setVolume(newVolume) {
    this.volume = newVolume
    if (this.youtubePlayer) {
      this.youtubePlayer.setVolume(newVolume)
    } else if (this.audio) {
      this.audio.volume = newVolume / 100
    }
    this.notifyListeners()
  }

  seekTo(time) {
    if (this.youtubePlayer) {
      this.youtubePlayer.seekTo(time)
    } else if (this.audio) {
      this.audio.currentTime = time
    }
  }

  // Fast forward/rewind
  fastForward(seconds = 10) {
    const newTime = Math.min(this.currentTime + seconds, this.duration)
    this.seekTo(newTime)
  }

  rewind(seconds = 10) {
    const newTime = Math.max(this.currentTime - seconds, 0)
    this.seekTo(newTime)
  }

  // Observer pattern for state changes
  addListener(callback) {
    this.listeners.add(callback)
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }

  notifyListeners() {
    this.listeners.forEach(callback => {
      callback({
        isPlaying: this.isPlaying,
        currentTime: this.currentTime,
        duration: this.duration,
        volume: this.volume,
        muted: this.muted,
        loop: this.loop,
        url: this.url,
        title: this.title,
        thumbnail: this.thumbnail,
        playlist: this.playlist,
        currentIndex: this.currentIndex,
        autoNext: this.autoNext
      })
    })
  }

  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentTime,
      duration: this.duration,
      volume: this.volume,
      muted: this.muted,
      loop: this.loop,
      url: this.url,
      title: this.title,
      thumbnail: this.thumbnail,
      playlist: this.playlist,
      currentIndex: this.currentIndex,
      autoNext: this.autoNext
    }
  }

  destroy() {
    if (this.audio) {
      this.audio.pause()
      this.audio = null
    }
    if (this.youtubePlayer) {
      this.youtubePlayer.destroy()
      this.youtubePlayer = null
    }
    this.stopTimeTracking()
    this.listeners.clear()
  }
}

// Create singleton instance
const musicService = new MusicService()

export default musicService
