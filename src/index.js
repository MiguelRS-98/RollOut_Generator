// Node Modules
const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const { info, transports } = require('electron-log');
const { homedir } = require('os');
const { join } = require('node:path');

// Local Modules
const { Startup } = require('./Startup');
const { GlobalShortcuts, EventsProcess, MainProcess, FilesTratment, FilesValidator, AutoUpdaterApp } = require('./Scripts/ExportScripts');

//Imports<
const { FilesDirectory, PoliciesDirectory } = require('./Resources/XMLDataDefault.json');
const PKGFileBase = require('./Resources/PKGFileBase.json');

// Call Classes Preset JS Files
const { UserSettingsFileGenerator, UserSettingsFileDelete, UserSettingsFileReset, __init__ } = new Startup();
const { registerShortcuts, unregisterShortcuts } = new GlobalShortcuts();
const { ViewLocals, LoadXMLSettings, addPKGFileContent } = new EventsProcess();
const { restartApplication } = new MainProcess();
const { TransformXMLToJSON, SendFileToRollOutLocation, DeleteEmptyDirectories, SendFileToRollOutLocationJava, fixRoute } = new FilesTratment();
const { ValidateFiles, TreatmentFilesRoutes, CreatePKGFile } = new FilesValidator();

// Procces Start
__init__(FilesDirectory, PoliciesDirectory);
transports.file.resolvePath = () => join(homedir(), '\\AppData\\Roaming\\.UserSettings\\AppLogs\\dataUpdates.log');
info(`Log Ready to work with version ${app.getVersion()}`);
// Definitions
let FileRouter,
  FilePolicies,
  XMLRouter,
  XMLPolicies,
  CreateDirRouter,
  CreateDirPolicies,
  PKGFile,
  Settings = {
    setDirectoryPackage: undefined,
    setDirectoryPolicies: undefined,
    setDirectoryRoutes: undefined,
    setStatus: undefined,
    setXMLConfig: undefined
  };

/**
 * UserSettings --> Data from this JSON file
 */
try {
  const { directoryPackage, directoryPolicies, directoryRoutes, status, XMLConfig } = require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'));
  Settings.setDirectoryPackage = directoryPackage;
  Settings.setDirectoryPolicies = directoryPolicies;
  Settings.setDirectoryRoutes = directoryRoutes;
  Settings.setStatus = status;
  Settings.setXMLConfig = XMLConfig;
} catch (err) {
  restartApplication();
};
//Main Process
const createWindow = () => {
  // Create the Main Window.
  const mainWindow = new BrowserWindow({
    icon: join(__dirname, "Resources/MoveFiles_Icon.ico"),
    minWidth: 1000,
    minHeight: 650,
    width: 1000,
    height: 650,
    center: true,
    resizable: false,
    closable: true,
    webPreferences: {
      devTools: true,
      nodeIntegration: true,
      preload: join(__dirname, 'Preloads/preload.js'),
    }
  });
  // Set UserTask List
  mainWindow.setThumbarButtons([
    {
      icon: join(__dirname, 'Resources/Restart.png'),
      click: () => {
        UserSettingsFileDelete();
        restartApplication();
      }
    }, {
      icon: join(__dirname, 'Resources/Settings.png'),
      click: () => {
        UserSettingsFileGenerator({
          status: true,
          XMLConfig: false,
          directoryPackage: require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json')).directoryPackage,
          directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'),
          directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml')
        })
        restartApplication();
      }
    }
  ])
  // Configs
  mainWindow.setTitle('NetLogistiK - MoveFiles')
  mainWindow.setMaxListeners(20);
  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, '/Interface/Views/index.html'));
  try {
    if (Settings.setXMLConfig === false) {
      const config = new BrowserWindow({
        icon: join(__dirname, "Resources/MoveFiles_Icon.ico"),
        parent: mainWindow,
        width: 800,
        height: 500,
        resizable: false,
        maxWidth: 800,
        maxHeight: 500,
        minimizable: false,
        maximizable: false,
        closable: false,
        center: true,
        modal: true,
        webPreferences: {
          devTools: true,
          nodeIntegration: true,
          preload: join(__dirname, 'Preloads/PreloadXML.js')
        }
      })
      config.setMaxListeners(20);
      config.setMenu(null);
      config.loadFile(join(__dirname, 'Interface/Views/WindowXML.html'));
    }
  } catch (err) {
    console.log('Throw JavaScript Node Exception To Create Settings Directory');
  };
  try {
    // Check the user config in settings JSON file
    if (!Settings.setStatus) {
      // Create the Modal Window Settings Setter.
      const child = new BrowserWindow({
        icon: join(__dirname, "Resources/MoveFiles_Icon.ico"),
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
      child.setMaxListeners(20);
      child.setMenu(null);
      child.loadFile(join(__dirname, '/Interface/Views/WindowSettings.html'));
    }
  } catch (err) {
    console.log('Throw JavaScript Node Exception To Create Settings Directory');
  };
};
// Configuration App
app.setAppLogsPath(join(homedir(), 'AppData\\Roaming\\.UserSettings\\AppLogs'));
// Disable Hardware Accelaration
app.disableHardwareAcceleration();
// Updates Events
autoUpdater.on('update-available', () => {
  info('Actualizacion Disponible')
}); // -----------------------------------------
autoUpdater.on('checking-for-update', () => {
  info('Buscando Actualizaciones...')
}); // -----------------------------------------
autoUpdater.on('update-downloaded', () => {
  info('Actualizacion Descargada')
}); // -----------------------------------------
autoUpdater.on('download-progress', (progress) => {
  info('\n\nDescargando Actualizacion...')
  info(progress)
}); // -----------------------------------------
autoUpdater.on('update-not-available', () => {
  info('Tienes La Ultima Version Disponible ✅')
}); // -----------------------------------------
autoUpdater.on('error', () => {
  info('rror En Actualizar La App ✅')
}) // -----------------------------------------
// When de app is ready, execute the the window
app.on('ready', () => {
  registerShortcuts('CommandOrControl+R');
  createWindow();
  autoUpdater.checkForUpdates();
});
// When the app is focused or not focused
app.on('browser-window-focus', (event, window) => {
  window.on('focus', () => {
    registerShortcuts('CommandOrControl+R');
  });
  window.on('blur', () => {
    unregisterShortcuts();
  });
});
// Listen Events From Client Side
ipcMain.on('viewLocalFiles', () => ViewLocals());
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'UpdateRouteSystem',
  (event, inputRouteData) => {
    UserSettingsFileGenerator({
      status: true,
      XMLConfig: true,
      directoryPackage: inputRouteData,
      directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'),
      directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml')
    })
    restartApplication();
  });
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('RestoreSettingFile', () => {
  UserSettingsFileDelete();
  restartApplication();
});
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('SetXMLConfigFiles', () => {
  UserSettingsFileGenerator({
    status: true,
    XMLConfig: false,
    directoryPackage: require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json')).directoryPackage,
    directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'),
    directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml')
  })
  restartApplication();
});
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('ResetConfig', () => {
  UserSettingsFileReset();
})
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('SendXMLFiles', (event, { Path, Type }) => {
  LoadXMLSettings(Path, Type);
});
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on(
  'UploadFiles',
  (event, { fileName, Java, fileLocation }) => {
    // PKG File Creation
    CreatePKGFile(Settings.setDirectoryPackage, PKGFileBase)
    // Definitions
    XMLRouter = TransformXMLToJSON(Settings.setDirectoryRoutes);
    CreateDirRouter = ValidateFiles(JSON.parse(XMLRouter), Settings.setDirectoryPackage);
    FileRouter = TreatmentFilesRoutes(CreateDirRouter);
    // Definitions
    XMLPolicies = TransformXMLToJSON(Settings.setDirectoryPolicies);
    CreateDirPolicies = ValidateFiles(JSON.parse(XMLPolicies), Settings.setDirectoryPackage);
    FilePolicies = TreatmentFilesRoutes(CreateDirPolicies);
    // Conditional Event To Check The Router CUSTOM Or DEFAULT
    // Conditional
    if (fileName.includes('.csv')) {
      // Execution
      SendFileToRollOutLocation(FilePolicies, fileLocation, fileName, Settings.setDirectoryPackage);
      // Execution
      addPKGFileContent(FilePolicies, Settings.setDirectoryPackage, fixRoute)
      // Conditional
    } else if (fileName.includes('.java') || fileName.includes('.properties')) {
      SendFileToRollOutLocationJava(FileRouter, fileLocation, fileName, Settings.setDirectoryPackage, Java);
      // Execution
      addPKGFileContent(FileRouter, Settings.setDirectoryPackage, fixRoute)
      // Conditional
    } else {
      // Execution
      SendFileToRollOutLocation(FileRouter, fileLocation, fileName, Settings.setDirectoryPackage);
      // Execution
      addPKGFileContent(FileRouter, Settings.setDirectoryPackage, fixRoute)
    };
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('DeleteDirectories', () => {
  try {
    for (let index = 0; index < 10; index++) {
      DeleteEmptyDirectories(FileRouter, Settings.setDirectoryPackage);
      DeleteEmptyDirectories(FilePolicies, Settings.setDirectoryPackage);
    }
  } catch (err) {
    console.log(err);
  }
});
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('Restart', () => {
  UserSettingsFileGenerator({
    status: true,
    XMLConfig: true,
    directoryPackage: require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json')).directoryPackage,
    directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml'),
    directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml')
  });
  restartApplication();
});