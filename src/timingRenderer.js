// requires
window.$ = window.jQuery = require('jquery');
const ChartJs = require('chart.js');

// jQuery selectors
let variableContent = $("#variable-content");

// jQuery selectors
/**
 * On clicking the RUN button on the summarize page, the page
 * will be cleared to be later filled with the skeleton for
 * the eventual results.
 * Of course also tells the main process to run the summarize
 * command.
 */
variableContent.on("click", '#run-timing', function() {
    variableContent.html('<canvas id="line-chart" width="800" height="450"></canvas>');
    ipcRenderer.send("run-timing");

    new Chart($('#line-chart'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Scatter Dataset',
                borderColor: '#c00a00',
                backgroundColor: '#c00a00',
                data: [{
                    x: 5,
                    y: 4
                }, {
                    x: 2,
                    y: 14
                }, {
                    x: 4,
                    y: 12
                }, {
                    x: 2,
                    y: 10
                }, {
                    x: 3,
                    y: 4
                }, {
                    x: 3,
                    y: 5
                }, {
                    x: 3,
                    y: 8
                }, {
                    x: 6,
                    y: 12
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

    Chart.plugins.register({
        beforeDraw: function(chartInstance) {
            var ctx = chartInstance.chart.ctx;
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
        }
    })
});

/**
 * This function is executed when the main process sends the
 * message 'set-title-and-preloader'. The result page skeleton
 * and preloader will be set.
 */
ipcRenderer.on('set-title-and-preloader', function (event) {
    variableContent.html(
        `<h2 id="summarize-result-title">Resulting summarized information</h2>
         <div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
         <div id="summarize-results"></div>`);
    // hide summarize results div untill it actually gets some results
    $('#summarize-results').hide();
});

