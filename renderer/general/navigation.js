/**
 * This file is accountable for the navigating functionalities.
 * Following a click event the accompanying variable content
 * will be displayed to the user.
 */

// requires
window.$ = window.jQuery = require('jquery');
const path = require('path');

// os username
const username = require('os').userInfo().username;

// log options configuration for all renderer processes
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';

// globals
__name__ = 'IONM Analysis Toolbox';
__description__ = 'Graphical User Interface for the purpose of using IONM Analysis tools. Created for the UMCG.';
__author__ = 'Olle de Jong';
__maintainer__ = 'Olle de Jong';
__contact__ = '[\'ol.de.jong@st.hanze.nl\', \'olledejong@gmail.com\', \'+31630583903\']';
__credits__ = '[\'Gea Drost\', \'Fiete Lange\', \'Sebastiaan Dulfer\']';
__version__ = require('electron').remote.app.getVersion();
__status__ = 'DEVELOPMENT';

// jQuery Selectors
let about_section_button = $('#about-section');
let help_section_button = $('#help-section');
let variable_content = $('#variable-content');
let body = $('body');

// set welcome message using the username from the OS
$('#welcome-text').html(`Welcome ${username}, please select a tool to get started`);

//==================================================================
// Home page
//==================================================================
$('#welcome-section').click(function () {
    if (variable_content.find('#tool-container').length !== 1) {
        $('.linePreloader').hide('fast');
        removeToastMessages();
        ipcRenderer.send('resize-window', 1142, 798);
        variable_content.load('components/index.html');
    }
});


//==================================================================
// Summarize section
//==================================================================
body.delegate('#summarize-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 750, 460);

    // fade in the html content
    variable_content.load('components/summarize.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/summarize.js') );
});


//==================================================================
// Show-timing section
//==================================================================
body.delegate('#timing-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 450);

    // fade in the html content
    variable_content.load('components/timing.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/timing.js') );
});


//==================================================================
// Show availability section
//==================================================================
body.delegate('#availability-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 510);

    // fade in the html content
    variable_content.load('components/availability.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/availability.js') );
});


//==================================================================
// Convert section
//==================================================================
body.delegate('#convert-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 690);

    // fade in the html content
    variable_content.load('components/convert.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/convert.js') );
});


//==================================================================
// Compute section
//==================================================================
body.delegate('#compute-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 445);

    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/compute.js') );
    // fade in the html content
    variable_content.load('components/compute.html').hide().fadeIn('slow');
    // generate select button options for what statistics the user wants to compute
    generateStatsParameterOptions();
});


//==================================================================
// Extract section
//==================================================================
body.delegate('#extract-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 530);

    // fade in the html content
    variable_content.load('components/extract.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/extract.js') );
});


//==================================================================
// Validate section
//==================================================================
body.delegate('#validate-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 460);

    // fade in the html content
    variable_content.load('components/validate.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/validate.js') );
});


//==================================================================
// Combine section
//==================================================================
body.delegate('#combine-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 440);

    // fade in the html content
    variable_content.load('components/combine.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/combine.js') );
});



//==================================================================
// Classify section
//==================================================================
body.delegate('#classify-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 460);

    // fade in the html content
    variable_content.load('components/classify.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/tools/classify.js') );
});


//==================================================================
// Application settings section
//==================================================================
body.delegate('#settings-section', 'click', function () {
    removeToastMessages();
    // tell main process to resize the window, and to retrieve the current settings
    ipcRenderer.send('resize-window', 1200, 850);
    ipcRenderer.send('get-current-settings');

    variable_content.load('components/settings.html').hide().fadeIn('slow');
    $('.linePreloader').show();
});


//==================================================================
// About section
//==================================================================
about_section_button.click(function () {
    let preloader = $('.linePreloader');
    // only load when not already loaded
    if(variable_content.find('#about-app').length !== 1) {
        preloader.hide('fast');
        removeToastMessages();
        ipcRenderer.send('resize-window', 1070, 625);
        // tell main process to get the python script its version info
        ipcRenderer.send('get-version-info');

        // generate the info that tells you stuff about this electron app
        setTimeout(function () {
            generateElectronAboutInfo();
        }, 100);

        // generate skeleton for information to be displayed in
        variable_content.load('components/about.html').hide().fadeIn('slow');
        preloader.show();
    }
});


//==================================================================
// Handles the requested python about/version info
//
// @param {object} error
// @param {object} python_version_info
// @param {object} stdErr
//==================================================================
ipcRenderer.on('script-version-info', function (event, python_version_info) {
    let tableHtml = [];
    let i;

    let partList = python_version_info.split(/\n/g);
    // remove last redundant element
    partList.pop();
    // loop trough version info list and generate a neat looking table for the front-end
    for (i = 0; i < partList.length; i += 2) {
        let newVal = partList[i].replace(': ', '');
        // add values to the html table string
        tableHtml.push('<tr><td class="version-first-cell">' + newVal + '</td><td class="version-second-cell">' + partList[i + 1] + '</td></tr>');
    }
    $('#scripts-version-info').html(tableHtml);
    $('.linePreloader').hide('fast');
});


//==================================================================
// Generates and sets the version info for this Electron application
// note: globals can be found at the top of this file
//==================================================================
function generateElectronAboutInfo() {
    $('#app-version-info').html(
        `<tr><td class="version-first-cell">Name</td><td class="version-second-cell">${__name__}</td></tr>
        <tr><td class="version-first-cell">Description</td><td class="version-second-cell">${__description__}</td></tr>
        <tr><td class="version-first-cell">Author</td><td class="version-second-cell">${__author__}</td></tr>
        <tr><td class="version-first-cell">Maintainer</td><td class="version-second-cell">${__maintainer__}</td></tr>
        <tr><td class="version-first-cell">Contact</td><td class="version-second-cell">${__contact__}</td></tr>
        <tr><td class="version-first-cell">Credits</td><td class="version-second-cell">${__credits__}</td></tr>
        <tr><td class="version-first-cell">Version</td><td class="version-second-cell">${__version__}</td></tr>
        <tr><td class="version-first-cell">Status</td><td class="version-second-cell">${__status__}</td></tr>`);
}


//==================================================================
// Loads tool script when not already loaded
//
// @param {string} location - path to script location
//==================================================================
function loadToolScript(location) {
    // check if script with the src already exists || length of 1 is yes, length of 0 is no
    let len = $('script').filter(function () {
        return ($(this).attr('src').includes(location));
    }).length;
    // if not exists
    if ( len === 0 ) {
        log.info('loading the following script:', location.substring(location.lastIndexOf('\\')+1));
        let script = document.createElement('script');
        script.src = location;
        document.body.appendChild(script);
    } else {
        log.info('the following script is already loaded:', location.substring(location.lastIndexOf('\\')+1));
    }
}


//==================================================================
// Generates the options from which the user can choose
// regarding what statistics the user wants to compute.
//==================================================================
function generateStatsParameterOptions() {
    // list of possible statistics user can choose from [ to be altered in the future ]
    // If the backend changes, you have to add the new arguments in this list!!
    // TODO: ADD TO DEV-README
    let possibleStatsArguments = ['all', 'auc', 'p_p_amplitude'];
    // for all possible statistical parameters add these to a select list for the user
    for (let i = 0; i < possibleStatsArguments.length; i++) {
        setTimeout(function() {
            $('#stats-input').append(new Option(possibleStatsArguments[i], possibleStatsArguments[i]));
        }, 100);
    }
}


//==================================================================
// Tells main process to open the README
//==================================================================
help_section_button.click(function () {
    let target = path.join(__dirname, '/README.pdf');
    ipcRenderer.send('open-window', target);
    showNotification('info', 'Support document file should now open in your default PDF viewer');
});


//==================================================================
// Displays machine total memory usage (updates every second)
//==================================================================
ipcRenderer.on('memory-usage', (event, memoryUsage) => {
    $('#memory-usage').css('width', (memoryUsage + '%'));
    $('#memory-usage-perc').html('MEM: ' + memoryUsage + '%');
});


//==================================================================
// Displays machine total memory usage (updates every second)
//==================================================================
ipcRenderer.on('message', (event, message, level) => {
    showNotification(level, message);
});