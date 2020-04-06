/**
 * This file is accountable for the navigating functionalities.
 * Following a click event the accompanying variable content
 * will be displayed to the user.
 */
// requires
window.$ = window.jQuery = require('jquery');
const path = require('path');

// os username
const username = require('os').userInfo().username.toUpperCase();

// log options configuration for all renderer processes
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';

// globals
__name__ = 'IONM Analysis Toolbox';
__description__ = 'Graphical User Interface for the purpose of using IONM Analysis tools. Created for the UMCG.';
__author__ = 'Olle de Jong';
__maintainer__ = 'Olle de Jong';
__contact__ = '[\'ol.de.jong@st.hanze.nl\', \'olledejong@gmail.com\', \'+31630583903\']';
__credits__ = '[\'Gea Drost\', \'Fiete Lange\', \'Sebastiaan Dulfer\']';
__version__ = '1.0.0';
__status__ = 'DEVELOPMENT';

// jQuery Selectors
let about_section_button = $('#about-section');
let variable_content = $('#variable-content');
let variable_content_div = $('#variable-content');
let body = $('body');

// set welcome message using the username from the OS
$('#welcome-text').html(`Welcome, ${username}, please select a tool to get started`);

/**
 * Loads variable content for the [ welcome section ]
 */
$('#welcome-section').click(function () {
    if (variable_content.find('#tool-container').length !== 1) {
        $('.linePreloader').hide('fast');
        removeToastMessages();
        ipcRenderer.send('resize-window', 1142, 798);
        variable_content.load('shared/index.html');
    }
});


/**
 * Loads variable content for the [ summarize section ]
 */
body.delegate('#summarize-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 750, 460);

    // fade in the html content
    variable_content.load('shared/summarize.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/summarizeRenderer.js') );
});


/**
 * Loads variable content for the [ timing section ]
 */
body.delegate('#timing-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 450);

    // fade in the html content
    variable_content.load('shared/timing.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/timingRenderer.js') );
});


/**
 * Loads variable content for the [ availability section ]
 */
body.delegate('#availability-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 510);

    // fade in the html content
    variable_content.load('shared/availability.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/availabilityRenderer.js') );
});


/**
 * Loads variable content for the [ convert section ]
 */
body.delegate('#convert-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 690);

    // fade in the html content
    variable_content.load('shared/convert.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/convertRenderer.js') );
});


/**
 * Loads variable content for the [ compute section ]
 */
body.delegate('#compute-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 445);

    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/computeRenderer.js') );
    // fade in the html content
    variable_content.load('shared/compute.html').hide().fadeIn('slow');
    // generate select button options for what statistics the user wants to compute
    generateStatsParameterOptions();
});


/**
 * Loads variable content for the [ extract section ]
 */
body.delegate('#extract-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 530);

    // fade in the html content
    variable_content.load('shared/extract.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/extractRenderer.js') );
});


/**
 * Loads variable content for the [ validate section ]
 */
body.delegate('#validate-section', 'click', function () {
    removeToastMessages();
    ipcRenderer.send('resize-window', 800, 460);

    // fade in the html content
    variable_content.load('shared/validate.html').hide().fadeIn('slow');
    // load the needed script
    loadToolScript( path.join(__dirname, '/renderer/validateRenderer.js') );
});


/**
 * Loads variable content for the [ combine section ]
 */
body.delegate('#combine-section', 'click', function () {
    removeToastMessages();
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet');
});



/**
 * Loads variable content for the [ classify section ]
 */
body.delegate('#classify-section', 'click', function () {
    removeToastMessages();
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet');
});


/**
 * Loads variable content for the [ settings section ]
 */
body.delegate('#settings-section', 'click', function () {
    removeToastMessages();
    // tell main process to resize the window, and to retrieve the current settings
    ipcRenderer.send('resize-window', 1200, 850);
    ipcRenderer.send('get-current-settings');

    variable_content.load('shared/settings.html').hide().fadeIn('slow');
    $('.linePreloader').show();
});


/**
 * Loads variable content for the [ about section ]
 *
 * Following a click on the about button, its variable content will be displayed.
 * Eventually two tables will be created.
 * This function tells the main process to retrieve the python script its version
 * info and calls function that generates the GUI version info.
 */
about_section_button.click(function () {
    let preloader = $('.linePreloader');
    // only load when not already loaded
    if(variable_content.find('#about-app').length !== 1) {
        preloader.hide('fast');
        removeToastMessages();
        ipcRenderer.send('resize-window', 1070, 625);
        // tell main process to get the python script its version info
        ipcRenderer.send('get-version-info');

        // generate skeleton for information to be displayed in
        variable_content.load('shared/about.html').hide().fadeIn('slow');
        preloader.show();
    }
});


/**
 * Parses the version info coming from the main process into a neat
 * looking table and displays this to the user.
 *
 * @param {object} error
 * @param {object} python_version_info
 * @param {object} stdErr
 */
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

    // generate the info that tells you stuff about this electron app
    generateElectronAboutInfo();
});


/**
 * Generates and sets the version info for this Electron application
 * note: globals can be found at the top of this file
 */
function generateElectronAboutInfo() {
    $('#app-version-info').html(`<tr><td class="version-first-cell">Name</td><td class="version-second-cell">${__name__}</td></tr>
                                <tr><td class="version-first-cell">Description</td><td class="version-second-cell">${__description__}</td></tr>
                                <tr><td class="version-first-cell">Author</td><td class="version-second-cell">${__author__}</td></tr>
                                <tr><td class="version-first-cell">Maintainer</td><td class="version-second-cell">${__maintainer__}</td></tr>
                                <tr><td class="version-first-cell">Contact</td><td class="version-second-cell">${__contact__}</td></tr>
                                <tr><td class="version-first-cell">Credits</td><td class="version-second-cell">${__credits__}</td></tr>
                                <tr><td class="version-first-cell">Version</td><td class="version-second-cell">${__version__}</td></tr>
                                <tr><td class="version-first-cell">Status</td><td class="version-second-cell">${__status__}</td></tr>`);
}


/**
 * Checks if a script is already loaded, if not, it get loaded.
 * Executed whenever the user is navigating to a tool
 */
function loadToolScript(location) {
    // check if script with the src already exists || length of 1 is yes, length of 0 is no
    let len = $('script').filter(function () {
        return ($(this).attr('src').includes(location));
    }).length;
    // if not exists
    if ( len === 0 ) {
        log.info('loading the following script: \n', location);
        let script = document.createElement('script');
        script.src = location;
        document.body.appendChild(script);
    } else {
        log.info('the following script is already loaded: \n', location);
    }
}


/**
 * Generates the options from which the user can choose regarding
 * what statistics the user wants to compute.
 */
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