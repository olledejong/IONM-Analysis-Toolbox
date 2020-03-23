/**
 * main.js is responsible for creating the single browser window and
 * communicating with the python project.
 * It runs the commands when asked to by one of the renderer processes
 * and returns the data (if needed) back to the renderer process the
 * task came from.
 */
// requires (electron)
const { app, BrowserWindow, dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const debug = require('electron-debug');
const exec = require('child_process').exec;
const log = require('electron-log');
console.log = log.log;
const isDev = require('electron-is-dev');
const Store = require('electron-store');

// create store object for user preferences
const store = new Store();
log.info('User preferences stored at: ', app.getPath('userData'));

// enable debug
debug();

// check what environment you're running in
if (isDev) {
    log.info('Running in development');
} else {
    log.info('Running in production');
}

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// global list which holds the paths of the via a dialog window selected csv files.
let selectedFileHolder;

// python src directory, retrieved from user-preferences on startup, can be changed via settings
pythonSrcDirectory = store.get('python-src-dir');

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
        show: false,
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

    // once everything is loaded, show window
    window.once('ready-to-show', () => {
        window.show()
    });

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
 *                         |> RESIZE BROWSER WINDOW <|
 * Resizes the browser window, can be called from one of the renderer processes
 *
 * @param {object} event - for purpose of communication with sender
 * @param {int} newX
 * @param {int} newY
 */
ipcMain.on('resize-window', function resizeBrowserWindow(event, newX, newY) {
    log.info('Resizing window to ', newX, ' x ', newY);
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
 *                       |> FILE SELECT AND STORE PATHS <|
 * Opens a dialog where the user can select files. If canceled, do nothing
 * if completed, store the paths to files in the array selectedFileHolder.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {Object} options - Options for the showOpenDialog method (directory or file / multi selection or single file etc)
 * @param {string} tool - tag that defines where the select-file message came from (purpose: correct handling of select output)
 */
ipcMain.on("select-file", function selectFileAndSendBack(event, options, tool, label) {
    // open the actual dialog with the above options
    dialog.showOpenDialog(window, options).then(fileNames => {
        // if selecting is cancelled, do not send back to renderer
        selectedFileHolder = fileNames.filePaths;
        log.info("[ selectFileAndSendBack ][ Sending file path(s) to renderer ]");
        log.info(fileNames.filePaths);
        if (tool === 'general') {
            event.sender.send("selected-general", fileNames.filePaths, label)
        } else if (tool === 'src-dir') {
            event.sender.send("selected-src-dir", fileNames.filePaths, label)
        } else if (tool === 'database') {
            event.sender.send("selected-database", fileNames.filePaths, label)
        } else if (tool === 'availability') {
            event.sender.send("selected-availability", fileNames.filePaths, label)
        }
    })
});


/**
 *                              |> SUMMARIZE 1/2 <|
 * Performs the summarize command and parses the outcome into JSON data by calling on
 * createJsonString().This gets sent back to the renderer process where it is displayed.
 *
 * @param {object} event - for purpose of communication with sender
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

    log.info("Creating child-process and running the summarize command");

    // for every path in selectedFileHolder execute the command 'ionm.py summarize [filepath]'
    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = `ionm.py summarize "${selectedFileHolder[i]}"`;
        exec(command, {
            cwd: pythonSrcDirectory
        }, function(error, stdout, stderr) {
            let summarize_error_message = "An error occurred while summarizing one or more files";

            // if errors occur, send an error message to the renderer process
            if (error !== null) {
                log.error(error);
                event.sender.send('error', summarize_error_message);
            } else if (stderr !== '') {
                log.error(stderr);
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
 *                          |> SUMMARIZE 1/2 <|
 * Generates JSON formatted string for front-end convenience by taking the
 * command line output and logically splitting and processing this.
 *
 * @param stdout
 * @returns {string} JSON_string - contains the JSON formatted information as string
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
 *                              |> SHOW TIMING <|
 * Executes the 'show timing' command and informs the renderer when it is completed
 *
 * @param {object} event - for purpose of communication with sender
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
            event.sender.send('timing-result');
        }
    })
});


/**
 *                          |> SHOW EEG AVAILABILITY <|
 * Executes the availability command to generate EEG availability plots for the given files
 *
 * @param {string} eeg_file_path - file path to the EEG file selected by the user
 * @param {string} trg_file_path - file path to the TRG file selected by the user
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on('run-availability', function executeAvailabilityCommand(event, eeg_file_path, trg_file_path) {
    window.setMinimumSize(850, 400);
    window.setSize(850, 400);
    event.sender.send('set-title-and-preloader-availability');

    let command = `ionm.py show_availability -c "${eeg_file_path}" -t "${trg_file_path}"`;
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
            event.sender.send('availability-result');
        }
    })
});



/**
 *                          |> CONVERT FILE(S) <|
 * Executes the convert command to convert the CVS files exported by the Eclipse
 * software into multiple custom CSV files: one separate file per modality.
 *
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on('run-convert', function executeConvertCommand(event) {
    log.info('Executing the convert command');
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
 *                              |> RE-RUN CONVERT <|
 * When an initial convert task fails, the user will be asked to insert the modalities
 * via forms because of which the convert failed. After this, the user gets the option
 * to re-run the convert command using the file-paths of the files that weren't correctly
 * converted in the first place.
 *
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on('rerun-convert', function executeReRunConvertCommand(event, failedConvertFilePaths) {
    log.info('Re-running the convert command using the file-paths of the converts that failed before');
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
 *                         |> COMPUTE STATISTICS OF FILE(S) <|
 * Computes the statistics of converted files and writes these to the database
 *
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on('run-compute', function executeComputeCommand(event) {
    log.info('Executing the compute command');
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
 *                          |> ABOUT / VERSION INFO <|
 * Handles the request for retrieving the python script its version info
 *
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on("get-version-info", function getVersionInfo(event) {
    log.info("Executing the version command");
    exec('ionm.py version', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while retrieving the python version info";
        if (error !== null) {
            log.error(error);
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("script-version-info", stdout);
        }
    });
});


/**
 *                           |> GET CURRENT APP SETTINGS <|
 * Handles the retrieving of the current database settings (for now only DB path).
 * This is done by calling the ionm.py function gui_get_database
 *
 * @param {object} event - for purpose of communication with sender
 */
ipcMain.on("get-current-settings", function getCurrentSettings(event) {
    // get python src dir from user preferences
    event.sender.send('current-python-src-dir', store.get('python-src-dir'));

    // get database path
    getDatabaseSettings(event);

    // get modalities
    getModalitySettings(event);
});

/**
 * Executes the command that retrieves the current database settings from
 * the python project's config.ini file
 *
 * @param {object} event - for purpose of communication with sender
 */
function getDatabaseSettings(event) {
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
}

/**
 * Executes the command that retrieves the current configured modalities from
 * the database via the python project
 *
 * @param {object} event - for purpose of communication with sender
 */
function getModalitySettings(event) {
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
}

/**
 *                    |> SETTINGS - SET DATABASE PATH <|
 * Writes the database path given by user to the config.ini by executing
 * the gui_set_database function in the python project
 *
 * @param {object} event - for purpose of communication with sender
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
 *                      |> SETTINGS - SET NEW MODALITY <|
 * Stores new modality in the configured database. This function is either called
 * via settings or after the converting of a file failes because one or more of the
 * encountered modalities have not been configured.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {string} name - name of the to be stored modality
 * @param {string} type - type of the to be stored modality (TRIGGERED or FREE_RUNNING)
 * @param {string} strategy - strategy of the to be stored modality (DIRECT or AVERAGE)
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
 *                      |> SETTINGS - SET PYTHON SRC DIR <|
 * Stores new modality in the configured database. This function is either called
 * via settings or after the converting of a file failes because one or more of the
 * encountered modalities have not been configured.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {string} src_dir - path of the to be set python src directory
 */
ipcMain.on('set-python-src-dir', function (event, src_dir) {
    log.info(event);
    try {
        // store the given path in user-preferences (if already exists it will be updated)
        store.set('python-src-dir', src_dir);
        // locally set the python src dir path for further use in the application
        pythonSrcDirectory = src_dir;
    } catch (e) {
        event.sender.send('error', 'An error occurred while trying to set the python src directory')
    } finally {
        event.sender.send('successfully-set-src-dir')
    }
});


/**
 *                |> CONFIRMATION BOX - SETUP DATABASE <|
 * Shows a confirmation box to the user for safety purposes. Used only for
 * sensitive user decisions.
 *
 * @param {object} event - for purpose of communication with sender
 * @param {object} options - options for the to be thrown confirmation box
 */
ipcMain.on('show-confirmation-box', function (event, options) {
    dialog.showMessageBox(window, options).then(r => {
        if (r.response !== 0) {
            event.sender.send('cancelled')
        } else {
            setupDatabase(event)
        }
    })
});


/**
 *                        |> SETUP DATABASE <|
 * Executes the python function that sets up the database via a ChildProcess
 * Only executed if user proceeds from confirmation box
 *
 * @param {object} event - for purpose of communication with sender
 */
function setupDatabase(event) {
    event.sender.send('setting-up-database');

    exec('ionm.py gui_setup', {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to setup the database";

        // if errors occur, send an error message to the renderer process
        if (error !== null) {
            log.error(error);
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            log.error(stderr);
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("database-setup-successful", stdout);
        }
    });
}