const { contextBridge, ipcRenderer } = require("electron");

function loadXML(XMLFilePath, XMLFileName, Type){
    let Data = {
        Path: XMLFilePath,
        Name: XMLFileName,
        Type: Type
    }
    ipcRenderer.send('SendXMLFiles', Data)
}

contextBridge.exposeInMainWorld(
    'setXML',
    {
        loadXML
    }
)