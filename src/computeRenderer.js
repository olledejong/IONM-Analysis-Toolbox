/**
 * This renderer file is responsible for all user interaction in the
 * compute section of the application. It is responsible for telling
 * the main process to execute the tool via a ChildProcess and handling
 * the response of this ChildProcess (error / success)
 */

// requires
window.$ = window.jQuery = require('jquery');
const path = require('path');

// selectors
let variableCont = $("#variable-content");

/**
 * Tells the main process to run the compute tool / command.
 * Sends message to resize the window
 */
variableCont.on("click", '#run-compute', function() {
    ipcRenderer.send('resize-window', 1180, 600);
    ipcRenderer.send("run-compute");
});

/**
 * Loads result page skeleton and the preloader will be showed.
 * Hides containers until needed later.
 */
ipcRenderer.on('set-title-and-preloader-compute', function () {
    $('.lds-ellipsis').show();
    variableCont.html(`<div id="compute-content">
                            <h1>Please work through the external windows to get to the final result</h1>
                            <div id="successful-computes">
                                <div id="succeeded-computes">
                                    <h2>Successfully computed<i class="fas fa-check"></i></h2>
                                    <p id="succeeded-computes-p">
                                        For now the method of selecting signals is the same as before, but this might change in the future.
                                    </p>
                                </div>
                            </div>
                       </div>`);
    $('#successful-computes').hide()
});

/**
 * Shows the result skeleton and fills it for every successfully completed
 * compute task. Hides preloader and shows the results.
 */
ipcRenderer.on('compute-result', function (event, stdout, file_path) {
    for (let i = 0; i < file_path.length; i++) {
        log.info(file_path);
        let file_name = path.parse(file_path[i]).base.trim();
        showNotification('success', `Successfully computed ${file_name} `);
        $(`<tr><td class="name-td">${file_name}</td><td class="msg-td">Successfully computed the statistics of this file. Results can be found in the database</td><td class="filepath-td">${file_path[0]}</td></tr><br>`).insertBefore('#succeeded-computes-p');
    }
    $('.lds-ellipsis').hide('fast');
    $('#compute-content h1').hide();
    $('#successful-computes').show('fast');

});

