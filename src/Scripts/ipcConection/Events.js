// Node Modules
const { exec } = require('node:child_process');
const { opendir } = require('node:fs');
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
}

module.exports = {
    EventsProcess
}