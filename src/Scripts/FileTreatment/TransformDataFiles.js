// Node Modules
const { readFileSync, copyFile, readdirSync, rmdirSync } = require('node:fs');
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
    FoldersContentValidate(Data, directoryPackage) {
        Data.map(element => {
            let tempDirectory = readdirSync(join(new FilesTratment().fixRoute(directoryPackage), element.routes), { encoding: 'utf-8' });
            if (tempDirectory.length < 1) {
                rmdirSync(join(new FilesTratment().fixRoute(directoryPackage), element.routes))
            }
        })
    }
    SendFileToRollOutLocation(Data, filePath, Name, directoryPackage) {
        Data.map(element => {
            let Destination = new FilesTratment().fixRoute(element.routes);
            let PathFile = new FilesTratment().fixRoute(filePath);
            if (Name.includes(element.type)) {
                copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                    err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                })
            }
        });
    };
    SendFileToRollOutLocationJava(Data, filePath, Name, directoryPackage, Java = 'class') {
        console.log(Java);
        if (Java === 'class') {
            Data.map(element => {
                if (element.type === 'java') {
                    let Destination = new FilesTratment().fixRoute(element.routes);
                    let PathFile = new FilesTratment().fixRoute(filePath);
                    if (Name.includes(element.type)) {
                        copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                            err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                        })
                    }
                }
            });
        } else {
            Data.map(element => {
                if (element.type === 'mtf') {
                    let Destination = new FilesTratment().fixRoute(element.routes);
                    let PathFile = new FilesTratment().fixRoute(filePath);
                    copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                        err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                    })
                }
            });
        }
    }
}

module.exports = {
    FilesTratment
}