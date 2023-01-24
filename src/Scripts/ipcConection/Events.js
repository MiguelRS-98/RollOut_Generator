// Node Modules2
const { Notification } = require('electron');
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
    addPKGFileContent(RollOutPath, Data) {
        console.log(Data);
        let getMainFolderPackage = RollOutPath.split('\\'),
            getMainNameDirectory = getMainFolderPackage[getMainFolderPackage.length - 1],
            ReturnStringDataRouter = `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`;
        console.log(ReturnStringDataRouter);
        let Functions = {
            REPLACE: (ArrayData) => {
                ArrayData.map(element => {
                    appendFileSync(
                        ReturnStringDataRouter,
                        `\nREPLACE ${element.normalize}${element.name} $LESDIR/${element.path}`
                    )
                })
            },
            LOADDATA: (ArrayData) => {
                appendFileSync(
                    ReturnStringDataRouter,
                    `\n\n# Removing files removed by extension.\n\n# Load any data affected.`
                )
                ArrayData.map(element => {
                    if (element.name.includes('.csv')) {
                        appendFileSync(
                            ReturnStringDataRouter,
                            `\nLOADDATA $LESDIR/${element.path}${element.name} ${element.name}`
                        )
                    }
                })
            },
            RUNSQL: (ArrayData) => {
                appendFileSync(
                    ReturnStringDataRouter,
                    `\n\n# Run any SQL, MSQL, and other scripts`
                )
                ArrayData.map(element => {
                    if (element.name.includes('.sql')) {
                        appendFileSync(
                            ReturnStringDataRouter,
                            `\nRunSQLIgnoreErrors $LESDIR/${element.path}${element.name} ${element.name}`
                        )
                    }
                })
            },
            IMPORTSLDATA: (ArrayData) => {
                appendFileSync(
                    ReturnStringDataRouter,
                    `\n\n# Import any Integrator data affected`
                )
                ArrayData.map(element => {
                    if (element.name.includes('.slexp')) {
                        appendFileSync(
                            ReturnStringDataRouter,
                            `\nIMPORTSLDATA $LESDIR/${element.path}${element.name} ${element.name}`
                        )
                    }
                })
            },
            COMPLETE: () => {
                new Notification({
                    title: 'RollOut Generado',
                    body: 'El RollOut se genero exitosamente',
                    icon: `${join(__dirname, '../../Resources/MoveFiles_Icon.png')}`,
                }).show()
                appendFileSync(
                    ReturnStringDataRouter,
                    `\n\n# Rebuilding C makefiles if necessary\n\n# Perform any environment rebuilds if necessary.\nMBUILD\n\n# End of the Script `
                )
            }
        };
        Functions.REPLACE(Data);
        Functions.LOADDATA(Data);
        Functions.RUNSQL(Data);
        Functions.IMPORTSLDATA(Data);
        Functions.COMPLETE();
    };
}

module.exports = {
    EventsProcess
}