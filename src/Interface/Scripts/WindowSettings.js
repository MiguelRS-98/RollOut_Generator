// Get DOM Elements
const ButtonRoute = document.getElementById('ButtonRoute');
const inputRoute = document.getElementById('desc-route');

//Definitions
let inputRouteData;

// Function Of Main Process
function UpdateConfig(){
    window.main.UpdateRouteSystem(inputRouteData);
};

inputRoute.addEventListener('keypress', e => {
    inputRouteData = e.target.value;
    if ( e.key === 'Enter') return UpdateConfig();
});

async function getDataSettingsFile() {
    await console.log('inicio');
    await window.main.GetPathSettings_Data((e, data) => {
        inputRoute.setAttribute('value', data)
        if (data === 'Not Asigned') {
            return inputRoute.removeAttribute('disabled')
        }
        return inputRoute.setAttribute('disabled','')
    });
    await console.log('fin');
}

getDataSettingsFile();