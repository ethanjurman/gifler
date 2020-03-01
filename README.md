# gifler
Recording gifs with an electron app & ffmpeg

To start recording, start the project with `npm start`
Then click two points on the screen. This will select the target recording area.
Then, when done, focus back on the gifler window. It will stop the recording and your gif will be available as `output.gif`

TODO
- [ ] Look into why when recording it seems offset (might be a display / ffmpeg / click point issue)
- [ ] Use better ffmpeg script for converting file into high res small file gif
- [ ] Output to a better file location
- [ ] Allow for different configuration (framerate)
- [ ] Ensure that ffmpeg capture ability works on other systems (OS X, linux?)
