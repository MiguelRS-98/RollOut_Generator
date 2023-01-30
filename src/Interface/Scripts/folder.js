const current_path = document.getElementById('current-path');
const boton = document.getElementById('confirm-exit');
const interface = document.getElementById('ui');
const backward = document.getElementById('backward');

// Definitions
let content_path, masterData = [];

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
    current_path.setAttribute('value', content_path);

    console.log('retrieve Method');
}

interface.addEventListener('click', (e) => {
    if (e.target.nodeName === 'IMG') {
        content_path += `\\${e.target.attributes.value.value}`
        getData(content_path);
    }
});

backward.addEventListener('click', () => {
    backward.removeAttribute('disabled', '');
    let structure = content_path.split('\\'), result, res;
    structure.pop();
    if (structure.length === 1) {
        backward.classList.add('disabled')
        return;
    };
    backward.classList.remove('disabled')
    for (let i = 0; i < structure.length; i++) {
        result += `\\${structure[i]}`;
    }
    res = result.split('undefined\\')[1];
    content_path = res;
    getData(content_path)
});

boton.addEventListener('click', () => {
    window.folder.Close();
})

function getData(content = '') {
    console.log(content);
    window.folder.getData(content, retrieveFolderData);
}

((content = '') => {
    window.folder.getData(content, retrieveFolderData);
})()