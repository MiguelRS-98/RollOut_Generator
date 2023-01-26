//Definitions
const loading_card = document.getElementById('loading-card');
const loading_card_h1 = document.getElementById('loading-card-h1');
const mtf_switch = document.getElementById('mtf-spacer');
const xml_settings = document.getElementById('xml-settings');
const restart_routes = document.getElementById('restart-routes');
const open_folder_routes = document.getElementById('open-folder-routes');

//Dependencies
let State_MTF = 'class';

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

//Data variables
let files;

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
    e.preventDefault();
    files = e.dataTransfer.files;
    retrieveFiles(files);
    filesArea.classList.remove('active');
    filesAreaText.textContent = 'Suelta tus archivos';
})

inputFiles.addEventListener('change', e => {
    files = this.files;
    retrieveFiles(files);
})

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

// Listener To Button Where The User Want Restore Config Of The App
restart_routes.addEventListener('click', () => window.main.RestoreSettings());

// Listener To Button Where Open The Local Files Of The App
open_folder_routes.addEventListener('click', () => window.main.ViewLocals());