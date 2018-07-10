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
		res.send(JSON.stringify({"status":"OK", "message":"ir-thermostat api"}));
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

  router.get('/enable/false', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    settings.enable = false;
    settings.setTemperatureSettings(temperatureSettings);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'status':'OK','temperatureSettings':temperatureSettings}));
  });

  router.get('/enable/true', function (req, res) {
    var temperatureSettings = settings.getTemperatureSettings();
    settings.enable = true;
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
module.exports = router;
