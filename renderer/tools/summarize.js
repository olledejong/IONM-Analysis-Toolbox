//=========================================================================
//                         Summarize Renderer
//=========================================================================
// This file handles all the functionality that has to do with the
// SUMMARIZE functionality. It listens for a click on the file select
// button, and tells the main process to handle this. It also displays
// the received filenames inside the button.
// It als listens for a click on the run button and tells the main process
// to execute the summarize part of the underlying python scripts.
//=========================================================================

// requires
window.$ = window.jQuery = require('jquery');

//=========================================================================
// On clicking the RUN button on the summarize page, the page will be
// cleared to be later filled with the skeleton for the eventual results.
// Of course also tells the main process to run the summarize command.
//=========================================================================
variable_content.on('click', '#run-summarize', () => {
    variable_content.html('');
    ipcRenderer.send('run-summarize');
});


//=====================================================================
// This function is executed when the main process sends the message
// 'set-title-and-preloader-summarize'. The result page skeleton and
// preloader will be set.
//=====================================================================
ipcRenderer.on('set-title-and-preloader-summarize', () => {
    $('.linePreloader').show();
    variable_content.html('<div id="summarize-results"></div>');
    // hide summarize results div untill it actually gets some results
    $('#summarize-results').hide();
});


//=======================================================================
// Handles the message from the main process that contains the summarize
// results for the selected Eclipse files. Appends tables to HTML only
// AFTER the generateTable function is done using JavaScript Promises.
//
// @param {string} JSON_result - unparsed JSON output from summarize cmd
//=======================================================================
ipcRenderer.on('summarize-result', (event, JSON_result) => {
    log.info('[ summarize.js ][ displaySummarizeResults() is being executed ]');
    // parse the JSON string into a JSON object
    let JSON_obj = JSON.parse(JSON_result);

    // show the results container
    $('#summarize-results').show();

    // because of JS promises the code between the curly brackets is
    // only executed when the function generateTable() is finished
    generateTable(JSON_obj).then( (result) => {
        let selector = $('#table-' + result[1]);

        selector.append(result[0]).hide().fadeIn(800);
        log.info('[ summarize.js ][ Appending table rows to table '+ result[1] +' ]');
        // fade out the preloader
        $('.linePreloader').hide('fast');
    });
});


//=======================================================================
// Returns a HTML table which is created using the parameter JSON_obj.
//
// @param {object} JSON_obj - parsed JSON_string
// @returns variables htmlTableContent and fileName via a Promise object
//=======================================================================
function generateTable(JSON_obj) {
    return new Promise((resolve) => {

        let decodedFilePath = decodeURI(JSON_obj['File path']);
        let htmlTableContent = [];
        let fileName = decodedFilePath.substring((decodedFilePath.lastIndexOf('\\') + 1) , ).replace(/\./g, '-');

        // create an unique table element
        $('#summarize-results').append(`<table class="summarize-table" id="table-${fileName}"></table>`);

        // create the first three rows which are always there
        htmlTableContent.push('<tr class="table-file-name"><th>' + fileName + '</th></tr>');
        htmlTableContent.push(`<tr><td class="table-item">${Object.keys(JSON_obj)[0]}</td><td>${decodedFilePath}</td></tr>`);
        htmlTableContent.push(`<tr><td class="table-item">${Object.keys(JSON_obj)[1]}</td><td>${JSON_obj['File size']}</td></tr>`);

        // for every instance in the meta object, build a row with its key and its value
        for(let i=0; i < Object.keys(JSON_obj.meta).length; i++) {
            let key = Object.keys(JSON_obj.meta)[i];
            let value = JSON_obj['meta'][Object.keys(JSON_obj.meta)[i]];
            htmlTableContent.push(`<tr><td class="table-item">${key}</td><td>${value}</td></tr>`);
        }

        // for every instance in the modalities object, build a row with its key and its value
        for(let j=0; j < Object.keys(JSON_obj['modalities']).length; j++) {
            let key = Object.keys(JSON_obj['modalities'])[j];
            let value = JSON_obj['modalities'][Object.keys(JSON_obj['modalities'])[j]];
            htmlTableContent.push(`<tr><td class="table-item">${key}</td><td>${value}</td></tr>`);
        }

        resolve([htmlTableContent, fileName]);
    });
}
