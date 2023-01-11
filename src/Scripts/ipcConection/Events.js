// Node Modules2
const { exec } = require('node:child_process');
const { copyFile, writeFileSync, appendFileSync } = require('node:fs');
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
    addPKGFileContent(RollOutPath, FileName, RouterFile) {
        let getMainFolderPackage = RollOutPath.split('\\'),
            getMainNameDirectory = getMainFolderPackage[getMainFolderPackage.length - 1];
        let FunctionConfig = {
            REPLACE: (Router, Name) => {
                let returnStringData = `REPLACE ${Router}/${Name} $LESDIR/${Router}`;
                appendFileSync(
                    `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                    returnStringData,
                    'utf-8'
                )
            },
            LOADDATA: (Router, Name) => {
                let returnStringData = `LOADDATA ${Router}/${Name} `;
                appendFileSync(
                    `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                    returnStringData,
                    'utf-8'
                )
            },
            IMPORTSLDATA: (Router, Name) => {
                let returnStringData = `IMPORTSLDATA ${Router}/${Name} `;
                appendFileSync(
                    `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                    returnStringData,
                    'utf-8'
                )
            },
            RunSQLIgnoreErrors: (Router, Name) => {
                let returnStringData = `RunSQLIgnoreErrors ${Router}/${Name} `;
                appendFileSync(
                    `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`,
                    returnStringData,
                    'utf-8'
                )
            }
        }
    }
}

module.exports = {
    EventsProcess
}