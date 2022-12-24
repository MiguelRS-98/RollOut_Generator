// Node Modules
const { app, BrowserWindow, ipcMain } = require('electron');
const { readdirSync } = require('node:fs');
const { homedir } = require('os');
const { dirname, join } = require('node:path');

// Local Modules
const { Startup } = require('./Startup');
const { GlobalShortcuts, EventsProcess, MainProcess, GlobalScripts, FilesTratment } = require('./Scripts/ExportScripts');

//Imports
const { FilesDirectory, PoliciesDirectory } = require('./Resources/XMLDataDefault.json')

console.log(FilesDirectory, "\n", PoliciesDirectory);

// Call Classes Preset JS Files
const { UserSettingsFileGenerator, UserSettingsFileDelete, __init__ } = new Startup();
const { registerShortcut } = new GlobalShortcuts();
const { ViewLocals, LoadXMLSettings } = new EventsProcess();
const { restartApplication } = new MainProcess();
const { ParseFile } = new GlobalScripts();

// Procces Start
__init__(FilesDirectory, PoliciesDirectory);

let Settings;

/**
 * UserSettings --> Data from this JSON file
 */
try {
  const { directoryPackage, directoryPolicies, directoryRoutes, status, typeStatus } = require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'));
  Settings = {
    setDirectoryPackage: directoryPackage,
    setDirectoryPolicies: directoryPolicies,
    setDirectoryRoutes: directoryRoutes,
    setStatus: status,
    setTypeStatus: typeStatus
  }
} catch (err) {
  restartApplication();
}

//Main Process
const createWindow = () => {
  // Create the Main Window.
  const mainWindow = new BrowserWindow({
    title: 'Move Files of System',
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    x: 0,
    y: 0,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      preload: join(__dirname, 'Preloads/preload.js'),
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, '/Interface/Views/index.html'));

  try {
    // Check the user config in settings JSON file
    if (!Settings.setStatus) {
      // Create the Modal Window Settings Setter.
      const child = new BrowserWindow({
        parent: mainWindow,
        width: 400,
        height: 400,
        resizable: false,
        maxWidth: 400,
        maxHeight: 400,
        minimizable: false,
        maximizable: false,
        closable: false,
        center: true,
        modal: true,
        movable: true,
        webPreferences: {
          devTools: true,
          nodeIntegration: true,
          preload: join(__dirname, 'Preloads/preloadRoute.js')
        }
      });
      //child.setMenu(null);
      child.loadFile(join(__dirname, '/Interface/Views/WindowSettings.html'));
    }
  } catch (err) {
    console.log('Throw JavaScript Node Exception To Create Settings Directory');
  }
};

// When de app is ready, execute the the window
app.on('ready', () => {
  registerShortcut('CommandOrControl+R');
  createWindow();
});

// Check the windows count in the app
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() });

// Listen Events From Client Side
ipcMain.on(
  'viewLocalFiles',
  () => ViewLocals()
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'UpdateRouteSystem',
  (event, inputRouteData) => {
    UserSettingsFileGenerator({
      status: true,
      typeStatus: "DEFAULT",
      directoryPackage: inputRouteData,
      directoryRoutes: Settings.setDirectoryRoutes,
      directoryPolicies: Settings.setDirectoryPolicies
    })
    restartApplication();
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'RestoreSettingFile',
  () => {
    console.log(readdirSync(join(homedir(), '\\AppData')));
    UserSettingsFileDelete();
    restartApplication();
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'SetXMLConfigFiles',
  () => {
    const config = new BrowserWindow({
      width: 800,
      height: 500,
      resizable: false,
      maxWidth: 800,
      maxHeight: 500,
      minimizable: false,
      maximizable: false,
      center: true,
      modal: true,
      webPreferences: {
        devTools: true,
        nodeIntegration: true,
        preload: join(__dirname, 'Preloads/PreloadXML.js')
      }
    })
    config.loadFile(join(__dirname, 'Interface/Views/WindowXML.html'));
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'SendXMLFiles',
  (event, { Path, Type }) => {
    LoadXMLSettings(Path, Type);
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'UploadFiles',
  (event, JSONConverted) => {

  }
);

