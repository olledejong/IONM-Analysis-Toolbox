const { app, BrowserWindow, dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const path = require('path');
const exec = require('child_process').exec;
const log = require('electron-log');
const notifier = require('node-notifier');
console.log = log.log;
const isDev = require('electron-is-dev');

// check what environment you're running in
if (isDev) {
    log.info('Running in development');
} else {
    log.info('Running in production');
}

// notify the user that he/she has to set python src directory
notifier.notify({
    title: 'IONM Analysis Toolbox',
    message: 'Don\'t forget to set the python src directory! Do this via settings.',
    icon: path.join(__dirname, '/assets/images/icon.svg'),
    sticky: true,
    type: 'error',
    appID: 'IONM Analysis Toolbox'
});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// global list which holds the paths of the via a dialog window selected csv files.
let selectedFileHolder;

// python src directory path, which is empty on startup but can be configured via settings
pythonSrcDirectory = '';

// log options configuration
log.transports.console.format = '{h}:{i}:{s} [{level}] {text}';

/**
 *                         [ CREATE WINDOW ]
 * Creates the GUI window based on some variables to be set by developer.
 * Disable DEV TOOLS window here!
 */
function createWindow () {
    // Create the browser window
    window = new BrowserWindow({
        width: 730,
        height: 800,
        title: 'IONM Analysis Toolbox',
        icon: __dirname + '/assets/images/icon.svg',
        resizable: true,
        frame: false,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            disableBlinkFeatures : "Auxclick"
        }
    });

    // and load the index.html of the app.
    window.loadFile('src/index.html');

    // Open the DevTools.
    window.webContents.openDevTools();

    // Emitted when the window is closed.
    window.on('closed', () => {
        window = null
    });
}

app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (window === null) {
        createWindow()
    }
});


/**
 *                        [ RESIZE BROWSER WINDOW ]
 * General function for resizing the browser window, can be called from the renderer
 * process by using ipcRenderer.send('resize-window')
 *
 * @param {int} newX
 * @param {int} newY
 */
ipcMain.on('resize-window', function resizeBrowserWindow(event, newX, newY) {
    log.info('[ resizeBrowserWindow ][ resizing window to: ', newX, 'px wide and ', newY, 'px high ]');
    try {
        let currentWindowSize = window.getSize();
        if ( currentWindowSize[0] !== newX && currentWindowSize[1] !== newY) {
            window.setMinimumSize(newX, newY);
            window.setSize(newX, newY);
        }
    } catch (e) {
        event.sender.send('error', 'Something went wrong while trying to resize the browser window')
    }
});


/**
 *                      [ FILE SELECT AND STORE PATHS ]
 * This function listens to the 'select-csv-file' message from the renderer process
 * which opens a dialog where the user can select files. If canceled, do nothing
 * if completed, store the paths to files in the array selectedFileHolder.
 *
 * @param event
 * @param options
 */
ipcMain.on("select-file", function selectFileAndSendBack(event, options) {
    // open the actual dialog with the above options
    dialog.showOpenDialog(window, options).then(fileNames => {
        // if selecting is cancelled, do not send back to renderer
        selectedFileHolder = fileNames.filePaths;
        if (fileNames.canceled === true) {
            log.info("[ selectFileAndSendBack ][ File selection cancelled ]");
            event.sender.send('selected', fileNames.filePaths)
        } else {
            log.info("[ selectFileAndSendBack ][ Sending file path(s) to renderer ]");
            log.info(fileNames.filePaths);
            event.sender.send("selected", fileNames.filePaths)
        }
    })
});


/**
 *                            [ SUMMARIZE (1 of 2) ]
 * Performs commandline commands which retrieve a summary of the basic
 * information about the given ECLIPSE-files. These get sent back to the
 * Renderer process in summarizeRenderer.js
 *
 * @param {object} IpcRendererEvent, contains all information about the event
 */
ipcMain.on("run-summarize", function executeSummarizeCommand(event) {
    // window sizing logic
    if ( selectedFileHolder.length > 2 ) {
        window.setMinimumSize(1220, 900);
        window.setSize(1220, 900);
    } else if ( selectedFileHolder.length === 2 ) {
        window.setMinimumSize(1220, 550);
        window.setSize(1220, 550);
    } else {
        window.setMinimumSize(800, 550);
        window.setSize(800, 550);
    }

    // issue message to the Renderer process to set result title and loading gif
    event.sender.send('set-title-and-preloader-summarize');

    log.info("[ executeSummarizeCommand ][ executing summarize command ]");

    // for every path in selectedFileHolder execute the command 'ionm.py summarize [filepath]'
    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = `ionm.py summarize "${selectedFileHolder[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, function(error, stdout, stderr) {
            let summarize_error_message = "An error occurred while summarizing one or more files";

            // if errors occur, send an error message to the renderer process
            if (error !== null) {
                event.sender.send('error', summarize_error_message);
            } else if (stderr !== '') {
                event.sender.send('error', summarize_error_message);
            } else {
                // build json string using the command output
                let JSONstring = createJsonString(stdout);

                // send the json string back to the renderer to be displayed
                event.sender.send("summarize-result", JSONstring);
            }
        });
    }
});


/**
 *                            [ SUMMARIZE (2 of 2) ]
 * Generates JSON formatted string for front-end convenience by taking the
 * command line output and logically splitting and processing this.
 *
 * @param stdout
 * @returns {string}
 */
function createJsonString(stdout) {
    let JSON_string = '{';
    let newOut = stdout.replace(/#/g, '').replace(/\r/g, '');
    let lines = newOut.split('\n');

    let filtered = lines.filter(function (val) {
        return (val.length > 1);
    });

    for (let i = 0; i < filtered.length; i++) {
        if( !filtered[i].startsWith('\t') ) {
            let splitted = filtered[i].split(/:\s/g);
            if (splitted[1] === undefined) {
                JSON_string += "\"" + splitted[0].replace(":", '') + "\": {";
            } else {
                if(splitted[1].includes('\\')) {
                    splitted[1] = encodeURI(splitted[1])
                }
                JSON_string += "\"" + splitted[0] + "\": \"" + splitted[1] + "\",";
            }
        }
        if( filtered[i].startsWith('\t') ) {
            let splitted = filtered[i].trim();
            splitted = splitted.split(/:\s/g);
            JSON_string += "\"" + splitted[0] + "\": \"" + splitted[1] + "\"";
            if (i !== (filtered.length -1 )) {
                if (!filtered[i + 1].startsWith("\t")) {
                    JSON_string += '}';
                }
            }
            if(i === (filtered.length -1 )) {
                JSON_string += "}";
            } else {
                JSON_string += ",";
            }
        }
    }
    JSON_string += '}';
    return JSON_string;
}


/**
 *                              [ SHOW TIMING ]
 * Executes the cli python command to generate timing plots for the given files
 */
ipcMain.on('run-timing', function executeShowTimingCommand(event) {
    window.setMinimumSize(850, 400);
    window.setSize(850, 400);

    event.sender.send('set-title-and-preloader-timing');

    let pathsString = '"' + selectedFileHolder.join('" "') + '"';
    let command = `ionm.py show_timing ${pathsString}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to generate the timing plot";
        if (error !== null) {
            log.error(error);
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send('timing-result', /*JSON.parse(stdout)*/);
        }
    })
});


/**
 *                              [ SHOW EEG AVAILABILITY ]
 * Executes the cli python command to generate EEG availability plots for the given files
 */
ipcMain.on('run-timing', function executeAvailabilityCommand(event) {
    window.setMinimumSize(850, 400);
    window.setSize(850, 400);

    event.sender.send('set-title-and-preloader-availability');

    // todo| Retrieve file paths from frontend via two different text input fields which function
    // todo| like select buttons.
    let eeg_file;
    let triggered_file;
    let command = `ionm.py show_availability -c ${eeg_file} -t ${triggered_file}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to generate the EEG availability plot";
        if (error !== null) {
            log.error(error);
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send('availability-result', /*JSON.parse(stdout)*/);
        }
    })
});



/**
 *                              [ CONVERT FILE(S) ]
 * Executes the cli python command to convert the CVS files exported by the Eclipse
 * software into multiple custom CSV files: one separate file per modality.
 */
ipcMain.on('run-convert', function executeConvertCommand(event) {
    log.info('[ main.js - executeConvertCommand ][ executing convert command ]');
    event.sender.send('set-title-and-preloader-convert');

    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = `ionm.py gui_convert "${selectedFileHolder[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, function (error, stdout, stderr) {
            let errorMessage = "An error occurred while trying to run the convert command";
            if (error !== null) {
                log.error(error);
                event.sender.send('error', errorMessage);
            } else if (stderr !== '') {
                log.error(stderr);
                event.sender.send('error', errorMessage);
            } else {
                event.sender.send('convert-result', JSON.parse(stdout), selectedFileHolder[i]);
            }
        });
    }
});


/**
 *                              [ RE-RUN CONVERT ]
 * When an initial convert task fails, the user will be asked to insert the modalities
 * via forms because of which the convert failed. After this, the user gets the option
 * to re-run the convert command using the file-paths of the files that weren't correctly
 * converted in the first place.
 */
ipcMain.on('rerun-convert', function executeReRunConvertCommand(event, failedConvertFilePaths) {
    log.info('[ main.js - executeReRunConvertCommand ][ re-running the convert command using the filepaths of the converts that failed]');
    event.sender.send('set-preloader-rerun-convert');

    for(let i = 0; i < failedConvertFilePaths.length; i++) {
        let command = `ionm.py gui_convert "${failedConvertFilePaths[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, function (error, stdout, stderr) {
            let errorMessage = "An error occurred while trying to run the convert command";
            if (error !== null) {
                log.error(error);
                event.sender.send('error', errorMessage);
            } else if (stderr !== '') {
                log.error(stderr);
                event.sender.send('error', errorMessage);
            } else {
                event.sender.send('convert-result', JSON.parse(stdout), failedConvertFilePaths[i]);
            }
        });
    }
});


/**
 *                              [ COMPUTE FILE(S) ]
 *
 */
ipcMain.on('run-compute', function executeComputeCommand(event) {
    log.info('[ main.js - executeComputeCommand ][ executing compute command ]');
    event.sender.send('set-title-and-preloader-compute');

    let pathsString = '"' + selectedFileHolder.join('" "') + '"';
    let command = `ionm.py compute -f ${pathsString} -s all`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, function (error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to run the compute command";
        if (error !== null) {
            log.error(error);
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send('compute-result', stdout, selectedFileHolder);
        }
    });

});

/**
 *                              [ VERSION INFO ]
 * Handles the request for retrieving the python script its version info
 */
ipcMain.on("get-version-info", function getVersionInfo(event) {
    log.info("[ getVersionInfo ][ executing 'ionm.py version' command ]");
    exec('ionm.py version', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while retrieving the python version info";
        if (error !== null) {
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("script-version-info", stdout);
        }
    });
});


/**
 *                              [ SETTINGS (1 of 4) ]
 * Handles the retrieving of the current database settings (for now only DB path).
 * This is done by calling the ionm.py function gui_get_database
 */
ipcMain.on("get-database-settings", function getDatabaseSettings(event) {
    exec('ionm.py gui_get_database', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while retrieving the database path";
        if (error !== null) {
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("current-database-settings", stdout);
        }
    });
});

/**
 *                              [ SETTINGS (2 of 4) ]
 * Handles the retrieving of the current modality settings.
 * This is done by calling the ionm.py function gui_get_modalities
 */
ipcMain.on("get-modality-settings", function getModalitySettings(event) {
    exec('ionm.py gui_get_modalities', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while retrieving the existing modalities";

        // if errors occur, send an error message to the renderer process
        if (error !== null) {
            if (error.toString().indexOf('modalities niet vinden') >= 0) {
                errorMessage = "The database is not setup yet, please do that first!";
            }
            event.sender.send('current-modality-settings', errorMessage);
        } else if (stderr !== '') {
            if (stderr.toString().indexOf('modalities niet vinden') >= 0) {
                errorMessage = "The database is not setup yet, please do that first!";
            }
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("current-modality-settings", stdout);
        }
    });
});

/**
 *                              [ SETTINGS (3 of 4) ]
 * Handles the retrieving of the current modality settings.
 * This is done by calling the ionm.py function gui_get_modalities
 */
ipcMain.on('set-database', function setDatabasePath(event) {
    // only one file can end up here, but it still is in a list
    let new_database_path = selectedFileHolder[0];

    let command = 'ionm.py gui_set_database "' + new_database_path + '"';
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to set the database";

        // if errors occur, send an error message to the renderer process
        if (error !== null) {
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("database-set-successful", stdout);
        }
    });
});


/**
 *                  [ SETTINGS (4 of 4)  /  AFTER FAILED CONVERT ]
 * Handles the retrieving of the current modality settings.
 * This is done by calling the ionm.py function gui_get_modalities
 */
ipcMain.on('set-new-modality', function setModality(event, name, type, strategy) {
    let command = `ionm.py gui_set_modality -n "${name}" -t "${type}" -s "${strategy}`;
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to set the modality";

        // if errors occur, send an error message to the renderer process
        if (error !== null) {
            event.sender.send('error', errorMessage);
            log.error(error);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("set-modality-successful", name);
        }
    });
});


/**
 *                      [ SETTINGS 5/5 - PYTHON SRC DIRECTORY ]
 */
ipcMain.on('get-python-src-dir-setting', function (event) {
    event.sender.send('current-python-src-dir', pythonSrcDirectory);
});

ipcMain.on('set-python-src-dir', function (event) {
    try {
        let new_src_dir_path = selectedFileHolder[0];
        pythonSrcDirectory = new_src_dir_path;
    } catch (e) {
        event.sender.send('error', 'An error occurred while trying to set the src directory')
    } finally {
        event.sender.send('successfully-set-src-dir')
    }
});


/**
 * Shows a confirmation box to the user for safety purposes
 */
ipcMain.on('showConfirmationBox', function (event, options) {
    dialog.showMessageBox(window, options).then(r => {
        if (r.response !== 0) {
            event.sender.send('cancelled')
        } else {
            setupDatabase(event)
        }
    })
});

/**
 * Calls the python function that sets up the database via a ChildProcess
 * @param event
 */
function setupDatabase(event) {
    event.sender.send('setting-up-database');

    exec('ionm.py gui_setup', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to setup the database";

        // if errors occur, send an error message to the renderer process
        if (error !== null) {
            event.sender.send('error', errorMessage);
            log.error(error);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("database-setup-successful", stdout);
        }
    });
}