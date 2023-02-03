//Definitions
const loading_card = document.getElementById('loading-card-xml');
const loading_card_h1 = document.getElementById('loading-card-h1-xml');
const mtf_switch = document.getElementById('cancel-settings');
const charge_settings = document.getElementById('charge-settings');

let state = 0, Router, Policies;

//Events
function xml_submit_files_config() {
    loading_card.classList.add('show');
    loading_card.classList.remove('unshow');
    setTimeout(() => {
        loading_card.classList.add('unshow');
        loading_card.classList.remove('show');
        window.main.Restart();
    }, 3000);
};

mtf_switch.addEventListener('click', () => {
    mtf_switch.classList.add('on');
    console.log('boton de configuracion');
    setTimeout(() => {
        mtf_switch.classList.remove('on');
    }, 50)
});

// Dependencies

//Drop & Drop to XML

//DOM Elements
const inputFilesXML = document.getElementById('inputFiles2');
const filesAreaXML = document.getElementById('drop-files-routes');
const filesAreaTextXML = document.getElementById('text-1');

//Data variables
let fileXML;

//DragOver and inner
filesAreaXML.addEventListener('dragover', e => {
    e.preventDefault();
    filesAreaXML.classList.add('active');
    filesAreaTextXML.textContent = 'Suelta el XML';
})
filesAreaXML.addEventListener('dragleave', e => {
    e.preventDefault();
    filesAreaXML.classList.remove('active');
    filesAreaTextXML.textContent = 'Sube XML de rutas';
})
filesAreaXML.addEventListener('drop', e => {
    e.preventDefault();
    fileXML = e.dataTransfer.files;
    filesAreaXML.classList.remove('active');
    if (fileXML[0].name.includes('.xml')) {
        filesAreaXML.classList.add('checkpass');
        Router = fileXML[0].path;
        window.main.loadXML(Router, 'Router');
        filesAreaTextXML.textContent = `Archivo ${fileXML[0].name} Cargado`;
    } else {
        filesAreaXML.classList.add('checkwrong');
        filesAreaTextXML.textContent = `Archivo ${fileXML[0].name} Invalido`;
    }
})

inputFilesXML.addEventListener('change', e => {
    fileXML = this.files;
})


//Drop & Drop to XML

//DOM Elements
const inputFilesPolicies = document.getElementById('inputFiles3');
const filesAreaPolicies = document.getElementById('drop-files-csv');
const filesAreaTextPolicies = document.getElementById('text-2')

//Data variables
let filePolicies;

//DragOver and inner
filesAreaPolicies.addEventListener('dragover', e => {
    e.preventDefault();
    filesAreaPolicies.classList.add('active');
    filesAreaTextPolicies.textContent = 'Suelta el XML';
})
filesAreaPolicies.addEventListener('dragleave', e => {
    e.preventDefault();
    filesAreaPolicies.classList.remove('active');
    filesAreaTextPolicies.textContent = 'Sube XML de politicas';
})
filesAreaPolicies.addEventListener('drop', e => {
    e.preventDefault();
    filePolicies = e.dataTransfer.files;
    filesAreaPolicies.classList.remove('active');
    if (filePolicies[0].name.includes('.xml')) {
        filesAreaPolicies.classList.add('checkpass');
        Policies = filePolicies[0].path;
        window.main.loadXML(Policies, 'Policies');
        filesAreaTextPolicies.textContent = `Archivo ${filePolicies[0].name} Cargado`;
    } else {
        filesAreaPolicies.classList.add('checkwrong')
        filesAreaTextPolicies.textContent = `Archivo ${filePolicies[0].name} Sin Subir`
    }
});

charge_settings.addEventListener('click', () => {
    xml_submit_files_config();
})

inputFilesPolicies.addEventListener('change', e => {
    filePolicies = this.files;
})

const cancelButton = document.getElementById('filesSettingsButton5');

mtf_switch.addEventListener('click', () => {
    window.main.Cancelar();
})