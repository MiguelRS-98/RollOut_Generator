const { contextBridge } = require("electron");



contextBridge.exposeInMainWorld(
    'setXML',
    {
        
    }
)