// Node Modules
const { mkdirSync, existsSync, writeFileSync, copyFileSync } = require('node:fs');
const { join } = require('node:path');

class FilesValidator {
    CreatePackageFiles(RollOutPath, { RollOut, Replacing_files_affected }, fixRoute) {
        let getMainFolderPackage = RollOutPath.split('\\'),
            getMainNameDirectory = getMainFolderPackage[getMainFolderPackage.length - 1],
            ReturnStringDataRouter = `${RollOutPath}\\${getMainNameDirectory.toUpperCase()}`;

        writeFileSync(
            ReturnStringDataRouter,
            `${RollOut}${Replacing_files_affected}`
        );

        copyFileSync(
            fixRoute(join(__dirname, '../../Resources/create_c_makefiles.pl')),
            fixRoute(join(RollOutPath, 'create_c_makefiles.pl'))
        );

        copyFileSync(
            fixRoute(join(__dirname, '../../Resources/rollout.pl')),
            fixRoute(join(RollOutPath, 'rollout.pl'))
        );
    }
    CreateDirectorysFiles(JSONArray, RollOutPath) {
        let routerIterator = "";
        JSONArray.map(
            dataRoute => {
                let Counter = dataRoute.routes[0].length;
                for (let i = 0; i < Counter; i++) {
                    routerIterator += `${dataRoute.routes[0][i]}\\`;
                    if (!existsSync(join(RollOutPath, routerIterator))) {
                        mkdirSync(
                            join(RollOutPath, routerIterator)
                        );
                    }
                };
                routerIterator = "";
            }
        )
        JSONArray = [];
    };
    ValidateFiles(FilesPathXML_arr, RollOutPath) {
        let XMLDecodePath = FilesPathXML_arr.FileSystem.extensions.path,
            fileTypeDef,
            ArrayRoutesSetter = [],
            ArrayDataSetter = [];
        for (let index = 0; index < XMLDecodePath.length; index++) {
            fileTypeDef = XMLDecodePath[index]._attributes.fileType;
            ArrayRoutesSetter.push(
                XMLDecodePath[index]._text.split('/')
            );
            ArrayDataSetter.push(
                { filetype: fileTypeDef, routes: ArrayRoutesSetter }
            );
            ArrayRoutesSetter = [];
        };
        new FilesValidator().CreateDirectorysFiles(ArrayDataSetter, RollOutPath);
        return ArrayDataSetter;
    }
    TreatmentFilesRoutes(ArrayDataTypes) {
        let ReturnFileList = [], textPlainRoute = "";
        ArrayDataTypes.map(dataType => {
            for (let b = 0; b < dataType.routes[0].length; b++) {
                textPlainRoute += `${dataType.routes[0][b]}/`;
            }
            ReturnFileList.push({
                type: dataType.filetype,
                routes: textPlainRoute
            });
            textPlainRoute = "";
        });
        return ReturnFileList;
    }
}

module.exports = {
    FilesValidator
}