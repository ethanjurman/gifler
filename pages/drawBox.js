const { ipcRenderer } = require('electron');

const RECORDING = 'RECORDING';
const NOT_RECORDING = 'NOT_RECORDING';

const boxCoor = [];
let index = 0;
let state = NOT_RECORDING;

let clientScreenDifX = 0;
let clientScreenDifY = 0;

const handleMouseDown = event => {
  const clickArea = document.getElementById('clickArea');
  boxCoor.length = 0;
  drawBox(event, 0);
  clickArea.onmousemove = handleMouseMove;
  clickArea.onmouseup = handleMouseUp;
};

const handleMouseMove = event => {
  drawBox(event, 1);
};

const handleMouseUp = event => {
  const clickArea = document.getElementById('clickArea');
  drawBox(event, 1);
  clickArea.onmousemove = null;
  clickArea.onmouseup = null;
};

const drawBox = (e, index) => {
  // e - event data
  // index - 0 if first, 1 if last
  if (state === RECORDING) {
    return null;
  }

  const x = e.clientX;
  const y = e.clientY;

  clientScreenDifX = e.clientX - e.screenX;
  clientScreenDifY = e.clientY - e.screenY;

  ipcRenderer.send('message', { x, y });

  boxCoor[index] = { x, y };

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

const startRecording = () => {
  const width = Math.abs(boxCoor[0].x - boxCoor[1].x);
  const height = Math.abs(boxCoor[0].y - boxCoor[1].y);
  const x = Math.min(boxCoor[0].x, boxCoor[1].x);
  const y = Math.min(boxCoor[0].y, boxCoor[1].y);

  ipcRenderer.send('START_RECORDING', {
    width,
    height,
    x,
    y,
    clientScreenDifX,
    clientScreenDifY,
  });

  const boxes = [...document.getElementsByClassName('darkBox')];
  boxes.forEach(box => {
    box.setAttribute('style', 'background: rgba(0,0,0,0)');
  });
  state = RECORDING;
};

const cancelRecording = () => {
  ipcRenderer.send('CANCEL_RECORDING');
};

const handleKeyPress = evt => {
  if (evt.code === 'Enter') {
    startRecording();
  }
  if (evt.code === 'Escape') {
    cancelRecording();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const clickArea = document.getElementById('clickArea');
  clickArea.onmousedown = handleMouseDown;
  // clickArea.addEventListener('mousedown', handleMouseDown);
  // clickArea.addEventListener('mousemove', handleMouseMove);
  // clickArea.addEventListener('mouseup', handleMouseUp);
  clickArea.addEventListener('keydown', handleKeyPress);
});
