const { globalShortcut, app } = require("electron");

class GlobalShortcuts {
    registerShortcuts(textShortcut){
        globalShortcut.register(textShortcut, (err) => {
            if (err) return console.log(err);
            app.quit();
            app.relaunch();
        });
    };
    unregisterShortcuts(){
        globalShortcut.unregisterAll();
    }
}

module.exports = {
    GlobalShortcuts
}