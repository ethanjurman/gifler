const os = require("os");
const { app, BrowserWindow, screen, ipcMain } = require("electron");
const { execSync, exec } = require("child_process");
const ffmpeg = require("ffmpeg-static-electron");

let drawWindow;
let dpiScale = 1;

const makeTransparentWindow = () => {
  const screenWindow = screen.getPrimaryDisplay().workAreaSize;
  dpiScale = screen.getPrimaryDisplay().scaleFactor;
  const transparentWindow = new BrowserWindow({
    width: screenWindow.width,
    height: screenWindow.height,
    webPreferences: {
      nodeIntegration: true
    },
    transparent: true,
    frame: false,
    show: false
  });
  transparentWindow.loadFile("./transparent.html");
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
      nodeIntegration: true
    }
  });

  // and load the index.html file
  window.loadFile("./index.html");

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

ipcMain.on("message", (event, arg) => {
  console.log({ arg });
});

let ffmpegProcess;

const logError = (error, stdout, stderr) => {
  if (error) {
    console.error({ error, stderr });
  }
};

const stopRecording = () => {
  console.log("STOP RECORDING");
  ffmpegProcess.stdin.write("q");

  const FPS = 24;
  const SCALE = 1080;
  const filepath = "output.mkv";

  // create palette
  const palatte = execSync(
    `${ffmpeg.path} -y -i ${filepath} -vf "fps=${FPS}, scale=${SCALE}:-1:flags=lanczos,palettegen" palette.png`,
    logError
  );
  const gif = execSync(
    `${ffmpeg.path} -y -i ${filepath} -i palette.png -q 0 -filter_complex "fps=${FPS},scale=${SCALE}:-1:flags=lanczos[x];[x][1:v]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" ${filepath}.gif`,
    logError
  );

  app.quit();
};

ipcMain.on(
  "startRecording",
  (__event, { x, y, width, height, clientScreenDifX, clientScreenDifY }) => {
    console.log("START RECORDING", {
      x,
      y,
      width,
      height,
      clientScreenDifX,
      clientScreenDifY
    });
    drawWindow.minimize();
    const outputFile = "output.mkv";

    if (os.platform() === "darwin") {
      // on mac
      ffmpegProcess = exec(
        `${
          ffmpeg.path
        } -y -f avfoundation -pix_fmt yuyv422 -framerate 24 -capture_cursor 1 -capture_mouse_clicks 1 -i "1:none" -vf "crop=${width *
          dpiScale}:${height * dpiScale}:${(x - clientScreenDifX) *
          dpiScale}:${(y - clientScreenDifY) * dpiScale}" ${outputFile}`,
        logError
      );
    }
    if (os.platform() === "win32") {
      // on pc
      ffmpegProcess = exec(
        `${ffmpeg.path} -y -f gdigrab -framerate 30 -offset_x ${x *
          dpiScale} -offset_y ${y * dpiScale} -video_size ${width *
          dpiScale}x${height *
          dpiScale} -show_region 1 -i desktop ${outputFile}`,
        logError
      );
    }
    // TODO SUPPORT OTHER SYSTEMS

    drawWindow.on("focus", stopRecording);
  }
);

ipcMain.on("stopRecording", stopRecording);
