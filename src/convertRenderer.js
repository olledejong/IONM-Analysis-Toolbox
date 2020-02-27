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