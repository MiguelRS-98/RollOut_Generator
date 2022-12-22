// Node Modules
const { contextBridge, ipcRenderer } = require("electron");

// Function For Export to MainProcess
function UpdateRouteSystem(inputRouteData) {
    if (inputRouteData.includes('C:\\')) {
        ipcRenderer.send('UpdateRouteSystem', inputRouteData)
    } else {
        console.log('Ruta Invalida');
    }
}

contextBridge.exposeInMainWorld(
    "setRoute",
    {
        UpdateRouteSystem
    }
)