//Definitions
const loading_card = document.getElementById('loading-card');
const loading_card_h1 = document.getElementById('loading-card-h1');
const mtf_switch = document.getElementById('mtf-spacer');
const xml_settings = document.getElementById('xml-settings');
const restart_routes = document.getElementById('restart-routes');
const open_folder_routes = document.getElementById('open-folder-routes');
const button_confimation = document.getElementById('strict-confirmation');
const files_viewer = document.getElementById('files-viewer');
const files_viewer_content = document.getElementById('files-viewer-content');
const file_button = document.getElementsByClassName('file-button');
const search_folder = document.getElementById('search-folder');
const ButtonRoute = document.getElementById('ButtonRoute');
const inputRoute = document.getElementById('desc-route');

//Dependencies
let State_MTF = 'class', files, filesDataArray = [], inputRouteData, stateRoute = false;

//Events
window.addEventListener('load', (e) => {
    loading_card.classList.add('show');
    loading_card.classList.remove('unshow');
    if (e.isTrusted) {
        setTimeout(async () => {
            loading_card.classList.add('unshow');
            loading_card.classList.remove('show');
        }, 3000);
    }
});

mtf_switch.addEventListener('click', () => {
    if (mtf_switch.classList.contains('button-state-desable') && State_MTF === 'class') {
        mtf_switch.classList.add('button-state-enable');
        mtf_switch.classList.remove('button-state-desable');
        State_MTF = 'mtf'
        console.log(State_MTF);
        return;
    }
    mtf_switch.classList.add('button-state-desable');
    mtf_switch.classList.remove('button-state-enable');
    State_MTF = 'class'
    console.log(State_MTF);
    return;
})

xml_settings.addEventListener('click', () => {
    xml_settings.classList.add('on');
    console.log('boton de configuracion');
    setTimeout(() => {
        xml_settings.classList.remove('on');
    }, 50)
})
restart_routes.addEventListener('click', () => {
    restart_routes.classList.add('on');
    console.log('boton de reinicio');
    setTimeout(() => {
        restart_routes.classList.remove('on');
    }, 50)
})
open_folder_routes.addEventListener('click', () => {
    open_folder_routes.classList.add('on');
    console.log('boton de locales');
    setTimeout(() => {
        open_folder_routes.classList.remove('on');
    }, 50)
})

//DOM Elements
const inputFiles = document.getElementById('inputFiles1');
const filesArea = document.getElementById('drop-files');
const filesAreaText = document.getElementById('text-files');

//DragOver and inner
filesArea.addEventListener('dragover', e => {
    e.preventDefault();
    filesArea.classList.add('active');
    filesAreaText.textContent = 'Subir archivos';
})
filesArea.addEventListener('dragleave', e => {
    e.preventDefault();
    filesArea.classList.remove('active');
    filesAreaText.textContent = 'Suelta tus archivos';
})
filesArea.addEventListener('drop', e => {
    if (stateRoute) {
        e.preventDefault();
        files = e.dataTransfer.files;
        filesViwer(files)
        filesAreaText.textContent = 'Suelta tus archivos';
        filesArea.classList.remove('active');
        return;
    }
    filesAreaText.textContent = 'Define una ruta';
    filesArea.classList.remove('active');
    return;
})

inputFiles.addEventListener('change', e => {
    files = this.files;
})

// Listener To Button Where The User Want Restore Config Of The App
restart_routes.addEventListener('click', () => window.main.RestoreSettings());

// Listener To Button Where Open The Local Files Of The App
open_folder_routes.addEventListener('click', () => window.main.ViewLocals());

button_confimation.addEventListener('click', () => {
    filesViewerState('on');
    retrieveFiles(filesDataArray)
})

files_viewer_content.addEventListener('click', e => {
    let data = e.target.attributes.value.value;
    if (e.target.tagName === 'IMG' || e.target.tagName === 'BUTTON') {
        deleteFilesPrepared(data)
    }
})

inputRoute.addEventListener('keypress', e => {
    inputRouteData = e.target.value;
    if (e.key === 'Enter') return UpdateConfig();
});

search_folder.addEventListener('click', () => {
    window.main.search();
})

// Functions

function filesViewerState(data) {
    if (data === 'off') {
        filesArea.classList.add('viewFiles-off');
        files_viewer.classList.remove('viewFiles-off');
        return;
    }
    filesArea.classList.remove('viewFiles-off');
    files_viewer.classList.add('viewFiles-off');
    return;
}

function filesViwer(files) {
    for (let i = 0; i < files.length; i++) {
        const { name, size, path } = files[i];
        filesDataArray.push({ name, size, path });
    }
    filesViewerState('off');
    renderFiles(filesDataArray);
}

function deleteFilesPrepared(value) {
    let result = [];
    for (let i = 0; i < filesDataArray.length; i++) {
        if (filesDataArray[i].name !== value) {
            const { name, size, path } = filesDataArray[i];
            result.push({ name, size, path })
        }
    }
    filesDataArray = result;
    renderFiles(filesDataArray);
}

function renderFiles(files) {
    if (filesDataArray.length === 0) {
        filesViewerState('on');
        return;
    }
    files_viewer_content.innerHTML = '';
    for (let i = 0; i < filesDataArray.length; i++) {
        files_viewer_content.innerHTML += `
        <div class="files-content">
            <div class="files-content-data">
                <div class="file-name">
                    ${filesDataArray[i].name}
                </div>
                <div class="file-size">
                    ${filesDataArray[i].size} bytes
                </div>
                <button class="file-button unique-button" value="${filesDataArray[i].name}">
                    <img src="./Resource/Recicle-inage.png" alt="delete files" width="30px" height="30px" value="${filesDataArray[i].name}">
                </button>
            </div>
        </div>
        `;
    }
}

function retrieveFiles(files) {
    for (let file of files) {
        processFiles(file)
    }
    window.main.deleteDirectories();
    window.main.RollOutCreation()
}

function processFiles(file) {
    window.main.getFiles(file.name, file.path, State_MTF);
}

// Function Of Main Process
function UpdateConfig() {
    window.main.UpdateRouteSystem(inputRouteData);
};

async function getDataSettingsFile() {
    await window.main.GetPathSettings_Data((data) => {
        console.log(data);
        if (data === 'Not Asigned') {
            stateRoute = false;
            inputRoute.removeAttribute('disabled');
            return;
        }
        stateRoute = true;
        inputRoute.setAttribute('value', data);
        inputRoute.setAttribute('disabled', '');
        return;
    });
}

getDataSettingsFile();