// Node Modules
const { readFileSync, copyFile, readdirSync, rmdir, existsSync } = require('node:fs');
const { join } = require('node:path');
const { xml2json } = require('xml-js');

class FilesTratment {
    TransformXMLToJSON(XMLPathFile) {
        let result = xml2json(readFileSync(XMLPathFile, { encoding: 'utf-8' }), { compact: true });
        return result;
    }
    fixRoute(route) {
        let newData,
            newVariable = route.split("\\");
        for (let i = 0; i < newVariable.length; i++) {
            newData += `/${newVariable[i]}`
        };
        return newData.split('undefined/')[1];
    };
    DeleteEmptyDirectories(Data) {
        Data.map(element => {
            let paddingRotes = element.routes.split('/');
            console.log(paddingRotes);
        })
    }
    SendFilesAlgorithm(element, filePath, Name, directoryPackage, javaTypeTreatment = 'class') {
        let Destination = this.fixRoute(element.routes);
        let PathFile = this.fixRoute(filePath);
        if (javaTypeTreatment === 'class') {
            if (Name.includes(element.type)) {
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
    };
    SendFileToRollOutLocationJava(Data, filePath, Name, directoryPackage, Java = 'class') {
        if (Java === 'class') {
            Data.map(element => {
                if (element.type === 'java') {
                    let Destination = new FilesTratment().fixRoute(element.routes),
                        PathFile = new FilesTratment().fixRoute(filePath);
                    if (Name.includes(element.type)) {
                        copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                            err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                        })
                    };
                };
            });
        } else {
            Data.map(element => {
                if (element.type === 'mtf') {
                    let Destination = new FilesTratment().fixRoute(element.routes),
                        PathFile = new FilesTratment().fixRoute(filePath);
                    copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                        err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                    });
                };
            });
        };
    };
};

module.exports = {
    FilesTratment
}