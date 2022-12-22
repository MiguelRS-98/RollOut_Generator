// Node Modules
const { unlink, existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { homedir } = require('node:os');

//Class Startup
class Startup {
    constructor() {
        this.USER_SETTINGS = {
            status: false,
            typeStatus: "DEFAULT",
            directoryPackage: "Not Asigned",
            directoryRoutes: "Not Asigned",
            directoryPolicies: "Not Asigned"
        }
    }
    UserSettingsFileGenerator(FileDataSettings, ord) {
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'))) {
            if (!FileDataSettings) {
                return writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify(this.USER_SETTINGS), { encoding: 'utf-8' })
            } else {
                return writeFileSync(join(homedir(), 'UserSettings/settings.json'), JSON.stringify(FileDataSettings), { encoding: 'utf-8' })
            }
        } else {
            if (!ord) {
                return;
            } else {
                return writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify(FileDataSettings), { encoding: 'utf-8' })
            }
        }
    }
    UserSettingsDirGenerator() {
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings'))) {
            mkdirSync(join(homedir(), 'AppData\\Roaming\\.UserSettings'));
        }
        new Startup().UserSettingsFileGenerator();
    }
    UserSettingsFileDelete(){
        unlink(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), err => err ? console.log(err) : console.log('File Delete Succesfull') )
    }
    UserSettingsXMLFiles(){
        
    }
}

module.exports = {
    Startup
}