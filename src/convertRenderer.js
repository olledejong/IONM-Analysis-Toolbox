// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let varContent = $("#variable-content");

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
varContent.on("click", '#run-convert', function() {
    varContent.html('clicked');
    ipcRenderer.send("run-convert");
});


/**
 * This function gets called by the main renderer for every file that the user wants to convert.
 * It shows confirmation or informative error messages to the user so that he/she knows what
 * to do next.
 */
ipcRenderer.on('convert-result', function (event, convert_output) {
    let rndmHash = Math.random().toString(36).substring(7);
    // this iteration of the convert command succeeded | if it has a success message
    if (convert_output.hasOwnProperty('succes-msg')) {
        $('.container-after-titlebar').append('<div id="'+ rndmHash + '" class="success-msg"><i class="fas fa-check"></i>&nbsp;&nbsp;'+ convert_output['succes-msg'] +'</div>');
        let tempElement = $('#'+rndmHash);

        // animate the succes message
        tempElement.animate({
            right: '+=465', opacity: 1
        }, 800, function () {
            tempElement.delay(3500).fadeOut(800, function () {
                $(this).remove();
            });
        });
    // this iteration of the convert command did not succeed | if it doesnt have a success message
    } else {
        $('.container-after-titlebar').append('<div id="'+ rndmHash + '" class="error-msg"><i class="fas fa-times-circle"></i>&nbsp;&nbsp;'+ convert_output['short-error-msg'] +'</div>');
        let tempElement = $('#'+rndmHash);

        // animate the error message
        tempElement.animate({
            right: '+=465', opacity: 1
        }, 800, function () {
            tempElement.delay(3500).fadeOut(800, function () {
                $(this).remove();
            });
        });
    }
});