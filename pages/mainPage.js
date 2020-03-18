const { ipcRenderer } = require('electron');

const setLoadingTrue = () => {
  const loading = document.getElementById('loadingBackground');
  loading.setAttribute('style', '');
};

const setLoadingFalse = () => {
  const loading = document.getElementById('loadingBackground');
  loading.setAttribute('style', 'display: none;');
};

ipcRenderer.on('SET_LOADING', (__event, status) => {
  status ? setLoadingTrue() : setLoadingFalse();
});

const handleStartRecordin = () => {
  ipcRenderer.send('OPEN_CAPTURE_WINDOW');
};

const handleTimeChange = () => {
  const video = document.getElementById('video');
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  const playedStrip = document.getElementById('played');
  newTimeToPercentage = val => {
    low1 = startTime;
    high1 = endTime;
    low2 = 0;
    high2 = 100;
    return low2 + ((val - low1) * (high2 - low2)) / (high1 - low1);
  };
  const width = newTimeToPercentage(video.currentTime);
  playedStrip.setAttribute('style', `width: ${width}%`);
  if (video.currentTime > endTime) {
    video.currentTime = startTime;
  }
};

const handleVideoEnd = () => {
  const video = document.getElementById('video');
  const startTime = document.getElementById('startTime').value;
  video.currentTime = startTime;
  video.play();
};

const handleLoadData = () => {
  const video = document.getElementById('video');
  // video.addEventListener('timeupdate', handleTimeChange);
  setInterval(handleTimeChange, 10);
  video.addEventListener('ended', handleVideoEnd);
  const endTime = document.getElementById('endTime');
  endTime.value = video.duration;
};

const handleSaveGif = () => {
  const startTime = document.getElementById('startTime').value;
  const endTime = document.getElementById('endTime').value;
  setLoadingTrue();
  ipcRenderer.send('SAVE_GIF', { startTime, endTime });
};

const handleClearFile = () => {
  ipcRenderer.send('CLEAR_FILE');
};

ipcRenderer.on('CLEAR_FILE_SUCCESS', () => {
  location.reload();
});

ipcRenderer.on('SAVE_GIF_DONE', setLoadingFalse);

const setPlayTime = ({ newStartTime, newEndTime }) => {
  const startTimeInput = document.getElementById('startTime');
  const endTimeInput = document.getElementById('endTime');
  const playTime = document.getElementById('playTime');
  const video = document.getElementById('video');
  const outerMargin = 28;

  const startTime = newStartTime || startTimeInput.value;
  const endTime = newEndTime || endTimeInput.value;

  startTimeInput.value = startTime;
  endTimeInput.value = endTime;

  timestampToPixels = val => {
    low1 = 0;
    high1 = video.duration;
    low2 = outerMargin;
    high2 = window.innerWidth - outerMargin;
    return low2 + ((val - low1) * (high2 - low2)) / (high1 - low1);
  };

  playTime.setAttribute(
    'style',
    `
    margin-left: ${timestampToPixels(startTime) - outerMargin}px;
    margin-right: ${window.innerWidth -
      timestampToPixels(endTime) -
      outerMargin}px;
    `,
  );
};

const handleChangeStartTimeStart = () => {
  const video = document.getElementById('video');
  const startCursor = document.getElementById('startTimeCursor');

  const outerMargin = 28;
  // allow for changes in start time based on mouse position
  pixelsToTimestamp = val => {
    low1 = outerMargin;
    high1 = window.innerWidth - outerMargin;
    low2 = 0;
    high2 = video.duration;
    return low2 + ((val - low1) * (high2 - low2)) / (high1 - low1);
  };

  document.onmousemove = event => {
    event.preventDefault();
    // update start time based on mouse position
    const mouseX = event.clientX;
    const newPosition = Math.min(
      Math.max(mouseX, outerMargin),
      window.innerWidth - outerMargin,
    );
    const newStartTime = Math.min(
      Math.max(pixelsToTimestamp(mouseX).toFixed(4), 0),
      video.duration,
    );

    video.currentTime = newStartTime;

    startCursor.setAttribute('style', `left: ${newPosition}px`);
    setPlayTime({ newStartTime });
  };
  document.onmouseup = () => {
    // stop changing start time
    document.onmousemove = null;
    document.onmouseup = null;
  };
};

const handleChangeEndTimeStart = () => {
  const video = document.getElementById('video');
  const endCursor = document.getElementById('endTimeCursor');

  const outerMargin = 28;
  // allow for changes in end time based on mouse position
  pixelsToTimestamp = val => {
    low1 = outerMargin;
    high1 = window.innerWidth - outerMargin;
    low2 = 0;
    high2 = video.duration;
    return low2 + ((val - low1) * (high2 - low2)) / (high1 - low1);
  };

  document.onmousemove = event => {
    event.preventDefault();
    // update end time based on mouse position
    const mouseX = event.clientX;
    const newPosition = Math.min(
      Math.max(mouseX, outerMargin),
      window.innerWidth - outerMargin,
    );
    const newEndTime = Math.min(
      Math.max(pixelsToTimestamp(mouseX).toFixed(4), 0),
      video.duration,
    );

    video.currentTime = newEndTime;

    endCursor.setAttribute('style', `left: ${newPosition}px`);
    setPlayTime({ newEndTime });
  };
  document.onmouseup = () => {
    // stop changing end time
    document.onmousemove = null;
    document.onmouseup = null;
  };
};

ipcRenderer.on('LOAD_VIDEO', () => {
  const video = document.getElementById('video');
  setLoadingTrue();
  attemptToLoadVideo = setInterval(() => {
    if (video.duration && video.duration !== Infinity) {
      clearInterval(attemptToLoadVideo);
      location.reload();
    }
  }, 1000);
});

document.addEventListener('DOMContentLoaded', () => {
  const captureButton = document.getElementById('captureButton');
  const clearFileButton = document.getElementById('clearFileButton');
  const video = document.getElementById('video');
  const saveButton = document.getElementById('save');
  const startCursor = document.getElementById('startTimeCursor');
  const endCursor = document.getElementById('endTimeCursor');

  captureButton.addEventListener('click', handleStartRecordin);
  clearFileButton.addEventListener('click', handleClearFile);
  video.addEventListener('loadedmetadata', handleLoadData);
  saveButton.addEventListener('click', handleSaveGif);
  startCursor.addEventListener('mousedown', handleChangeStartTimeStart);
  endCursor.addEventListener('mousedown', handleChangeEndTimeStart);
});
