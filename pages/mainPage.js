const { ipcRenderer } = require('electron');

const handleOPEN_CAPTURE_WINDOW = () => {
  ipcRenderer.send('OPEN_CAPTURE_WINDOW');
};

const handleTimeChange = () => {
  const video = document.getElementById('video');
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  if (video.currentTime > endTime) {
    video.currentTime = startTime;
  }
};

const handleLoadData = () => {
  const video = document.getElementById('video');
  video.addEventListener('timeupdate', handleTimeChange);
  const endTime = document.getElementById('endTime');
  endTime.value = video.duration;
};

const handleSaveGif = () => {
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const loading = document.getElementById('loading');
  loading.setAttribute('style', '');
  ipcRenderer.send('SAVE_GIF', { startTime, endTime });
};

ipcRenderer.on('SAVE_GIF_DONE', () => {
  const loading = document.getElementById('loading');
  loading.setAttribute('style', 'display:none');
});

document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.getElementById('captureButton');
  captureButton.addEventListener('click', handleOPEN_CAPTURE_WINDOW);
  const video = document.getElementById('video');
  video.addEventListener('loadedmetadata', handleLoadData);
  const saveButton = document.getElementById('save');
  saveButton.addEventListener('click', handleSaveGif);
});
