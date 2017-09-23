const electron = require('electron');
const url = require('url');
const path = require('path');

const { app, BrowserWindow, Menu, ipcMain } = electron;

// set environment
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

// listen for app to be ready
app.on('ready', function () {
  // create new window
  mainWindow = new BrowserWindow({});
  // load html into window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
    // file://dirname/mainWindow.html
  }));
  // shut all windows when main closes
  mainWindow.on('closed', function () {
    app.quit();
  });

  // build menu from template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // insert menu
  Menu.setApplicationMenu(mainMenu);
});

// handle create add window
function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item'
  });

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));
  // garbage collection handle
  addWindow.on('close', function () {
    addWindow = null;
  });
}

// catch item:add
ipcMain.on('item:add', function (e, item) {
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

// create menu template
// a template is an array of objects
const mainMenuTemplate = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Add Item',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Items',
        click() {
          mainWindow.webContents.send('item:clear')
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// if mac, add empty object to menu (otherwise the wise mac displays 'electron' instead of 'file' as the first menu tab...)
process.platform == 'darwin' && mainMenuTemplate.unshift({});

// add devtools item if not in production
process.env.node_ENV !== 'production' && mainMenuTemplate.push({
  label: 'Developer Tools',
  submenu: [
    {
      label: 'Toggle DevTools',
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, focusedWindow) {
        focusedWindow.toggleDevTools();
      }
    },
    {
      role: 'reload'
    }
  ]
});