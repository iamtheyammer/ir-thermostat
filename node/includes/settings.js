// [root]/node/includes/settings.js
// ir-thermostat by @iamtheyammer

var fs = require('fs');
var path = require('path');

module.exports = {
  getSettings: function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../json/settings.json')));
  },
  getCurrent: function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../json/current.json')));
  },
  getTemperatureSettings: function() {
    return JSON.parse(fs.readFileSync(path.join(__dirname, '../../json/temperatureSettings.json')));
  },
  setTemperatureSettings: function(data) {
    fs.writeFileSync(path.join(__dirname, '../../json/temperatureSettings.json'), JSON.stringify(data));
  },
  setSettings: function(data) {
    fs.writeFileSync(path.join(__dirname, '../../json/settings.json'), JSON.stringify(data));
  }
};
