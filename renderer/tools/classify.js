/**
 * This renderer file is responsible for all user interaction in the
 * 'classify' section of the application. It is responsible
 * for telling the main process to execute the tool via a ChildProcess
 * and handling the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// global jQuery selectors
let vc = $('#variable-content');

/**
 * Responsible for handling the information that the file select dialog
 * returns. Displays the file-path inside the correct select button using
 * the label parameter.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {array} paths - all the selected file-paths in an array
 * @param {string} label - word that is used to checks where the path should be displayed
 */
ipcRenderer.on('selected-classify', function (event, paths) {
    let run_btn = $('#run-classify');
    let selected_filenames = $('#selected-filenames');
    if (paths.length !== 0) {
        selected_filenames.css({
            'word-break': 'break-all',
            'position' : 'relative',
            'left' : '0',
            'top' : '0',
            'margin': '8px 8px 8px 15px',
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


/**
 * Tells the main process to run the classify tool / command.
 * Clears the html.
 */
vc.on('click', '#run-classify', function() {
    let selected_filenames = $('#selected-filenames');

    let extracted_filepath = selected_filenames.html();

    vc.html('');
    ipcRenderer.send('run-classify', extracted_filepath);
});


/**
 * Shows the result page skeleton and the preloader will be showed.
 */
ipcRenderer.on('set-title-and-preloader-classify', function () {
    let preloader = $('.linePreloader');

    preloader.show();
    vc.html('<h1 class="external-window-instruction">The classifying can be performed in the external pop-up window(s)</h1>');
    ipcRenderer.send('resize-window', 1000, 300);
});


/**
 * Restores original page when user closes external windows and functionality is done
 * Hides preloader and sends message to resize window.
 */
ipcRenderer.on('classify-result', function () {
    showNotification('success', 'Successfully ran the classifier over the file', 5000);
    let preloader = $('.linePreloader');
    vc.load('components/classify.html').hide().fadeIn('slow');
    ipcRenderer.send('resize-window', 800, 460);
    preloader.hide();
});
