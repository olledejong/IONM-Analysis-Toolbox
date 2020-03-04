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
    ipcRenderer.send("run-convert");
});


/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-convert'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-convert', function () {
    varContent.html(
        `<h2 id="convert-result-title">Convert results</h2>
         <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
         <div id="convert-results"></div>`);
    // hide summarize results div untill it actually gets some results
    $('#convert-results').hide();
});

/**
 * This function gets called by the main renderer for every file that the user wants to convert.
 * It shows confirmation or informative error messages to the user so that he/she knows what
 * to do next.
 */
ipcRenderer.on('convert-result', function displayConvertResultContent(event, convert_output) {
    let rndmHash = Math.random().toString(36).substring(7);

    // calculate the extra needed top offset
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // if iteration has a success message in it
    if (convert_output.hasOwnProperty('succes-msg')) {
        $('.container-after-titlebar').append('<div id="' + rndmHash + '" class="success-msg"><i class="fas fa-check"></i>&nbsp;&nbsp;' + convert_output['succes-msg'] + '</div>');
    // if iteration does not contain success message
    } else {
        $('.container-after-titlebar').append('<div id="'+ rndmHash + '" class="error-msg"><i class="fas fa-times-circle"></i>&nbsp;&nbsp;'+ convert_output['short-error-msg'] +'</div>');
    }

    $('#convert-results').html(convert_output['error-msg']).show();
    $('#convert-results').append(convert_output['unknown-modalities']);

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