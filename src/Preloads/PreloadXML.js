const { contextBridge, ipcRenderer } = require("electron");

function loadXML(XMLFilePath, Identify){
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

contextBridge.exposeInMainWorld(
    'setXML',
    {
        loadXML,
        Restart,
        Cancelar
    }
)