// Node Modules
const { autoUpdater, dialog } = require('electron');

class AutoUpdaterApp {
    DialogUpdateConfirmation() {
        console.log('actualizando');
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