// Node Modules2
const { exec } = require('node:child_process');
const { copyFile, writeFileSync } = require('node:fs');
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
    }
    LoadXMLSettings(XMLPathFile, typeFile) {
        const ActualSettings = require(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'))
        if (typeFile === 'Router') {
            copyFile(XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml'), (err) => {
                err ? console.log(err) : console.log('Load File Succesfull');
            });
        }
        if (typeFile === 'Policies') {
            copyFile(XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml'), (err) => {
                err ? console.log(err) : console.log('Load File Succesfull');
            });
        }
        writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify({
            ...ActualSettings,
            directoryRoutes: `${homedir()}\\AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml`,
            directoryPolicies: `${homedir()}\\AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml`
        }), { encoding: 'utf-8' });
        return;
    }
}

module.exports = {
    EventsProcess
}