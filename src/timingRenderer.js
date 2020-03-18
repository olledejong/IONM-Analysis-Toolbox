// requires
window.$ = window.jQuery = require('jquery');

// jQuery selectors
let variableContent = $("#variable-content");

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
variableContent.on("click", '#run-timing', function() {
    variableContent.html('');
    ipcRenderer.send("run-timing");
});


/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-timing'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-timing', function (event) {
    $('.lds-ellipsis').show('fast');
    variableContent.html(`<div id="timing-results"></div>`);
    // hide summarize results div untill it actually gets some results
    $('#timing-results').hide();
});


ipcRenderer.on('timing-result', function (event, timing_result) {
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
