const { FilesTratment } = require("./FileTreatment/TransformDataFiles");
const { EventsProcess } = require("./ipcConection/Events");
const { GlobalScripts } = require("./Scripts/GlobalScripts");
const { GlobalShortcuts } = require("./Scripts/GlobalShortcuts");
const { MainProcess } = require("./Scripts/MainProcess");
const { UploadFiles } = require('./FileTreatment/UploadFiles');

module.exports = {
    GlobalShortcuts,
    EventsProcess,
    MainProcess,
    GlobalScripts,
    FilesTratment,
    UploadFiles
}