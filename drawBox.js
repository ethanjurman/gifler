const { ipcRenderer } = require('electron');

// console.log(ipcRenderer.sendSync('sync-message', 'ping'));

const RECORDING = 'RECORDING';
const NOT_RECORDING = 'NOT_RECORDING';

const boxCoor = [];
let index = 0;
let state = NOT_RECORDING;

const drawBox = e => {
  if (state === RECORDING) {
    return null;
  }

  const x = e.screenX;
  const y = e.screenY;

  ipcRenderer.send('message', { x, y });
  const box = document.getElementById('whiteBox');
  boxCoor[index] = { x, y };
  index = index === 0 ? 1 : 0;

  // build box
  if (boxCoor.length === 2) {
    const width = Math.abs(boxCoor[0].x - boxCoor[1].x);
    const height = Math.abs(boxCoor[0].y - boxCoor[1].y);
    const left = Math.min(boxCoor[0].x, boxCoor[1].x);
    const top = Math.min(boxCoor[0].y, boxCoor[1].y);
    const positionStyle = 'absolute';
    const backgroundStyle = 'rgba(255,255,255,0.2)';
    box.setAttribute(
      'style',
      `
        position: ${positionStyle};
        background: ${backgroundStyle};
        width:${width}px;
        height:${height}px;
        left:${left}px;
        top:${top}px;
    `,
    );
  }
};

const handleKeyPress = evt => {
  if (evt.code === 'Enter') {
    startRecording();
  }
  if (evt.code === 'Escape') {
    stopRecording();
  }
};

const startRecording = () => {
  const width = Math.abs(boxCoor[0].x - boxCoor[1].x);
  const height = Math.abs(boxCoor[0].y - boxCoor[1].y);
  const x = Math.min(boxCoor[0].x, boxCoor[1].x);
  const y = Math.min(boxCoor[0].y, boxCoor[1].y);

  ipcRenderer.send('startRecording', { width, height, x, y });
  state = RECORDING;
};

const stopRecording = () => {
  ipcRenderer.send('stopRecording');
};

document.addEventListener('DOMContentLoaded', () => {
  const clickArea = document.getElementById('clickArea');
  clickArea.addEventListener('click', drawBox);
  clickArea.addEventListener('keydown', handleKeyPress);
});
