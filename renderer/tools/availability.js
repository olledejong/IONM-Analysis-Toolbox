//==================================================================
//                     Availability Renderer
//==================================================================
// This file is responsible for all user interaction in the 'show EEG
// availability' section of the application. It is responsible for
// telling the main process to execute the tool via a ChildProcess
// and handling the response of this ChildProcess (error / success)
//==================================================================

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let var_con = $('#variable-content');

//=======================================================================
// Responsible for handling the information that the file select dialog
// returns. Displays the file-path inside the correct select button using
// the label parameter.
//
// @param {object} event - for purpose of communication with sender
// @param {array} paths - all the selected file-paths in an array
// @param {string} label - word that is used to checks where the path
//                         should be displayed
//=======================================================================
ipcRenderer.on('selected-availability', (event, paths, label) => {
    let trg_select = $('#a-trg-select-btn');
    let eeg_select = $('#a-eeg-select-btn');
    if (label === 'trg') {
        if (paths.length !== 0) {
            log.info('paths: ', paths);
            trg_select.html(paths.join('<br>'));
            trg_select.css('font-size', '13px');
        } else {
            trg_select.html('Click to select a TRG file');
            trg_select.css('font-size', '16px');
        }
        checkIfAvailabilityFormComplete();
    } else {
        if (paths.length !== 0) {
            eeg_select.html(paths.join('<br>'));
            eeg_select.css('font-size', '13px');
        } else {
            eeg_select.html('Click to select an EEG file');
            eeg_select.css('font-size', '16px');
        }
        checkIfAvailabilityFormComplete();
    }
});


//=======================================================================
// Calls on the checkIfFormComplete function every time the -w
// parameter is altered by the user
//=======================================================================
var_con.on('change', '#availability-select-container', () => {
    checkIfAvailabilityFormComplete();
});


//==========================================================================
// Checks if both the needed files are given. Disables / enables run button
//==========================================================================
function checkIfAvailabilityFormComplete() {
    let run_availability = $('#run-availability');
    let trg_select_a = $('#a-trg-select-btn');
    let eeg_select_a = $('#a-eeg-select-btn');
    let window_size_availability = $('#window-size-availability');
    // if a TRG file, EEG file and windows size is between 1 and 10, enable run button
    if ( trg_select_a.html().includes('TRG') && eeg_select_a.html().includes('EEG') &&
        trg_select_a.html().includes('\\') && eeg_select_a.html().includes('\\') &&
        (window_size_availability.val() > 0 && window_size_availability.val() <= 10) ) {
        run_availability.css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        run_availability.css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
}


//===================================================================
// Tells the main process to run the availability tool / command.
// Clears the html.
//===================================================================
var_con.on('click', '#run-availability', () => {
    let window_size_availability = $('#window-size-availability');

    let eeg_file = $('#a-eeg-select-btn').html();
    let trg_file = $('#a-trg-select-btn').html();
    let win_size = window_size_availability.val();
    log.info(win_size);
    var_con.html('');
    ipcRenderer.send('run-availability', eeg_file, trg_file, win_size);
});


//=======================================================================
// Shows the result page skeleton and the preloader will be showed
//=======================================================================
ipcRenderer.on('set-title-and-preloader-availability', () => {
    ipcRenderer.send('resize-window', 1030, 310);
    $('.linePreloader').show();
    var_con.html('<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>');
});


//===========================================================================
// Restores original page when user closes external windows and functionality
// is done. Hides preloader and sends message to resize window.
//===========================================================================
ipcRenderer.on('availability-result', () => {
    ipcRenderer.send('resize-window', 800, 510);
    var_con.load('components/availability.html').hide().fadeIn('slow');
    $('.linePreloader').hide('fast');
});
