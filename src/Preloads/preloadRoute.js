// Node Modules
const { contextBridge, ipcRenderer } = require("electron");

// Function For Export to MainProcess
function getData(path, callback) {
    ipcRenderer.send('getPathSystemData', path)
    ipcRenderer.on('returnDataFolders', (e, data) => {
        callback(data.data, data.path)
    })
}

contextBridge.exposeInMainWorld(
    "folder",
    {
        getData
    }
)