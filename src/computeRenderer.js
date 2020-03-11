// requires
window.$ = window.jQuery = require('jquery');

// selectors
let variableCont = $("#variable-content");

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
variableCont.on("click", '#run-compute', function() {
    ipcRenderer.send("run-compute");
});

/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-convert'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-compute', function () {
    $('.lds-ellipsis').show();
    variableCont.html('<div id="compute-content"></div>')
});


ipcRenderer.on('compute-result', function (event, stdout) {
    $('.lds-ellipsis').hide('fast');
    $('#compute-content').html(stdout)
});

