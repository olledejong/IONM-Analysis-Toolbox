//=======================================================================
//                      Settings Page Renderer
//=======================================================================
// This file is responsible for all user interaction in the
// settings section of the application. Also for telling the main process
// what to do regarding the settings of this applications and the python
// project. These functionalities are:
// - Setting the python src directory
// - Setting the database the user wants to work with
// - Setting up a new database
// - Insight into the current configured modalities of the active database
// - Add a new modality to the active database
//=======================================================================

// requires
window.$ = window.jQuery = require('jquery');

// globals
let currentDatabase;
let currentSrcDirectory;
let currentDefaultSelectPath;

//===========================================================================
// Displays the currently configured src directory path to the user
//
// @param {object} event
// @param {string} current_src_dir - currently configured src directory path
//===========================================================================
ipcRenderer.on('current-python-src-dir', (event, current_src_dir) => {
    if (current_src_dir === 'No python src directory configured') {
        showNotification('info', 'Please configure the python src directory to get started');
        $('.linePreloader').hide();
    }
    currentSrcDirectory = current_src_dir;
    // shows after 100ms because it doesnt display otherwise
    setTimeout(() => {
        $('#src-dir-path').html(currentSrcDirectory);
    }, 200);
});


//==============================================================================
// Displays the currently configured default select directory's path to the user
//
// @param {object} event
// @param {string} current_default_select_path - currently configured src 
//                 directory path
//==============================================================================
ipcRenderer.on('current-default-select-dir', (event, current_default_select_path) => {
    if (current_default_select_path) {
        currentDefaultSelectPath = current_default_select_path;
    } else {
        currentDefaultSelectPath = 'Not configured yet';
    }
    // shows after 100ms because it doesnt display otherwise
    setTimeout(() => {
        $('#default-select-dir-path').html(currentDefaultSelectPath);
    }, 200);
});


//==============================================================================
// Displays the currently configured database settings (path) to the user
//
// @param {object} event
// @param {string} database_path - currently configured database settings (path)
//==============================================================================
ipcRenderer.on('current-database-settings', (event, database_path) => {
    let database_path_holders = $('.database-path');
    if (database_path.trim().length === 0) {
        database_path_holders.html('No path configured');
    } else if (database_path === 'error') {
        // error only occurs when the python src directory is not correct
        database_path_holders.html('Python src directory is incorrect');
    } else {
        database_path_holders.html(database_path.replace(/"/g, ''));
        currentDatabase = database_path.replace(/"/g, '');
    }
});


//=========================================================================
// Displays the currently configured trace selection settings to the user
//
// @param {object} event
// @param {string} trace_selection_settings - currently configured trace
//                 selection settings
//=========================================================================
ipcRenderer.on('current-trace-settings', (event, trace_selection_settings) => {
    let chunk_size = parseInt(trace_selection_settings);
    let chunk_size_field = $('#chunk-size');
    chunk_size_field.val(chunk_size);
});


//=========================================================================
// Show the configured modalities (modalities present in database) to the
// user in a neat table format
//
// @param {object} event
// @param {string} current_modality_settings - JSON string containing the
//                 current  configured modalities
//=========================================================================
ipcRenderer.on('current-modality-settings', (event, current_modality_settings) => {
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
               </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200);
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

                // for every modality, add its configuration (type, strategy and description) to its table
                for (let j = 0; j < Object.keys(Object.values(parsed)[i]).length; j++) {
                    let rowElement = $('#row-' + rndmHash);
                    rowElement.append('<td>' + Object.values(Object.values(parsed)[i])[j] + '</td>');
                }
            }
        }
    // if result does not contain curly brackets aka modalities, the database isn't set up yet, display empty table
    } else {
        let tableContent;
        log.info(current_modality_settings);
        if (current_modality_settings.includes('database')) {
            showNotification('warn', 'The database has not been setup yet!');
            tableContent = 'The database has not been setup yet';
        } else {
            tableContent = 'An error occurred while retrieving the modalities';
        }
        modalities_table.remove();
        $(`<table id="modalities-table">
            <tr id="modalities-table-hrow">
                <th>${tableContent}</th>
            </tr>
         </table>`).insertBefore('#add-new-modality').children(':last').hide().fadeIn(1200);
    }
    $('.linePreloader').hide('fast');
});


//=============================================================================
// Lets the user know that the python src dir has been successfully configured.
// Also retrieves the currently configured settings.
//=============================================================================
ipcRenderer.on('successfully-set-src-dir', () => {
    showNotification('success', 'Successfully set the python src directory');
    $('.linePreloader').show();
    ipcRenderer.send('get-current-settings');
});


//=============================================================================
// Lets the user know that the default select directory path has been
// successfully configured.
//=============================================================================
ipcRenderer.on('successfully-set-default-select-dir', () => {
    showNotification('success', 'Successfully set the default select directory path');
});


//==========================================================================
// Lets the user know that the modality was set successfully by showing a
// toast notification for every modality.
//==========================================================================
ipcRenderer.on('set-modality-successful', (event, name) => {
    $('.linePreloader').hide('fast');
    showNotification('success', ('Successfully stored the modality '+ name));
    // refresh modalities (in case of added via settings)
    ipcRenderer.send('get-current-settings');
    $('.linePreloader').show();
});


//=============================================================================
// Tells the main process to write the by the user selected database path to the
// config.ini file in the python project. Also disables the 'set database' button.
//=============================================================================
variable_content.on('click', '#set-database', () => {
    $('.linePreloader').show();
    let database_path = $('#new-database-path').html();
    let set_database = $('#set-database');
    set_database.css({
        'background': '#ccc',
        'color': '#404040',
        'cursor': 'auto'
    }).prop('disabled', true);

    // tell main.js to set the database path in config.ini (path is already in main)
    ipcRenderer.send('set-database', database_path);
});


//=============================================================================
// Tells the main process to set the by the user selected python src dir.
// Also disables the 'set src directory' button.
//=============================================================================
variable_content.on('click', '#set-src-dir', () => {
    let src_dir = $('#src-dir-path').html();
    let set_src_dir = $('#set-src-dir');
    set_src_dir.css({
        'background':'#ccc',
        'color':'#404040',
        'cursor':'auto'
    }).prop('disabled', true);

    // tell main.js to set the python src dir
    ipcRenderer.send('set-python-src-dir', src_dir);
});


//=============================================================================
// Tells the main process to set the by the user selected default select dir path.
// Also disables the 'SET DEFAULT SELECT PATH' button.
//=============================================================================
variable_content.on('click', '#set-default-select-dir', () => {
    let default_select_dir = $('#default-select-dir-path').html();
    ipcRenderer.send('set-default-select-dir', default_select_dir);

    let set_default_select_dir = $('#set-default-select-dir');
    set_default_select_dir.css({
        'background':'#ccc',
        'color':'#404040',
        'cursor':'auto'
    }).prop('disabled', true);
});


//=============================================================================
// Retrieves / updates the currently configured settings because of the
// successful configuration of a new database path
//=============================================================================
ipcRenderer.on('database-set-successful', () => {
    ipcRenderer.send('get-current-settings');
    showNotification('success', 'Successfully set the database path, updating the modalities..');
});


//=============================================================================
// Shows the modality form using an animation on the user's request
//=============================================================================
variable_content.on('click', '#add-new-modality', () => {
    ipcRenderer.send('resize-window', 1200, 800);

    // animate the modality form
    $('#add-modality').animate({
        margin: '15px 0 0 0', opacity: 1, zIndex: 20
    }, 800);

    $('#hide-modality-form').show();
});


//============================================
// Hides the modality form using an animation
//============================================
variable_content.on('click', '#hide-modality-form', () => {
    let add_modality = $('#add-modality');
    // hide add-modality form
    $('#hide-modality-form').hide();
    add_modality.css('z-index', -5);
    add_modality.animate({
        margin: '-270px 0 0 0', opacity: 0
    }, 800);
    resetModalityForm();
});


//=============================================================================
// Retrieves the filled out form values and tells the main process to execute
// the 'set modality' command. Then disables the 'submit new modality' button.
//=============================================================================
variable_content.on('click', '#submit-new-modality', () => {
    // show preloader
    $('.linePreloader').show();
    // scope vars
    let submit_new_modality = $('#submit-new-modality');
    let description_input = $('#description-input');

    // get form information
    let modality = $('#modality-input').val();
    let type = $('input[name=\'type\']:checked').val();
    let strategy = $('input[name=\'strategy\']:checked').val();
    let description = null;

    // if description given, replace null
    if (description_input.val().length > 0) {
        description = description_input.val();
    }

    // disable button
    submit_new_modality.css({
        'background': '#ccc',
        'color': '#404040',
        'cursor': 'auto'
    }).prop('disabled', true);
    resetModalityForm();

    // tell main.js to set the new modality
    ipcRenderer.send('set-new-modality', modality, type, strategy, description);
});


//=============================================================================
// Alters the design of the 'set src dir' button + enables / disables it. Also
// the displayed src-dir path gets updated.
//
// @param {object} event
// @param {array} selected_src_dir - selected src directory path
//=============================================================================
ipcRenderer.on('selected-src-dir', (event, selected_src_dir) => {
    // scope selectors
    let src_dir_path_p = $('#src-dir-path');
    let set_src_dir = $('#set-src-dir');

    // if there is no path selected
    if(selected_src_dir.length !== 0) {
        src_dir_path_p.html(selected_src_dir);
        set_src_dir.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    // if path selected
    } else {
        src_dir_path_p.html(currentSrcDirectory);
        set_src_dir.css({
            'color':'#404040',
            'cursor':'auto',
            'background':'#ccc'
        }).prop('disabled', true);
    }
});


//===============================================================================
// Alters design of the 'set database' button and the displayed path gets updated
//
// @param {object} event
// @param {array} selected_database - selected database path in an array
//===============================================================================
ipcRenderer.on('selected-database', (event, selected_database) => {
    let set_database = $('#set-database');
    let database_path_p = $('.database-path');

    // if there is no path selected
    if (selected_database.length !== 0) {
        database_path_p.html(selected_database);
        set_database.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    // if path selected
    } else {
        database_path_p.html(currentDatabase);
        set_database.css({
            'color': '#404040',
            'cursor': 'auto',
            'background': '#ccc'
        }).prop('disabled', true);
    }
});


//=============================================================================
// Alters design of the 'SET DEFAULT SELECT PATH' button and the displayed path
// gets updated.
//
// @param {object} event
// @param {array} selected_default_path - selected default select path in an
//                array (return type of select modal)
//=============================================================================
ipcRenderer.on('selected-default-select-dir', (event, selected_default_path) => {
    let set_default_select_dir = $('#set-default-select-dir');
    let default_select_dir_path = $('#default-select-dir-path');

    // if there is no path selected
    if (selected_default_path.length !== 0) {
        default_select_dir_path.html(selected_default_path);
        set_default_select_dir.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    // if path selected
    } else {
        default_select_dir_path.html(currentDefaultSelectPath);
        set_default_select_dir.css({
            'color': '#404040',
            'cursor': 'auto',
            'background': '#ccc'
        }).prop('disabled', true);
    }
});


//====================================================================
// Resets the modality form after submit or when the form gets hidden
//====================================================================
function resetModalityForm() {
    $('#modality-input').val('');
    $('#description-input').val('');
    $('#triggered').prop('checked', true);
    $('#direct').prop('checked', true);
}


//====================================================================
// Listener for changes in the add-modality form. When form is filled
// completed, the submit button get enabled. When it is not complete,
// the submit button gets disabled
//====================================================================
variable_content.on('change', '#add-modality', () => {
    let submit_new_modality = $('#submit-new-modality');
    if ( $('#modality-input').val().length > 0) {
        submit_new_modality.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        submit_new_modality.css({
            'background': '#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
});


//=========================================================================
// Tells the main process to show the user a confirmation popup box whether
// he/she is absolutely sure about seting up the database. Based on the
// feedback of the user, the setup command get run or not.
//=========================================================================
variable_content.on('click', '#setup-database', () => {
    let options  = {
        buttons: ['Yes', 'No', 'Cancel'],
        message: 'Are you sure about setting up the following database?\n'+ currentDatabase
    };
    ipcRenderer.send('show-confirmation-box', options);
});


//========================================================
// Lets the user know that the database is being setup
//========================================================
ipcRenderer.on('setting-up-database', () => {
    $('.linePreloader').show();
});


//===========================================================
// Lets the user know that the database setup was successful
//===========================================================
ipcRenderer.on('database-setup-successful', () => {
    // update the modalities
    ipcRenderer.send('get-current-settings');
    showNotification('success', 'Successfully setup the database, updating the modalities..');
});


//===========================================================
// Tells the main process to set the chunk size setting.
// Also disables the 'SUBMIT SETTINGS' button.
//===========================================================
variable_content.on('click', '#set-trace-selection-settings', () => {
    // show preloader
    $('.linePreloader').show();
    // scope vars
    let chunk_size = $('#chunk-size').val();
    let submit_trace_settings = $('#set-trace-selection-settings');

    // tell main to write the chunk size to the config.ini file
    ipcRenderer.send('set-chunk-size', chunk_size);
    submit_trace_settings.css({
        'background':'#ccc',
        'color':'#404040',
        'cursor':'auto'
    }).prop('disabled', true);
});


//====================================================================
// Listener for changes in the add-modality form. When form is filled
// completed, the submit button get enabled. When it is not complete,
// the submit button gets disabled
//====================================================================
variable_content.on('change', '#trace-selection-settings', () => {
    let submit_trace_settings = $('#set-trace-selection-settings');
    let chunk_size_field = $('#chunk-size');
    if (chunk_size_field.val().length > 0 &&
        chunk_size_field.val() >= 50 &&
        chunk_size_field.val() <= 800) {
        submit_trace_settings.css({
            'background': '#e87e04',
            'color': 'white',
            'cursor': 'pointer'
        }).prop('disabled', false);
    } else {
        submit_trace_settings.css({
            'background': '#ccc',
            'color': '#404040',
            'cursor': 'auto'
        }).prop('disabled', true);
    }
});


//====================================================================
// Lets the user know the chunk size setting was successfully set
//====================================================================
ipcRenderer.on('chunk-size-set-successful', () => {
    $('.linePreloader').hide('fast');
    showNotification('success', 'Successfully updated the trace selection settings');
});

