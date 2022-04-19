[![ko-fi](https://www.ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/R6R21LO82)

# Alpha Launcher
Launcher for the 0.5.3 client with management for multiple realmlists.

## Standalone installation
Binaries for windows and Linux/Darwin appimages can be found on the [releases page](https://github.com/The-Alpha-Project/Alpha-Launcher/releases).

Download and run as usual, for the appimages make sure to set them as executables writing `sudo chmod +x ./Alpha.launcher-x.x.x.AppImage` in your terminal.

## Development
Run `npm start`, development app will be created with a title bar and devtools option active.

### Prerequisites
Node v16.14+ and npm v8.3+ are both required for this project to be built and for actively developing on it, make sure the project can build successfully with this node version as it is the same defined in build phase for rolling out releases on github.

### Build
To build the project run:

```bash
npm install
npm run dist
```

Compiled executable will be under electron/output folder.
