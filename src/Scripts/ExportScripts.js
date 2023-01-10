const { FilesTratment } = require("./FileTreatment/TransformDataFiles");
const { EventsProcess } = require("./ipcConection/Events");
const { GlobalShortcuts } = require("./Scripts/GlobalShortcuts");
const { MainProcess } = require("./Scripts/MainProcess");
const { FilesValidator } = require('./FileTreatment/FilesValidator');
const { AutoUpdaterApp } = require('./Scripts/AutoUpdater');

module.exports = {
    GlobalShortcuts,
    EventsProcess,
    MainProcess,
    FilesTratment,
    FilesValidator,
    AutoUpdaterApp
}