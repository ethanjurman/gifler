# gifler

Recording gifs with an electron app & ffmpeg

To start recording, start the project with `npm start`

Then click two points on the screen. You can keep clicking to alter the selected recording area. Once you are happy with the selection press the `Enter` key on your keyboard. This will select the target recording area.

Then, when done, focus back on the gifler window. It will stop the recording and your gif will be available as `output.gif`

TODO
- [ ] Rename?
- [x] Look into why when recording it seems offset (might be a display / ffmpeg / click point issue)
  - seems to be an issue with dpi support, should be able to grab the screen scale factor but might require testing to see that the mouse is being drawn correctly (at least on windows).
- [x] Use better ffmpeg script for converting file into high res small file gif
- [x] Output to a better file location
- [ ] Allow for different configuration (framerate)
- [ ] Ensure that ffmpeg capture ability works on other systems (OS X, linux?)
  - [x] OSX
  - [x] Windows
  - [ ] Linux
  - [ ] Android?
