const path = require('path');
var appDir = path.dirname(require.main.filename);

var Settings = function (localPath) {
  if (localPath) {
    this.localSettings = require(localPath);
  } else {
    this.localSettings = require(path.join(appDir,'..', 'settings.json'));
  }
};

Settings.prototype.get = function (settingName) {
  if (process.env[settingName]) {
    return process.env[settingName];
  } else if (this.localSettings[settingName] && this.localSettings[settingName].default) {
    return this.localSettings[settingName].default
  } else {
    return undefined;
  }
};

module.exports = new Settings();