const current_path = document.getElementById('current-path');
const boton = document.getElementById('confirm-exit');
const interface = document.getElementById('ui');
const backward = document.getElementById('backward');
const disk_select = document.getElementById('disk-select');


// Definitions
let content_path, masterData = [], disk = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
];

window.addEventListener('DOMContentLoaded', () => {
    window.folder.getData('', retrieveFolderData);
    retrieveDisks(disk)
});

function retrieveFolderData(data, path) {
    masterData = data;
    interface.innerHTML = '';
    data.map(name => {
        if (!name.includes('.')) {
            interface.innerHTML += `
            <div class="folders">
                <img src="./Resource/Folder-image-2.png" alt="${name}" value="${name}" width="90px" height="90px">
                <h4>${name}</h4>
            </div>
            `;
        }
    })
    content_path = path;
    current_path.setAttribute('value', path);
};

function retrieveDisks(array) {
    disk_select.innerHTML = '';
    array.map(disk => {
        disk_select.innerHTML += `
        <option value="${disk}:\\">${disk}</option>
        `
    })
};

function getData(content = '') {
    window.folder.getData(content, retrieveFolderData);
};

current_path.addEventListener('keypress', e => {
    if (e.key === 'Enter') {
        content_path = e.target.value;
        getData(content_path);
    }
});

disk_select.addEventListener('change', e => {
    content_path = e.target.value;
    getData(content_path);
});

interface.addEventListener('click', (e) => {
    if (e.target.nodeName === 'IMG') {
        if (content_path.length < 4) {
            content_path += `${e.target.attributes.value.value}`
        } else {
            content_path += `\\${e.target.attributes.value.value}`
        }
        getData(content_path);
    }
});

backward.addEventListener('click', () => {
    backward.removeAttribute('disabled', '');
    let structure = content_path.split('\\'), result, res;
    structure.pop();
    for (let i = 0; i < structure.length; i++) {
        result += `\\${structure[i]}`;
    }
    res = result.split('undefined\\')[1];
    if (res.length < 3) {
        res += '\\';
    }
    content_path = res;
    getData(content_path)
});

boton.addEventListener('click', () => {
    window.folder.Close();
});