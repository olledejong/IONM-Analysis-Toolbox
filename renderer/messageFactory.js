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

    $('.container-after-titlebar').append(`<div id="${r}" class="error-msg"><i class="fas fa-times-circle"></i> ${error_message}</div>`);

    let tempElement = $('#'+r);
    tempElement.css('top', '+=' + extraTopOffset);

    tempElement.animate({
        right: '+=465', opacity: 1
    }, 800, function () {
        tempElement.delay(5000).fadeOut(800, function () {
            $(this).remove();
        });
    });
    $('.lds-ellipsis').hide();
});


/**
 * General function for generating and animating notification (toast) messages for all
 * renderer processes
 *
 * @param type
 * @param message
 */
// eslint-disable-next-line no-unused-vars
function showNotification(type, message) {
    let container_after_titlebar = $('.container-after-titlebar');
    let r = Math.random().toString(36).substring(7);

    // check for existing notification messages, add extra top offset if one or more already exist
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // add notification element to page according to type
    if (type === 'error') {
        container_after_titlebar.append(`<div id="${r}" class="error-msg"><i class="fas fa-times-circle"></i>&nbsp;&nbsp;${message}</div>`);
    } else if (type === 'info') {
        container_after_titlebar.append(`<div id="${r}" class="info-msg"><i class="fas fa-info-circle"></i>&nbsp;&nbsp;${message}</div>`);
    } else if (type === 'success') {
        container_after_titlebar.append(`<div id="${r}" class="success-msg"><i class="fas fa-check"></i>&nbsp;&nbsp;${message}</div>`);
    } else {
        container_after_titlebar.append(`<div id="${r}" class="warning-msg"><i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;${message}</div>`);
    }

    let tempNotificationElement = $('#'+r);
    tempNotificationElement.css('top', '+=' + extraTopOffset);

    // animate the error message
    tempNotificationElement.animate({
        right: '+=465', opacity: 1
    }, 800, function () {
        tempNotificationElement.delay(5000).fadeOut(800, function () {
            $(this).remove();
        });
    });
}

/**
 * Removes all displayed toast messages on navigation
 */
// eslint-disable-next-line no-unused-vars
function removeToastMessages() {
    $('.success-msg').remove();
    $('.info-msg').remove() ;
    $('.error-msg').remove();
    $('.warning-msg').remove();
}