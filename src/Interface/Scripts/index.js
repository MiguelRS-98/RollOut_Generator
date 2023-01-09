// Get DOM Elements
const filesSettingsButton1 = document.getElementById('filesSettingsButton1');
const filesSettingsButton2 = document.getElementById('filesSettingsButton2');
const filesSettingsButton3 = document.getElementById('filesSettingsButton3');
const filesSettingsButton4 = document.getElementById('filesSettingsButton4');
const filesJavaSwitch = document.getElementById('filesJavaSwitch');

//Dependencies
let State_MTF = 'class';

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
    window.main.getFiles(file.name, file.path, State_MTF);
}

// Listener To Button Where The User Want Restore Config Of The App
filesSettingsButton1.addEventListener('click', () => window.main.RestoreSettings());

// Listener To Button Where Open The Local Files Of The App
filesSettingsButton2.addEventListener('click', () => window.main.ViewLocals());

// Listener To Button Where The User Want Create A Custom Config With XML Files
filesSettingsButton3.addEventListener('click', () => window.main.SetXMLConfigFiles());

filesSettingsButton4.addEventListener('click', () => {
    console.log('Enter');
    if (filesSettingsButton4.className === 'MTFDesactive') {
        State_MTF = 'mtf';
        filesSettingsButton4.classList.remove('MTFDesactive');
        filesSettingsButton4.classList.add('MTFActive');
    }else if (filesSettingsButton4.className === 'MTFActive') {
        State_MTF = 'class';
        filesSettingsButton4.classList.remove('MTFActive');
        filesSettingsButton4.classList.add('MTFDesactive');
    };
})