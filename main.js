const { app, BrowserWindow, dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const exec = require('child_process').exec;
const log = require('electron-log');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// global list which holds the paths of the via a dialog window selected csv files.
let selectedFileHolder;

// [CHANGE THIS TO WHERE YOUR IONM PYTHON PROJECT IS LOCATED]
pythonSrcDirectory = 'D:\\Menno\\IONM\\src';

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
    log.info('[ resizeBrowserWindow ][ resizing window to: ', newX, 'x', newY, 'px ]');
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
        log.info('[ executeSummarizeCommand ][ resizing window ]');
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
        let command = 'ionm.py summarize "' + selectedFileHolder[i] + '"';
        exec(command, {
            cwd: pythonSrcDirectory
        }, function(error, stdout, stderr) {
            let summarize_error_message = "An error occurred while retrieving the file summary";

            // if errors occur, send an error message to the renderer process
            if (error !== null) {
                event.sender.send('error', summarize_error_message);
            } else if (stderr !== '') {
                event.sender.send('error', summarize_error_message);
            } else {
                // build json string using the command output
                let JSONstring = createJsonString(stdout);

                // send the json string back to the renderer to be displayed
                event.sender.send("summarize-result", JSONstring, fraction);
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
            //log.info(splitted[0]);
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
 *                          [ SHOW TIMING ]
 *
 */
ipcMain.on('run-timing', function executeShowTimingCommand(event) {
    window.setMinimumSize(800, 530);
    window.setSize(800, 530);

    event.sender.send('set-title-and-preloader-timing');

    let pathsString = '"' + selectedFileHolder.join('" "') + '"';
    let command = 'ionm.py show_timing ' + pathsString;
    log.info(pathsString);
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        let errorMessage = "An error occurred while trying to run the show_timing command";
        if (error !== null) {
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send('timing-result', JSON.parse(stdout));
        }
    })
});


/**
 *                          [ CONVERT FILE(S) ]
 *
 */
ipcMain.on('run-convert', function executeConvertCommand(event) {
    log.info('[ main.js - executeConvertCommand ][ executing convert command ]');

    event.sender.send('set-title-and-preloader-convert');

    for(let i = 0; i < selectedFileHolder.length; i++) {
        let command = 'ionm.py gui_convert "' + selectedFileHolder[i] + '"';
        exec(command, {
            cwd: pythonSrcDirectory
        }, function (error, stdout, stderr) {
            let errorMessage = "An error occurred while trying to run the convert command";
            if (error !== null) {
                event.sender.send('error', errorMessage);
            } else if (stderr !== '') {
                event.sender.send('error', errorMessage);
            } else {
                event.sender.send('convert-result', JSON.parse(stdout));
            }
        });
    }
});


/**
 *                           [ VERSION INFO ]
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
 *                          [ SETTINGS (1 of 3) ]
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
 *                          [ SETTINGS (2 of 3) ]
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
            event.sender.send('error', errorMessage);
        } else if (stderr !== '') {
            event.sender.send('error', errorMessage);
        } else {
            event.sender.send("current-modality-settings", stdout);
        }
    });
});

/**
 *                          [ SETTINGS (3 of 3) ]
 * Handles the retrieving of the current modality settings.
 * This is done by calling the ionm.py function gui_get_modalities
 */
ipcMain.on('set-database', function (event) {
    log.info('to be set database path: ', selectedFileHolder);
    // only one file can end up here, but it still is in a list
    let new_database_path = selectedFileHolder[0];
    log.info(new_database_path);

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