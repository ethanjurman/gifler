const { app, BrowserWindow, screen, ipcMain } = require('electron');
const { exec } = require('child_process');
const ffmpeg = require('ffmpeg-static-electron');

let drawWindow;

const makeTransparentWindow = () => {
  const screenWindow = screen.getPrimaryDisplay().workAreaSize;
  const transparentWindow = new BrowserWindow({
    width: screenWindow.width,
    height: screenWindow.height,
    webPreferences: {
      nodeIntegration: true,
    },
    transparent: true,
    frame: false,
    show: false,
  });
  transparentWindow.loadFile('./transparent.html');
  // transparentWindow.setAlwaysOnTop(true);
  transparentWindow.setResizable(false);
  // transparentWindow.setIgnoreMouseEvents(true);
  drawWindow = transparentWindow;
  return transparentWindow;
};

const createWindow = () => {
  // create browser window
  const window = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html file
  window.loadFile('./index.html');

  // Open DevTools
  // window.webContents.openDevTools();
  const transparentWindow = makeTransparentWindow();
  transparentWindow.show();
  // transparentWindow.webContents.openDevTools();
};

app
  .whenReady()
  .then(createWindow)
  .catch(err => {
    console.error(err);
  });

ipcMain.on('message', (event, arg) => {
  console.log({ arg });
});

let ffmpegProcess;

const stopRecording = () => {
  console.log('STOP RECORDING');
  ffmpegProcess.stdin.write('q');
  app.quit();
};

ipcMain.on('startRecording', (__event, { x, y, width, height }) => {
  console.log('START RECORDING');
  drawWindow.minimize();
  const outputFile = 'output.gif';

  ffmpegProcess = exec(
    `${ffmpeg.path} -y -f gdigrab -framerate 30 -offset_x ${x} -offset_y ${y} -video_size ${width}x${height} -show_region 1 -i desktop ${outputFile}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error({ error, stderr });
      }
    },
  );

  drawWindow.on('focus', stopRecording);
});

ipcMain.on('stopRecording', stopRecording);
