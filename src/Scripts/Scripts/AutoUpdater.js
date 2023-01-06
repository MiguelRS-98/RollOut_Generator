// Node Modules
const { autoUpdater, app, dialog } = require('electron');

class AutoUpdaterApp {
    constructor() {
        //Definitions
        this.urlServerUpdater = 'https://update.electronjs.org';
        this.urlUpdater = `${this.urlServerUpdater}/PintoGamer64/Move_Files/${process.platform}-${process.arch}/${app.getVersion()}`
        // set URL to updates
        autoUpdater.setFeedURL({ url: this.urlUpdater })
    }
    DialogUpdateConfirmation() {
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart', 'Later'],
            title: 'Application Update',
            detail: 'A new version has been downloaded. Restart the application to apply the updates.',
        }
        dialog.showMessageBox(dialogOpts).then((res) => {
            if (res.response === 0) autoUpdater.quitAndInstall()
        })
    }
}

module.exports = { AutoUpdaterApp }