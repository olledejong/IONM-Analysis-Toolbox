/**
 * Script responsible for creating a Windows MSI installer
 */

// 1. Import Modules
const { MSICreator } = require('electron-wix-msi');
const path = require('path');

// 2. Define input and output directory.
const APP_DIR = path.resolve(__dirname, './dist/IONM-Analysis-Toolbox-win32-x64');
// outputDirectory: "C:\\Users\sdkca\Desktop\windows_installer",
const OUT_DIR = path.resolve(__dirname, './dist/windows_installer');

// 3. Instantiate the MSICreator
const msiCreator = new MSICreator({
    appDirectory: APP_DIR,
    outputDirectory: OUT_DIR,

    // Configure metadata
    description: 'A Graphical User Interface for all IONM Analysis Tools',
    exe: 'IONM-Analysis-Toolbox',
    name: 'IONM Analysis Toolbox',
    manufacturer: 'Olle de Jong',
    version: '1.0.0',

    // Configure installer User Interface
    ui: {
        chooseDirectory: true,
        images: {
            background: path.resolve(__dirname, './assets/images/SetupBG.jpg')
        }
    },
});

// 4. Create a .wxs template file
msiCreator.create().then(function(){

    // Step 5: Compile the template to a .msi file
    msiCreator.compile();
});