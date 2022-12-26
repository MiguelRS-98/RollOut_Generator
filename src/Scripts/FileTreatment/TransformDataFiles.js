// Node Modules
const { readFileSync, copyFile } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');
const { xml2json } = require('xml-js');

class FilesTratment {
    TransformXMLToJSON(XMLPathFile) {
        let result = xml2json(readFileSync(XMLPathFile, { encoding: 'utf-8' }), { compact: true });
        return result;
    }
    SendFileToRollOutLocation(Data, filePath) {
        Data.map(element => {
            copyFile(filePath, join(require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json').directoryPackage), element.routes), (err) => {
                err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
            })
        });
    }
}

module.exports = {
    FilesTratment
}