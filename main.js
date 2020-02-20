const { app, BrowserWindow, screen, fs , dialog} = require('electron');
const ipcMain = require('electron').ipcMain;
const exec = require('child_process').exec;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let window;
let tempfilePaths;

function createWindow () {
    // TODO: Calculate wanted position for "help" window

    // get screen size
    //let mainScreen = screen.getPrimaryDisplay();

    // Create the browser window
    window = new BrowserWindow({
        //width: mainScreen.workArea.width,
        //height: mainScreen.workArea.height,
        width: 1280,
        height: 750,
        icon: __dirname + '/assets/images/icon.svg',
        resizable: false,
        frame: false,
        webPreferences: {
            webSecurity: true,
            nodeIntegration: true,
            disableBlinkFeatures : "Auxclick"
            // contextIsolation: true
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
 *                             VERSION INFO
 *
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
    dialog.showOpenDialog(window, options).then(fileNames => {
        // if selecting is cancelled, do not send back to renderer
        tempfilePaths = fileNames.filePaths;
        if (fileNames.canceled === true) {
            console.log("[ main.js ][ file selection cancelled ]")
        } else {
            console.log("[ main.js ][ sending selected file names info back to renderer ]");
            event.sender.send("selected", fileNames.filePaths)
        }
    })
});

/**
 *                             VERSION INFO
 * Handles the request for retrieving the python scripts' version info
 */
ipcMain.on("get-version-info", function getVersionInfo(event) {
    console.log("executing version command");
    exec('ionm.py version', {
        cwd: 'D:\\Menno\\IONM\\src'
    }, function(error, stdout, stderr) {
        console.log("sending information back to renderer");
        event.sender.send("version-info", error, stdout, stderr);
    });
});

/**
 *                              SUMMARIZE
 * Performs commandline commands which retrieve a summary of the basic
 * information about the given ECLIPSE-files. These get sent back to the
 * Renderer process in summarizeRenderer.js
 *
 * @param event IpcRendererEvent, contains all information about the event
 */
ipcMain.on("run-summarize", function runSummarizeCommand(event) {
    console.log("executing summarize command");
    //let JSON_result = [];
    let forLoopExecuted = false;
    let i;
    // issue message to the Renderer process to set result title and loading gif
    event.sender.send('set-title-and-gif');
    for(i = 0; i < tempfilePaths.length; i++) {
        forLoopExecuted = true;
        //console.log('itteration number: ', i);
        let fraction = (i+1) / tempfilePaths.length;
        console.log('fraction of jobs done: ', fraction);
        let command = 'ionm.py summarize "' + tempfilePaths[i] + '"';
        //console.log(command);
        //console.log(tempfilePaths[i]);
        exec(command, {
            cwd: 'D:\\Menno\\IONM\\src'
        }, function(error, stdout, stderr) {
            console.log("stdout: ", stdout);
            console.log("stderr: ", stderr);
            console.log("error: ", error);
            console.log("sending summarize result back to renderer");
            //JSON_result.push(createJsonFormat(stdout));
            let JSONstring = createJsonString(stdout);

            event.sender.send("summarize-result", JSONstring);
        });
    }
});


/**
 *                              SUMMARIZE
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
            //console.log(splitted[0]);
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
