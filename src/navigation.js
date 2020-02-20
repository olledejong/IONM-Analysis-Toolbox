/**
 * This file is accountable for the navigating functionalities.
 * Following a click event the accompanying variable content
 * will be displayed to the user.
 */

// requires
window.$ = window.jQuery = require('jquery');
const log = require('electron-log');


// globals
__name__ = "IONM Analysis Toolbox";
__author__ = "Olle de Jong";
__maintainer__ = "Olle de Jong";
__contact__ = "['ol.de.jong@st.hanze.nl', 'olledejong@gmail.com']";
__credits__ = "['Gea Drost', 'Fiete Lange', 'Sebastiaan Dulfer']";
__version__ = "1.0.0";
__status__ = "PRODUCTION";

// jQuery Selectors
let about_section_button = $("#about-section");
let variable_content_div = $("#variable-content");


/**
 * Loads variable content for the [ welcome section ]
 */
$("#welcome-section").click(function () {
    variable_content_div.html(
        `<p class="welcome-text">Welcome to the Intraoperative Neurofysiological Monitoring Analysis toolbox!</p>`
    );
});

/**
 * Loads variable content for the [ summarize section ]
 */
$("#summarize-section").click( function() {
    //ipcRenderer.send('resize-window', 800, 600);
    variable_content_div.html(
        `<div class="file-upload">
            Using this functionality you're able to retrieve some basic information about the Eclipse file(s)<br>
            you select. This information includes: path, size, name, date, duration and the modalities.
            <br>
            Please select the CSV files you wish to use.
            <button id="file-selectBtn" class="file-selectBtn">Select file(s)</button>
            <button class="run-summarize" disabled>RUN</button>
        </div>`)
});

/**
 * Loads variable content for the [ timing section ]
 */
$("#timing-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. timing content ..</p>`
    );
});


/**
 * Loads variable content for the [ availability section ]
 */
$("#availability-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. availability content ..</p>`
    );
});


/**
 * Loads variable content for the [ convert section ]
 */
$("#convert-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. convert content ..</p>`
    );
});


/**
 * Loads variable content for the [ compute section ]
 */
$("#compute-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. compute content ..</p>`
    );
});


/**
 * Loads variable content for the [ EVC section ]
 */
$("#evc-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. EVC content ..</p>`
    );
});


/**
 * Loads variable content for the [ classify section ]
 */
$("#classify-section").click(function () {
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
        // tell main process to get the python script its version info
        ipcRenderer.send('get-version-info');

        // generate skeleton for information to be displayed in
        variable_content_div.html(
            `<div id="about-app">
                 <h1>Graphic User Interface - Electron<i class="fas fa-tv"></i></h1>
                 <div id="app-version-info" class="version-info">
                    <!-- will be filled -->
                 </div>
             </div>
             <div id="about-scripts">
                 <h1>Underlying functionality - Python<i class="fas fa-cogs"></i></h1>
                 <div id="scripts-version-info" class="version-info">
                 </div>
             </div>`);

        let r = Math.random().toString(36).substring(7);
        $('.container-after-titlebar').append('<div id="'+ r + '" class="info-msg"><i class="fas fa-info-circle"></i> Retrieving version info from the Python script</div>');

        let tempElement = $('#'+r);

        tempElement.animate({
            right: '+=465', opacity: 1
        }, 800, function () {
            tempElement.delay(3500).fadeOut(800, function () {
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
 * @param {object} stdOut
 * @param {object} stdErr
 */
ipcRenderer.on("version-info", function (event, error, stdOut, stdErr) {
    let tableHtml = [];
    let i;
    console.log(error);
    console.log(stdErr);

    // if no errors occurred ..
    if( error === null && stdErr === '') {
        // split version info on every occurrence of '\n'
        let partList = stdOut.split(/\n/g);
        // remove last redundant element
        partList.pop();
        // loop trough version info list and generate a neat looking table for the front-end
        for (i = 0; i < partList.length; i += 2) {
            let newVal = partList[i].replace(": ", "");
            // add values to the html table string
            tableHtml.push('<tr><td>' + newVal + '</td><td>' + partList[i + 1] + '</td></tr>');
        }
    } else {
        // if errors occurred ..
        let r = Math.random().toString(36).substring(7);
        console.log("[ navigation.js ][ an error occurred while trying to retrieve python version-info ]");
        // add error message div to the frontend
        $('.container-after-titlebar').append('<div id="'+ r + '" class="error-msg"><i class="fas fa-times-circle"></i> An error occurred while trying to retrieve the version-info</div>');

        // temp element id so that always the right message gets animated
        let tempElement = $('#'+r);

        // animate the error message
        tempElement.animate({
           right: '+=465', opacity: 1
        }, 800, function () {
            tempElement.delay(3500).fadeOut(800, function () {
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
    $("#app-version-info").html(`<tr><td>Name</td><td>${__name__}</td></tr>
                                <tr><td>Author</td><td>${__author__}</td></tr>
                                <tr><td>Maintainer</td><td>${__maintainer__}</td></tr>
                                <tr><td>Contact</td><td>${__contact__}</td></tr>
                                <tr><td>Credits</td><td>${__credits__}</td></tr>
                                <tr><td>Version</td><td>${__version__}</td></tr>
                                <tr><td>Status</td><td>${__status__}</td></tr></p>`)
}

