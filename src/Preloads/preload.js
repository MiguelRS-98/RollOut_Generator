// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Node Modules
const { contextBridge, ipcRenderer } = require("electron");

// Function For Export to MainProcess
function ViewLocals() {
    ipcRenderer.send('viewLocalFiles');
};
function RestoreSettings() {
    ipcRenderer.send('RestoreSettingFile')
};
function SetXMLConfigFiles() {
    ipcRenderer.send('SetXMLConfigFiles')
};
function getFiles(Name, Path, JavaTreatment) {
    const jsonData = {
        fileName: Name,
        fileLocation: Path,
        Java: JavaTreatment
    };
    ipcRenderer.send('UploadFiles', jsonData)
}

contextBridge.exposeInMainWorld(
    'main',
    {
        ViewLocals,
        RestoreSettings,
        SetXMLConfigFiles,
        getFiles
    }
)