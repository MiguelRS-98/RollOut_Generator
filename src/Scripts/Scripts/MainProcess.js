const { app } = require("electron");

class MainProcess {
    restartApplication() {
        app.quit();
        app.relaunch();
    }
}

module.exports = {
    MainProcess
}