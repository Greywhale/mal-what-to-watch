const { app, BrowserWindow, ipcMain } = require('electron');

const path = require('path');
const url = require('url');
//const request = require('request');
//const rp = require('request-promise');
const Promise = require('bluebird');
const request = Promise.promisifyAll(require('request'));
const {parseString} = require('xml2js');
const _ = require('lodash');
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let userList = {};

function parseAnimeJSON(allAnime) {
  const sortedAnime = {};

  const statusWatching = '1';
  const statusComplete = '2';
  const statusOnHold = '3';
  const statusDropped = '4';
  const statusPlan = '6';

  const animeWatching = _.filter(allAnime, {'my_status': [statusWatching]});
  const animeComplete = _.filter(allAnime, {'my_status': [statusComplete]});
  const animeOnHold = _.filter(allAnime, {'my_status': [statusOnHold]});
  const animeDropped = _.filter(allAnime, {'my_status': [statusDropped]});
  const animePlan = _.filter(allAnime, {'my_status': [statusPlan]});

  sortedAnime['watching'] = animeWatching;
  sortedAnime['completed'] = animeComplete;
  sortedAnime['onHold'] = animeOnHold;
  sortedAnime['dropped'] = animeDropped;
  sortedAnime['plan'] = animePlan;
  return sortedAnime;
}

function createPlanList() {
  const planList = {};
  const theRestList = {};
  const users = Object.keys(userList);

  //agregate planned to watch anime
  for(let i = 0; i < users.length; i++) {
    const userPlanAnime = userList[users[i]].plan;
    for(let j = 0; j < userPlanAnime.length; j++) {
      planList[userPlanAnime[j].series_title] = userPlanAnime[j].series_image;
    }
  }

  //agregate the rest
  for(let i = 0; i < users.length; i++) {
    const keyArray = ['watching', 'completed', 'onHold', 'dropped'];
    for(let j = 0; j < keyArray.length; j++) {
      const inspectUser = userList[users[i]];
      const inspectList = inspectUser[keyArray[j]];
      for(let k = 0; k < inspectList.length; k++) {
        const animeInfo = inspectList[k];
        theRestList[animeInfo.series_title] = animeInfo.series_image;
      }
    }
  }

  const plannedAnimeKeys =  Object.keys(planList);
  const finalPlanList = {};
  for(let i = 0; i < plannedAnimeKeys.length; i++) {
    const iterateKey = plannedAnimeKeys[i];
    if (theRestList[iterateKey]  === undefined) {
      console.log(iterateKey);
      finalPlanList[iterateKey] = planList[iterateKey];
    }
  }
  return finalPlanList;
}
function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, '../renderer/index.html'), //eslint-disable-line
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  ipcMain.on('input-msg', function(event, inputValues) {
    const requests = inputValues.map(userName => {
      const callPath = 'http://myanimelist.net/malappinfo.php?u='+userName+'&status=all&type=anime';
      const options = {
        uri: callPath,
      };
      return request.getAsync(options);
    });

    Promise.all(requests).then(responses => {
      for(let i = 0; i < responses.length; i++) {
        const content = responses[i].body;
        parseString(content, function (err, result) {
          const sortedAnime = parseAnimeJSON(result['myanimelist'].anime);
          userList[inputValues[i]] = sortedAnime;
        });
      }
      const planList = createPlanList();
      event.sender.send('returnPlanList', planList);
    });
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') { //eslint-disable-line
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
