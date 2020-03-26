/**
 * This renderer file is responsible for all user interaction in the
 * compute section of the application. It is responsible for telling
 * the main process to execute the tool via a ChildProcess and handling
 * the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');
const path = require('path');

// selectors
let variableCont = $('#variable-content');

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the select button.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 */
ipcRenderer.on('selected-compute', function (event, paths) {
    let compute_select_btn = $('#compute-select-btn');

    if (paths.length !== 0) {
        compute_select_btn.html(paths.join('<br>'));
        checkIfComputeFormComplete();
    } else {
        compute_select_btn.html('Click to select a converted file');
        checkIfComputeFormComplete();
    }
});


/**
 * Listens to change of the compute select container. If change, then it runs the
 * function that checks if a file and the stats argument are given correctly.
 */
variableCont.on('change', '#compute-select-container',  function checkIfFormComplete() {
    log.info('change in compute select container');
    checkIfComputeFormComplete();
});


/**
 * Checks if a file and the stats argument are given correctly.
 * Disables / enables run button
 */
function checkIfComputeFormComplete() {
    let run_compute = $('#run-compute');
    let compute_select_btn = $('#compute-select-btn');
    let stats_input_field = $('#stats-input');
    if ( compute_select_btn.html().includes('\\') &&
        (stats_input_field.val() === 'all' || stats_input_field.val() === 'auc' || stats_input_field.val() === 'p_p_amplitude')) {
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

/**
 * Tells the main process to run the compute tool / command.
 * Sends message to resize the window
 */
variableCont.on('click', '#run-compute', function() {
    let stats_input_field = $('#stats-input');
    let stats_value = stats_input_field.val();
    log.info(stats_value);
    ipcRenderer.send('resize-window', 1180, 600);
    ipcRenderer.send('run-compute', stats_value);
});


/**
 * Loads result page skeleton and the preloader will be showed.
 * Hides containers until needed later.
 */
ipcRenderer.on('set-title-and-preloader-compute', function () {
    $('.lds-ellipsis').show();
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

/**
 * Shows the result skeleton and fills it for every successfully completed
 * compute task. Hides preloader and shows the results.
 */
ipcRenderer.on('compute-result', function (event, stdout, file_path) {
    for (let i = 0; i < file_path.length; i++) {
        log.info(file_path);
        let file_name = path.parse(file_path[i]).base.trim();
        showNotification('success', `Successfully computed ${file_name} `);
        $(`<tr><td class="name-td">${file_name}</td><td class="msg-td">Successfully computed the statistics of this file. Results can be found in the database</td><td class="filepath-td">${file_path[0]}</td></tr><br>`).insertBefore('#succeeded-computes-p');
    }
    $('.lds-ellipsis').hide('fast');
    $('#compute-content h1').hide();
    $('#successful-computes').show('fast');

});
