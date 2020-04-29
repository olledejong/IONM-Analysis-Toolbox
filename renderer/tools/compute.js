//======================================================================
// This renderer file is responsible for all user interaction in the
// compute section of the application. It is responsible for telling
// the main process to execute the tool via a ChildProcess and handling
// the response of this ChildProcess (error / success)
//======================================================================

// requires
window.$ = window.jQuery = require('jquery');

// global selectors
let variableCont = $('#variable-content');

//======================================================================
// Responsible for handling the information that the file select dialog
// returns. Displays the file-path inside the select button.
//
// @param {object} event - for purpose of communication with sender
// @param {array} paths - all the selected file-paths in an array
//======================================================================
ipcRenderer.on('selected-compute', (event, paths) => {
    let compute_select_btn = $('#compute-select-btn');

    // use generate file names function from fileSelect.js
    if (paths.length !== 0) {
        compute_select_btn.html(generateFilenames(paths));
        checkIfComputeFormComplete();
    } else {
        compute_select_btn.html('Click to select a file');
        checkIfComputeFormComplete();
    }
});


//====================================================================
// Listens to change of the compute select container. If change, then
// it runs the function that checks if a file and the stats argument
// are given correctly.
//====================================================================
variableCont.on('change', '#compute-select-container',  function checkIfFormComplete() {
    checkIfComputeFormComplete();
});


//===============================================================
// Checks if a file and the stats argument are given correctly.
// Disables / enables run button
//===============================================================
function checkIfComputeFormComplete() {
    let run_compute = $('#run-compute');
    let compute_select_btn = $('#compute-select-btn');
    if ( compute_select_btn.html().includes('TRG') ) {
        run_compute.css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        run_compute.css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
}


//=============================================================
// Tells the main process to run the compute tool / command.
// Sends message to resize the window
//=============================================================
variableCont.on('click', '#run-compute', () => {
    let stats_input_field = $('#stats-input');
    let stats_value = stats_input_field.val();

    ipcRenderer.send('resize-window', 1100, 300);
    ipcRenderer.send('run-compute', stats_value);
});


//=============================================================
// Loads result page skeleton and the preloader will be showed.
// Hides containers until needed later.
//=============================================================
ipcRenderer.on('set-title-and-preloader-compute', () => {
    $('.linePreloader').show();
    variableCont.html(`<div id="compute-content">
                            <h1 class="external-window-instruction">Please work through the external windows to get to the final result</h1>
                            <div id="successful-computes">
                                <div id="succeeded-computes">
                                    <h2>Successfully computed<i class="fas fa-check"></i></h2>
                                    <p id="succeeded-computes-p">
                                        For now the method of selecting signals is the same as before, but this might change in the future.
                                    </p>
                                </div>
                            </div>
                       </div>`);
    $('#successful-computes').hide();
});


//===============================================================
// Shows the result skeleton and fills it for every successfully
// completed compute task. Hides preloader and shows the results.
//
// @param {string} file_path - file path of the computed file
//===============================================================
ipcRenderer.on('compute-result', (event, stdout, file_path) => {
    ipcRenderer.send('resize-window', 1200, 500);

    for (let i = 0; i < file_path.length; i++) {
        log.info(file_path);
        let file_name = path.parse(file_path[i]).base.trim();
        showNotification('success', `Successfully computed ${file_name}`);
        $(`<tr><td class="name-td">${file_name}</td><td class="msg-td">Successfully computed the statistics of this file. Results can be found in the database</td><td class="filepath-td">${file_path[0]}</td></tr><br>`).insertBefore('#succeeded-computes-p');
    }
    $('.linePreloader').hide('fast');
    $('#compute-content h1').hide();
    $('#successful-computes').show('fast');
});

