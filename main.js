//==================================================================
// Create browser window / the app its logic
//==================================================================
// This file is responsible for creating the single browser window
// and communicating with the python project. It runs the commands
// when asked to by one of the renderer processes and returns the
// data (if needed) back to the renderer process the task came from
//==================================================================

// requires (electron)
const { app, BrowserWindow, dialog, screen } = require('electron');
const ipcMain = require('electron').ipcMain;
const exec = require('child_process').exec;
const log = require('electron-log');
console.log = log.log;
const isDev = require('electron-is-dev');
const Store = require('electron-store');
const ps = require('ps-node');
const { autoUpdater } = require('electron-updater');

// create store object for user preferences
const store = new Store();
log.info('User preferences stored at: ', app.getPath('userData'));

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// global list which holds the paths of the via a dialog window selected csv files.
let selectedFileHolder;

// python renderer directory, retrieved from user-preferences on startup, can be changed via settings
let pythonSrcDirectory = store.get('python-src-dir');
let defaultFileSelectionDir = store.get('default-select-path');

// log options configuration
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';

//==================================================================
// Create browser window / the app its logic
//==================================================================
function createWindow () {
    // Create the browser window
    window = new BrowserWindow({
        show: false,
        width: 1065,
        height: 728,
        title: 'IONM Analysis Toolbox',
        icon: __dirname + './assets/images/app_icon.ico',
        resizable: true,
        maximizable: true,
        frame: false,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            disableBlinkFeatures : 'Auxclick'
        }
    });

    window.on('unresponsive', () => {
        dialog.showErrorBox('Oh no, the application has become unresponsive!',
            'Please quit the application and try to restart it. Force quit it via Task Manager if you have to.');
    });

    // and load the index.html of the app.
    window.loadFile('index.html');

    // once everything is loaded, show window
    window.webContents.on('did-finish-load', () => {
        window.show();
        autoUpdater.checkForUpdates();
    });

    // check what environment you're running in
    if (isDev) {
        log.info('Running in development');

        // open the DevTools.
        window.webContents.openDevTools();
        window.resizable = true;

        // enable debug
        const debug = require('electron-debug');
        debug();

        // if in dev, if secondary window, open there.
        let displays = screen.getAllDisplays();
        let externalDisplay = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0;
        });
        if (externalDisplay) {
            window.setPosition(externalDisplay.bounds.x + 150, externalDisplay.bounds.y + 150);
        }
    } else {
        log.info('Running in production');
    }

    // renderer crash results in restart
    window.webContents.on('crashed', () => {
        app.relaunch();
        app.quit();
    });
}

// when app started, create window
app.on('ready', () => {
    createWindow();
});

// when (only) window is closed
app.on('window-all-closed', async () => {
    window = null;
    // stop sending memory usage to window renderer
    clearInterval(getMemoryUsageInterval);
    // clean up background processes
    log.info('Attempting to quit the application..');
    log.info('Looking for unwanted running processes..');
    new Promise((resolve) => {
        cleanUpProcesses(resolve);
    }).then(() => {
        log.info('Now actually quitting, bye..');
        app.quit();
    });
});


//==================================================================
// Cleans up all remaining running python processes created by this
// application its session.
//
// @param resolve - return type of a promise
//==================================================================
function cleanUpProcesses(resolve) {
    // simple lookup for python processes
    ps.lookup({command: 'python.exe'}, (err, resultList) => {
        let i = 0;
        let numberOfProcessesFound = resultList.length;
        if (numberOfProcessesFound === 0) {
            log.info('Encountered no unwanted running processes!');
            resolve('done');
        }
        // for every python process that was found
        resultList.forEach((process) => {
            i++;
            // if process was created by this application
            if (process.arguments[0].includes('ionm.py')) {
                log.info(`Killing a '${process.arguments[1]}' process..`);
                // kill the unwanted background process
                let command = `taskkill /F /pid ${process.pid}`;
                exec(command, (error, stdout, stderr) => {
                    if (error) {
                        log.error(error);
                    } else if (stderr) {
                        log.error(stderr);
                    } else {
                        log.info(stdout);
                    }
                });
            }
        });
        // if iteration count is equal to length of python processes found
        if (i === numberOfProcessesFound) {
            resolve('done');
        }
    });
}

//==================================================================
//                         AUTO-UPDATER
//==================================================================
// Resizes the browser window, can be called from one of the
// renderer processes for the purpose fitting the content better
//
// @param {string} text - the message itself
// @param {string} level - the level of significance of the message
//==================================================================
function sendStatusToWindow(text, level) {
    try {
        window.webContents.send('message', text, level);
    } catch (e) {
        log.info('Browser window probably already closed, no biggie, ignoring..');
    }
}

autoUpdater.on('update-available', () => {
    sendStatusToWindow('Update available! Downloading..', 'info');
});

autoUpdater.on('update-not-available', () => {
    sendStatusToWindow('Application is up-to-date!', 'info');
});

autoUpdater.on('error', (err) => {
    sendStatusToWindow('An error occurred while checking for updates', 'error');
    log.error('An error occurred during the auto-update mechanism', err);
});

autoUpdater.on('update-downloaded', () => {
    // Wait 5 seconds, then quit and install
    sendStatusToWindow('Update downloaded, restarting in 5 seconds!', 'warn');

    setTimeout(() => {
        autoUpdater.quitAndInstall();
    }, 5000);
});


//==================================================================
//                    RESIZE BROWSER WINDOW
//==================================================================
// Resizes the browser window, can be called from one of the
// renderer processes for the purpose fitting the content better
//
// @param {object} event - for purpose of communication with sender
// @param {int} newX
// @param {int} newY
//==================================================================
ipcMain.on('resize-window', (event, newX, newY) => {
    try {
        let currentWindowSize = window.getSize();
        if ( currentWindowSize[0] !== newX && currentWindowSize[1] !== newY) {
            window.setMinimumSize(newX, newY);
            window.setSize(newX, newY, true);
        }
    } catch (e) {
        try {
            event.sender.send('error', 'Something went wrong while trying to resize the browser window');
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    }
});

//========================================================================
//                    FILE SELECT AND STORE PATHS
//========================================================================
// Opens a dialog where the user can select files. If canceled, do nothing
// if completed, store the paths to files in the array selectedFileHolder.
//
// @param {object} event - for purpose of communication with sender
// @param {Object} options - Options for the showOpenDialog method
//        (directory or file / multi selection or single file etc)
// @param {string} tool - tag that defines where the select-file message
//         came from (purpose: correct handling of select output)
//========================================================================
ipcMain.on('select-file', (event, options, tool, label) => {
    options.defaultPath = defaultFileSelectionDir;
    // open the actual dialog with the above options
    dialog.showOpenDialog(window, options).then(fileNames => {
        // if selecting is cancelled, do not send back to renderer
        selectedFileHolder = fileNames.filePaths;
        try {
            switch (tool) {
            case 'general':
                event.sender.send('selected-general', fileNames.filePaths, label);
                break;
            case 'src-dir':
                event.sender.send('selected-src-dir', fileNames.filePaths, label);
                break;
            case 'database':
                event.sender.send('selected-database', fileNames.filePaths, label);
                break;
            case 'default-select-dir':
                event.sender.send('selected-default-select-dir', fileNames.filePaths, label);
                break;
            case 'availability':
                event.sender.send('selected-availability', fileNames.filePaths, label);
                break;
            case 'compute':
                event.sender.send('selected-compute', fileNames.filePaths, label);
                break;
            case 'validate':
                event.sender.send('selected-validate', fileNames.filePaths, label);
                break;
            case 'extract':
                event.sender.send('selected-extract', fileNames.filePaths, label);
                break;
            case 'combine':
                event.sender.send('selected-combine', fileNames.filePaths, label);
                break;
            case 'classify':
                event.sender.send('selected-classify', fileNames.filePaths, label);
                break;
            }
        } catch (e) {
            log.error('Caught an error while opening a dialog: \n', e);
        }
    });
});


//==========================================================================
//                           SUMMARIZE 1/2
//==========================================================================
// Performs the summarize command and parses the outcome into JSON data by 
// calling on createJsonString().This gets sent back to the renderer process
// where it is displayed.
//
// @param {object} event - for purpose of communication with sender
//==========================================================================
ipcMain.on('run-summarize', (event) => {
    // window sizing logic
    if ( selectedFileHolder.length > 2 ) {
        window.setMinimumSize(1360, 900);
        window.setSize(1360, 900);
    } else if ( selectedFileHolder.length === 2 ) {
        window.setMinimumSize(1360, 550);
        window.setSize(1360, 550);
    } else {
        window.setMinimumSize(720, 535);
        window.setSize(720, 535);
    }

    // issue message to the Renderer process to set result title and loading gif
    event.sender.send('set-title-and-preloader-summarize');
    log.info('Creating child-process and running the summarize command');

    // for every path in selectedFileHolder execute the command 'ionm.py summarize [filepath]'
    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = `python ionm.py summarize "${selectedFileHolder[i]}"`;
        log.info(command);
        exec(command, {
            cwd: pythonSrcDirectory
        }, (error, stdout, stderr) => {
            try {
                // if errors occur, send an error message to the renderer process
                if (error || stderr) {
                    event.sender.send('error', 'An error occurred while summarizing one or more files', 'summarize');
                } else {
                    // build json string using the command output
                    let JSONstring = createJsonString(stdout);
                    // send the json string back to the renderer to be displayed
                    event.sender.send('summarize-result', JSONstring);
                }
            } catch (e) {
                log.error('Caught an error while trying to send data to the renderer process: \n', e);
            }
        });
    }
});

//==================================================================================
//                                SUMMARIZE 2/2
//==================================================================================
// Generates JSON formatted string for front-end convenience by taking the command 
// line output and logically splitting and processing this.
// 
// @param {object} stdout - unprocessed output from summarize execution
// @returns {string} JSON_string - contains the JSON formatted information as string
//===================================================================================
function createJsonString(stdout) {
    let JSON_string = '{';
    let newOut = stdout.replace(/#/g, '').replace(/\r/g, '');
    let lines = newOut.split('\n');

    let filtered = lines.filter((val) => {
        return (val.length > 1);
    });

    for (let i = 0; i < filtered.length; i++) {
        if( !filtered[i].startsWith('\t') ) {
            let splitted = filtered[i].split(/:\s/g);
            if (splitted[1] === undefined) {
                JSON_string += '"' + splitted[0].replace(':', '') + '": {';
            } else {
                if(splitted[1].includes('\\')) {
                    splitted[1] = encodeURI(splitted[1]);
                }
                JSON_string += '"' + splitted[0] + '": "' + splitted[1] + '",';
            }
        }
        if( filtered[i].startsWith('\t') ) {
            let splitted = filtered[i].trim();
            splitted = splitted.split(/:\s/g);
            JSON_string += '"' + splitted[0] + '": "' + splitted[1] + '"';
            if (i !== (filtered.length -1 )) {
                if (!filtered[i + 1].startsWith('\t')) {
                    JSON_string += '}';
                }
            }
            if(i === (filtered.length -1 )) {
                JSON_string += '}';
            } else {
                JSON_string += ',';
            }
        }
    }
    JSON_string += '}';
    return JSON_string;
}


//==================================================================
//                           SHOW TIMING
//==================================================================
// Executes the 'show timing' command and informs the renderer when 
// it is completed
// 
// @param {object} event - for purpose of communication with sender
//==================================================================
ipcMain.on('run-timing', (event) => {
    event.sender.send('set-title-and-preloader-timing');

    let pathsString = '"' + selectedFileHolder.join('" "') + '"';
    let command = `python ionm.py show_timing ${pathsString}`;
    log.info('Creating child-process and running the timing command');
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to generate the timing plot', 'timing');
            } else {
                event.sender.send('timing-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//=====================================================================
//                       SHOW EEG AVAILABILITY
//=====================================================================
// Executes the availability command to generate EEG availability plots
// for the given files.
//
// @param {string} eeg_file_path - file path to the selected EEG file
// @param {string} trg_file_path - file path to the selected TRG file
// @param {object} event - for purpose of communication with sender
//=====================================================================
ipcMain.on('run-availability', (event, eeg_file_path, trg_file_path, window_size) => {
    event.sender.send('set-title-and-preloader-availability');

    let command = `python ionm.py show_availability -c "${eeg_file_path}" -t "${trg_file_path}" -w ${window_size}`;
    log.info('Creating child-process and running the \'show availability\' command');
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to generate the EEG availability plot', 'availability');
            } else {
                event.sender.send('availability-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//====================================================================
//                              CONVERT
//====================================================================
// Executes the convert command to convert the CVS files exported by
// the Eclipse software into multiple custom CSV files: one separate
// file per modality.
//
// @param {object} event - for purpose of communication with sender
//====================================================================
ipcMain.on('run-convert', (event) => {
    log.info('Executing the convert command');
    event.sender.send('set-title-and-preloader-convert');

    log.info('Creating child-process and running the convert command');
    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = `python ionm.py gui_convert "${selectedFileHolder[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, (error, stdout, stderr) => {
            let filename = selectedFileHolder[i].substr(selectedFileHolder[i].lastIndexOf('\\') + 1,)
            try {
                if (error || stderr) {
                    event.sender.send('error', `Could not execute convert command for the file ${filename}`, 'convert');
                } else {
                    event.sender.send('convert-result', JSON.parse(stdout), selectedFileHolder[i], selectedFileHolder.length);
                }
            } catch (e) {
                log.error('Caught an error while trying to send data to the renderer process: \n', e);
            }
        });
    }
});


//============================================================================
//                             RE-RUN CONVERT
//============================================================================
// When an initial convert task fails, the user will be asked to insert the
// modalities via forms because of which the convert failed. After this, the
// user gets the option to re-run the convert command using the file-paths of
// the files that weren't correctly
//
// @param {object} event - for purpose of communication with sender
//============================================================================
ipcMain.on('rerun-convert', (event, failedConvertFilePaths) => {
    log.info('Re-running the convert command using the file-paths of the converts that failed before');
    event.sender.send('set-preloader-rerun-convert');

    for(let i = 0; i < failedConvertFilePaths.length; i++) {
        let command = `python ionm.py gui_convert "${failedConvertFilePaths[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, (error, stdout, stderr) => {
            try {
                if (error || stderr) {
                    event.sender.send('error', `Could not execute convert command for the file ${selectedFileHolder[i]}`, 'convert');
                } else {
                    event.sender.send('convert-result', JSON.parse(stdout), failedConvertFilePaths[i], failedConvertFilePaths.length, selectedFileHolder.length);
                }
            } catch (e) {
                log.error('Caught an error while trying to send data to the renderer process: \n', e);
            }
        });
    }
});


//==============================================================================
//                            COMPUTE STATISTICS
//==============================================================================
// Calls the python compute function which computes the statistics of converted
// files and writes these to the database.
//
// @param {object} event - for purpose of communication with sender
// @param {string} stats - determines which types of statistics will be computed
//==============================================================================
ipcMain.on('run-compute', (event, stats) => {
    log.info('Executing the compute command');
    event.sender.send('set-title-and-preloader-compute');

    let pathsString = '"' + selectedFileHolder.join('" "') + '"';
    let command = `python ionm.py compute -f ${pathsString} -s ${stats}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to run the compute command', 'compute');
            } else {
                event.sender.send('compute-result', stdout, selectedFileHolder);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//============================================================================
//                              EXTRACT EEG
//============================================================================
// Gets eeg data from every TES-MEP where it is available and puts them in a
// new csv file.
//
// @param {object} event - for purpose of communication with sender
// @param {string} eeg_file_path - file path to selected eeg file
// @param {string} trg_file_path - file path to selected trg file
//============================================================================
ipcMain.on('run-extract', (event, eeg_file_path, trg_file_path) => {
    log.info('Executing the extract command');
    event.sender.send('set-title-and-preloader-extract');

    let command = `python ionm.py extract_eeg -c "${eeg_file_path}" -t "${trg_file_path}"`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to extract the data from the files', 'extract');
            } else {
                event.sender.send('extract-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//============================================================================
//                                VALIDATE
//============================================================================
// Creates validation screens for the user to exclude artifact data in the
// combined EEG, TES MEP data.
//
// @param {object} event - for purpose of communication with sender
// @param {string} extracted_file - path to the selected extracted file
//============================================================================
ipcMain.on('run-validate', (event, extracted_file) => {
    log.info('Executing the validate command');
    event.sender.send('set-title-and-preloader-validate');

    let command = `python ionm.py validate -f ${extracted_file}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to validate the file', 'validate');
            } else {
                event.sender.send('validate-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//============================================================================
//                                COMBINE
//============================================================================
// Combines statistics from the database with values from an output file of a
// program created by Jan-Willem. Also adds the patient ID to the output file.
//
// @param {object} event - for purpose of communication with sender
// @param {string} extracted_file - path to the selected extracted file
// @param {int} patient_id - identifier that points to a patient
//============================================================================
ipcMain.on('run-combine', (event, extracted_file, patient_id) => {
    log.info('Executing the combine command');
    event.sender.send('set-title-and-preloader-combine');

    let command = `python ionm.py combine -f ${extracted_file} -p ${patient_id}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to combine the file', 'combine');
            } else {
                event.sender.send('combine-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//============================================================================
//                                CLASSIFY
//============================================================================
// Classifies signals in a file on the presence of F-waves
//
// @param {object} event - for purpose of communication with sender
// @param {string} extracted_file - path to the selected extracted file
// @param {int} patient_id - identifier that points to a patient
//============================================================================
ipcMain.on('run-classify', (event, converted_file) => {
    log.info('Executing the classify command');
    event.sender.send('set-title-and-preloader-classify');

    let command = `python ionm.py classify -f ${converted_file}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to classify for F-waves', 'classify');
            } else {
                event.sender.send('classify-result');
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//=============================================================================
//                           ABOUT / VERSION INFO
//=============================================================================
// Handles the request for retrieving the python script its version info. Sends
// the output back to the front-end.
//
// @param {object} event - for purpose of communication with sender
//=============================================================================
ipcMain.on('get-version-info', (event) => {
    log.info('Executing the version command');
    exec('python ionm.py version', {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while retrieving the python version info');
            } else {
                event.sender.send('script-version-info', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//===================================================================================
//                             GET CURRENT APP SETTINGS
//===================================================================================
// Handles the retrieving of the current database settings (db / modalities / trace)
// This is done by calling the ionm.py functions gui_get_database, gui_get_modalities
// and gui_get_trace_settings
//
// @param {object} event - for purpose of communication with sender
//===================================================================================
ipcMain.on('get-current-settings', (event) => {
    // get python project dir from user preferences
    try {
        if (store.get('python-src-dir')) {
            // get settings
            event.sender.send('current-default-select-dir', store.get('default-select-path'));
            event.sender.send('current-python-src-dir', store.get('python-src-dir'));
            getDatabaseSettings(event);
            getModalitySettings(event);
            getTraceSelectionSettings(event);
        } else {
            event.sender.send('current-python-src-dir', 'No python src directory configured');
        }
    } catch (e) {
        log.error('Caught an error while trying to send data to the renderer process: \n', e);
    }
});

function getDatabaseSettings(event) {
    exec('python ionm.py gui_get_database', {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while retrieving the database path');
                event.sender.send('current-database-settings', 'error');
            } else {
                event.sender.send('current-database-settings', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
}

function getModalitySettings(event) {
    exec('python ionm.py gui_get_modalities', {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            // if errors occur, send an error message to the renderer process
            if (error || stderr) {
                // if error originated because of table not being present
                if (error.toString().indexOf('Microsoft Access Driver') >= 0 || stderr.toString().indexOf('Microsoft Access Driver') >= 0) {
                    event.sender.send('current-modality-settings', 'The database is not setup yet, please do that first!');
                    // if caused by something else
                } else {
                    event.sender.send('error', 'An error occurred while retrieving the modalities');
                    event.sender.send('current-modality-settings', 'An error occurred while retrieving the modalities');
                }
                // if no error
            } else {
                // send result data to renderer
                event.sender.send('current-modality-settings', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
}

function getTraceSelectionSettings(event) {
    exec('python ionm.py gui_get_trace_settings', {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while retrieving the trace selection settings');
            } else {
                event.sender.send('current-trace-settings', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
}


//==========================================================================
//                      SETTINGS - SET DATABASE PATH
//==========================================================================
// Writes the database path given by user to the config.ini by executing
// the gui_set_database function in the python project.
//
// @param {object} event - for purpose of communication with sender
//==========================================================================
ipcMain.on('set-database', (event, new_database_path) => {
    let command = 'python ionm.py gui_set_database "' + new_database_path + '"';
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            // if errors occur, send an error message to the renderer process
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to set the database');
            } else {
                event.sender.send('database-set-successful', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//=====================================================================================
//                            SETTINGS - SET NEW MODALITY
//=====================================================================================
// Stores new modality in the configured database. This function is either called via
// settings or after the converting of a file failes because one or more of the
// encountered modalities have not been configured.
//
// @param {object} event - for purpose of communication with sender
// @param {string} name - name of the to be stored modality
// @param {string} type - type of the to be stored modality (TRIGGERED or FREE_RUNNING)
// @param {string} strategy - strategy of the to be stored modality (DIRECT or AVERAGE)
//=====================================================================================
ipcMain.on('set-new-modality', (event, name, type, strategy, tool) => {
    let command = `python ionm.py gui_set_modality -n "${name}" -t "${type}" -s "${strategy}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            // if errors occur, send an error message to the renderer process
            if (error || stderr) {
                event.sender.send('error', `An error occurred while trying to set the modality ${name}`);
            } else {
                if (tool === 'convert') {
                    event.sender.send('set-modality-successful-convert', name);
                } else {
                    event.sender.send('set-modality-successful-settings', name);
                }
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//==========================================================================
//                      SETTINGS - SET PYTHON SRC DIR
//==========================================================================
// Stores the location of the python project in the user its AppData using
// electron-store module. Also saves it in the application session.
//
// @param {object} event - for purpose of communication with sender
// @param {string} src_dir - path of the to be set python renderer directory
//==========================================================================
ipcMain.on('set-python-src-dir', (event, src_dir) => {
    try {
        // store the given path in user-preferences (if already exists it will be updated)
        store.set('python-src-dir', src_dir);
        // locally set the python renderer dir path for further use in the application
        pythonSrcDirectory = src_dir;
    } catch (e) {
        try {
            event.sender.send('error', 'An error occurred while trying to set the python renderer directory');
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    } finally {
        try {
            event.sender.send('successfully-set-src-dir');
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    }
});


//====================================================================================
//                     SETTINGS - SET DEFAULT SELECT DIRECTORY
//====================================================================================
// Stores the given default select directory path for user convenience. This way
// the user doesnt have to click through multiple windows to get to their data folder.
//
// @param {object} event - for purpose of communication with sender
// @param {string} default_select_dir - path of the to be set default select dir
//====================================================================================
ipcMain.on('set-default-select-dir', (event, default_select_dir) => {
    try {
        // store the given path in user-preferences (if already exists it will be updated)
        store.set('default-select-path', default_select_dir);
        // locally set the python renderer dir path for further use in the application
        defaultFileSelectionDir = default_select_dir;
    } catch (e) {
        try {
            event.sender.send('error', 'An error occurred while trying to set the default select directory');
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    } finally {
        try {
            event.sender.send('successfully-set-default-select-dir');
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    }
});


//===============================================================================
//                        SETTINGS - SET CHUNK SIZE
//===============================================================================
// Stores the new chunk size setting in the config.ini file. This function is on
// in the settings section of the application
//
// @param {object} event - for purpose of communication with sender
// @param {string} chunk_size - the amount of signals that the user sees at once
//===============================================================================
ipcMain.on('set-chunk-size', (event, chunk_size) => {
    let command = `python ionm.py gui_set_chunk_size ${chunk_size}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        try {
            // if errors occur, send an error message to the renderer process
            if (error || stderr) {
                event.sender.send('error', 'An error occurred while trying to set the chunk size setting');
            } else {
                event.sender.send('chunk-size-set-successful', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
});


//===============================================================================
//                   SETTINGS - SETUP DATABASE CONFIRMATION BOX
//===============================================================================
// Shows a confirmation box to the user for safety purposes. Used only for
// sensitive user decisions.
//
// @param {object} event - for purpose of communication with sender
// @param {object} options - options for the to be thrown confirmation box
//===============================================================================
ipcMain.on('show-confirmation-box', (event, options) => {
    dialog.showMessageBox(window, options).then(r => {
        if (r.response !== 0) {
            try {
                event.sender.send('cancelled');
            } catch (e) {
                log.error('Caught an error while trying to send data to the renderer process: \n', e);
            }
        } else {
            try {
                setupDatabase(event);
            } catch (e) {
                log.error('Caught an error while trying to setup the database: \n', e);
            }
        }
    });
});


//===============================================================================
//                         SETTINGS - SETUP DATABASE
//===============================================================================
// Executes the python function that sets up the database via a ChildProcess
// Only executed if user proceeds from confirmation box.
//
// @param {object} event - for purpose of communication with sender
//===============================================================================
function setupDatabase(event) {
    event.sender.send('setting-up-database');
    exec('python ionm.py gui_setup', {
        cwd: pythonSrcDirectory
    }, (error, stdout, stderr) => {
        let errorMessage = 'An error occurred while trying to setup the database';
        try {
            // if errors occur, send an error message to the renderer process
            if (error || stderr) {
                event.sender.send('error', errorMessage);
            } else {
                event.sender.send('database-setup-successful', stdout);
            }
        } catch (e) {
            log.error('Caught an error while trying to send data to the renderer process: \n', e);
        }
    });
}


//==================================================================
// Machine memory usage
//==================================================================
const getMemoryUsageInterval = setInterval(() => {
    // get memory usage
    let systemMemoryInfo = process.getSystemMemoryInfo();
    let memoryUsed = (systemMemoryInfo['total'] - systemMemoryInfo['free']);
    let percOfMemUsed = ((memoryUsed / systemMemoryInfo['total']) * 100);
    window.webContents.send('memory-usage', Math.round(percOfMemUsed));
}, 1000);