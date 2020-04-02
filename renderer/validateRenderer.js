/**
 * This renderer file is responsible for all user interaction in the
 * 'validate' section of the application. It is responsible
 * for telling the main process to execute the tool via a ChildProcess
 * and handling the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let varb_cont = $('#variable-content');

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the correct select button using
 * the label parameter.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 * @param {string} label - word that is used to checks where the path should be displayed
 */
ipcRenderer.on('selected-validate', function (event, paths) {
    let run_btn = $('#run-validate');
    let selected_filenames = $('#selected-filenames');
    if (paths.length !== 0) {
        selected_filenames.css({
            'position' : 'relative',
            'left' : '0',
            'top' : '0',
            'margin': '8px 0 8px 15px',
            'transform': 'none',
        });
        selected_filenames.html(paths.join('<br>'));
        run_btn.css({
            'right': '0',
            'opacity' : '1'
        }).prop('disabled', false);
    } else {
        selected_filenames.css({
            'position' : 'absolute',
            'left' : '50%',
            'top' : '50%',
            'margin': '0',
            'transform': 'translate(-50%, -50%)',
        });
        selected_filenames.html('No file selected');
        run_btn.css({
            'right': '-100px',
            'opacity' : '0'
        }).prop('disabled', true);
    }
});