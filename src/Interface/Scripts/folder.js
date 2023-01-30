const current_path = document.getElementById('current-path');
const confirm = document.getElementById('confirm');
const cancel = document.getElementById('cancel');
const interface = document.getElementById('ui');

// Definitions
let path, routes_parts = [], content_path, state = true;

async function retrieveFolderData(path = '') {
    await window.folder.getData(path, (data, path) => {
        console.log(data);
        routes_parts = [];
        for (let i = 0; i < data.length; i++) {
            if (!data[i].includes('.')) {
                if (!data[i].includes(' ')) {
                    routes_parts.push({
                        folder: data[i]
                    })
                }
            }
        }
        current_path.setAttribute('value', path)
        content_path = path
        viewFolders(routes_parts);
    });
}

function viewFolders(array) {
    console.log(array);
    interface.innerHTML = '';
    for (let i = 0; i < array.length; i++) {
        interface.innerHTML += `
        <div class="folders" value="${array[i].folder}">
            <img src="./Resource/Folder-image-2.png" alt="${array[i].folder}" value="${array[i].folder}" width="90px" height="90px">
            <h4 value="${array[i].folder}">${array[i].folder}</h4>
        </div>
        `;
    }
    routes_parts = [];
}

interface.addEventListener('dblclick', (e) => {
    let tag = e.target.tagName;
    if (tag === 'DIV' || tag === 'IMG' || tag === 'H3' && e.target.attributes.value.value) {
        content_path += `\\${e.target.attributes.value.value}`
        retrieveFolderData(content_path)
    }
});

if (state) {
    retrieveFolderData();
    state = false
}