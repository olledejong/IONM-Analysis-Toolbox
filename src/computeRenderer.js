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
    ipcRenderer.send('resize-window', 1180, 600);
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

