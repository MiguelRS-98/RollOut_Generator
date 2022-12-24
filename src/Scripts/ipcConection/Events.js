// Node Modules
const { ipcRenderer } = require('electron');
const { exec } = require('node:child_process');
const { copyFile } = require('node:fs');
const { homedir } = require('node:os');
const { join } = require('node:path');

class EventsProcess {
    constructor(ipcNameParam) {
        this.ipcMain_Name = ipcNameParam
    }
    ViewLocals() {
        exec('explorer .', err => {
            if (err) {
                console.log(err);
            }
        })
    }
    LoadXMLSettings(XMLPathFile, typeFile){
        if (typeFile === 'Router') return copyFile(XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Router.xml'), (err) => {
            err ? console.log(err) : console.log('Load File Succesfull');
        });
        if (typeFile === 'Policies') return copyFile(XMLPathFile, join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM\\Policies.xml'), (err) => {
            err ? console.log(err) : console.log('Load File Succesfull');
        });
    }
}

module.exports = {
    EventsProcess
}