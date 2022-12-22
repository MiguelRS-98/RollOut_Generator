// Get DOM Elements
const filesSettingsButton1 = document.getElementById('filesSettingsButton1');
const filesSettingsButton2 = document.getElementById('filesSettingsButton2');
const filesSettingsButton3 = document.getElementById('filesSettingsButton3');

//Dependencies
let State_number = 0;

//Drop & Drop to Command Files

//DOM Elements
const inputFiles = document.getElementById('inputFiles1');
const filesArea = document.querySelector('#filesArea1');
const filesAreaText = document.querySelector('.filesAreaText1');

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
    filesAreaText.textContent = 'Sube los archivos';
})
filesArea.addEventListener('drop', e => {
    e.preventDefault();
    files = e.dataTransfer.files;
    retrieveFiles(files);
    filesArea.classList.remove('active');
    filesAreaText.textContent = 'Sube los archivos';
    console.log(State_number);
})

inputFiles.addEventListener('change', e => {
    files = this.files;
    CallBackFiles();
    retrieveFiles(files);
})

function retrieveFiles(files) {
    for (let file of files) {
        processFiles(file)
    }

}

function processFiles(file) {
    if (State_number >= 2) {
        window.main.getFiles(file.name, file.path);
    }
}

// Listener To Button Where The User Want Restore Config Of The App
filesSettingsButton1.addEventListener('click', () => window.main.RestoreSettings());

// Listener To Button Where Open The Local Files Of The App
filesSettingsButton2.addEventListener('click', () => window.main.ViewLocals());

// Listener To Button Where The User Want Create A Custom Config With XML Files
filesSettingsButton3.addEventListener('click', () => window.main.SetXMLConfigFiles());