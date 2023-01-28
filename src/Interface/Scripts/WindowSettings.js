// Get DOM Elements
const ButtonRoute = document.getElementById('ButtonRoute');
const inputRoute = document.getElementById('desc-route');

//Definitions
let inputRouteData;

// Function Of Main Process
function UpdateConfig() {
    window.main.UpdateRouteSystem(inputRouteData);
};

inputRoute.addEventListener('keypress', e => {
    inputRouteData = e.target.value;
    if (e.key === 'Enter') return UpdateConfig();
});

async function getDataSettingsFile() {
    await window.main.GetPathSettings_Data((e, data) => {
        if (data === 'Not Asigned') {
            return inputRoute.removeAttribute('disabled')
        }
        inputRoute.setAttribute('value', data)
        return inputRoute.setAttribute('disabled', '')
    });
}

getDataSettingsFile();