//==================================================================
//                      File Select Handler
//==================================================================
// This file is responsible for telling the main process to open a
// file / dir selection window. The handling of the response of those
// windows happens inside the renderer process of the tool that the
// specific selection window was meant for.
//==================================================================

//==================================================================
//                            GENERAL
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of general
// tools
//==================================================================
variable_content.on('click', '.csv-select-btn', () => {
    let tool = 'general';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select file(s)',
        filters: types,
        properties: ['openFile', 'multiSelections']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                            GENERAL
//==================================================================
// Receive the information of the selected files via message
// "selected-general" and display the filenames
//
// @param {object} event
// @param {array} paths - contains paths of all selected files
//==================================================================
ipcRenderer.on('selected-general', (event, paths) => {
    // jQuery selector(s)
    let run_button = $('.run-button');
    let selected_filenames_p = $('#selected-filenames');

    // only do something if there are actually files are selected
    if(paths.length !== 0) {
        selected_filenames_p.css({
            'position' : 'relative',
            'left' : '0',
            'top' : '0',
            'margin': '8px 0 8px 15px',
            'transform': 'none',
        });
        // set text inside the button to selected files
        selected_filenames_p.html(generateFilenames(paths));

        // show run button and enable it
        if ( run_button.prop('disabled') === true ) {
            run_button.css({
                'right': '0',
                'opacity' : '1'
            });
        }
        run_button.prop('disabled', false);

    // disable run button when file selection cancelled
    } else {
        selected_filenames_p.css({
            'position' : 'absolute',
            'left' : '50%',
            'top' : '50%',
            'margin': '0',
            'transform': 'translate(-50%, -50%)',
        });
        selected_filenames_p.html('No files selected');
        run_button.css({
            'right': '-100px',
            'opacity' : '0'
        });
        run_button.prop('disabled', true);
    }
});


//==================================================================
//                            GENERAL
//==================================================================
// Generates displayable html strings for every absolute path in the
// given array.
//
// @param {string} paths
// @returns {string} a filename followed by a html linebreak
//==================================================================
function generateFilenames(paths) {
    let fileNameList = [];
    // loop through list of filepaths
    for (let i = 0; i < paths.length; i++) {
        let lastIndex = paths[i].lastIndexOf('\\');
        let substring = paths[i].substring((lastIndex + 1), paths[i].length);
        // after every two filenames push a linebreak, but dont do this for the first element
        fileNameList.push(substring);
        fileNameList.push('<br>');
    }
    return fileNameList.join('');
}


//==================================================================
//                         AVAILABILITY
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// availability tool
//==================================================================
variable_content.on('click', '#a-eeg-select-btn', () => {
    let tool = 'availability';
    let label = 'eeg';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select electroencephalography (EEG) file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool, label);
});


//==================================================================
//                         AVAILABILITY
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// availability tool
//==================================================================
variable_content.on('click', '#a-trg-select-btn', () => {
    let tool = 'availability';
    let label = 'trg';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select triggered (TRG) file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool, label);
});


//==================================================================
//                            COMPUTE
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// compute tool
//==================================================================
variable_content.on('click', '#compute-select-btn', () => {
    let tool = 'compute';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select a converted file',
        filters: types,
        properties: ['openFile', 'multiSelections']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                           EXTRACT
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// extract tool
//==================================================================
variable_content.on('click', '#e-eeg-select-btn', () => {
    let tool = 'extract';
    let label = 'eeg';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select electroencephalography (EEG) file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool, label);
});


//==================================================================
//                           EXTRACT
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// extract tool
//==================================================================
variable_content.on('click', '#e-trg-select-btn', () => {
    let tool = 'extract';
    let label = 'trg';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select triggered (TRG) file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool, label);
});


//==================================================================
//                           VALIDATE
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of the
// validating an extracted file.
//==================================================================
variable_content.on('click', '#validate-select-btn', () => {
    let tool = 'validate';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select an extracted file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                           COMBINE
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of
// combining database data with an EEG file.
//==================================================================
variable_content.on('click', '#combine-select-btn', () => {
    let tool = 'combine';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select a file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                           CLASSIFY
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of
// classifying files for F-wave presence
//==================================================================
variable_content.on('click', '#classify-select-btn', () => {
    let tool = 'classify';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select a converted file',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                           DATABASE
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of setting
// the database path via the app settings
//==================================================================
variable_content.on('click', '#select-database-btn', () => {
    let tool = 'database';
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['accdb'] }
    ];
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select database',
        filters: types,
        properties: ['openFile']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                           SRC DIR
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting of files is for the purpose of setting
// the python project its location (src dir)
//==================================================================
variable_content.on('click', '#select-src-dir', () => {

    let tool = 'src-dir';
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select Python Project SRC Directory',
        properties: ['openDirectory']
    };
    ipcRenderer.send('select-file', options, tool);
});


//==================================================================
//                  DEFAULT SELECTION DIRECTORY
//==================================================================
// Informs the main process it has to open a select file window and
// lets it know the selecting is for the purpose of setting
// the default file selection directory when opening selecting files
// to run tools on
//==================================================================
variable_content.on('click', '#select-default-dir', () => {

    let tool = 'default-select-dir';
    // configure the options (allowed types + properties)
    const options = {
        title: 'Select default file / directory select path',
        properties: ['openDirectory']
    };
    ipcRenderer.send('select-file', options, tool);
});