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
    fixRoute(route) {
        let newData;
        let newVariable = route.split("\\")
        for (let i = 0; i < newVariable.length; i++) {
            newData += `/${newVariable[i]}`
        }
        return newData.split('undefined/')[1]
    };
    SendFileToRollOutLocationRouter(Data, filePath, Name, directoryPackage) {
        Data.map(element => {
            let Destination = new FilesTratment().fixRoute(element.routes);
            let PathFile = new FilesTratment().fixRoute(filePath);
            console.log(Destination, "\n", directoryPackage);
            if (Name.includes(element.type)) {
                copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                    err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                })
            }
        });
    }
    SendFileToRollOutLocationPolicies(Data, filePath, Name, directoryPackage) {
        Data.map(element => {
            let Destination = new FilesTratment().fixRoute(element.routes);
            let PathFile = new FilesTratment().fixRoute(filePath);
            console.log(Destination, "\n", directoryPackage);
            if (Name.includes(element.type)) {
                copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                    err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                })
            }
        });
    }
}

module.exports = {
    FilesTratment
}