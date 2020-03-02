// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_cont = $("#variable-content");

ipcRenderer.on('current-database-settings', function (event, database_settings) {
    $('#database-path').html(database_settings);
    log.info(database_settings);
});

ipcRenderer.on('current-modality-settings', function (event, modality_settings) {
    let parsed = JSON.parse(modality_settings);
    log.info(parsed);
});


/**
 *
 */
variable_content.on("click", '#select-database', function() {
    log.info('clicked select button');
    ipcRenderer.send("select-db-file");
});


/**
 * On clicking the SET DATABASE button on the settings page, this
 * renderer process will tell the main process to set the selected
 * database path in the config.ini file in the Python project
 */
var_cont.on("click", '#run-convert', function() {
    ipcRenderer.send("run-convert");
});


ipcRenderer.on('selected', function (event, database_path) {
    $('#database-path').html(database_path);
});