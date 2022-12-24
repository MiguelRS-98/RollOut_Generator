// Node Modules
const { xml2json } = require('xml-js');

class FilesTratment {
    TransformXMLToJSON(XMLPathFile) {
        let result = xml2json(XMLPathFile, { compact: true });
        ipcRenderer.send('UploadXMLSettings', result);
    }
}

module.exports = {
    FilesTratment
}