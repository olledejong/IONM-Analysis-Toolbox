/**
 * This renderer file is responsible for all user interaction in the
 * settings section of the application. Also for telling the main process
 * what to do regarding the settings of this applications and the python
 * project. These functionalities are:
 * - Setting the python src directory
 * - Setting the database the user wants to work with
 * - Setting up a new database
 * - Insight into the current configured modalities of the active database
 * - Add a new modality to the active database
 */

// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let var_cont = $("#variable-content");

// globals
let currentDatabase;
let currentSrcDirectory;

/**
 * Displays the currently configured src directory path to the user
 *
 * @param {object} event
 * @param {string} current_src_dir - currently configured src directory path
 */
ipcRenderer.on('current-python-src-dir', function (event, current_src_dir) {
    $('#src-dir-path').html(current_src_dir);
    currentSrcDirectory = current_src_dir[0];
});

/**
 * Lets the user know that the python src dir has been successfully configured.
 * Also retrieves the currently configured settings.
 */
ipcRenderer.on('successfully-set-src-dir', function () {
    showNotification('success', 'Successfully set the python src directory');
    showNotification('info', 'Retrieving currently configured application settings');
    ipcRenderer.send('get-current-settings');
});

/**
 * Displays the currently configured database settings (path)
 *
 * @param {object} event
 * @param {string} database_settings - currently configured database settings (path)
 */
ipcRenderer.on('current-database-settings', function (event, database_settings) {
    if (database_settings.trim().length === 0) {
        log.info('leeg');
        $('.database-path').html('No path configured');
    } else {
        $('.database-path').html(database_settings.replace(/"/g, ''));
        currentDatabase = database_settings.replace(/"/g, '');
    }
});


/**
 * Show the configured modalities to the user in a table.
 *
 * @param {object} event
 * @param {string} current_modality_settings - JSON string containing the current configured modalities
 */
ipcRenderer.on('current-modality-settings', function (event, current_modality_settings) {
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
                <th>Either the database is not setup yet, or an error occurred while retrieving the modalities</th>
            </tr>
         </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200)
    }
});


/**
 * Tells the main process to write the by the user selected database path to the
 * config.ini file in the python project. Also disables the 'set datbase' button.
 */
var_cont.on("click", '#set-database', function() {
    showNotification('info', 'Setting the database path');
    ipcRenderer.send("set-database");

    let set_database = $('#set-database');
    set_database.css({
        'background': '#ccc',
        'color': '#404040',
        'cursor': 'auto'
    });
    set_database.prop('disabled', true);
});

/**
 * Tells the main process to set the by the user selected python src dir.
 * Also disables the 'set src directory' button.
 */
variable_content.on("click", '#set-src-dir', function() {
    let src_dir = $('#src-dir-path').html();
    ipcRenderer.send('set-python-src-dir', src_dir);

    let set_src_dir = $('#set-src-dir');
    set_src_dir.css({
        'background':'#ccc',
        'color':'#404040',
        'cursor':'auto'
    });
    set_src_dir.prop('disabled', true);
});


/**
 * Retrieves / updates the currently configured settings because of the
 * successful configuration of a new database path
 */
ipcRenderer.on('database-set-successful', function () {
    ipcRenderer.send('get-current-settings');

    showNotification('success', 'Successfully set the database path');
    showNotification('info', 'Retrieving the modalities for this database');
});


/**
 * Shows the modality form using an animation on the user's request
 */
variable_content.on("click", '#add-new-modality', function() {
    ipcRenderer.send('resize-window', 1200, 800);

    // animate the modality form
    $('#add-modality').animate({
        margin: '15px 0 0 0', opacity: 1, zIndex: 20
    }, 800);

    $('#hide-modality-form').show()
});


/**
 * Hides the modality form using an animation on the user's request
 */
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


/**
 * Retrieves the filled out form values and tells the main process to execute
 * the 'set modality' command. Then disables the 'submit new modality' button.
 */
variable_content.on("click", '#submit-new-modality', function() {
    let submit_new_modality = $('#submit-new-modality');
    let description_input = $('#description-input');

    // get form information
    let modality = $('#modality-input').val();
    let type = $("input[name='type']:checked").val();
    let strategy = $("input[name='strategy']:checked").val();
    let description = null;

    // if description given, replace null
    if (description_input.val().length > 0) {
        description = description_input.val();
    }

    ipcRenderer.send('set-new-modality', modality, type, strategy, description);

    // disable button
    submit_new_modality.css({
        'background': '#ccc',
        'color': '#404040',
        'cursor': 'auto'
    }).prop('disabled', true);

    resetModalityForm();
});

/**
 * Alters the design of the 'set src dir' button + enables / disables it. Also
 * the displayed src-dir path gets updated.
 *
 * @param {object} event
 * @param {array} selected_src_dir - selected src directory path in an array (return type of select modal)
 */
ipcRenderer.on('selected-src-dir', function (event, selected_src_dir) {
    // scope selectors
    let src_dir_path_p = $('#src-dir-path');
    let set_src_dir = $('#set-src-dir');

    // only do something if there is a file selected
    if(selected_src_dir.length !== 0) {
        src_dir_path_p.html(selected_src_dir);
        set_src_dir.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false)
    } else {
        src_dir_path_p.html(currentSrcDirectory);
        set_src_dir.css({
            'color':'#404040',
            'cursor':'auto',
            'background':'#ccc'
        }).prop('disabled', true);
    }
});

/**
 * Alters design of the 'set database' button and the displayed path gets updated
 *
 * @param {object} event
 * @param {array} selected_database - selected database path in an array (return type of select modal)
 */
ipcRenderer.on('selected-database', function (event, selected_database) {
    let set_database = $('#set-database');
    let database_path_p = $('.database-path');

    if (selected_database.length !== 0) {
        database_path_p.html(selected_database);
        set_database.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false)
    } else {
        database_path_p.html(currentDatabase);
        set_database.css({
            'color': '#404040',
            'cursor': 'auto',
            'background': '#ccc'
        }).prop('disabled', true);
    }
});


/**
 * Resets the modality form after submit or when the form gets hidden
 */
function resetModalityForm() {
    $('#modality-input').val("");
    $('#description-input').val("");
    $('#triggered').prop('checked', true);
    $('#direct').prop('checked', true);
}

/**
 * Listener for changes in the add-modality form. When form is filled completed, the
 * submit button get enabled. When it is not complete, the submit button gets disabled
 */
variable_content.on('change', '#add-modality',  function checkIfFormComplete() {
    let submit_new_modality = $('#submit-new-modality');
    if ( $('#modality-input').val().length > 0) {
        submit_new_modality.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false)
    } else {
        submit_new_modality.css({
            'background': '#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
});


/**
 * Tells the main process to show the user a confirmation popup box whether
 * he/she is absolutely sure about seting up the database. Based on the feedback
 * of the user, the setup command get run or not.
 */
variable_content.on('click', '#setup-database', function () {
    let options  = {
        buttons: ["Yes", "No", "Cancel"],
        message: "Are you sure about setting up the following database?\n"+ currentDatabase
    };
    ipcRenderer.send('show-confirmation-box', options);
});


/**
 * Lets the user know that the database is being setup on message from main process
 */
ipcRenderer.on('setting-up-database', function () {
    showNotification('info', 'Setting up the database')
});


/**
 * Lets the user know that the database setup was successful on message from main process
 */
ipcRenderer.on('database-setup-successful', function () {
    showNotification('success', 'Successfully setup the database');
    // update the modalities
    ipcRenderer.send('get-current-settings');
    showNotification('info', 'Retrieving the modalities for this database');
});