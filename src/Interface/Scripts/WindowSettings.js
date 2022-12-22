// Get DOM Elements
const ButtonRoute = document.getElementById('ButtonRoute');
const inputRoute = document.getElementById('inputRoute');

//Definitions
let inputRouteData;

// Function Of Main Process
function UpdateConfig(){
    window.setRoute.UpdateRouteSystem(inputRouteData);
};

//Listener To Input Text For Get the Route To RollOut Send Files
inputRoute.addEventListener('change', e => {
    inputRouteData = e.target.value;
});
inputRoute.addEventListener('keypress', e => {
    if ( e.key === 'Enter') return UpdateConfig();
});

//Listener to Button Set Route to RollOut
ButtonRoute.addEventListener('click', () => {
    UpdateConfig();
});

document.addEventListener('keypress', e => {
    if ( e.key === 'Enter') return UpdateConfig();
});