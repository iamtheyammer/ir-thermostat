/*
 * [root]/node/app.js
 * nodejs frontend for https://github.com/iamtheyammer/ir-thermostat
 * Licensed under a GNU GPLv3 license.
*/


var express = require('express');
var app = express();
var mu2Express = require("mu2express");
app.engine('mustache', mu2Express.engine);
app.set('view engine', 'mustache');
app.set('views', __dirname + '/views');
var settings = require("./includes/settings.js");
var bodyParser = require("body-parser");
var fs = require("fs");

app.use(require("./routes/home.js"));
app.use("/api", require("./routes/api.js"));
/*app.use("/get", require("./routes/get.js"));
app.use("/setup", require("./routes/setup.js"));
app.use("/test", require("./routes/test.js"));*/
var port = settings.getSettings().webPort;
app.listen(port);
console.log("ir-thermostat running on port " + port + ".");
console.log("This software, from https://github.com/iamtheyammer/ir-thermostat,");
console.log("is licensed with the GNU GPLv3 license. Enjoy!");
