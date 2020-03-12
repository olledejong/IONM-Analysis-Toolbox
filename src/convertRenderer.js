// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let varContent = $("#variable-content");
let convert_results = $('#convert-results');

// globals
let failedConvertFilePaths = [];

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
varContent.on("click", '#run-convert', function() {
    ipcRenderer.send('resize-window', 1000, 850);
    ipcRenderer.send("run-convert");
});


/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-convert'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-convert', function () {
    $('.lds-ellipsis').show();
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


ipcRenderer.on('set-preloader-rerun-convert', function () {
    $('.lds-ellipsis').show();
    $('#add-modality-form-div').animate({
        opacity: 0
    }, 800, function () {
        $(this).remove();
    })
});


/**
 * This function gets called by the main renderer for every file that the user wants to convert.
 * It shows confirmation or informative error messages to the user so that he/she knows what
 * to do next.
 */
ipcRenderer.on('convert-result', function displayConvertResultContent(event, convert_output, filePathOfRun) {
    let missingModalities = [];
    let rndmHash = Math.random().toString(36).substring(7);
    let convert_results = $('#convert-results');

    // output parts
    let file_name = convert_output['file-name'];
    let success_msg = convert_output['success-msg'];
    let short_error_msg = convert_output['short-error-msg'];
    let error_msg = convert_output['error-msg'];
    let unknown_modalities = convert_output['unknown-modalities'];

    // calculate the extra needed top offset
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // if iteration has a success message in it
    if (convert_output.hasOwnProperty('success-msg')) {
        $(`<tr><td class="failed-name-td">` + file_name +`</td><td class="err-msg-td">`+ success_msg +`</td><td class="file-path-td">`+ filePathOfRun +`</td></tr><br>`).insertBefore('#succeeded-converts-p');
        $('#succeeded-converts').show();
        $('#success-and-run-compute').show();

        showNotification('success', success_msg);
        convert_results.show();
    // if iteration does not contain success message
    } else {
        failedConvertFilePaths.push(filePathOfRun);
        $(`<tr><td class="failed-name-td">` + file_name +`</td><td class="err-msg-td">`+ error_msg +`</td><td class="file-path-td">`+ filePathOfRun +`</td></tr><br>`).insertBefore('#failed-converts-p');
        $('#add-modality-form-div').show();
        $('#failed-converts').show();
        let existingAddModalityForms = [];
        // get all modality name text values
        let modalityTextFields = $('.modality-input');
        for(let i = 0; i < modalityTextFields.length; i++){
            existingAddModalityForms.push($(modalityTextFields[i]).val())
        }
        log.info('EXISING ON PAGE: ', existingAddModalityForms);

        for (let i = 0; i < unknown_modalities.length; i++) {
            if (!missingModalities.includes(unknown_modalities[i].toString())) {
                missingModalities.push(unknown_modalities[i].toString())
            }
        }
        log.info('ALL MISSING: ', missingModalities);
        showNotification('error', short_error_msg);
        convert_results.show();

        // generate and insert the modality forms
        generateModalityFormFields(missingModalities, existingAddModalityForms, unknown_modalities);
    }

    let tempNotiElement = $('#'+rndmHash);
    tempNotiElement.css('top', '+=' + extraTopOffset);

    // animate the message
    tempNotiElement.animate({
        right: '+=465', opacity: 1
    }, 800, function () {
        tempNotiElement.delay(6000).fadeOut(800, function () {
            $(this).remove();
        });
    });

    $('.lds-ellipsis').hide('fast');
});


/**
 * Generates and inserts a modality form field for every modality encountered
 * that is not already displayed to the user. This has to be done because the
 * function gets run for every file the user selects
 * @param missingModalities
 * @param existingAddModalityForms
 * @param unknown_modalities
 */
function generateModalityFormFields(missingModalities, existingAddModalityForms, unknown_modalities) {
    for (let i = 0; i < missingModalities.length; i++) {
        let rndmHash = Math.random().toString(36).substring(7);
        if (!existingAddModalityForms.includes(unknown_modalities[i])) {
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

varContent.on("click", '#submit-all-modalities', function runAddModalityPerForm() {
    $('.add-modality-after-convert').each(function (i, form) {
        let modality_name = $(this).find('.modality-input').val();
        let modality_type;
        let modality_strategy;
        // let modality_type = $(this).find('.modality-input').val();
        // let modality_strategy = $(this).find('.modality-input').val()
        if($(this).find('#triggered').prop('checked')) {
            modality_type = $(this).find('#triggered').val()
        } else {
            modality_type = $(this).find('#free-running').val()
        }

        if($(this).find('#direct').prop('checked')) {
            modality_strategy = $(this).find('#direct').val()
        } else {
            modality_strategy = $(this).find('#average').val()
        }

        // store all modalities using the values of their unique form
        ipcRenderer.send('set-new-modality', modality_name, modality_type, modality_strategy);

        // animate forms out
        $('.add-modality-after-convert').animate({
            opacity: 0
        }, 800, function () {
            $(this).remove();
            $('#submit-all-modalities').css('background', '#ccc').css('color', '#404040').css('cursor', 'auto').prop('disabled', true);
            $('#rerun-failed-converts').css('background', '#ff8c00cf').css('color', 'white').css('cursor', 'pointer').prop('disabled', false)
        });
    })
});


/**
 * When the main process successfully set the modalities (nothing can go wrong
 * while doing that, so no error handling) let the user know by showing a toast
 * notification for every modality
 */
ipcRenderer.on('set-modality-successful', function (event, name) {
    showNotification('success', ('Successfully stored the modality '+ name));

    // refresh modalities (in case of via settings)
    ipcRenderer.send('get-modality-settings');
});


/**
 * Because the at first unknown modalities now have been stored (nothing can go wrong
 * while doing that, so no error handling) we can let the user repeat the convert command
 * for those files that previously failed. This is initiated by a click on the rerun button.
 */
varContent.on('click', '#rerun-failed-converts', function () {
    ipcRenderer.send("rerun-convert", failedConvertFilePaths);
    // empty the list for possible future encounters
    failedConvertFilePaths = [];
});
