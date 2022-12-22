const { globalShortcut, app } = require("electron");

class GlobalShortcuts {
    registerShortcut(textShortcut){
        globalShortcut.register(textShortcut, (err) => {
            if (err) return console.log(err);
            app.quit();
            app.relaunch();
        });
    }
}

module.exports = {
    GlobalShortcuts
}