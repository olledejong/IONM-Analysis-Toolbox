// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_con = $("#variable-content");

/**
 * On clicking the RUN button on the availability page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the availability
 * command.
 */
var_con.on("click", '#run-availability', function() {
    var_con.html('');
    ipcRenderer.send("run-availability");
});

/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-availability'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-timing', function (event) {
    $('.lds-ellipsis').show('fast');
    variableContent.html(`<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>`);
    // hide summarize results div untill it actually gets some results
    $('#timing-results').hide();
});
