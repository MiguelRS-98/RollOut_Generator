// Node Modules
const { unlink, existsSync, mkdirSync, writeFileSync } = require("node:fs");
const { join } = require("node:path");
const { homedir } = require('node:os');

//Class Startup
class Startup {
    constructor() {
        // Default Settings
        this.USER_SETTINGS = {
            status: false,
            typeStatus: "DEFAULT",
            directoryPackage: "Not Asigned",
            directoryRoutes: "Not Asigned",
            directoryPolicies: "Not Asigned"
        }
    }
    UserSettingsFileGenerator(FileDataSettings) {
        // Set Settings JSON File
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'))) {
            if (!FileDataSettings) {
                writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify(this.USER_SETTINGS), { encoding: 'utf-8' })
            } else {
                writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify(FileDataSettings), { encoding: 'utf-8' })
            }
        } else {
            if (FileDataSettings) {
                writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), JSON.stringify(FileDataSettings), { encoding: 'utf-8' })
            }
        }
    }
    UserSettingsDirXMLGenerator() {
        // Set DEFUALT Directory in ConfigRouter Folder To Settings Directory
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT'))) {
            mkdirSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT'));
        }
        // Set CUSTOM Directory in ConfigRouter Folder To Settings Directory
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM'))) {
            mkdirSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\CUSTOM'));
        }
    }
    UserSettingsDirGenerator() {
        // Set Main Directory To Settings
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings'))) {
            mkdirSync(join(homedir(), 'AppData\\Roaming\\.UserSettings'));
        }
        // Set Settings XML Directory
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter'))) {
            mkdirSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter'));
        }
    }
    UserSettingsFileDelete() {
        // Delete The Settings JSON File To Restore The Settings
        unlink(join(homedir(), 'AppData\\Roaming\\.UserSettings\\settings.json'), err => err ? console.log(err) : console.log('File Delete Succesfull'))
    }
    UserSettingsXMLFiles(FilesRouter, PoliciesRouter) {
        // Set The XML Files In The ConfigRouter - DEFAULT Directory
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'))) {
            writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Router.xml'), FilesRouter, { encoding: 'utf-8' });
        }
        // Set The XML Files In The ConfigRouter - DEFAULT Directory
        if (!existsSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml'))) {
            writeFileSync(join(homedir(), 'AppData\\Roaming\\.UserSettings\\ConfigRouter\\DEFAULT\\Policies.xml'), PoliciesRouter, { encoding: 'utf-8' });
        }
    }
    __init__(FilesRouter, PoliciesRouter) {
        console.log(FilesRouter, "\n", "\n", PoliciesRouter);
        new Startup().UserSettingsDirGenerator();
        new Startup().UserSettingsDirXMLGenerator();
        new Startup().UserSettingsFileGenerator();
        new Startup().UserSettingsXMLFiles(FilesRouter, PoliciesRouter);
    }
}

module.exports = {
    Startup
}