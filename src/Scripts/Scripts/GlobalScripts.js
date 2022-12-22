class GlobalScripts {
    constructor(directoryPackage){
        this.directoryPackage = directoryPackage;
    }
    ParseFile(filePath) {
        let XMLFile = readFileSync(filePath, { encoding: "utf-8" });
        let JSONFile = xml2json(XMLFile, { compact: true });
        return JSON.parse(JSONFile);
    }
}

module.exports = {
    GlobalScripts
}