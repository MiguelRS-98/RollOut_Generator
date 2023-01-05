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
    async FoldersContentValidate(Data, directoryPackage) {
        await Data.map(element => {
            if (element.type !== 'mtf') {
                let newData,
                    result,
                    TempArray = element.routes[0];
                let RoutesArray = element.routes[0];
                for (let index = 0; index <= RoutesArray.length + 2; index++) {
                    newData = '';
                    for (let idx = 0; idx <= RoutesArray.length; idx++) {
                        newData += `/${TempArray[idx]}`
                    }

                    TempArray.pop();

                    if (existsSync(join(directoryPackage, newData.split('/undefined')[0]))) {
                        result = readdirSync(join(directoryPackage, newData.split('/undefined')[0]), { encoding: 'utf-8' });
                        console.log(join(directoryPackage, newData.split('/undefined')[0]));
                        if (result.length < 2) {
                            try {
                                rmdir(join(directoryPackage, newData.split('/undefined')[0]), (err) => {
                                    if (err) return;
                                    //if (!err) console.log('directorio eliminado');
                                })
                            } catch (err) {
                                console.log('err logued \n');
                            }
                        }
                    }
                }
            }
        });
    }
    SendFileToRollOutLocation(Data, filePath, Name, directoryPackage) {
        Data.map(element => {
            let Destination = new FilesTratment().fixRoute(element.routes),
                PathFile = new FilesTratment().fixRoute(filePath);
            if (Name.includes(element.type)) {
                copyFile(PathFile, join(directoryPackage, Destination, Name), (err) => {
                    err ? console.log(err) : console.log(`Archivos ${element.type} copiado satisfactoriamente`)
                });
            };
        });
    };
    SendFileToRollOutLocationJava(Data, filePath, Name, directoryPackage, Java = 'class') {
        console.log(Java);
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