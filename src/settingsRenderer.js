// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_cont = $("#variable-content");

// globals
let currentDatabase;


ipcRenderer.on('current-database-settings', function (event, database_settings) {
    $('.database-path').html(database_settings.replace(/"/g, ''));
    currentDatabase = database_settings.replace(/"/g, '');
});


/**
 * Show the configured modalities to the user on the message 'current-modality-settings'.
 * This message comes from the main process and with it comes the modality info from the
 * database.
 *
 * @param output
 */
ipcRenderer.on('current-modality-settings', function (event, current_modality_settings) {
    let parsed = JSON.parse(current_modality_settings);

    let set_modalities = $('#set-modalities');
    let modalities_table = $('#modalities-table');

    if (Object.keys(parsed).length === 0) {
        modalities_table.remove();
        // append table with informative message
        $(`<table id="modalities-table">
            <tr id="modalities-table-hrow">
                <th>No modalities configured for this database</th>
            </tr>
         </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200)
    } else {
        modalities_table.remove();
        // add table skeleton and header row to the page
        $(`<table id="modalities-table">
                <tr id="modalities-table-hrow">
                    <th>MODALITY</th>
                    <th>` + Object.keys(Object.values(parsed)[0])[0].toUpperCase() + `</th>
                    <th>` + Object.keys(Object.values(parsed)[0])[1].toUpperCase() + `</th>
                    <th>` + Object.keys(Object.values(parsed)[0])[2].toUpperCase() + `</th>
                </tr>
           </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200);

        // for every key (modality), create a row which will hold its information
        for (let i = 0; i < Object.keys(parsed).length; i++) {
            log.info(Object.keys(parsed)[i]);
            let rndmHash = Math.random().toString(36).substring(7);
            $('#modalities-table').append('<tr id="row-' + rndmHash + '"><td>' + Object.keys(parsed)[i] + '</td></tr>');

            // for every modality, add its configuration (type, strategy and description) to its
            for (let j = 0; j < Object.keys(Object.values(parsed)[i]).length; j++) {
                let rowElement = $('#row-' + rndmHash);
                rowElement.append('<td>' + Object.values(Object.values(parsed)[i])[j] + '</td>');
            }
        }
    }
});


/**
 * On click on the database SELECT button, this function sends a message
 * to the main process and tells it to open a file selection window with
 * the dynamic content 'options'
 */
variable_content.on("click", '#select-database-btn', function() {
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['accdb'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select database',
        filters: types,
        defaultPath: "D:\\Menno\\NimEclipse\\NS\\test",
        properties: ['openFile']
    };
    ipcRenderer.send("select-file", options);
});


/**
 * On clicking the SET DATABASE button on the settings page, this
 * renderer process will tell the main process to set the selected
 * database path in the config.ini file in the Python project
 */
var_cont.on("click", '#set-database', function() {
    ipcRenderer.send("set-database");

    let set_database = $('#set-database');
    set_database.css('background', '#ccc');
    set_database.css('color', '#404040');
    set_database.prop('disabled', true);
    set_database.css('cursor', 'auto')
});


/**
 * When setting the database string is completed successfully,
 * retrieve the settings again (update) and show toast messages
 * to the user
 */
ipcRenderer.on('database-set-successful', function () {
    ipcRenderer.send('get-modality-settings');
    ipcRenderer.send('get-database-settings');

    showNotification('success', 'Successfully set the new database path');
    showNotification('info', 'Updating the modalities');
});


/**
 * On click on the database SELECT button, this function sends a message
 * to the main process and tells it to open a file selection window with
 * the dynamic content 'options'
 */
variable_content.on("click", '#add-new-modality', function() {
    log.info('add clicked');
    ipcRenderer.send('resize-window', 1200, 800);
    $('#settings-content').append(
        `<div class="small-tool" id="add-modality">
            <input type="radio" id="triggered" name="type" value="TRIGGERED">
            <label for="triggered">TRIGGERED</label><br>
            <input type="radio" id="free-running" name="type" value="FREE_RUNNING">
            <label for="free-running">FREE_RUNNING</label><br>
            
            <input type="radio" id="direct" name="strategy" value="DIRECT">
            <label for="direct">DIRECT</label><br>
            <input type="radio" id="average" name="strategy" value="AVERAGE">
            <label for="average">AVERAGE</label><br>
       </div>`);

    // animate the error message
    $('#add-modality').animate({
        margin: '15px 0 0 0', opacity: 1
    }, 800);
});


/**
 *
 */
ipcRenderer.on('selected', function (event, selected_database) {
    // scope selectors
    let set_database = $('#set-database');
    let database_path_p = $('.database-path');

    // only do something if there is a file selected
    if(selected_database.length !== 0) {
        database_path_p.html(selected_database);
        set_database.css('background', '#ff8c00cf');
        set_database.css('color', 'white');
        set_database.prop('disabled', false);
        set_database.css('cursor', 'pointer')
    } else {
        ipcRenderer.send('get-database-settings');
        database_path_p.html(currentDatabase);
        set_database.css('background', '#ccc');
        set_database.css('color', '#404040');
        set_database.prop('disabled', true);
        set_database.css('cursor', 'auto')
    }
});