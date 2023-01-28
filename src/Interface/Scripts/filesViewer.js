const drop_files = document.getElementById('drop-files');
const files_viewer = document.getElementById('files-viewer');

let filesDataArray = [];

function filesViwer(files) {
    files.map(element => {
        const { name, size } = element;
        filesDataArray.push({ name, size });
    })
    filesArea.classList.remove('viewFiles-off');
    files_viewer_content.classList.add('viewFiles-off');
}