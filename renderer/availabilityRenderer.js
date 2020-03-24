/**
 * This renderer file is responsible for all user interaction in the
 * 'show EEG availability' section of the application. It is responsible
 * for telling the main process to execute the tool via a ChildProcess
 * and handling the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let var_con = $("#variable-content");

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the correct select button using
 * the label parameter.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 * @param {string} label - word that is used to checks where the path should be displayed
 */
ipcRenderer.on('selected-availability', function (event, paths, label) {
    let trg_select = $('#trg-select-btn');
    let eeg_select = $('#eeg-select-btn');
    if (label === 'trg') {
        if (paths.length !== 0) {
            trg_select.html(paths.join('<br>'));
        } else {
            trg_select.html('Click to select a TRG file');
        }
        checkIfFilesAreGiven()
    } else {
        if (paths.length !== 0) {
            eeg_select.html(paths.join('<br>'));
        } else {
            eeg_select.html('Click to select an EEG file');
        }
        checkIfFilesAreGiven()
    }
});

/**
 * Checks if both the needed files are given. Disables / enables run button
 */
function checkIfFilesAreGiven() {
    let run_availability = $('#run-availability');
    let trg_select = $('#trg-select-btn');
    let eeg_select = $('#eeg-select-btn');
    if ( trg_select.html().includes('\\') && eeg_select.html().includes('\\') ) {
        run_availability.css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false)
    } else {
        run_availability.css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true)
    }
}

/**
 * Tells the main process to run the availability tool / command.
 * Clears the html.
 */
var_con.on("click", '#run-availability', function() {
    let trg_select = $('#trg-select-btn');
    let eeg_select = $('#eeg-select-btn');

    let eeg_file = eeg_select.html();
    let trg_file = trg_select.html();
    var_con.html('');
    ipcRenderer.send("run-availability", eeg_file, trg_file);
});

/**
 * Shows the result page skeleton and the preloader will be showed.
 */
ipcRenderer.on('set-title-and-preloader-availability', function () {
    let preloader = $('.lds-ellipsis');

    preloader.show('fast');
    var_con.html(`<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>`);
});


/**
 * Restores original page when user closes external windows and functionality is done
 * Hides preloader and sends message to resize window.
 */
ipcRenderer.on('availability-result', function () {
    let preloader = $('.lds-ellipsis');
    ipcRenderer.send('resize-window', 800, 450);
    var_con.load('../shared/availability.html');
    preloader.hide('fast');
});
