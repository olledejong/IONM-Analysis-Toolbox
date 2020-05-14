//==================================================================
//                       Titlebar Generator
//==================================================================
// This file generates a custom title bar by using the npm package
// electron-custom-titlebar.
//==================================================================

// requires
const customTitlebar = require('custom-electron-titlebar');
const { remote } = require('electron');
window.$ = window.jQuery = require('jquery');

// Create custom title bar and set characteristics
let MyTitleBar = new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#404040'),
    unfocusEffect: false,
    titleHorizontalAlignment: 'left',
    minimizable: true,
    maximizable: true,
    drag: true,
    shadow: false,
    icon: 'assets/images/app_icon.png'
});
MyTitleBar.updateTitle('IONM ANALYSIS TOOLBOX');
MyTitleBar.updateIcon('assets/images/app_icon.png');

// Create the custom menu (empty) and first element
const menu = new remote.Menu();
// Set and thus apply the newly created menu
MyTitleBar.updateMenu(menu);