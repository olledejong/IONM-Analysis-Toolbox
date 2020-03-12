// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_cont = $("#variable-content");

// globals
let currentDatabase;

// set the start path of the file select window
defaultDatabasePath = "D:\\Menno\\NimEclipse\\NS\\test";


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
    let set_modalities = $('#set-modalities');
    let modalities_table = $('#modalities-table');
    let parsed;

    // if string contains curly brackets, aka if it contains modalities then process it
    // and provide a table displaying all current modalities for the user
    if (current_modality_settings.indexOf('{') >= 0) {
        parsed = JSON.parse(current_modality_settings);
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
                let rndmHash = Math.random().toString(36).substring(7);
                $('#modalities-table').append('<tr id="row-' + rndmHash + '"><td>' + Object.keys(parsed)[i] + '</td></tr>');

                // for every modality, add its configuration (type, strategy and description) to its
                for (let j = 0; j < Object.keys(Object.values(parsed)[i]).length; j++) {
                    let rowElement = $('#row-' + rndmHash);
                    rowElement.append('<td>' + Object.values(Object.values(parsed)[i])[j] + '</td>');
                }
            }
        }
    // if result does not contain curly brackets aka modalities, the database isnt set up yet, display empty table
    } else {
        modalities_table.remove();
        $(`<table id="modalities-table">
            <tr id="modalities-table-hrow">
                <th>The database is not setup yet, please do that first!</th>
            </tr>
         </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200)
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
        defaultPath: defaultDatabasePath,
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
    showNotification('info', 'Setting the database path..');
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

    showNotification('success', 'Successfully set the database path');
    showNotification('info', 'Updating the modalities..');
});


/**
 * On click on the database SELECT button, this function sends a message
 * to the main process and tells it to open a file selection window with
 * the dynamic content 'options'
 */
variable_content.on("click", '#add-new-modality', function() {
    ipcRenderer.send('resize-window', 1200, 800);

    // animate the modality form
    $('#add-modality').animate({
        margin: '15px 0 0 0', opacity: 1, zIndex: 20
    }, 800);

    $('#hide-modality-form').show()
});

variable_content.on("click", '#hide-modality-form', function() {
    let add_modality = $('#add-modality');
    // hide add-modality form
    $('#hide-modality-form').hide();
    add_modality.css('z-index', -5);
    add_modality.animate({
        margin: '-130px 0 0 0', opacity: 0
    }, 800);

    resetModalityForm();
});

variable_content.on("click", '#submit-new-modality', function() {
    let submit_new_modality = $('#submit-new-modality');
    let description_input = $('#description-input');

    // handle click
    let modality = $('#modality-input').val();
    let type = $("input[name='type']:checked").val();
    let strategy = $("input[name='strategy']:checked").val();
    let description = null;

    // if description given, replace null
    if (description_input.val().length > 0) {
        description = description_input.val();
    }

    ipcRenderer.send('set-new-modality', modality, type, strategy, description);

    submit_new_modality.css('background', '#ccc');
    submit_new_modality.css('color', '#404040');
    submit_new_modality.css('cursor', 'auto');
    submit_new_modality.prop('disabled', true);
    resetModalityForm();
});

/**
 * Will be executed when the file select method detects no error and
 * some file has been selected. Resulting from this, the design of the
 * 'set database' button gets changed and the displayed path gets changed
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
        database_path_p.html(currentDatabase);
        set_database.css('background', '#ccc');
        set_database.css('color', '#404040');
        set_database.prop('disabled', true);
        set_database.css('cursor', 'auto')
    }
});

function resetModalityForm() {
    $('#modality-input').val("");
    $('#description-input').val("");
    $('#triggered').prop('checked', true);
    $('#direct').prop('checked', true);
}

/**
 * Listener for add-modality form change. When form is filled out,
 * enable the
 */
variable_content.on('change', '#add-modality',  function checkIfFormComplete() {
    let submit_new_modality = $('#submit-new-modality');
    if ( $('#modality-input').val().length > 0) {
        submit_new_modality.css('background', '#ff8c00cf');
        submit_new_modality.css('color', 'white');
        submit_new_modality.css('cursor', 'pointer');
        submit_new_modality.prop('disabled', false)
    } else {
        submit_new_modality.css('background', '#ccc');
        submit_new_modality.css('color', '#404040');
        submit_new_modality.css('cursor', 'auto');
        submit_new_modality.prop('disabled', true)
    }
});


/**
 * Shows the user a confirmation popup whether he/she is absolutely
 * sure about seting up the database. Using the feedback of the user,
 * in the Main process, the setup command either gets run or it doesnt.
 */
variable_content.on('click', '#setup-database', function () {
    let options  = {
        buttons: ["Yes", "No", "Cancel"],
        message: "Are you sure about setting up the following database?\n"+ currentDatabase
    };
    ipcRenderer.send('showConfirmationBox', options)
    showNotification('info', 'Setting up the database..');
});


ipcRenderer.on('database-setup-successful', function () {
    showNotification('success', 'Successfully setup the database');
    // update the modalities
    ipcRenderer.send('get-modality-settings');
    showNotification('info', 'Updating the modalities..');
});