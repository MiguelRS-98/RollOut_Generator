// Node Modules
const { readFileSync, copyFile } = require('node:fs');
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
    SendFilesAlgorithm(element, filePath, Name, directoryPackage, javaTypeTreatment = 'class') {
        let Destination = this.fixRoute(element.routes);
        let PathFile = this.fixRoute(filePath);
        if (javaTypeTreatment === 'class') {
            console.log('entrando en javaTreatment');
            if (Name.includes(element.type)) {
                console.log('Archivo copiado');
                copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                    err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                })
            }
        } else {
            copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`);
            })
        }
    }
    SendFileToRollOutLocation(Data, filePath, Name, directoryPackage, javaTypeTreatment) {
        Data.map(routerElement => {
            console.log(routerElement);
            if (Name.includes('.java') || Name.includes('.properties')) {
                if (javaTypeTreatment === 'mtf') {
                    if (routerElement.type === 'mtf') {
                        new FilesTratment().SendFilesAlgorithm(routerElement, filePath, Name, directoryPackage, javaTypeTreatment);
                    };
                } else {
                    new FilesTratment().SendFilesAlgorithm(routerElement, filePath, Name, directoryPackage);
                }
            } else {
                new FilesTratment().SendFilesAlgorithm(routerElement, filePath, Name, directoryPackage);
            };
        });
    }
}

module.exports = {
    FilesTratment
}