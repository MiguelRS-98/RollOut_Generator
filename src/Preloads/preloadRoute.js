// Node Modules
const { contextBridge, ipcRenderer } = require("electron");

// Function For Export to MainProcess
function UpdateRouteSystem(inputRouteData) {
    ipcRenderer.send('UpdateRouteSystem', inputRouteData)
}

contextBridge.exposeInMainWorld(
    "setRoute",
    {
        UpdateRouteSystem
    }
)