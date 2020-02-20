window.$ = window.jQuery = require('jquery');

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


// --- WELCOME SECTION --- //
$("#welcome-section").click(function () {
    variable_content_div.html(
        `<p class="welcome-text">Welcome to the Intraoperative Neurofysiological Monitoring Analysis toolbox!</p>`
    );
});

// --- SUMMARIZE SECTION --- //
$("#summarize-section").click(function () {
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

// --- TIMING SECTION --- //
$("#timing-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. timing content ..</p>`
    );
});


// --- AVAILABILITY SECTION --- //
$("#availability-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. availability content ..</p>`
    );
});


// --- CONVERT SECTION --- //
$("#convert-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. convert content ..</p>`
    );
});


// --- COMPUTE SECTION --- //
$("#compute-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. compute content ..</p>`
    );
});


// --- EVC SECTION --- //
$("#evc-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. EVC content ..</p>`
    );
});


// --- CLASSIFY SECTION --- //
$("#classify-section").click(function () {
    variable_content_div.html(
        `<p class="dev-message">.. classify content ..</p>`
    );
});

// --- ABOUT SECTION --- //
about_section_button.click(function () {

    if(variable_content_div.find('#about-app').length > 0) {
        // when about page already loaded, do not load it again.
    } else {
        // generate skeleton for information to be displayed in
        ipcRenderer.send('get-version-info');
        variable_content_div.html(`
        <div id="about-app">
            <h1>Graphic User Interface - Electron<i class="fas fa-tv"></i></h1>
            <p id="app-version-info" class="version-info">
                <!-- will be filled -->
            </p>
        </div>
        <div id="about-scripts">
            <h1>Underlying functionality - Python<i class="fas fa-cogs"></i></h1>
            <p id="scripts-version-info" class="version-info">
                retrieving information from python script...
            </p>
        </div>`
        )}
    // generate the info that tells you stuff about this electron app
    generateElectronAbout();
});

// On the message 'version-info' from the Main process it gets parsed into
// the wanted format for displaying a neat looking table on the front-end
ipcRenderer.on("version-info", function (event, error, stdOut, stdErr) {
    let tableHtml = [];
    let i;
    // split version info on every occurrence of '\n'
    let partList = stdOut.split(/\n/g);
    // remove last redundant element
    partList.pop();
    // loop trough version info list and generate a neat looking table for the front-end
    for(i = 0; i < partList.length; i += 2) {
        let newVal = partList[i].replace(": ", "");
        // add values to the html table string
        tableHtml.push('<tr><td>' + newVal + '</td><td>' + partList[i+1] + '</td></tr>');
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

