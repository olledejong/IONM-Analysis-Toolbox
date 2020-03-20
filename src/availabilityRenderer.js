// requires
window.$ = window.jQuery = require('jquery');

// global
let tool = 'availability';

// jQuery selectors
let var_con = $("#variable-content");



ipcRenderer.on('selected-availability', function (event, paths, label) {
    if (label === 'trg') {
        if (paths.length !== 0) {
            $('#trg-select-btn').html(paths.join('<br>'));
        } else {
            $('#trg-select-btn').html('Click to select a TRG file');
        }
        checkIfFilesAreGiven()
    } else {
        if (paths.length !== 0) {
            $('#eeg-select-btn').html(paths.join('<br>'));
        } else {
            $('#eeg-select-btn').html('Click to select an EEG file');
        }
        checkIfFilesAreGiven()
    }
});

/**
 * Checks if both the needed files are given. Disables / enables run button
 */
function checkIfFilesAreGiven() {
    if ( $('#trg-select-btn').html().includes('\\') &&  $('#eeg-select-btn').html().includes('\\') ) {
        $('#run-availability').css({
            'background':'#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false)
    } else {
        $('#run-availability').css({
            'background':'#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true)
    }
}

/**
 * On clicking the RUN button on the availability page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the availability
 * command.
 */
var_con.on("click", '#run-availability', function() {
    let eeg_file = $('#eeg-select-btn').html();
    let trg_file = $('#trg-select-btn').html();
    var_con.html('');
    ipcRenderer.send("run-availability", eeg_file, trg_file);
});

/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-availability'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-availability', function (event) {
    $('.lds-ellipsis').show('fast');
    variableContent.html(`<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>`);
    // hide summarize results div untill it actually gets some results
    $('#timing-results').hide();
});

ipcRenderer.on('availability-result', function () {
    ipcRenderer.send('resize-window', 800, 450);
    var_con.html(
        `<div id="availability-content">
            <div id="availability-content-description" class="content-description-container">
                <h3 id="availability-content-h">Generate a plot showing when an EEG context is available for given evoked potentials</h3>
                <p id="availability-content-p">
                This will generate a plot showing timestamps at which IONM measurements were made. In the resulting graph 
                you will see plots in which timestamps of measurements are plotted as a function of the position in file.
                <br><br>Please select the CSV file(s) of which you would like to see a timing plot.
                </p>
            </div>
            <div id="availability-select-container">
                <button id="eeg-select-btn" class="availability-btn">Click to select an EEG file</button>
                <button id="trg-select-btn" class="availability-btn">Click to select a TRG file</button>
                <button id="run-availability" disabled>RUN</button>
            </div>
        </div>`);
    $('.lds-ellipsis').hide('fast');
})
