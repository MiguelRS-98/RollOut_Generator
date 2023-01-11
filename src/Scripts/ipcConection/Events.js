// Node Modules2
const { exec } = require('node:child_process');
const { copyFile, writeFileSync, appendFile } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');

class EventsProcess {
    constructor(ipcNameParam) {
        this.ipcMain_Name = ipcNameParam
    }
    ViewLocals() {
        try {
            exec(`explorer.exe ${join(homedir(), 'AppData/Roaming/.UserSettings')}`)(err => {
                if (err) {
                    console.log(err);
                }
            })
        } catch (err) {
            console.log(err);
        }
    };
    LoadXMLSettings(XMLPathFile, typeFile) {
        const ActualSettings = require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'))
        if (typeFile === 'Router') {
            copyFile(
                XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml'),
                (err) => {
                    err ? console.log(err) : console.log('Load File Succesfull');
                }
            );
        }
        if (typeFile === 'Policies') {
            copyFile(
                XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml'),
                (err) => {
                    err ? console.log(err) : console.log('Load File Succesfull');
                }
            );
        };
        writeFileSync(
            join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'),
            JSON.stringify({
                ...ActualSettings,
                directoryRoutes: `${homedir()}\\AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml`,
                directoryPolicies: `${homedir()}\\AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml`
            }),
            { encoding: 'utf-8' }
        );
        return;
    };
    addPKGFileContent(Data, RollOutPath, fixRoute) {
        console.log({ Data, RollOutPath });
        // Definitions
        let getMainFolderPackage = RollOutPath.split('\\'),
            getMainNameDirectory = getMainFolderPackage[getMainFolderPackage.length - 1];
        // Config's to Functions To Set Data In The PKG File
        let FunctionConfig = {
            REPLACE: (Router, Name) => {
                appendFile(
                    `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                    `\nREPLACE ${join(Router, Name)} $LESDIR/${Router.split('pkg/')[1]}`,
                    (err) => {
                        if (err) return console.log(err);
                    }
                )
            },
            LOADDATA: (Router, Name) => {
                if (Name.includes('.csv')) {
                    let returnStringData = `\nLOADDATA\n${Router}/${Name} `;
                    appendFile(
                        `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                        returnStringData,
                        (err) => {
                            if (err) return console.log(err);
                        }
                    )
                }
            },
            IMPORTSLDATA: (Router, Name) => {
                if (Name.includes('.slexp')) {
                    let returnStringData = `IMPORTSLDATA\n${Router}/${Name} `;
                    appendFile(
                        `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                        returnStringData,
                        (err) => {
                            if (err) return console.log(err);
                        }
                    )
                }
            },
            RUN_SQL_IGNORE_ERRORS: (Router, Name) => {
                if (Name.includes('.sql')) {
                    let returnStringData = `RunSQLIgnoreErrors\n${Router}/${Name} `;
                    appendFile(
                        `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                        returnStringData,
                        (err) => {
                            if (err) return console.log(err);
                        }
                    )
                }
            }
        };
        // Export Functions
        // ---------------------------- // -------------------------- //
        async function Replace(fileName) {
            await Data.map(element => {
                if (fileName.includes(element.type)) {
                    FunctionConfig.REPLACE(fixRoute(element.routes), fileName)
                };
            });
        };
        // ---------------------------- // -------------------------- //
        async function LoadData(fileName) {
            await Data.map(element => {
                if (fileName.includes(element.type)) {
                    FunctionConfig.LOADDATA(fixRoute(element.routes), fileName)
                };
            });
        };
        // ---------------------------- // -------------------------- //
        async function ImportSLData(fileName) {
            await Data.map(element => {
                if (fileName.includes(element.type)) {
                    FunctionConfig.IMPORTSLDATA(fixRoute(element.routes), fileName)
                };
            });
        };
        // ---------------------------- // -------------------------- //
        async function RunSQLWithoutErr(fileName) {
            await Data.map(element => {
                if (fileName.includes(element.type)) {
                    FunctionConfig.RUN_SQL_IGNORE_ERRORS(fixRoute(element.routes), fileName)
                };
            });
        };
        return {
            Replace,
            LoadData,
            ImportSLData,
            RunSQLWithoutErr
        };
    };
}

module.exports = {
    EventsProcess
}