// Node Modules
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const { autoUpdater } = require('electron-updater');
const { info, transports } = require('electron-log');
const { homedir } = require('os');
const { join } = require('node:path');
const { readdirSync } = require('node:fs');

// Local Modules
const { Startup } = require('./Startup');
const { GlobalShortcuts, EventsProcess, MainProcess, FilesTratment, FilesValidator } = require('./Scripts/ExportScripts');

//Imports<
const { FilesDirectory, PoliciesDirectory } = require('./Resources/XMLDataDefault.json');
const PKGFileBase = require('./Resources/PKGFileBase.json');

// Call Classes Preset JS Files
const { UserSettingsFileGenerator, UserSettingsFileDelete, UserSettingsFileReset, __init__ } = new Startup();
const { registerShortcuts, unregisterShortcuts } = new GlobalShortcuts();
const { ViewLocals, LoadXMLSettings, addPKGFileContent } = new EventsProcess();
const { restartApplication } = new MainProcess();
const { TransformXMLToJSON, SendFileToRollOutLocation, DeleteEmptyDirectories, SendFileToRollOutLocationJava, fixRoute } = new FilesTratment();
const { ValidateFiles, TreatmentFilesRoutes, CreatePackageFiles } = new FilesValidator();

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
  ResponceMethod = [],
  Settings = {
    setDirectoryPackage: undefined,
    setDirectoryPolicies: undefined,
    setDirectoryRoutes: undefined,
    setStatus: undefined,
    setXMLConfig: undefined
  };

// Window
let mainWindow, folderWindow;

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
  mainWindow = new BrowserWindow({
    icon: join(__dirname, "Resources/MoveFiles_Icon.ico"),
    minWidth: 1000,
    minHeight: 720,
    width: 1000,
    height: 720,
    maxWidth: 1200,
    maxHeight: 820,
    maximizable: false,
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
    info(`[ Descargando... ${Math.trunc(progress.percent)}% ]`)
  }); // -----------------------------------------
  autoUpdater.on('update-not-available', () => {
    info('Tienes La Ultima Version Disponible ✅')
  }); // -----------------------------------------
  autoUpdater.on('error', () => {
    info('Error En Actualizar La App ✅')
  }) // -----------------------------------------
  // Configs
  mainWindow.setTitle('NetLogistiK - MoveFiles')
  mainWindow.setMaxListeners(20);
  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadFile(join(__dirname, '/Interface/Views/main.html'));
};
// Configuration App
app.setAppLogsPath(join(homedir(), 'AppData\\Roaming\\.UserSettings\\AppLogs'));
// Disable Hardware Accelaration
app.disableHardwareAcceleration();
// When de app is ready, execute the the window
app.on('ready', () => {
  registerShortcuts('CommandOrControl+R');
  createWindow();
  autoUpdater.checkForUpdatesAndNotify();
  info(BrowserWindow.getAllWindows().length);
});
// When the app is Quit throw message
app.on('quit', () => {
  info('Exit To Application\n\n\n')
})
// When the app is focused or not focused
app.on('browser-window-focus', (event, window) => {
  window.on('focus', () => {
    registerShortcuts('CommandOrControl+R');
  });
  window.on('blur', () => {
    unregisterShortcuts();
  });
});
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
})
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
ipcMain.on('getData-PathRollOut', (e) => {
  const { directoryPackage } = require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'));

  e.reply('sendData-PathRollOut', directoryPackage)
})
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
    CreatePackageFiles(Settings.setDirectoryPackage, PKGFileBase, fixRoute)
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
      SendFileToRollOutLocation(ResponceMethod, FilePolicies, fileLocation, fileName, Settings.setDirectoryPackage);
      // Conditional
    } else if (fileName.includes('.java') || fileName.includes('.properties')) {
      // Execution
      SendFileToRollOutLocationJava(ResponceMethod, FileRouter, fileLocation, fileName, Settings.setDirectoryPackage, Java);
      // Conditional
    } else {
      // Execution
      SendFileToRollOutLocation(ResponceMethod, FileRouter, fileLocation, fileName, Settings.setDirectoryPackage);
    };
    mainWindow.setProgressBar(0.3)
  }
);
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('UploadDataToPKGFile', () => {
  addPKGFileContent(Settings.setDirectoryPackage, ResponceMethod);
  ResponceMethod = [];
  mainWindow.setProgressBar(1.0)
  mainWindow.setProgressBar(0.0)
})
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('DeleteDirectories', () => {
  try {
    for (let index = 0; index < 30; index++) {
      DeleteEmptyDirectories(FileRouter, Settings.setDirectoryPackage);
      DeleteEmptyDirectories(FilePolicies, Settings.setDirectoryPackage);
      mainWindow.setProgressBar(0.6)
    }
  } catch (err) {
    return;
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
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('ReturnConfig', () => {
  UserSettingsFileGenerator({
    status: true,
    XMLConfig: true,
    directoryPackage: require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json')).directoryPackage,
    directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'),
    directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml')
  });
  restartApplication();
});
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('searchWindow', () => {
  folderWindow = new BrowserWindow({
    icon: join(__dirname, "Resources/MoveFiles_Icon.ico"),
    parent: mainWindow,
    width: 570,
    height: 530,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      preload: join(__dirname, 'Preloads/preloadRoute.js'),
    }
  })
  folderWindow.setMenu(null);
  folderWindow.loadFile(join(__dirname, '/Interface/Views/folders.html'));
})
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('CloseFolder', () => {
  folderWindow.close();
  mainWindow.focus()
})
// -------------------------------------------------- // -------------------------------------------------- //
ipcMain.on('getPathSystemData', (e, path) => {
  try {
    let res_path = '', res_data = '', path_exits = '';
    if (path === '') {
      res_path = homedir();
      res_data = readdirSync(homedir(), { encoding: 'utf-8', withFileTypes: false });
      e.reply('returnDataFolders', { path: res_path || '', data: res_data });
      return;
    }
    path_exits = path;
    res_data = readdirSync(path_exits, { encoding: 'utf-8', withFileTypes: false });
    if (res_data.length === 0) {
      UserSettingsFileGenerator({
        status: true,
        XMLConfig: true,
        directoryPackage: path_exits,
        directoryRoutes: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'),
        directoryPolicies: join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml')
      })
      restartApplication();
    }
    e.reply('returnDataFolders', { path: path_exits || '', data: res_data });
    return;
  } catch (err) {
    console.log(err);
    dialog.showMessageBoxSync(folderWindow, {
      title: 'Acceso de Carpetas',
      closable: true,
      message: 'Esta carpeta no existe o permite su acceso',
      icon: join(__dirname, "Resources/MoveFiles_Icon.ico")
    })
    res_path = homedir();
    res_data = readdirSync(homedir(), { encoding: 'utf-8', withFileTypes: false });
    e.reply('returnDataFolders', { path: res_path || '', data: res_data });
  }
})