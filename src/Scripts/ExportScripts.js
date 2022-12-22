const { EventsProcess } = require("./ipcConection/Events");
const { GlobalScripts } = require("./Scripts/GlobalScripts");
const { GlobalShortcuts } = require("./Scripts/GlobalShortcuts");
const { MainProcess } = require("./Scripts/MainProcess");

module.exports = {
    GlobalShortcuts,
    EventsProcess,
    MainProcess,
    GlobalScripts
}