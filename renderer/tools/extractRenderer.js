/**
 * This renderer file is responsible for all user interaction in the
 * 'extract EEG' section of the application. It is responsible
 * for telling the main process to execute the tool via a ChildProcess
 * and handling the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let var_content = $('#variable-content');

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the correct select button using
 * the label parameter.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 * @param {string} label - word that is used to checks where the path should be displayed
 */
ipcRenderer.on('selected-extract', function (event, paths, label) {
    let trg_select = $('#e-trg-select-btn');
    let eeg_select = $('#e-eeg-select-btn');
    if (label === 'trg') {
        if (paths.length !== 0) {
            trg_select.html(paths.join('<br>'));
            trg_select.css('font-size', '14px');
        } else {
            trg_select.html('Click to select a TRG file');
            trg_select.css('font-size', '14px');
        }
        checkIfExtractFormComplete();
    } else {
        if (paths.length !== 0) {
            eeg_select.html(paths.join('<br>'));
            eeg_select.css('font-size', '14px');
        } else {
            eeg_select.html('Click to select an EEG file');
            eeg_select.css('font-size', '14px');
        }
        checkIfExtractFormComplete();
    }
});


/**
 * Calls on the checkIfFormComplete function every time the -w
 * parameter is altered by the user
 */
var_content.on('change', '#extract-select-container',  function () {
    checkIfExtractFormComplete();
});


/**
 * Checks if both the needed files and the window argument are given correctly.
 * Disables / enables run button
 */
function checkIfExtractFormComplete() {
    let run_extract = $('#run-extract');
    let trg_select = $('#e-trg-select-btn');
    let eeg_select = $('#e-eeg-select-btn');
    if ( trg_select.html().includes('\\') && eeg_select.html().includes('\\')) {
        run_extract.css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        run_extract.css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
}


/**
 * Tells the main process to run the extract tool / command.
 * Clears the html.
 */
var_content.on('click', '#run-extract', function() {
    ipcRenderer.send('resize-window', 800, 300);
    let trg_select = $('#e-trg-select-btn');
    let eeg_select = $('#e-eeg-select-btn');
    let window_size_extract = $('#window-size-extract');

    let eeg_file = eeg_select.html();
    let trg_file = trg_select.html();
    let win_size = window_size_extract.val();
    var_content.html('');
    ipcRenderer.send('run-extract', eeg_file, trg_file, win_size);
});

/**
 * Shows the result page skeleton and the preloader will be showed.
 */
ipcRenderer.on('set-title-and-preloader-extract', function () {
    let preloader = $('.linePreloader');

    preloader.show();
    var_content.html('<h1 class="external-window-instruction">Please be patient, this could take quite some time..</h1>');
});


/**
 * Restores original page when user closes external windows and functionality is done
 * Hides preloader and sends message to resize window.
 */
ipcRenderer.on('extract-result', function () {
    showNotification('success', 'Successfully extracted the information into a separate file');
    let preloader = $('.linePreloader');
    var_content.load('shared/extract.html').hide().fadeIn('slow');
    ipcRenderer.send('resize-window', 800, 530);
    preloader.hide();
});
