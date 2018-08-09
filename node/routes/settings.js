// [root]/node/routes/settings.js
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
    var currentSettings = settings.getSettings();
    var varThatDoesntExist;
    /*var errors = {
      'error':(!currentSettings.verbose) ? 'The verbose output setting is missing.' : varThatDoesntExist,
      'error':(!currentSettings.checkDelay) ? 'The check delay setting is missing.' : varThatDoesntExist,
      'error':(!currentSettings.webPort) ? 'The web port setting is missing. (wait: that\'s impossible: you\'re viewing this page!!)' : varThatDoesntExist,
      'error':(!currentSettings.temperature.tempUnit) ? 'The temperature unit setting is missing.' : varThatDoesntExist,
      'error':(!currentSettings.dht.enable) ? 'The DHT enable setting is missing.' : varThatDoesntExist,
      'error':(!currentSettings.dht.pin) ? 'The DHT pin setting is missing. (don\'t have a DHT sensor? ignore or set to 23.)' : varThatDoesntExist,
      'error':(!currentSettings.dht.type) ? 'The DHT type is missing. (don\'t have a DHT sensor? ignore or set to 11.)' : varThatDoesntExist,
      'error':(!currentSettings.temperature.validRange) ? 'The valid range setting is missing. (don\'t have a DHT sensor? ignore or set to 2.)' : varThatDoesntExist,
      'error':(!currentSettings.pir.enable) ? 'The PIR enable setting is missing.' : varThatDoesntExist,
      'error':(!currentSettings.pir.pin) ? 'The PIR pin setting is missing. (don\'t have a PIR sensor? ignore or set to 24.)' : varThatDoesntExist,
      'error':(!currentSettings.pir.requireMotion) ? 'The require motion setting is missing. (don\'t have a PIR sensor? ignore or set to false/uncheck the box)' : varThatDoesntExist,
      'error':(!currentSettings.ir.remoteName) ? 'The IR remote name is missing. (critical!)' : varThatDoesntExist,
      'error':(!currentSettings.ir.timesToSendCode) ? 'The times to send code setting is missing. (critical!)' : varThatDoesntExist,
    }*/ //errors are currently commented out because they're not working.
    console.log((!currentSettings.verbose) ? 'The verbose output setting is missing.' : null);
    console.log('Settings: ' + JSON.stringify(currentSettings));
    //console.log('Errors: ' + JSON.stringify(errors));
    var locals = {
      /*'errors':(errors.error != null) ? errors : varThatDoesntExist,*/
      'verboseStatus':(currentSettings.verbose == true) ? 'on' : 'off', // on/off value for verbose output.
      'verboseCheck':(currentSettings.verbose == true) ? 'checked' : 'unchecked', // use a ternary operator to determine if the box should be checked based on the value of verboseStatus
      'checkDelay':currentSettings.checkDelay,
      'port':currentSettings.webPort,
      'tempUnit':currentSettings.temperature.tempUnit,
      'dhtEnable':(currentSettings.dht.enable == true) ? 'on' : 'off',
      'dhtEnableCheck':(currentSettings.dht.enable == true) ? 'checked' : 'unchecked',
      'dhtType': () => {
        switch(settings.getSettings().dht.type) {
          case 11:
            return 'DHT11'
          case 22:
            return 'DHT22'
          case 2302:
            return 'AM2302'
        }
      },
      'dhtPin':currentSettings.dht.pin,
      'validRange':currentSettings.temperature.validRange,
      'pirEnable':(currentSettings.pir.enable == true) ? 'on' : 'off',
      'pirEnableCheck':(currentSettings.pir.enable == true) ? 'checked' : 'unchecked',
      'requireMotion':(currentSettings.pir.requireMotion == true) ? 'on' : 'off',
      'requireMotionCheck':(currentSettings.pir.requireMotion == true) ? 'on' : 'off',
      'pirPin':currentSettings.pir.pin,
      'irRemoteName':currentSettings.ir.remoteName,
      'timesToSendCode':currentSettings.ir.timesToSendCode
    }; // the locals to pass into the render-er

    console.log('Locals: ' + JSON.stringify(locals));
    res.setHeader('Content-Type', 'text/html');
		res.render('settings', { 'locals': locals });
	});


  router.post('/post', urlencodedParser, function(req, res) {
    //should probably make something happen here!
    console.log(req.body);
    var currentSettings = settings.getSettings();
    // more ternary operators to do this simply
    var newSettings = {
      "webPort":(req.body.port && req.body.port != '') ? req.body.port : currentSettings.webPort,
      "verbose":(req.body.verbose == 'on') ? true : false,
      "checkDelay":(req.body.checkDelay && req.body.checkDelay != '') ? req.body.checkDelay : currentSettings.checkDelay,
      "temperature": {
        "tempUnit":(req.body.tempUnit != 'f' && req.body.tempUnit != 'c') ? 'f' : req.body.tempUnit,
        "validRange":(req.body.validRange && req.body.validRange != '') ? req.body.validRange : currentSettings.temperature.validRange
      },
      "dht":{
        "enable":(req.body.dhtEnable == 'on') ? true : false,
        "type":(req.body.dhtType && req.body.dhtType != '') ? req.body.dhtType : currentSettings.dht.type,
        "pin":(req.body.dhtPin && req.body.dhtPin != '') ? req.body.dhtPin : currentSettings.dht.pin
      },
      "pir":{
        "enable":(req.body.pirEnable == 'on') ? true : false,
        "pin":(req.body.pirPin && req.body.pirPin != '') ? req.body.pirPin : currentSettings.pir.pin,
        "requireMotion":(req.body.requireMotion == 'on') ? true : false
      },
      "ir":{
        "remoteName":(req.body.remoteName && req.body.remoteName != '') ? req.body.remoteName : currentSettings.ir.remoteName,
        "timesToSendCode":(req.body.timesToSendCode && req.body.timesToSendCode != '') ? req.body.timesToSendCode : currentSettings.ir.timesToSendCode
      }
    }


    settings.setSettings(newSettings); // set the new settings
    res.send('<head><meta http-equiv="refresh" content="0; url=/settings" /></head>'); // redirect ya back to the home page
  });
module.exports = router;
