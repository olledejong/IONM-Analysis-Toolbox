//=========================================================================
//                         Show Timing Renderer
//=========================================================================
// This file is responsible for all user interaction in the
// 'show timing' section of the application. It is responsible for telling
// the main process to execute the tool via a ChildProcess and handling
// the response of this ChildProcess (error / success)
//=========================================================================

// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let variableContent = $('#variable-content');

//=========================================================================
// Tells the main process to run the summarize command and empties the page
//=========================================================================
variableContent.on('click', '#run-timing', () => {
    variableContent.html('');
    ipcRenderer.send('run-timing');
});


//==============================================================
// Sets result page skeleton and preloader will be shown
//==============================================================
ipcRenderer.on('set-title-and-preloader-timing', () => {
    $('.linePreloader').show();
    ipcRenderer.send('resize-window', 980, 310);
    variableContent.html('<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>');
    // hide summarize results div untill it actually gets some results
    $('#timing-results').show();
});


//==============================================================
// Restores original page when user closes external windows and
// functionality is done. Also hides preloader.
//==============================================================
ipcRenderer.on('timing-result', () => {
    ipcRenderer.send('resize-window', 750, 512);
    variableContent.load('components/timing.html').hide().fadeIn('slow');
    $('.linePreloader').hide('fast');
});
