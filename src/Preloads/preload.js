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
function getFiles(Name, Path) {
    const fileTypeValidate = ['.mcmd', '.sql', '.mtrg', '.idx', '.tbl', '.csv'];
    for (let fileType of fileTypeValidate) {
        if (Name.includes(fileType) === true) {
            const jsonData = {
                fileName: Name,
                fileLocation: Path
            };
            ipcRenderer.send('UploadFiles', jsonData)
        }
    }
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