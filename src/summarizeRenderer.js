window.$ = window.jQuery = require('jquery');

// inform the Main Process that it has to open a file select window
$("#variable-content").on("click", '.run-summarize', function() {
    console.log("clicked run button");
    //TODO: SET LOADING GIF
    $("#variable-content").html('');
    ipcRenderer.send("run-summarize");
});

ipcRenderer.on('set-title-and-gif', function (event) {
    $("#variable-content").html(`<h2>Requested summarized basic information about the selected ECLIPSE-files</h2>
                                 <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
                                 <div id="summarize-results"></div>`);
    // hide summarize results div untill it actually gets some results
    $('#summarize-results').hide();
});


/**
 * Handles the message from the main process that contains the summarize results for the
 * selected Eclipse files.
 * //todo expand
 */
ipcRenderer.on("summarize-result", function displaySummarizeResults(event, JSON_result) {
    console.log("[ summarizeRenderer.js ][ displaySummarizeResults() is being executed ]");

    let JSON_obj = JSON.parse(JSON_result);
    console.log("[ summarizeRenderer.js ][ JSON OBJECT ]", JSON_obj);
    console.log(JSON_obj['File size']);

    // show the results container
    $('#summarize-results').show();

    // because of JS promises the code between the curly brackets is
    // only executed when the function generateTable() is finished
    generateTable(JSON_obj).then(function (result) {
        console.log(result[0]);
        console.log(result[1]);

        let selector = '#table-' + result[1];
        console.log(selector);
        $(selector).append(result[0]);
        $('.lds-ellipsis').fadeOut();
    });
});

/**
 * Returns a HTML table which is created using the parameter JSON_obj
 *
 * @param JSON_obj (parsed JSON object)
 * @returns variables htmlTableContent and fileName via a Promise object
 */
function generateTable(JSON_obj) {
    return new Promise(function(resolve, reject) {

        let decodedFilePath = decodeURI(JSON_obj['File path']);
        let htmlTableContent = [];
        let fileName = decodedFilePath.substring((decodedFilePath.lastIndexOf('\\') + 1) , ).replace(/\./g, '-');

        // create an unique table element
        $('#summarize-results').append('<table class="summarize-table" id="table-' + fileName + '"></table>');

        // create the first three rows which are always there
        htmlTableContent.push('<tr class="table-file-name"><th>' + fileName + '</th></tr>');
        htmlTableContent.push('<tr><td class="table-item">' + Object.keys(JSON_obj)[0] + '</td><td>'+ decodedFilePath +'</td></tr>');
        htmlTableContent.push('<tr><td class="table-item">' + Object.keys(JSON_obj)[1] + '</td><td>'+ JSON_obj['File size'] +'</td></tr>');

        // for every instance in the meta object, build a row with its key and its value
        for(let i=0; i < Object.keys(JSON_obj.meta).length; i++) {
            let key = Object.keys(JSON_obj.meta)[i];
            let value = JSON_obj['meta'][Object.keys(JSON_obj.meta)[i]];
            htmlTableContent.push('<tr><td class="table-item">'+ key + '</td><td>' + value + '</td></tr>')
        }

        // for every instance in the modalities object, build a row with its key and its value
        for(let j=0; j < Object.keys(JSON_obj['modalities']).length; j++) {
            let key = Object.keys(JSON_obj['modalities'])[j];
            let value = JSON_obj['modalities'][Object.keys(JSON_obj['modalities'])[j]];
            htmlTableContent.push('<tr><td class="table-item">'+ key + '</td><td>' + value + '</td></tr>')
        }

        resolve([htmlTableContent, fileName]);
    });
}
