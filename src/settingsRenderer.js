// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_cont = $("#variable-content");

// globals
let currentDatabase;


ipcRenderer.on('current-database-settings', function (event, database_settings) {
    $('#database-path').html(database_settings.replace(/"/g, ''));
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

    // add table skeleton and header row to the page
    $('#set-modalities').append(`<table id="modalities-table">
                                    <tr id="modalities-table-hrow">
                                        <th>MODALITY</th>
                                        <th>`+ Object.keys(Object.values(parsed)[0])[0].toUpperCase() +`</th>
                                        <th>`+ Object.keys(Object.values(parsed)[0])[1].toUpperCase() +`</th>
                                        <th>`+ Object.keys(Object.values(parsed)[0])[2].toUpperCase() +`</th>
                                    </tr>
                                 </table>`).children(':last').hide().fadeIn(1000);

    // for every key (modality), create a row which will hold its information
    for(let i=0; i < Object.keys(parsed).length; i++) {
        let rndmHash = Math.random().toString(36).substring(7);
        $('#modalities-table').append('<tr id="row-'+ rndmHash +'"><td>'+ Object.keys(parsed)[i] +'</td></tr>');

        // for every modality, add its configuration (type, strategy and description) to its
        for(let j=0; j < Object.keys(Object.values(parsed)[i]).length; j++) {
            let rowElement = $('#row-' + rndmHash);
            rowElement.append('<td>'+ Object.values(Object.values(parsed)[i])[j] +'</td>');
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
        defaultPath: "D:\\Menno",
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
});


ipcRenderer.on('selected', function (event, selected_database) {
    // scope selectors
    let set_database = $('#set-database');
    let database_path_p = $('#database-path');

    // only do something if there is a file selected
    if(selected_database.length !== 0) {
        database_path_p.html(selected_database);
        set_database.css('background', '#ff8c00cf');
        set_database.css('color', 'white')
    } else {
        database_path_p.html(currentDatabase);
        set_database.css('background', '#ccc');
        set_database.css('color', '#404040')
    }
});