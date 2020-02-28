const { app, BrowserWindow, screen, fs , dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const exec = require('child_process').exec;
const log = require('electron-log');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;

// global list which holds the paths of the via a dialog window selected files.
let tempfilePaths;

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
    // get screen size
    //let mainScreen = screen.getPrimaryDisplay();k

    // Create the browser window
    window = new BrowserWindow({
        //width: mainScreen.workArea.width,
        //height: mainScreen.workArea.height,
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
    let currentWindowSize = window.getSize();
    if ( currentWindowSize[0] !== newX && currentWindowSize[1] !== newY) {
        window.setMinimumSize(newX, newY);
        window.setSize(newX, newY);
    }
});


/**
 *                      [ FILE SELECT AND STORE PATHS ]
 * This function listens to the 'select-file' message from the renderer process
 * which opens a dialog where the user can select files. If canceled, do nothing
 * if copleted, store the pats to files in the array tempfilePaths.
 *
 * //TODO : GENERALIZE THIS FUNCTION?
 */
ipcMain.on("select-file", function selectFileAndSendBack(event) {
    // configure which types of files are allowed
    let types = [
        {name: 'Only extensions allowed:', extensions: ['csv', 'xlsx'] }
        ];

    // configure the options (allowed types + properties)
    const options = {
        title: 'Select file(s)',
        filters: types,
        defaultPath: "D:\\Menno\\NimEclipse",
        properties: ['openFile', "multiSelections"]
        };

    // open the actual dialog with the above options
    dialog.showOpenDialog(window, options).then(fileNames => {
        // if selecting is cancelled, do not send back to renderer
        tempfilePaths = fileNames.filePaths;
        if (fileNames.canceled === true) {
            log.info("[ selectFileAndSendBack ][ file selection cancelled ]");
            event.sender.send('selected', fileNames.filePaths)
        } else {
            log.info("[ selectFileAndSendBack ][ sending selected file names info back to renderer ]");

            // send the filenpaths to the renderer process
            event.sender.send("selected", fileNames.filePaths)
        }
    })
});


/**
 *                            [ SUMMARIZE ]
 * Performs commandline commands which retrieve a summary of the basic
 * information about the given ECLIPSE-files. These get sent back to the
 * Renderer process in summarizeRenderer.js
 *
 * @param {object} IpcRendererEvent, contains all information about the event
 */
ipcMain.on("run-summarize", function executeSummarizeCommand(event) {
    // window sizing logic
    if ( tempfilePaths.length > 2 ) {
        log.info('[ executeSummarizeCommand ][ resizing window ]');
        window.setMinimumSize(1220, 900);
        window.setSize(1220, 900);
    } else if ( tempfilePaths.length === 2 ) {
        window.setMinimumSize(1220, 550);
        window.setSize(1220, 550);
    } else {
        window.setMinimumSize(800, 550);
        window.setSize(800, 550);
    }

    // issue message to the Renderer process to set result title and loading gif
    event.sender.send('set-title-and-preloader-summarize');

    log.info("[ executeSummarizeCommand ][ executing summarize command ]");

    // for every path in tempfilePaths execute the command 'ionm.py summarize [filepath]'
    for(let i = 0; i < tempfilePaths.length; i++) {
        let fraction = Math.round(((i+1) / tempfilePaths.length) * 100);
        log.info('[ executeSummarizeCommand ][ percentage handled: ', fraction, '% ]');
        let command = 'ionm.py summarize "' + tempfilePaths[i] + '"';
        exec(command, {
            cwd: pythonSrcDirectory
        }, function(error, stdout, stderr) {
            let summarize_error_message = "An error occurred while retrieving the file summary";

            // if errors occur, send an error message to the renderer process
            if (error !== null) {
                log.error("[ executeSummarizeCommand ] ", error);
                event.sender.send('error', summarize_error_message);
            } else if (stderr !== '') {
                log.error("[ executeSummarizeCommand ] ", stderr);
                event.sender.send('error', summarize_error_message);
            } else {
                log.info("[ executeSummarizeCommand ] \n", stdout);

                // build json string using the command output
                let JSONstring = createJsonString(stdout);

                // send the json string back to the renderer to be displayed
                event.sender.send("summarize-result", JSONstring, fraction);
                log.info("[ executeSummarizeCommand ][ sent summarize result back to renderer ]");
            }
        });
    }
});


/**
 *                            [ SUMMARIZE ]
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

    let pathsString = '"' + tempfilePaths.join('" "') + '"';
    let command = 'ionm.py show_timing ' + pathsString;
    log.info(pathsString);
    exec(command, {
        cwd: pythonSrcDirectory
    }, function(error, stdout, stderr) {
        log.info('show_timing finished');
        log.info('stdout: ', stdout);
        log.info('stderr: ', stderr);
        log.info('error: ', error);
        //log.info('json parsed!: ', JSON.parse(stdout));
        event.sender.send('timing-result', JSON.parse(stdout));
    })
});


/**
 *                          [ CONVERT FILE(S) ]
 *
 */
ipcMain.on('run-convert', function executeConvertCommand(event) {
    // let pathsString = '"' + tempfilePaths.join('" "') + '"';
    // let command = 'ionm.py gui_convert ' + pathsString;
    log.info('[ main.js - executeConvertCommand ][ executing convert command ]');
    // log.info(pathsString);
    for(let i = 0; i < tempfilePaths.length; i++) {
        let command = 'ionm.py gui_convert "' + tempfilePaths[i] + '"';
        exec(command, {
            cwd: pythonSrcDirectory
        }, function (error, stdout, stderr) {
            log.info(stdout);
            log.info('[ executeConvertCommand ][ convert command completed ]');
            event.sender.send('convert-result', JSON.parse(stdout));
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
        log.info("[ getVersionInfo ][ sending 'ionm.py version' information back to renderer ]");
        event.sender.send("script-version-info", error, stdout, stderr);
    });
});
