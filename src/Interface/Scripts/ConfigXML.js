//Drop & Drop to XML

//DOM Elements
const inputFilesXML = document.getElementById('inputFiles2');
const filesAreaXML = document.querySelector('#filesArea2');
const filesAreaTextXML = document.querySelector('.filesAreaText2');

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
    if (fileXML[0].type === 'text/xml') {
        filesAreaXML.classList.add('checkpass');
        window.electron.XMLFile(fileXML[0].path, fileXML[0].type)
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
const filesAreaPolicies = document.querySelector('#filesArea3');
const filesAreaTextPolicies = document.querySelector('.filesAreaText3');

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
    if (filePolicies[0].type === 'text/xml') {
        filesAreaPolicies.classList.add('checkpass');
        window.electron.PoliciesFile(filePolicies[0].path, filePolicies[0].type);
        State_number++
        filesAreaTextPolicies.textContent = `Archivo ${filePolicies[0].name} Cargado`;
    } else {
        filesAreaPolicies.classList.add('checkwrong');
        filesAreaTextPolicies.textContent = `Archivo ${filePolicies[0].name} Invalido`
        filesAreaTextPolicies.textContent = `Archivo ${filePolicies[0].name} Sin Subir`

    }
})

inputFilesPolicies.addEventListener('change', e => {
    filePolicies = this.files;
})
