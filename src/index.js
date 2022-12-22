// Node Modules
const { app, BrowserWindow, ipcMain } = require('electron');
const { existsSync, readdirSync } = require('node:fs');
const { homedir } = require('os');
const { join } = require('path');

// Local Modules
const { Startup } = require('./Startup');
const { GlobalShortcuts, EventsProcess, MainProcess, GlobalScripts } = require('./Scripts/ExportScripts');
const { dirname } = require('node:path');

// Call Classes Preset JS Files
const { UserSettingsDirGenerator, UserSettingsFileGenerator, UserSettingsFileDelete } = new Startup();
const { registerShortcut } = new GlobalShortcuts();
const { ViewLocals } = new EventsProcess();
const { restartApplication } = new MainProcess();

// Procces Start
UserSettingsDirGenerator();

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

// Call Classes Preset JS Files
const { ParseFile } = new GlobalScripts(Settings.setDirectoryPackage);

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
};

// When de app is ready, execute the the window
app.on('ready', () => {
  registerShortcut('CommandOrControl+R');
  createWindow();
});

// Check the windows count in the app
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow() });

// Listen Events From Client Side
ipcMain.on('viewLocalFiles', () => ViewLocals());
ipcMain.on('UpdateRouteSystem', (event, inputRouteData) => {
  console.log('UpdateRouteSystem -> Allow Work');
  UserSettingsFileGenerator({
    status: true,
    typeStatus: "DEFAULT",
    directoryPackage: inputRouteData,
    directoryRoutes: Settings.setDirectoryRoutes,
    directoryPolicies: Settings.setDirectoryPolicies
  }, true)
  restartApplication();
})
ipcMain.on('RestoreSettingFile', () => {
  console.log(readdirSync(join(homedir(), '\\AppData')));
  UserSettingsFileDelete();
  restartApplication();
});
ipcMain.on('SetXMLConfigFiles', () => {
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
})

