/**
 *                          [ GLOBAL ERROR HANDLER ]
 * Whenever the message 'error' is sent by the main process, a (toast) notification
 * using a custom message will be displayed to the user.
 *
 * @param error_message
 */
ipcRenderer.on('error', function errorHandler(event, error_message) {
    let r = Math.random().toString(36).substring(7);

    // check for existing notification messages, add extra top offset if one or more already exist
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    $('.container-after-titlebar').append('<div id="'+ r + '" class="error-msg"><i class="fas fa-times-circle"></i> '+ error_message +'</div>');

    let tempElement = $('#'+r);
    tempElement.css('top', '+=' + extraTopOffset);

    tempElement.animate({
        right: '+=465', opacity: 1
    }, 800, function () {
        tempElement.delay(5000).fadeOut(800, function () {
            $(this).remove();
        });
    });

});