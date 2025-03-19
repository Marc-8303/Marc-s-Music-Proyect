document.addEventListener('DOMContentLoaded', () => {
    const uploadForm = document.getElementById('uploadForm');
    const fileList = document.getElementById('fileList');
    const playlist = document.getElementById('playlist');
    const audioPlayer = document.getElementById('audioPlayer');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const playBtn = document.getElementById('playBtn');
    const currentTrackName = document.getElementById('currentTrackName');
    const currentTimeEl = document.getElementById('currentTime');
    const durationEl = document.getElementById('duration');
    const progressBar = document.querySelector('.progress');
    const progressContainer = document.querySelector('.progress-bar');
    const volumeSlider = document.querySelector('.volume-slider');
  
    let currentTrack = 0;
    let playlistArray = [];
    let isPlaying = false;
  
    // Cargar la lista de archivos subidos
    function loadFiles() {
      fetch('/files')
        .then(response => response.json())
        .then(files => {
          fileList.innerHTML = '';
          files.forEach(file => {
            const li = document.createElement('li');
            li.textContent = file;
            
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'track-actions';
            
            const addBtn = document.createElement('button');
            addBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addBtn.className = 'track-action-btn';
            addBtn.onclick = () => addToPlaylist(file);
            
            actionsDiv.appendChild(addBtn);
            li.appendChild(actionsDiv);
            fileList.appendChild(li);
          });
        });
    }
  
    // Agregar canción a la lista de reproducción
    function addToPlaylist(file) {
      if (!playlistArray.includes(file)) {
        playlistArray.push(file);
        updatePlaylist();
      }
    }
  
    // Actualizar la lista de reproducción en la interfaz
    function updatePlaylist() {
      playlist.innerHTML = '';
      playlistArray.forEach((file, index) => {
        const li = document.createElement('li');
        li.textContent = file;
  
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'track-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '<i class="fas fa-trash"></i>';
        removeBtn.className = 'track-action-btn';
        removeBtn.onclick = () => removeFromPlaylist(index);
        
        const upBtn = document.createElement('button');
        upBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        upBtn.className = 'track-action-btn';
        upBtn.onclick = () => moveTrack(index, -1);
        
        const downBtn = document.createElement('button');
        downBtn.innerHTML = '<i class="fas fa-arrow-down"></i>';
        downBtn.className = 'track-action-btn';
        downBtn.onclick = () => moveTrack(index, 1);
  
        actionsDiv.appendChild(removeBtn);
        actionsDiv.appendChild(upBtn);
        actionsDiv.appendChild(downBtn);
        li.appendChild(actionsDiv);
        playlist.appendChild(li);
      });
    }
  
    // Quitar canción de la lista de reproducción
    function removeFromPlaylist(index) {
      playlistArray.splice(index, 1);
      updatePlaylist();
    }
  
    // Mover canción hacia arriba o abajo en la lista
    function moveTrack(index, direction) {
      const newIndex = index + direction;
      if (newIndex >= 0 && newIndex < playlistArray.length) {
        [playlistArray[index], playlistArray[newIndex]] = [playlistArray[newIndex], playlistArray[index]];
        updatePlaylist();
      }
    }
  
    // Reproducir/pausar una pista
    function togglePlay() {
      if (playlistArray.length === 0) return;
      
      if (isPlaying) {
        audioPlayer.pause();
      } else {
        if (audioPlayer.src === '') {
          playTrack(currentTrack);
        } else {
          audioPlayer.play();
        }
      }
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
    }
  
    // Reproducir una pista
    function playTrack(index) {
      if (index >= 0 && index < playlistArray.length) {
        currentTrack = index;
        audioPlayer.src = `/uploads/${playlistArray[currentTrack]}`;
        currentTrackName.textContent = playlistArray[currentTrack];
        audioPlayer.play();
        isPlaying = true;
        playBtn.innerHTML = '<i class="fas fa-pause"></i>';
      } else {
        currentTrackName.textContent = 'Ninguna canción';
        isPlaying = false;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
      }
    }
  
    // Subir archivo
    uploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(uploadForm);
      fetch('/upload', {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(() => {
        loadFiles();
        uploadForm.reset();
      });
    });
  
    // Botón "Anterior"
    prevBtn.addEventListener('click', () => {
      if (currentTrack > 0) {
        playTrack(currentTrack - 1);
      }
    });
  
    // Botón "Siguiente"
    nextBtn.addEventListener('click', () => {
      if (currentTrack < playlistArray.length - 1) {
        playTrack(currentTrack + 1);
      } else {
        playTrack(0); // Repetir desde el principio
      }
    });
  
    // Botón "Reproducir/Pausar"
    playBtn.addEventListener('click', togglePlay);
  
    // Actualizar tiempo de reproducción
    audioPlayer.addEventListener('timeupdate', () => {
      const { currentTime, duration } = audioPlayer;
      const progressPercent = (currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
      
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60).toString().padStart(2, '0');
      currentTimeEl.textContent = `${minutes}:${seconds}`;
      
      if (duration) {
        const durationMinutes = Math.floor(duration / 60);
        const durationSeconds = Math.floor(duration % 60).toString().padStart(2, '0');
        durationEl.textContent = `${durationMinutes}:${durationSeconds}`;
      }
    });
  
    // Cambiar posición del audio
    progressContainer.addEventListener('click', (e) => {
      const width = progressContainer.clientWidth;
      const clickPosition = e.offsetX;
      const duration = audioPlayer.duration;
      audioPlayer.currentTime = (clickPosition / width) * duration;
    });
  
    // Control de volumen
    volumeSlider.addEventListener('input', () => {
      audioPlayer.volume = volumeSlider.value;
    });
  
    // Cuando termine una canción, pasar a la siguiente
    audioPlayer.addEventListener('ended', () => {
      if (currentTrack < playlistArray.length - 1) {
        playTrack(currentTrack + 1);
      } else {
        playTrack(0); // Repetir desde el principio
      }
    });
  
    // Cargar archivos al iniciar
    loadFiles();
  
    // Establecer volumen inicial
    audioPlayer.volume = 0.7;
});