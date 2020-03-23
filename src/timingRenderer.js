/**
 * This renderer file is responsible for all user interaction in the
 * 'show timing' section of the application. It is responsible for telling
 * the main process to execute the tool via a ChildProcess and handling
 * the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let variableContent = $("#variable-content");

/**
 * Tells the main process to run the summarize tool / command and
 * empties the page
 */
variableContent.on("click", '#run-timing', function() {
    variableContent.html('');
    ipcRenderer.send("run-timing");
});


/**
 * Sets result page skeleton and preloader will be shown.
 */
ipcRenderer.on('set-title-and-preloader-timing', function () {
    $('.lds-ellipsis').show('fast');
    variableContent.html(`<h1 class="external-window-instruction">The generated plot(s) will been opened in external window(s)</h1>`);
    // hide summarize results div untill it actually gets some results
    $('#timing-results').hide();
});


/**
 * Restores original page when user closes external windows and functionality
 * is done. Also hides preloader.
 */
ipcRenderer.on('timing-result', function () {
    variableContent.html(
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
    $('.lds-ellipsis').hide('fast');
});
