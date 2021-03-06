# AmperTox <img align="left" src="assets/icon/128.png?raw=true" alt="Logo" width="40" height="40">

Encrypted peer to peer messenger and Tox client for GNU/Linux, Windows and MacOS.

![screenshot](docs/screenshot.png)

Current features:
- 1 on 1 messaging
- chat history (currently unencrypted)
- avatars (gifs are also supported)
- file transfers work, but there is no UI for them

## Warning
This client is currently in alpha stage. Please **backup your Tox profiles** before using it.

**Note:** there are some performance issues with file transfers caused by using toxcore with ffi-napi. This causes slow transfer speeds and increased CPU usage (only during file transfers).

## Prerequisites
- [toxcore 2.16 or higher](https://github.com/TokTok/c-toxcore)
- [Node.js 14.x](https://nodejs.org)
- [Python](https://python.org)

## Build from source
```
npm install
npm run build
```
For development you can instead run `npm run watch`. It will rebuild automatically on changes, but you will still need to restart the app to see them.

To make a release build run `npm run build-release`. It will create executables for your platform in `build` directory.

## Run
Run `npm run start` to start the app.

## License
All the code is licensed under GPL 3. Assets such as sounds and icons are licensed under CC BY-SA 4.0.