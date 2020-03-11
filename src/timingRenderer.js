// requires
window.$ = window.jQuery = require('jquery');
const ChartJs = require('chart.js');

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
    variable_content.html('');
    ipcRenderer.send("run-timing");
});


/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader-timing'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader-timing', function (event) {
    $('.lds-ellipsis').show('fast');
    variableContent.html(
        `<h2 id="summarize-result-title">Resulting timing plots</h2>
         <div id="timing-results"></div>`);
    // hide summarize results div untill it actually gets some results
    $('#timing-results').hide();
});


ipcRenderer.on('timing-result', function (event, timing_result) {
    log.info('timing result in renderer: ', timing_result);
    log.info(typeof timing_result);

    $('#timing-results').html('<canvas id="myChart"></canvas>');
    let myChart = $('#myChart');

    let modalities = timing_result['modalities'];
    let timestamps = timing_result['timestamps'];
    let indices = timing_result['indices'];
    let unique_modalities = timing_result['unique_modalities'];
    let colors = timing_result['colors'];
    log.info('mod: ', modalities);
    log.info('tim: ', timestamps);
    log.info('ind: ', indices);
    log.info('uni: ', unique_modalities);
    log.info('col: ', colors);

    let massPopChart = new Chart(myChart, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatter Dataset',
                data: [{
                    x: -10,
                    y: 0
                }, {
                    x: 0,
                    y: 10
                }, {
                    x: 10,
                    y: 5
                }]
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom'
                }]
            }
        }
    });
    $('.lds-ellipsis').hide('fast');
});
