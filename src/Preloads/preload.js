// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

// Node Modules
const { contextBridge, ipcRenderer } = require("electron");

// Function For Export to MainProcess
function ViewLocals() {
    ipcRenderer.send('viewLocalFiles');
};
function RestoreSettings() {
    ipcRenderer.send('RestoreSettingFile');
};
function SetXMLConfigFiles() {
    ipcRenderer.send('SetXMLConfigFiles');
};
function getFiles(Name, Path, JavaTreatment) {
    const jsonData = {
        fileName: Name,
        fileLocation: Path,
        Java: JavaTreatment
    };
    ipcRenderer.send('UploadFiles', jsonData);
}
function deleteDirectories() {
    ipcRenderer.send('DeleteDirectories');
}
function RollOutCreation() {
    ipcRenderer.send('UploadDataToPKGFile');
}
function loadXML(XMLFilePath, Identify) {
    let Data = {
        Path: XMLFilePath,
        Type: Identify
    }
    ipcRenderer.send('SendXMLFiles', Data)
}
function Restart() {
    ipcRenderer.send('Restart')
}
function Cancelar() {
    ipcRenderer.send('ReturnConfig')
}
function UpdateRouteSystem(inputRouteData) {
    ipcRenderer.send('UpdateRouteSystem', inputRouteData)
}
function GetPathSettings_Data(params) {
    ipcRenderer.send('getData-PathRollOut')
    ipcRenderer.on('sendData-PathRollOut', (e, data) => {
        params(data)
    })
}

function search() {
    ipcRenderer.send('searchWindow')
}

contextBridge.exposeInMainWorld(
    'main',
    {
        ViewLocals,
        RestoreSettings,
        SetXMLConfigFiles,
        getFiles,
        deleteDirectories,
        RollOutCreation,
        loadXML,
        Restart,
        Cancelar,
        UpdateRouteSystem,
        GetPathSettings_Data,
        search
    }
);