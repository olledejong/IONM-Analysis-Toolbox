// selectors
let bdy = $('body');

//==================================================================
//                      GLOBAL ERROR HANDLER
//==================================================================
// Whenever the message 'error' is sent by the main process, a toast
// notification using a custom message will be displayed to the user.
//
// @param error_message
//==================================================================
ipcRenderer.on('error', (event, error_message, duration) => {
    showNotification('error', error_message, duration);
    $('.linePreloader').hide('fast');
});


//==================================================================
//                    SHOW TOAST NOTIFICATION
//==================================================================
// General function for generating and animating notification toast
// messages for all renderer processes
//
// @param type
// @param message
// @param duration
//==================================================================
// eslint-disable-next-line no-unused-vars
function showNotification(type, message, duration) {
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
        if (duration !== 'indefinitely') {
            tempNotificationElement.delay(duration).fadeOut(800, function () {
                $(this).remove();
                $(function () {
                    $('.success-msg').animate({
                        top: '-=40'
                    }, { duration: 350, queue: false } );
                    $('.info-msg').animate({
                        top: '-=40'
                    }, { duration: 350, queue: false } );
                    $('.warning-msg').animate({
                        top: '-=40'
                    }, { duration: 350, queue: false } );
                    $('.error-msg').animate({
                        top: '-=40'
                    }, { duration: 350, queue: false } );
                });
            });
        }
    });
}

//==================================================================
// Removes all currently displayed toast notifications
//==================================================================
// eslint-disable-next-line no-unused-vars
function removeToastMessages() {
    $('.success-msg').remove();
    $('.info-msg').remove() ;
    $('.error-msg').remove();
    $('.warning-msg').remove();
}

//==================================================================
// On click event handlers for all toast notifications
//==================================================================
bdy.delegate('.warning-msg', 'click', function () {
    let id = this.id;
    removeNotification(id);
});

bdy.delegate('.error-msg', 'click', function () {
    let id = this.id;
    removeNotification(id);
});

bdy.delegate('.info-msg', 'click', function () {
    let id = this.id;
    removeNotification(id);
});

bdy.delegate('.success-msg', 'click', function () {
    let id = this.id;
    removeNotification(id);
});

//==================================================================
// Removes the clicked notification
//==================================================================
function removeNotification(id) {
    let properId = '#' + id;
    $(properId).fadeOut(800, function () {
        this.remove();
    })
}
