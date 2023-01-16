// Node Modules
const { ipcRenderer } = require('electron');
const { ipcMain } = require('electron/main');
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
    DeleteEmptyDirectories(Data, directoryPackage) {
        try {
            Data.map(element => {
                let newStringDirectory,
                    newArrayDirectoryContent,
                    paddingRoutes = element.routes.split('/'),
                    temporalPaddingRoutes = element.routes.split('/');
                for (let prIdx = 0; prIdx < paddingRoutes.length; prIdx++) {
                    newStringDirectory = ""
                    for (let b = 0; b < temporalPaddingRoutes.length; b++) {
                        if (newStringDirectory === newStringDirectory) {
                            newStringDirectory += `/${paddingRoutes[b]}`;
                        }
                    }
                    temporalPaddingRoutes.pop();
                    if (existsSync(join(directoryPackage, newStringDirectory)) && newStringDirectory.length !== 0) {
                        newArrayDirectoryContent = readdirSync(join(directoryPackage, newStringDirectory), { encoding: 'utf-8' })
                        if (newArrayDirectoryContent.length === 0) {
                            rmdir(join(directoryPackage, newStringDirectory), (err) => {
                                if (err) return;
                            })
                        }
                    }
                }
            })
        } catch (err) {
            return;
        }
    }
    SendFilesAlgorithm(element, filePath, Name, directoryPackage) {
        let Destination = this.fixRoute(element.routes),
            PathFile = this.fixRoute(filePath),
            resultFile;
        if (Name.includes(element.type)) {
            if (!Name.includes('.msql')) {
                copyFile(
                    PathFile,
                    join(directoryPackage, Destination, Name),
                    (err) => {
                        if (err) return console.log(err);
                    }
                );
                resultFile = {
                    normalize: Destination,
                    path: Destination.split(`${Destination.split('/')[0]}/`)[1],
                    name: Name
                }
            }
        };
        return resultFile
    }
    SendFileToRollOutLocation(ResponceMethod, Data, filePath, Name, directoryPackage) {
        let ResponceFT;
        Data.map(routerElement => {
            ResponceFT = new FilesTratment().SendFilesAlgorithm(routerElement, filePath, Name, directoryPackage);
            if (ResponceFT !== undefined && !ResponceMethod.includes(ResponceFT)) {
                ResponceMethod.push(ResponceFT);
            }
        })
    };
    SendFileToRollOutLocationJava(ResponceMethod, Data, filePath, Name, directoryPackage, Java = 'class') {
        let Destination, PathFile;
        if (Java === 'class') {
            Data.map(element => {
                if (element.type === 'java') {
                    Destination = new FilesTratment().fixRoute(element.routes);
                    PathFile = new FilesTratment().fixRoute(filePath);
                    if (Name.includes(element.type)) {
                        copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                            err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                        });
                        // Array.ProtoType.Add
                        let resultFile = {
                            normalize: Destination,
                            path: Destination.split(`${Destination.split('/')[0]}/`)[1],
                            name: Name
                        };
                        if (resultFile !== undefined && !ResponceMethod.includes(resultFile)) {
                            ResponceMethod.push(resultFile);
                        }
                    };
                };
            });
        } else {
            Data.map(element => {
                if (element.type === 'mtf') {
                    Destination = new FilesTratment().fixRoute(element.routes);
                    PathFile = new FilesTratment().fixRoute(filePath);
                    copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                        err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                    });
                    // Array.ProtoType.Add
                    let resultFile = {
                        normalize: Destination,
                        path: Destination.split(`${Destination.split('/')[0]}/`)[1],
                        name: Name
                    };
                    if (resultFile !== undefined && !ResponceMethod.includes(resultFile)) {
                        ResponceMethod.push(resultFile);
                    }
                };
            });
        };
    };
};

module.exports = {
    FilesTratment
}