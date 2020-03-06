// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let varContent = $("#variable-content");
let convert_results = $('#convert-results');

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
varContent.on("click", '#run-convert', function() {
    ipcRenderer.send('resize-window', 1700, 1000);
    ipcRenderer.send("run-convert");
});


/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-convert'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-convert', function () {
    varContent.html(
        `<!--<h2 id="convert-result-title">Convert results</h2>-->
         <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
         <div id="convert-results">
            <div id="add-modality-form-div">
                <button class="settings-button" id="submit-all-modalities" disabled>SUBMIT ALL</button>
            </div>
         </div>`);
    $('#convert-results').hide();
});

/**
 * This function gets called by the main renderer for every file that the user wants to convert.
 * It shows confirmation or informative error messages to the user so that he/she knows what
 * to do next.
 */
ipcRenderer.on('convert-result', function displayConvertResultContent(event, convert_output) {
    log.info('display function run');
    let missingModalities = [];
    let rndmHash = Math.random().toString(36).substring(7);
    let convert_results = $('#convert-results');

    // output parts
    let file_name = convert_output['file-name'];
    let success_msg = convert_output['succes-msg'];
    let short_error_msg = convert_output['short-error-msg'];
    let error_msg = convert_output['error-msg'];
    let unknown_modalities = convert_output['unknown-modalities'];
    log.info('unknown: ', unknown_modalities);

    // calculate the extra needed top offset
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // if iteration has a success message in it
    if (convert_output.hasOwnProperty('succes-msg')) {
        $('.container-after-titlebar').append('<div id="' + rndmHash + '" class="success-msg"><i class="fas fa-check"></i>&nbsp;&nbsp;' + success_msg + '</div>');
    // if iteration does not contain success message
    } else {
        let existingAddModalityForms = [];
        // get all modality name text values
        let modalityTextFields = $('.modality-input');
        for(let i = 0; i < modalityTextFields.length; i++){
            existingAddModalityForms.push($(modalityTextFields[i]).val())
        }
        log.info('EXISING ON PAGE: ', existingAddModalityForms);

        for (let i = 0; i < unknown_modalities.length; i++) {
            if (!missingModalities.includes(unknown_modalities[i].toString())) {
                log.info('doesnt include ', unknown_modalities[i].toString());
                missingModalities.push(unknown_modalities[i].toString())
            }
        }
        log.info('NOT IN DATABASE: ', missingModalities);

        $('.container-after-titlebar').append('<div id="'+ rndmHash + '" class="error-msg"><i class="fas fa-times-circle"></i>&nbsp;&nbsp;'+ short_error_msg +'</div>');
        convert_results.show();

        // log.info('missing', missingModalities);
        // log.info('unkown', unknown_modalities);

        for (let i = 0; i < missingModalities.length; i++) {
            if (!existingAddModalityForms.includes(unknown_modalities[i])) {
                $(`<div class="add-modality-after-convert" id="add-modality-after-convert` + i + `">
                    <input class="modality-input" id="modality-input" type="text" placeholder="MODALITY" value="` + unknown_modalities[i] + `" required>
                    <input id="description-input" type="text" placeholder="DESCRIPTION (Optional)">
                    <div class="add-modality-btn-container" id="add-modality-btn-container` + i + `">
                        <div class="radio-container" id="type-radios">
                            <label class="radio">
                              <input type="radio" id="triggered" name="type` + i + `" value="TRIGGERED" checked="checked">
                              <span>TRIGGERED</span>
                            </label>
                            <label class="radio">
                              <input type="radio" id="free-running" name="type` + i + `" value="FREE_RUNNING">
                              <span>FREE-RUNNING</span>
                            </label>
                        </div>
                        <div class="radio-container" id="strategy-radios">
                            <label class="radio">
                              <input type="radio" id="direct" name="strategy` + i + `" value="DIRECT" checked="checked">
                              <span>DIRECT</span>
                            </label>
                            <label class="radio">
                              <input type="radio" id="average" name="strategy` + i + `" value="AVERAGE">
                              <span>AVERAGE</span>
                            </label>
                        </div>
                    </div>
                </div>`).insertBefore('#submit-all-modalities').children(':last').hide().fadeIn(1200);
            }
        }
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

    $('.lds-ellipsis').fadeOut();
});

variable_content.on('change', '.add-modality-after-convert',  function checkIfFormComplete() {
    let submit_new_modality = $('#submit-all-modalities');
    log.info('CHANGE!');
    if ( $('.modality-input').val().length > 0) {
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