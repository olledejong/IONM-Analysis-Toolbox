/**
 * This renderer file is responsible for all user interaction in the
 * convert section of the application. It is responsible for telling
 * the main process to execute the tool via a ChildProcess and handling
 * the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let varContent = $('#variable-content');

// globals
let failedConvertFilePaths = [];

/**
 * Tells the main process to run the summarize tool / command.
 * Sends message to resize window.
 */
varContent.on('click', '#run-convert', function() {
    ipcRenderer.send('resize-window', 1000, 850);
    ipcRenderer.send('run-convert');
});


/**
 * Loads result page skeleton and the preloader will be showed.
 * Hides all containers until needed later.
 */
ipcRenderer.on('set-title-and-preloader-convert', function () {
    $('.linePreloader').show();
    varContent.html(
        `<div id="convert-results">
            <div id="success-and-run-compute">
                <div id="succeeded-converts">
                    <h1>Succeeded converts<i class="fas fa-check"></i></h1>
                    <p id="succeeded-converts-p">
                        In the future, below might appear a form per succeeded convert for the purpose of immediately computing
                        the convert files their statistics.<br>
                        This is currently in development..
                    </p>
                </div>
            </div>
            <div id="add-modality-form-div">
                <div id="failed-converts">
                    <h1>Failed converts<i class="fas fa-times-circle"></i></h1>
                    <p id="failed-converts-p">
                        Below you see a form for every unique modality encountered that is not present in the modalities table. 
                        Make alterations where needed and hit the 'submit all' button to insert the modalities into the database.
                    </p>
                </div>
                <div id="failed-converts-actions">
                    <button class="settings-button" id="submit-all-modalities">SUBMIT ALL</button>
                    <button class="settings-button" id="rerun-failed-converts" disabled>RE-RUN FAILED CONVERTS</button>
                </div>
            </div>
         </div>`);
    $('#convert-results').hide();
    $('#succeeded-converts').hide();
    $('#failed-converts').hide();
    $('#add-modality-form-div').hide();
    $('#success-and-run-compute').hide();
});

/**
 * Show container for the purpose of adding encountered unknown modalities.
 * Shows preloader.
 */
ipcRenderer.on('set-preloader-rerun-convert', function () {
    $('.linePreloader').show();
    $('#add-modality-form-div').animate({
        opacity: 0
    }, 800, function () {
        $(this).remove();
    });
});


/**
 * Shows confirmation (and resulting logic) or informative error messages about the convert
 * task the user just ran.
 *
 * @param {string} convert_output - the output of the convert run in JSON string format
 * @param {string} filepath_of_run - the filepath of the specific convert run
 * @param {object} event - for purpose of communication with sender
 */
ipcRenderer.on('convert-result', function displayConvertResultContent(event, convert_output, filepath_of_run) {
    let convert_results_container = $('#convert-results');
    let succeeded_converts_containter = $('#succeeded-converts');
    let success_and_compute_container = $('#success-and-run-compute');
    let failed_converts_container = $('#failed-converts');
    let add_modality_forms_container = $('#add-modality-form-div');
    let preloader = $('.linePreloader');

    // output parts
    let file_name = convert_output['file-name'];
    let success_msg = convert_output['success-msg'];
    let short_error_msg = convert_output['short-error-msg'];
    let unknown_modalities = convert_output['unknown-modalities'];

    // if iteration has a success message in it (if convert of file succeeded)
    // eslint-disable-next-line no-prototype-builtins
    if (convert_output.hasOwnProperty('success-msg')) {
        $(`<tr><td class="filename-td">${file_name}</td><td class="msg-td">${success_msg}</td><td class="file-path-td">${filepath_of_run}</td></tr><br>`).insertBefore('#succeeded-converts-p');
        succeeded_converts_containter.show();
        success_and_compute_container.show();

        showNotification('success', success_msg, 5000);
        convert_results_container.show();

    // if iteration does not contain success message (if convert of file failed)
    } else {
        failedConvertFilePaths.push(filepath_of_run);
        $(`<tr><td class="filename-td">${file_name}</td><td class="msg-td">Modalities missing in database:<br>${unknown_modalities}</td><td class="file-path-td">${filepath_of_run}</td></tr><br>`).insertBefore('#failed-converts-p');
        add_modality_forms_container.show();
        failed_converts_container.show();

        showNotification('error', short_error_msg, 5000);
        convert_results_container.show();

        let existingFormsOnPage = getExistingModalities();
        // generate and insert the modality forms
        generateModalityFormFields( existingFormsOnPage, unknown_modalities );
    }
    preloader.hide();
});


/**
 * Gets all the modality forms that are already on the page
 *
 * @returns {array} existingFormsOnPage - all modalities that are already on the page
 */
function getExistingModalities() {
    let modalityInputFields = $('.modality-input');
    let existingFormsOnPage = [];
    // get all modality name text values
    for (let i = 0; i < modalityInputFields.length; i++) {
        existingFormsOnPage.push($(modalityInputFields[i]).val());
    }
    return existingFormsOnPage;
}


/**
 * Generates and inserts a modality form field for every modality encountered
 * that is not already displayed to the user. This has to be done because the
 * function gets run for every file the user selects.
 *
 * @param existingFormsOnPage
 * @param unknown_modalities
 */
function generateModalityFormFields(existingFormsOnPage, unknown_modalities) {
    for (let i = 0; i < unknown_modalities.length; i++) {
        let rndmHash = Math.random().toString(36).substring(7);
        if (!existingFormsOnPage.includes(unknown_modalities[i])) {
            $(`<div class="add-modality-after-convert">
                    <input class="modality-input" id="modality-input" type="text" placeholder="MODALITY" value="` + unknown_modalities[i] + `" required>
                    <div class="add-modality-btn-container">
                        <div class="radio-container" id="type-radios">
                            <label class="radio">
                              <input type="radio" id="triggered" name="type-` + rndmHash + `" value="TRIGGERED" checked="checked">
                              <span>TRIGGERED</span>
                            </label>
                            <label class="radio">
                              <input type="radio" id="free-running" name="type-` + rndmHash + `" value="FREE_RUNNING">
                              <span>FREE-RUNNING</span>
                            </label>
                        </div>
                        <div class="radio-container" id="strategy-radios">
                            <label class="radio">
                              <input type="radio" id="direct" name="strategy-` + rndmHash + `" value="DIRECT" checked="checked">
                              <span>DIRECT</span>
                            </label>
                            <label class="radio">
                              <input type="radio" id="average" name="strategy-` + rndmHash + `" value="AVERAGE">
                              <span>AVERAGE</span>
                            </label>
                        </div>
                    </div>
                </div>`).insertBefore('#failed-converts-actions');
        }
    }
}


/**
 * Retrieves the values selected by the user for each modality (form) and tells
 * the main process to store them one-by-one. Also disables/enables button and
 * hides the preloader.
 */
varContent.on('click', '#submit-all-modalities', function runAddModalityPerForm() {
    showNotification('warn', 'Do not re-run until the modalities have been stored successfully!', 'indefinitely');
    // loop trough all 'add modality' forms
    $('.add-modality-after-convert').each(function () {
        let modality_name = $(this).find('.modality-input').val();
        let modality_type;
        let modality_strategy;

        // if triggered radio button is checked
        if($(this).find('#triggered').prop('checked')) {
            modality_type = $(this).find('#triggered').val();
        // if free-running radio button is checked
        } else {
            modality_type = $(this).find('#free-running').val();
        }

        // if direct radio button is checked
        if($(this).find('#direct').prop('checked')) {
            modality_strategy = $(this).find('#direct').val();
        // if average radio button is checked
        } else {
            modality_strategy = $(this).find('#average').val();
        }

        // store the modality using the values of their unique form
        ipcRenderer.send('set-new-modality', modality_name, modality_type, modality_strategy);

        // animate forms out
        $('.add-modality-after-convert').animate({
            opacity: 0
        }, 800, function () {
            $(this).remove();
            $('#submit-all-modalities').css({
                'background': '#ccc',
                'color': '#404040',
                'cursor': 'auto'
            }).prop('disabled', true);
            $('#rerun-failed-converts').css({
                'background': '#e87e04',
                'color': 'white',
                'cursor': 'pointer'
            }).prop('disabled', false);
        });
    });
    $('.linePreloader').show();
});


/**
 * Lets the user know that the modality was set successfully by showing a
 * toast notification for every modality.
 */
ipcRenderer.on('set-modality-successful', function (event, name) {
    $('.linePreloader').hide('fast');
    showNotification('success', ('Successfully stored the modality '+ name), 5000);
    // refresh modalities (in case of added via settings)
    ipcRenderer.send('get-current-settings');
});


/**
 * Tells the main process to re-run the convert command for the failed converts.
 * Because the at first unknown modalities now have been stored (nothing can go wrong
 * while doing that, so no error handling) we can let the user repeat the convert command
 * for those files that previously failed.
 */
varContent.on('click', '#rerun-failed-converts', function () {
    ipcRenderer.send('rerun-convert', failedConvertFilePaths);
    // empty the list for possible future encounters
    failedConvertFilePaths = [];
});
