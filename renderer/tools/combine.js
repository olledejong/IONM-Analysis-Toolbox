/**
 * This renderer file is responsible for all user interaction in the
 * 'combine' section of the application. It is responsible
 * for telling the main process to execute the tool via a ChildProcess
 * and handling the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let variab_cont = $('#variable-content');

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the correct select button using
 * the label parameter.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 * @param {string} label - word that is used to checks where the path should be displayed
 */
ipcRenderer.on('selected-combine', function (event, paths) {
    let combine_select_btn = $('#combine-select-btn');
    // use generate file names function from fileSelect.js
    if (paths.length !== 0) {
        combine_select_btn.html(paths);
        combine_select_btn.css('font-size', '13px');
        checkIfCombineFormComplete();
    } else {
        combine_select_btn.html('Click to select a file');
        combine_select_btn.css('font-size', '16px');
        checkIfCombineFormComplete();
    }
});


/**
 * Listens to change of the compute select container. If change, then it runs the
 * function that checks if a file and the stats argument are given correctly.
 */
variab_cont.on('change', '#combine-select-container',  function checkIfFormComplete() {
    checkIfCombineFormComplete();
});


/**
 * Checks if a file and the stats argument are given correctly.
 * Disables / enables run button
 */
function checkIfCombineFormComplete() {
    let run_combine = $('#run-combine');
    let combine_select_btn = $('#combine-select-btn');
    let patient_id_input = $('#patient-id-input');
    if ( combine_select_btn.html().includes('.csv') &&
         patient_id_input.val() > 0 ) {
        run_combine.css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        run_combine.css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
}


/**
 * Tells the main process to run the combine tool / command.
 * Clears the html.
 */
variab_cont.on('click', '#run-combine', function() {
    let selected_filenames_container = $('#combine-select-btn');
    let patient_id = $('#patient-id-input').val();

    // file selected by user
    let selected_filepath = selected_filenames_container.html();

    variab_cont.html('');
    ipcRenderer.send('run-combine', selected_filepath, patient_id);
});


/**
 * Shows the result page skeleton and the preloader will be showed.
 */
ipcRenderer.on('set-title-and-preloader-combine', function () {
    let preloader = $('.linePreloader');

    preloader.show();
    variab_cont.html('<h1 class="external-window-instruction">Combining the data, this could take quite some time..</h1>');
    ipcRenderer.send('resize-window', 1000, 300);
});


/**
 * Restores original page when user closes external windows and functionality is done
 * Hides preloader and sends message to resize window.
 */
ipcRenderer.on('combine-result', function () {
    showNotification('success', 'Successfully combined the file with the database parameters', 5000);
    let preloader = $('.linePreloader');
    variab_cont.load('components/combine.html').hide().fadeIn('slow');
    ipcRenderer.send('resize-window', 800, 460);
    preloader.hide();
});
