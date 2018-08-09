// [root]/node/routes/api.js
// ir-thermostat by @iamtheyammer

var express = require('express');
var router = express.Router();
let settings = require('../includes/settings.js');
//Middle ware that is specific to this router
router.use(function timeLog(req, res, next) {
  //console.log('Time: ', Date.now());
  next();
});
	router.get("/", function (req, res) {
    res.setHeader('Content-Type', 'application/json');
		res.send(JSON.stringify({"status":"OK", "message":"ir-thermostat api working like a charm!"}));
	});

  router.get('/current', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(settings.getCurrent()));
  });

  router.get('/temperatureSettings', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(settings.getTemperatureSettings()));
  });

  router.get('/settings', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(settings.getSettings()));
  });

  router.put('/temperatureSettings/enable/false', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    temperatureSettings.enable = false;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/enable/true', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    temperatureSettings.enable = true;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.get('/temperatureSettings/hold/cancel', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    temperatureSettings.hold = null;
    settings.setTemperatureSettings(temperatureSettings);
    if (req.query.redirect) {
      console.log(req.query.redirect);
      console.log('<head><meta http-equiv="refresh" content="0; url="' + req.query.redirect + '" /></head>');
      return res.send('<head><meta http-equiv="refresh" content="0; url=' + req.query.redirect + '" /></head>');
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  })

  router.put('/temperatureSettings/hold/new', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();

    if (req.query.holdTemperature && req.query.holdFanSpeed) {
      temperaureSettings.hold = {
        'holdTemperature': req.query.holdTemperature,
        'holdFanSpeed': req.query.holdFanSpeed,
        'holdExpiry': Math.round(Date.now()/1000)+7200
      };
    } else if (req.query.holdTemperature && !req.query.holdFanSpeed) {
      temperaureSettings.hold = {
        'holdTemperature': req.query.holdTemperature,
        'holdExpiry': Math.round(Date.now()/1000)+7200
      };
    } else if (req.query.holdFanSpeed && !req.query.holdTemperature) {
      temperaureSettings.hold = {
        'holdFanSpeed': req.query.holdFanSpeed,
        'holdExpiry': Math.round(Date.now()/1000)+7200
      };
    } else {
      return res.send(JSON.stringify({'status':'error','message':'no valid props were found. please refer to docs/apiReference.md for more information...'}));
    }

    settings.setTemperatureSettings(temperatureSettings);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/temperature', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    if (!req.query.temperature) return res.send(JSON.stringify({'status':'error','message':'no temperature specified. please refer to docs/apiReference.md for more information...'}));
    if (typeof(Number(req.query.temperature)) != typeof(2)) return res.send(JSON.stringify({'status':'error','message':'temperature isn\'t a number. please refer to docs/apiReference.md for more information...'}));
    req.query.temperature = Number(req.query.temperature);
    temperatureSettings.temperature = req.query.temperature;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/fanSpeed', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    if (!req.query.fanSpeed) return res.send(JSON.stringify({'status':'error','message':'no fan speed specified. please refer to docs/apiReference.md for more information...'}));
    if (typeof(Number(req.query.fanSpeed)) != typeof(2)) return res.send(JSON.stringify({'status':'error','message':'fanSpeed isn\'t a number. please refer to docs/apiReference.md for more information...'}));
    req.query.fanSpeed = Number(req.query.fanSpeed);
    temperatureSettings.fanSpeed = req.query.fanSpeed;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/lrSwing', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    if (!req.query.lrSwing) return res.send(JSON.stringify({'status':'error','message':'no lrSwing specified. please refer to docs/apiReference.md for more information...'}));
    req.query.lrSwing = (req.query.lrSwing == 'true') ? true : false;
    if (typeof(req.query.lrSwing) != typeof(true)) return res.send(JSON.stringify({'status':'error','message':'lrSwing isn\'t a boolean. please refer to docs/apiReference.md for more information...'}));
    temperatureSettings.lrSwing = req.query.lrSwing;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/udSwing', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    if (!req.query.udSwing) return res.send(JSON.stringify({'status':'error','message':'no udSwing specified. please refer to docs/apiReference.md for more information...'}));
    req.query.udSwing = (req.query.udSwing == 'true') ? true : false;
    if (typeof(req.query.udSwing) != typeof(true)) return res.send(JSON.stringify({'status':'error','message':'udSwing isn\'t a boolean. please refer to docs/apiReference.md for more information...'}));
    temperatureSettings.udSwing = req.query.udSwing;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.put('/temperatureSettings/light', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    if (!req.query.light) return res.send(JSON.stringify({'status':'error','message':'no light specified. please refer to docs/apiReference.md for more information...'}));
    req.query.light = (req.query.light == 'true') ? true : false;
    if (typeof(req.query.light) != typeof(true)) return res.send(JSON.stringify({'status':'error','message':'light isn\'t a boolean. please refer to docs/apiReference.md for more information...'}));
    temperatureSettings.light = req.query.light;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });
module.exports = router;
