/**
 * This file does everything that has to do with the title bar
 * and the menu bar.
 */

// REQUIRES
const customTitlebar = require('custom-electron-titlebar');
const { remote } = require('electron');
const ipcRenderer = require('electron').ipcRenderer;


// Create custom title bar and set characteristics
let MyTitleBar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#404040'),
    unfocusEffect: false,
    titleHorizontalAlignment: "left",
    minimizable: true,
    maximizable: false,
    drag: true,
    shadow: false,
    icon: '../assets/images/icon.svg'
});
MyTitleBar.updateTitle("IONM ANALYSIS TOOLBOX");


/**
 * Adds the classname 'active' to the active menu element
 *
 * @type {HTMLElement}
 */
// This piece of code listens to the click on menu
// buttons and changes the color accordingly.
let taskbar = document.getElementById("taskbar");
let sections = taskbar.getElementsByClassName("taskbar-div");
for (let i = 0; i < sections.length; i++) {
    sections[i].addEventListener("click", function() {
        let current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";
    });
}

// Create the custom menu (empty) and first element
const menu = new remote.Menu();
// Set and thus apply the newly created menu
MyTitleBar.updateMenu(menu);