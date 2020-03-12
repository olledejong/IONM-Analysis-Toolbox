// requires
window.$ = window.jQuery = require('jquery');
const path = require('path');

// selectors
let variableCont = $("#variable-content");

/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
variableCont.on("click", '#run-compute', function() {
    ipcRenderer.send("run-compute");
});

/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-convert'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-compute', function () {
    $('.lds-ellipsis').show();
    variableCont.html(`<div id="compute-content">
                            <div id="successful-computes">
                                <div id="succeeded-computes">
                                    <h1>Succeeded computes<i class="fas fa-check"></i></h1>
                                    <p id="succeeded-computes-p">
                                        For now the method of selecting signals is the same as before, but this might change in the future.
                                    </p>
                                </div>
                            </div>
                       </div>`);
    $('#successful-computes').hide()
});


ipcRenderer.on('compute-result', function (event, stdout, file_path) {
    let file_name = path.parse(file_path).base.trim();
    $('.lds-ellipsis').hide('fast');
    showNotification('success', `The file has successfully been computed`);
    $('#successful-computes').show('fast');
    $(`<tr><td class="name-td">` + file_name +`</td><td class="msg-td">Successfully computed the statistics of this file. Results can be found in the database</td><td class="filepath-td">`+ file_path +`</td></tr><br>`).insertBefore('#succeeded-computes-p');
});

