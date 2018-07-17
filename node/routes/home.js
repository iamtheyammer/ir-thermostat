// [root]/node/routes/home.js
// ir-thermostat by @iamtheyammer

var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var settings = require("../includes/settings.js");
var bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: false });
//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  //console.log('Time: ', Date.now());
  next();
});
	router.get("/", function(req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    //console.log('Current temperature settings:');
    //console.log(temperatureSettings);

    if (temperatureSettings.enable == true) {
      temperatureSettings.enable = 'on';
      var airOnCheck = 'checked';
    } else {
      temperatureSettings.enable = 'off';
      var airOnCheck = 'unchecked';
    }

    if (temperatureSettings.lrSwing == true) {
      temperatureSettings.lrSwing = 'on';
      var lrSwingCheck = 'checked';
    } else {
      temperatureSettings.lrSwing = 'off';
      var lrSwingCheck = 'unchecked';
    }

    if (temperatureSettings.udSwing == true) {
      temperatureSettings.udSwing = 'on';
      var udSwingCheck = 'checked';
    } else {
      temperatureSettings.udSwing = 'off';
      var udSwingCheck = 'unchecked';
    }
    if (temperatureSettings.light == true) {
      temperatureSettings.light = 'on';
      var lightCheck = 'checked';
    } else {
      temperatureSettings.light = 'off';
      var lightCheck = 'unchecked';
    }

    switch (temperatureSettings.fanSpeed) {
      case 0:
        temperatureSettings.fanSpeed = 'auto';
        break;
      case 6:
        temperatureSettings.fanSpeed = '5 + turbo';
        break;
    }

    if (temperatureSettings.hold) {
      if (temperatureSettings.hold.holdTemperature && temperatureSettings.hold.holdFanSpeed) {
        var bothHold = true;
        var holdTemperature = temperatureSettings.hold.holdTemperature;
        var holdFanSpeed = temperatureSettings.hold.holdFanSpeed
        //console.log('bothhold');
      } else if (temperatureSettings.hold.holdTemperature) {
        var isTemperatureHold = true;
        var holdTemperature = temperatureSettings.hold.holdTemperature;
        //console.log('temphold');
      } else if (temperatureSettings.hold.holdFanSpeed) {
        var fanSpeedHold = true;
        var holdFanSpeed = temperatureSettings.hold.holdFanSpeed;
        //console.log('fanhold');
      }
      //console.log('a hold exists.');
      var holdExpiry = Math.round((temperatureSettings.hold.holdExpiry-(Math.round(Date.now()/1000)))/60);
      //console.log(holdExpiry);
    } else {
      var holdTemperature = false;
      var holdFanSpeed = false;
      var isTemperatureHold = false;
      var bothHold = false;
      var fanSpeedHold = false;
    }
    var temperatureHold = true;
    var locals = {
      'airConditionerStatus':temperatureSettings.enable,
      'isAirOn':airOnCheck,
      'temperature':temperatureSettings.temperature,
      'fanSpeed':temperatureSettings.fanSpeed,
      'lrSwing':temperatureSettings.lrSwing,
      'udSwing':temperatureSettings.udSwing,
      'light':temperatureSettings.light,
      'isUpDownSwingOn':udSwingCheck,
      'isLeftRightSwingOn':lrSwingCheck,
      'isLightOn':lightCheck,
      'isTemperatureHold':isTemperatureHold,
      'holdTemperature':holdTemperature,
      'isFanSpeedHold':fanSpeedHold,
      'holdFanSpeed':holdFanSpeed,
      'isBothHold':bothHold,
      'holdExpiry':holdExpiry,
      'checkDelay':settings.getSettings().checkDelay
    }
    //console.log('Locals:');
    //console.log(locals);
    // /(temperatureSettings.hold.holdExpiry-(Math.round(Date.now()/1000))/60)
		res.render('home', { 'locals': locals });
  });


  router.post("/post", urlencodedParser, function (req, res) {
    var currentTempSettings = settings.getTemperatureSettings();
    //console.log('req.body:');
    //console.log(req.body);

    if (!req.body.temperature || req.body.temperature == '') { // if no temp was submitted, we'll set the temp to the previous temp
      var temperature = currentTempSettings.temperature;
    }
    if (!req.body.fanSpeed || req.body.fanSpeed == '') { // if no fan speed was submitted, we'll set the fan speed to the previous value
      var fanSpeed = currentTempSettings.fanSpeed;
    }

    if (req.body.temperatureHold && req.body.fanSpeedHold) { // if there's a hold on both, make that object
      var hold = {
        'holdTemperature':req.body.temperature,
        'holdFanSpeed':req.body.fanSpeed,
        'holdExpiry':Math.round(Date.now()/1000)+7200
      }
      var temperature = currentTempSettings.temperature; // since the temp and fanSpeed boxes held a hold value, the permanent temperature/fanSpeed values stay.
      var fanSpeed = currentTempSettings.fanSpeed;
    } else if (req.body.temperatureHold == 'on') {
      var hold = {
        'holdTemperature':req.body.temperature,
        'holdExpiry':Math.round(Date.now()/1000)+7200
      }
      } else if (req.body.fanSpeedHold == 'on') {
        var hold = {
          'holdFanSpeed':req.body.fanSpeed,
          'holdExpiry':Math.round(Date.now()/1000)+7200
        }

      if (!fanSpeed && !req.body.fanSpeed) {
        var fanSpeed = currentTempSettings.fanSpeed; // if the fan speed wasn't empty, and the fan speed hold box wasn't checked, the we set the final fan speed to the entered one.
      } else if (req.body.fanSpeed) {
        var fanSpeed = req.body.fanSpeed;
      }
      var temperature = currentTempSettings.temperature;
      // (cont above comment) there will only be a fanSpeed variable if no fan speed was entered.
    } else if (req.body.fanSpeedHold == 'on') {
      var hold = {
        'holdFanSpeed':req.body.fanSpeed,
        'holdExpiry':Math.round(Date.now()/1000)+7200
      }
      if (!temperature && req.body.temperatureHold == 'off') {
        var temperature = req.body.temperature; // if the temperature wasn't empty, and the temperature hold box wasn't checked, the we set the final temperature to the entered one.
      } else if (req.body.temperature) {
        var temperature = req.body.temperature;
      }
      // (cont above comment) there will only be a temperature variable if no temperature was entered.
      var fanSpeed = currentTempSettings.fanSpeed;
    }

    if (!hold) var hold = null;
    if (req.body.lrSwing == 'on') {
      req.body.lrSwing = true;
    } else if (req.body.lrSwing == 'off') {
      req.body.lrSwing = false;
    } else if (!req.body.lrSwing) {
      req.body.lrSwing = false;
    } else {
      console.log('Major server error parsing req.body.lrSwing. It\'s not \'on\' or \'off\'!');
    }
    if (req.body.udSwing == 'on') {
      req.body.udSwing = true;
    } else if (req.body.udSwing == 'off') {
      req.body.udSwing = false;
    } else if (!req.body.udSwing) {
        req.body.udSwing = false;
    } else {
      console.log('Major server error parsing req.body.udSwing. It\'s not \'on\' or \'off\'!');
    }

    if (req.body.light == 'on') {
      req.body.light = true;
    } else if (req.body.light == 'off') {
      req.body.light = false;
    } else if (!req.body.light) {
      req.body.light = false;
    } else {
      console.log('Major server error parsing req.body.light. It\'s not \'on\' or \'off\'!');
    }

    if (req.body.airEnable == 'on') {
      req.body.airEnable = true;
    } else if (req.body.airEnable == 'off') {
      req.body.airEnable = false;
    } else if (!req.body.airEnable) {
      req.body.airEnable = false;
    } else {
      console.log('Major server error parsing req.body.airEnable. It\'s not \'on\' or \'off\'!');
    }

    if (!temperature) var temperature = req.body.temperature;
    if (!fanSpeed) var fanSpeed = req.body.fanSpeed;
    if (currentTempSettings.hold) hold = currentTempSettings.hold;
    //console.log('temp: ' + temperature);
    settings.setTemperatureSettings({
      'enable':req.body.airEnable,
      'temperature':temperature,
      'fanSpeed':fanSpeed,
      'lrSwing':req.body.lrSwing,
      'udSwing':req.body.udSwing,
      'light':req.body.light,
      'hold':hold
    });

    return res.send('<head><meta http-equiv="refresh" content="0; url=/" /></head>');
  });
module.exports = router;
