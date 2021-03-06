const os = require('os');
const { app, BrowserWindow, screen, ipcMain, dialog } = require('electron');
const { execSync, exec } = require('child_process');
const ffmpeg = require('ffmpeg-static-electron');
const fs = require('fs');

let mainWindow;
let drawWindow;
let dpiScale = 1;
let filename = 'output';

const makeTransparentWindow = () => {
  const screenWindow = screen.getPrimaryDisplay().workAreaSize;
  dpiScale = screen.getPrimaryDisplay().scaleFactor;
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
  transparentWindow.loadFile('./pages/transparent.html');
  transparentWindow.setResizable(false);

  // transparentWindow.webContents.openDevTools();

  drawWindow = transparentWindow;
  return transparentWindow;
};

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    show: true,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile('./pages/index.html');

  // Open DevTools
  mainWindow.webContents.openDevTools();
};

ipcMain.on('OPEN_CAPTURE_WINDOW', () => {
  const transparentWindow = makeTransparentWindow();
  transparentWindow.show();
  mainWindow.hide();
});

ipcMain.on('UPDATE_FILE_NAME', (__message, value) => {
  console.log({ value });
  filename = value;
});

app
  .whenReady()
  .then(createWindow)
  .catch(err => {
    console.error(err);
  });

let ffmpegProcess;

const logError = (error, stdout, stderr) => {
  if (error) {
    console.error({ error, stderr });
  }
};

const stopRecording = ipcEvent => () => {
  console.log('STOP RECORDING');
  drawWindow.hide();
  ffmpegProcess.stdin.write('q');
  mainWindow.webContents.send('SET_LOADING', true);
  mainWindow.show();
  setTimeout(() => mainWindow.webContents.send('LOAD_VIDEO'), 1000);
  mainWindow.webContents.send('SET_LOADING', false);
};

ipcMain.on('CANCEL_RECORDING', () => {
  console.log('STOP RECORDING');
  drawWindow.hide();
  mainWindow.show();
});

ipcMain.on('SAVE_GIF', async (event, { startTime, endTime }) => {
  console.log('save gif');
  const FPS = 24;
  const SCALE = 1080;
  const videoFilepath = `${filename}.mkv`;

  const { filePath } = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Gif',
    filters: [{ name: 'Gif', extensions: ['gif'] }],
  });

  if (!filePath) {
    console.log('no file path');
    event.reply('SAVE_GIF_DONE');
    return null;
  }

  console.log('saving to', filePath);

  const duration = endTime - startTime;

  console.log('palatte generation');

  // create palette
  const palatte = execSync(
    `${ffmpeg.path} -y -ss ${startTime} -t ${duration} -i ${videoFilepath} -vf "fps=${FPS}, scale=${SCALE}:-1:flags=lanczos,palettegen" palette.png`,
    logError,
  );

  console.log('gif creation');

  const gif = execSync(
    `${ffmpeg.path} -y -ss ${startTime} -t ${duration} -i ${videoFilepath} -i palette.png -q 0 -filter_complex "fps=${FPS},scale=${SCALE}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" ${filePath}`,
    logError,
  );
  console.log('save gif finished');
  event.reply('SAVE_GIF_DONE');
});

ipcMain.on(
  'START_RECORDING',
  (event, { x, y, width, height, clientScreenDifX, clientScreenDifY }) => {
    console.log('START RECORDING');
    drawWindow.minimize();
    const outputFile = `${filename}.mkv`;

    const xValue = Math.floor((x - clientScreenDifX) * dpiScale);
    const yValue = Math.floor((y - clientScreenDifY) * dpiScale);
    const heightValue = Math.floor(height * dpiScale);
    const widthValue = Math.floor(width * dpiScale);

    if (os.platform() === 'darwin') {
      // on mac
      ffmpegProcess = exec(
        `${ffmpeg.path} -y -f avfoundation -pix_fmt yuyv422 -framerate 24 -capture_cursor 1 -capture_mouse_clicks 1 -i "1:none" -vf "crop=${widthValue}:${heightValue}:${xValue}:${yValue}" ${outputFile}`,
        logError,
      );
    }
    if (os.platform() === 'win32') {
      // on pc
      ffmpegProcess = exec(
        `${ffmpeg.path} -y -f gdigrab -framerate 30 -offset_x ${xValue} -offset_y ${yValue} -video_size ${widthValue}x${heightValue} -i desktop ${outputFile}`,
        logError,
      );
    }
    // TODO SUPPORT OTHER SYSTEMS

    drawWindow.on('focus', stopRecording(event));
  },
);

ipcMain.on('CLEAR_FILE', event => {
  fs.unlink(`${filename}.mkv`, err => {
    if (err) {
      console.error(err);
    }
    event.reply('CLEAR_FILE_SUCCESS');
  });
});
