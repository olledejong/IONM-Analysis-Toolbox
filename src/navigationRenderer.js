/**
 * This file is accountable for the navigating functionalities.
 * Following a click event the accompanying variable content
 * will be displayed to the user.
 */

// requires
window.$ = window.jQuery = require('jquery');
const log = require('electron-log');

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


/**
 * Loads variable content for the [ welcome section ]
 */
$("#welcome-section").click(function () {
    if (variable_content_div.find('#tool-container').length > 0) {
    } else {
        ipcRenderer.send('resize-window', 730, 800);
        variable_content_div.html(
        `<h1 class="welcome-text">What do you wish to do next?</h1>
         <div id="tool-container">
            <div id="summarize-section">
                <h3>Summarize File(s)</h3>
                <p>Gain insight into Eclipse files</p>
                <p class="python-command-p">python command: ionm.py summarize [files]</p>
            </div>
            <div id="timing-section">
                <h3>Show Timing</h3>
                <p>Plot timestamps of measurements as a function of position in file</p>
            </div>
            <div id="availability-section">
                <h3>Show EEG Availability</h3>
                <p>Generate a plot showing concurrent availability of a continuous modality and a triggered modality</p>
            </div>
            <div id="convert-section">
                <h3>Convert File(s)</h3>
                <p>Convert an Eclipse CSV into multiple custom files: one per modality</p>
            </div>
            <div id="compute-section">
                <h3>Compute Statistics</h3>
                <p>Calculate statistics for given converted file (triggered modalities) and store these in the database</p>
            </div>
            <div id="evc-section">
                <h3>Extract, Validate and Combine</h3>
                <p>click here to expand pathway</p>
                <p></p>
            </div>
            <div id="classify-section">
                <h3>Classify</h3>
                <p>Classify signals of file(s) on the presence of F-waves</p>
            </div>
            <div id="free-slot-section">
                <h3>Placeholder</h3>
                <p>Optional new tool</p>
            </div>
        </div>`);
    }
});

/**
 * Loads variable content for the [ summarize section ]
 */
body.delegate("#summarize-section", "click", function() {
    ipcRenderer.send('resize-window', 800, 460);
    variable_content_div.html(
        `<div id="summarize-content">
            <h3 id="summarize-content-h">Get Eclipse file summary</h3>
            <p id="summarize-content-p">
            Using this functionality you're able to retrieve some basic information about the Eclipse file(s)
            you select. The information in this summary contains for example: path to the file, file size, file name, date of measuring, duration of measurement and the types of modalities.
            <br><br>Please select the CSV file(s) you wish to summarize.
            </p>
            <button id="file-selectBtn" class="file-selectBtn">Select file(s)</button>
            <button class="run-summarize" disabled>RUN</button>
        </div>`)
});

/**
 * Loads variable content for the [ timing section ]
 */
body.delegate('#timing-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. timing content ..</p>`
    );
});


/**
 * Loads variable content for the [ availability section ]
 */
body.delegate('#availability-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. availability content ..</p>`
    );
});


/**
 * Loads variable content for the [ convert section ]
 */
body.delegate('#convert-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. convert content ..</p>`
    );
});


/**
 * Loads variable content for the [ compute section ]
 */
body.delegate('#compute-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. compute content ..</p>`
    );
});


/**
 * Loads variable content for the [ EVC section ]
 */
body.delegate('#evc-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. EVC content ..</p>`
    );
});


/**
 * Loads variable content for the [ classify section ]
 */
body.delegate('#classify-section', 'click', function () {
    variable_content_div.html(
        `<p class="dev-message">.. classify content ..</p>`
    );
});

/**
 * Loads variable content for the [ about section ]
 *
 * Following a click on the about button, its variable content will be displayed.
 * Eventually two tables will be created.
 * This function tells the main process to retrieve the python script its version
 * info and calls fuction that generates the GUI version info.
 */
about_section_button.click(function () {
    if(variable_content_div.find('#about-app').length > 0) {
        // when about page already loaded, do not load it again.
    } else {
        ipcRenderer.send('resize-window', 900, 550);
        // tell main process to get the python script its version info
        ipcRenderer.send('get-version-info');

        // generate skeleton for information to be displayed in
        variable_content_div.html(
            `
            <div id="about-scripts">
                 <h1>Python Scripts<i class="fas fa-cogs"></i></h1>
                 <div id="scripts-version-info" class="version-info">
                 </div>
            </div>
            <div id="about-app">
                 <h1>Graphic User Interface<i class="fas fa-tv"></i></h1>
                 <div id="app-version-info" class="version-info">
                    <!-- will be filled -->
                 </div>
            </div>
            <div id="umcg-logo-div">
                <img id="umcg-logo" alt="umcg logo" src="../assets/images/umcg_logo_wide.png">
            </div>
             `);

        let r = Math.random().toString(36).substring(7);
        container_after_titlebar.append('<div id="'+ r + '" class="info-msg"><i class="fas fa-info-circle"></i> Retrieving version info from the script</div>');

        let tempElement = $('#'+r);

        tempElement.animate({
            right: '+=465', opacity: 1
        }, 750, function () {
            tempElement.delay(4000).fadeOut(800, function () {
                $(this).remove();
            });
        });
    }

    // generate the info that tells you stuff about this electron app
    generateElectronAbout();
});

/**
 * Parses the version info coming from the main process into a neat
 * looking table and displays this to the user.
 *
 * @param {object} error
 * @param {object} python_version_info
 * @param {object} stdErr
 */
ipcRenderer.on("script-version-info", function (event, error, python_version_info, stdErr) {
    let tableHtml = [];
    let i;

    // if no errors occurred ..
    if( error === null && stdErr === '') {
        // split version info on every occurrence of '\n'
        let partList = python_version_info.split(/\n/g);
        // remove last redundant element
        partList.pop();
        // loop trough version info list and generate a neat looking table for the front-end
        for (i = 0; i < partList.length; i += 2) {
            let newVal = partList[i].replace(": ", "");
            // add values to the html table string
            tableHtml.push('<tr><td class="version-first-cell">' + newVal + '</td><td class="version-second-cell">' + partList[i + 1] + '</td></tr>');
        }
    } else {
        // if errors occurred ..
        let r = Math.random().toString(36).substring(7);
        log.info("[ navigationRenderer.js ][ an error occurred while trying to retrieve python version-info ]");
        // add error message div to the frontend
        container_after_titlebar.append('<div id="'+ r + '" class="error-msg"><i class="fas fa-times-circle"></i> An error occurred while trying to retrieve the version-info</div>');

        // temp element id so that always the right message gets animated
        let tempElement = $('#'+r);

        // animate the error message
        tempElement.animate({
           right: '+=465', opacity: 1
        }, 750, function () {
            tempElement.delay(4000).fadeOut(800, function () {
                $(this).remove();
            });
        });
    }

    $("#scripts-version-info").html(tableHtml);
});

/**
 * Generates and sets the version info for this Electron application
 * note: globals can be found at the top of this file
 */
function generateElectronAbout() {
    $("#app-version-info").html(`<tr><td class="version-first-cell">Name</td><td class="version-second-cell">${__name__}</td></tr>
                                <tr><td class="version-first-cell">Author</td><td class="version-second-cell">${__author__}</td></tr>
                                <tr><td class="version-first-cell">Maintainer</td><td class="version-second-cell">${__maintainer__}</td></tr>
                                <tr><td class="version-first-cell">Contact</td><td class="version-second-cell">${__contact__}</td></tr>
                                <tr><td class="version-first-cell">Credits</td><td class="version-second-cell">${__credits__}</td></tr>
                                <tr><td class="version-first-cell">Version</td><td class="version-second-cell">${__version__}</td></tr>
                                <tr><td class="version-first-cell">Status</td><td class="version-second-cell">${__status__}</td></tr></p>`)
}