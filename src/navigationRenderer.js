/**
 * This file is accountable for the navigating functionalities.
 * Following a click event the accompanying variable content
 * will be displayed to the user.
 */

// requires
window.$ = window.jQuery = require('jquery');
const log = require('electron-log');
// os username
const username = require("os").userInfo().username.toUpperCase();

log.info();

// log options configuration for all renderer processes
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';


// globals
__name__ = "IONM Analysis Toolbox";
__author__ = "Olle de Jong";
__maintainer__ = "Olle de Jong";
__contact__ = "['ol.de.jong@st.hanze.nl', 'olledejong@gmail.com']";
__credits__ = "['Gea Drost', 'Fiete Lange', 'Sebastiaan Dulfer']";
__version__ = "1.0.0";
__status__ = "DEVELOPMENT";

// jQuery Selectors
let about_section_button = $("#about-section");
let variable_content_div = $("#variable-content");
let container_after_titlebar = $('.container-after-titlebar');
let body = $('body');


// set welcome message using the username from the OS
$('#welcome-text').html('Welcome, '+ username +', please select a tool to get started');

/**
 * Loads variable content for the [ welcome section ]
 */
$("#welcome-section").click(function () {
    if (variable_content_div.find('#tool-container').length > 0) {
    } else {
        ipcRenderer.send('resize-window', 730, 800);
        variable_content_div.html(
        `<h1 id="welcome-text">Hi ` + username + `, what do you wish to do next?</h1>
         <div id="tool-container">
            <div id="summarize-section">
                <span class="tool-number">1</span>
                <h3>Summarize File(s)</h3>
                <p>Gain insight into Eclipse files</p>
                <p class="python-command-p">python command: ionm.py summarize [files]</p>
                <span class="tool-finished"><i class="fas fa-check"></i></span>
            </div>
            <div id="timing-section">
                <span class="tool-number">2</span>
                <h3>Show Timing</h3>
                <p>Plot timestamps of measurements as a function of position in file</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="availability-section">
                <span class="tool-number">3</span>
                <h3>Show EEG Availability</h3>
                <p>Generate a plot showing concurrent availability of a continuous modality and a triggered modality</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="convert-section">
                <span class="tool-number">4</span>
                <h3>Convert File(s)</h3>
                <p>Convert an Eclipse CSV into multiple custom files: one per modality</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="compute-section">
                <span class="tool-number">5</span>
                <h3>Compute Statistics</h3>
                <p>Calculate statistics for given converted file (triggered modalities) and store these in the database</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="evc-section">
                <span class="tool-number">6</span>
                <h3>Extract, Validate and Combine</h3>
                <p>click here to expand pathway</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="classify-section">
                <span class="tool-number">7</span>
                <h3>Classify</h3>
                <p>Classify signals of file(s) on the presence of F-waves</p>
                <span class="tool-in-dev"><i class="fas fa-exclamation-triangle"></i></span>
            </div>
            <div id="settings-section">
                <span id="settings-icon"><i class="fas fa-cog"></i></span>
                <h3>Settings</h3>
                <p>Change the database here. You can also set the modalities of the active database here</p>
            </div>
        </div>`);
    }
});


/**
 * Loads variable content for the [ summarize section ]
 */
body.delegate("#summarize-section", "click", function () {
    ipcRenderer.send('resize-window', 750, 460);
    variable_content_div.html(
        `<div id="summarize-content">
            <div id="summarize-content-description" class="content-description-container">
                <h3 id="summarize-content-h">Obtain a summary of the selected file(s) its contents</h3>
                <p id="summarize-content-p">
                Using this functionality you're able to retrieve some basic information about the Eclipse file(s)
                you select. The information in this summary contains for example: path to the file, file size, file name, date of measuring, duration of measurement and the types of modalities.
                <br><br>Please select the CSV file(s) you wish to summarize.
                </p>
            </div>
            <div id="file-upload-container">
                <button id="file-selectBtn" class="csv-select-btn">Click to select</button>
                <div id="selected-filename-container">
                    <p id="selected-filenames">No files selected</p>
                    <button class="run-button" id="run-summarize" disabled>RUN</button>
                </div>
            </div>
        </div>`)
});


/**
 * Loads variable content for the [ timing section ]
 */
body.delegate('#timing-section', 'click', function () {
    ipcRenderer.send('resize-window', 800, 450);
    variable_content_div.html(
        `<div id="timing-content">
            <div id="timing-content-description" class="content-description-container">
                <h3 id="timing-content-h">Generate a timing plot for insight into IONM measurements</h3>
                <p id="timing-content-p">
                This will generate a plot showing timestamps at which IONM measurements were made. In the resulting graph 
                you will see plots in which timestamps of measurements are plotted as a function of the position in file.
                <br><br>Please select the CSV file(s) of which you would like to see a timing plot.
                </p>
            </div>
            <div id="file-upload-container">
                <button id="file-selectBtn" class="csv-select-btn">Click to select</button>
                <div id="selected-filename-container">
                    <p id="selected-filenames">No files selected</p>
                    <button class="run-button" id="run-timing" disabled>RUN</button>
                </div>
            </div>
        </div>`);
});


/**
 * Loads variable content for the [ availability section ]
 */
body.delegate('#availability-section', 'click', function () {
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet')
});


/**
 * Loads variable content for the [ convert section ]
 */
body.delegate('#convert-section', 'click', function () {
    ipcRenderer.send('resize-window', 800, 450);
    variable_content_div.html(
        `<div id="convert-content">
            <div id="convert-content-description" class="content-description-container">
                <h3 id="convert-content-h">Convert Eclipse CSV files(s) into a custom format</h3>
                <p id="convert-content-p">
                    This tool is a preprocess tool to eventually compute the statistics of the Eclipse files. 
                    It will convert Eclipse CSV files into multiple custom files: one separate file per modality. 
                    As mentioned, the statistics can be computed for one or more of these converted files. These statistics 
                    will be stored in the IONM database.
                    <br><br>Please select the CSV file(s) you wish to convert.
                </p>
            </div>
            <div id="file-upload-container">
                <button id="file-selectBtn" class="csv-select-btn">Click to select</button>
                <div id="selected-filename-container">
                    <p id="selected-filenames">No files selected</p>
                    <button class="run-button" id="run-convert" disabled>RUN</button>
                </div>
            </div>
<!--            <button class="run-button" id="run-convert" disabled>RUN</button>-->
        </div>`);
});


/**
 * Loads variable content for the [ compute section ]
 */
body.delegate('#compute-section', 'click', function () {
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet')
});


/**
 * Loads variable content for the [ EVC section ]
 */
body.delegate('#evc-section', 'click', function () {
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet')
});


/**
 * Loads variable content for the [ classify section ]
 */
body.delegate('#classify-section', 'click', function () {
    showNotification('warning', 'I\'m sorry, but this part hasn\'t been fully implemented yet')
});


/**
 * Loads variable content for the [ settings section ]
 */
body.delegate('#settings-section', 'click', function () {
    ipcRenderer.send('resize-window', 1200, 600);
    ipcRenderer.send('get-database-settings');
    ipcRenderer.send('get-modality-settings');
    variable_content_div.html(
       `<div id="set-database-path">
            <h4>Configure the database</h4>
            <p id="database-path-p">
                The currently configured database is displayed within the white box. Select and
                set the the database you wish to work with.
                
            </p>
            <p id="database-path"></p>
            <button class="database-button" id="select-database" disabled>SELECT</button>
            <button class="database-button" id="set-database" disabled>SET DATABASE</button>
        </div>
        `);
    showNotification('info', 'Retrieving current configured database path')
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
    if(variable_content_div.find('#about-app').length > 0) {
        // when about page already loaded, do not load it again.
    } else {
        ipcRenderer.send('resize-window', 1070, 540);
        // tell main process to get the python script its version info
        ipcRenderer.send('get-version-info');

        // generate skeleton for information to be displayed in
        variable_content_div.html(
            `
            <div id="about-scripts">
                 <h1>Python Project</h1>
                 <div id="scripts-version-info" class="version-info">
                    <!-- will be filled -->
                 </div>
            </div>
            <div id="about-app">
                 <h1>Graphical User Interface</h1>
                 <div id="app-version-info" class="version-info">
                    <!-- will be filled -->
                 </div>
            </div>
            <div id="umcg-logo-div">
                <img id="umcg-logo" alt="umcg logo" src="../assets/images/umcg_logo_wide.png">
            </div>
             `);
        showNotification('info', 'Retrieving version info from the script')
    }
    // generate the info that tells you stuff about this electron app
    generateElectronAboutInfo();
});


/**
 * Parses the version info coming from the main process into a neat
 * looking table and displays this to the user.
 *
 * @param {object} error
 * @param {object} python_version_info
 * @param {object} stdErr
 */
ipcRenderer.on("script-version-info", function (event, python_version_info) {
    let tableHtml = [];
    let i;

    let partList = python_version_info.split(/\n/g);
    // remove last redundant element
    partList.pop();
    // loop trough version info list and generate a neat looking table for the front-end
    for (i = 0; i < partList.length; i += 2) {
        let newVal = partList[i].replace(": ", "");
        // add values to the html table string
        tableHtml.push('<tr><td class="version-first-cell">' + newVal + '</td><td class="version-second-cell">' + partList[i + 1] + '</td></tr>');
    }

    $("#scripts-version-info").html(tableHtml);
});


/**
 * Generates and sets the version info for this Electron application
 * note: globals can be found at the top of this file
 */
function generateElectronAboutInfo() {
    $("#app-version-info").html(`<tr><td class="version-first-cell">Name</td><td class="version-second-cell">${__name__}</td></tr>
                                <tr><td class="version-first-cell">Author</td><td class="version-second-cell">${__author__}</td></tr>
                                <tr><td class="version-first-cell">Maintainer</td><td class="version-second-cell">${__maintainer__}</td></tr>
                                <tr><td class="version-first-cell">Contact</td><td class="version-second-cell">${__contact__}</td></tr>
                                <tr><td class="version-first-cell">Credits</td><td class="version-second-cell">${__credits__}</td></tr>
                                <tr><td class="version-first-cell">Version</td><td class="version-second-cell">${__version__}</td></tr>
                                <tr><td class="version-first-cell">Status</td><td class="version-second-cell">${__status__}</td></tr></p>`)
}

/**
 * General function for generating and animating notification (toast) messages for this renderer
 * @param type
 * @param message
 */
function showNotification(type, message) {
    let r = Math.random().toString(36).substring(7);

    // check for existing notification messages, add extra top offset if one or more already exist
    let extraTopOffset = ($('.success-msg').length + $('.info-msg').length + $('.error-msg').length + $('.warning-msg').length) * 40;

    // add notification element to page according to type
    if (type === 'error') {
        container_after_titlebar.append('<div id="'+ r + '" class="error-msg"><i class="fas fa-times-circle"></i>&nbsp;&nbsp;'+ message + '</div>');
    } else if (type === 'info') {
        container_after_titlebar.append('<div id="'+ r + '" class="info-msg"><i class="fas fa-info-circle"></i>&nbsp;&nbsp;'+ message + '</div>');
    } else if (type === 'success') {
        container_after_titlebar.append('<div id="'+ r + '" class="success-msg"><i class="fas fa-check"></i>&nbsp;&nbsp;'+ message + '</div>');
    } else {
        container_after_titlebar.append('<div id="'+ r + '" class="warning-msg"><i class="fas fa-exclamation-triangle"></i>&nbsp;&nbsp;'+ message + '</div>');
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