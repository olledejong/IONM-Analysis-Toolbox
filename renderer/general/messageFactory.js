//==================================================================
//                       Message Factory
//==================================================================
// This file handles all aspects of handling errors and presenting
// informative messages to the user.
//==================================================================

// selectors / requires
let bdy = $('body');
window.$ = window.jQuery = require('jquery');

//==================================================================
//                 IPC-MAIN ERROR MESSAGE HANDLER
//==================================================================
// Whenever the message 'error' is sent by the main process, a toast
// notification using a custom message will be displayed to the user.
//
// @param error_message
//==================================================================
ipcRenderer.on('error', (event, error_message, tool) => {
    showNotification('error', error_message);
    switch (tool) {
    case 'summarize':
        variable_content.load('components/summarize.html');
        ipcRenderer.send('resize-window', 750, 460);
        break;
    case 'timing':
        variable_content.load('components/timing.html');
        ipcRenderer.send('resize-window', 800, 450);
        break;
    case 'availability':
        variable_content.load('components/availability.html');
        ipcRenderer.send('resize-window', 800, 510);
        break;
    case 'convert':
        variable_content.load('components/convert.html');
        ipcRenderer.send('resize-window', 800, 690);
        break;
    case 'compute':
        variable_content.load('components/compute.html');
        ipcRenderer.send('resize-window', 800, 445);
        generateStatsParameterOptions();
        break;
    case 'validate':
        variable_content.load('components/validate.html');
        ipcRenderer.send('resize-window', 800, 460);
        break;
    case 'extract':
        variable_content.load('components/extract.html');
        ipcRenderer.send('resize-window', 800, 530);
        break;
    case 'combine':
        variable_content.load('components/combine.html');
        ipcRenderer.send('resize-window', 750, 460);
        break;
    case 'classify':
        variable_content.load('components/classify.html');
        ipcRenderer.send('resize-window', 800, 460);
        break;
    }
    // hide preloader
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
function showNotification(type, message) {
    let container_after_titlebar = $('.container-after-titlebar');
    let r = Math.random().toString(36).substring(7);

    // check for existing notification messages, add extra top offset if one or more already exist
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // add notification element to page according to type
    if (type === 'error') {
        container_after_titlebar.append(`<div id="${r}" class="error-msg"><i class="fas fa-times-circle"></i><span id="toast-message">&nbsp;&nbsp;${message}</span><span id="close-toast">Click to close</span></div>`);
    } else if (type === 'info') {
        container_after_titlebar.append(`<div id="${r}" class="info-msg"><i class="fas fa-info-circle"></i><span id="toast-message">&nbsp;&nbsp;${message}</span><span id="close-toast">Click to close</span></div>`);
    } else if (type === 'success') {
        container_after_titlebar.append(`<div id="${r}" class="success-msg"><i class="fas fa-check"></i><span id="toast-message">&nbsp;&nbsp;${message}</span><span id="close-toast">Click to close</span></div>`);
    } else {
        container_after_titlebar.append(`<div id="${r}" class="warning-msg"><i class="fas fa-exclamation-triangle"></i><span id="toast-message">&nbsp;&nbsp;${message}</span><span id="close-toast">Click to close</span></div>`);
    }

    let tempNotificationElement = $('#'+r);
    tempNotificationElement.css('top', '+=' + extraTopOffset);

    // animate the error message
    tempNotificationElement.animate({
        right: '+=465', opacity: 1
    }, 800);
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
bdy.on('click', '.warning-msg', (e) => {
    removeNotification(e, this);
});

bdy.on('click', '.error-msg', (e) => {
    removeNotification(e);
});

bdy.on('click', '.info-msg', (e) => {
    removeNotification(e);
});

bdy.on('click', '.success-msg', (e) => {
    removeNotification(e);
});

//==================================================================
// Removes the clicked notification
//==================================================================
function removeNotification(e) {
    let parent = $(e.target).parent();
    let parentId = '#' + parent.attr('id');
    // if user clicks the notification div itself
    if ( parent.attr('class') !== 'container-after-titlebar' ) {
        $(parentId).remove();
    // if user clicks any other element inside the notification div
    } else {
        $(parentId).remove();
    }
}

//==================================================================
// Shows the user it can close a notification by clicking on it
//==================================================================
bdy.on('mouseenter', '.error-msg, .warning-msg, .info-msg, .success-msg', (e) => {
    let noti = $('#' + e.target.id);
    // get the width of the notification element and set it as min-width so that the
    // notification element doesnt become the size of its content
    noti.css('min-width', ((noti.width() + 20) + 'px'));
    noti.children( '#toast-message' ).css('opacity', '0.1');
    noti.children( '#close-toast' ).css('opacity', '1.0');
}).on('mouseleave', '.error-msg, .warning-msg, .info-msg, .success-msg', (e) => {
    let noti = $('#' + e.target.id);
    noti.children( '#toast-message' ).css('opacity', '1.0');
    noti.children( '#close-toast' ).css('opacity', '0');
});