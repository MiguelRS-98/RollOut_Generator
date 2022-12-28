const { FilesTratment } = require("./FileTreatment/TransformDataFiles");
const { EventsProcess } = require("./ipcConection/Events");
const { GlobalShortcuts } = require("./Scripts/GlobalShortcuts");
const { MainProcess } = require("./Scripts/MainProcess");
const { UploadFiles } = require('./FileTreatment/UploadFiles');

module.exports = {
    GlobalShortcuts,
    EventsProcess,
    MainProcess,
    FilesTratment,
    UploadFiles
}