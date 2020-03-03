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

  const x = e.clientX;
  const y = e.clientY;

  ipcRenderer.send('message', { x, y });

  boxCoor[index] = { x, y };
  index = index === 0 ? 1 : 0;

  // build box
  if (boxCoor.length === 2) {
    const width = Math.abs(boxCoor[0].x - boxCoor[1].x);
    const height = Math.abs(boxCoor[0].y - boxCoor[1].y);
    const left = Math.min(boxCoor[0].x, boxCoor[1].x);
    const right = Math.max(boxCoor[0].x, boxCoor[1].x);
    const top = Math.min(boxCoor[0].y, boxCoor[1].y);
    const bottom = Math.max(boxCoor[0].y, boxCoor[1].y);
    const box = document.getElementById('whiteBox');
    box.setAttribute(
      'style',
      `
        width:${width}px;
        height:${height}px;
        left:${left}px;
        top:${top}px;
    `,
    );
    console.log({ top, left, right, bottom });
    const boxTop = document.getElementById('darkBoxTop');
    boxTop.setAttribute('style', `bottom: ${window.innerHeight - top}px`);
    const boxLeft = document.getElementById('darkBoxLeft');
    boxLeft.setAttribute(
      'style',
      `right: ${window.innerWidth -
        left}px; top: ${top}px; bottom: ${window.innerHeight - bottom}px`,
    );
    const boxRight = document.getElementById('darkBoxRight');
    boxRight.setAttribute(
      'style',
      `left: ${right}px; top: ${top}px; bottom: ${window.innerHeight -
        bottom}px`,
    );
    const boxBottom = document.getElementById('darkBoxBottom');
    boxBottom.setAttribute('style', `top: ${bottom}px`);
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
