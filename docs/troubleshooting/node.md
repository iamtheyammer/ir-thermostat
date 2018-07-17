# Node.js Troubleshooting
This is the file you might need to troubleshoot errors in the node.js script.

I've done my best to answer most common questions, but open an issue if there's a problem.

# Error: Cannot find module 'someModuleName'
This error will look something like this:
```
module.js:540
    throw err;
    ^

Error: Cannot find module 'express'
    at Function.Module._resolveFilename (module.js:538:15)
    at Function.Module._load (module.js:468:25)
    at Module.require (module.js:587:17)
    at require (internal/module.js:11:18)
    at Object.<anonymous> (/Users/sammendelson/Documents/GitHub/ir-thermostat/node/app.js:8:15)
    at Module._compile (module.js:643:30)
    at Object.Module._extensions..js (module.js:654:10)
    at Module.load (module.js:556:32)
    at tryModuleLoad (module.js:499:12)
    at Function.Module._load (module.js:491:3)
```
This means you're missing a module that must be installed prior to starting the script.

Try running `npm install 'moduleYouWereMissingFromTheErrorMessage'` if you're in the node directory.

# ENOENT
This error will look something like this:
```
fs.js:646
  return binding.open(pathModule._makeLong(path), stringToFlags(flags), mode);
                 ^

Error: ENOENT: no such file or directory, open '/Users/sammendelson/Documents/GitHub/ir-thermostat/json/settings.json'
    at Object.fs.openSync (fs.js:646:18)
    at Object.fs.readFileSync (fs.js:551:33)
    at Object.getSettings (/Users/sammendelson/Documents/GitHub/ir-thermostat/node/includes/settings.js:9:26)
    at Object.<anonymous> (/Users/sammendelson/Documents/GitHub/ir-thermostat/node/app.js:23:21)
    at Module._compile (module.js:643:30)
    at Object.Module._extensions..js (module.js:654:10)
    at Module.load (module.js:556:32)
    at tryModuleLoad (module.js:499:12)
    at Function.Module._load (module.js:491:3)
    at Function.Module.runMain (module.js:684:10)
```

The script can't find one of your JSON files. Try these steps (if you're in the node folder):  
1. `ls` - you should see a file named  `app.js`, along with some directories like `node-modules`.
2. `cd ../json`
3. `ls` - you should see three files: `current.json`, `settings.json` and `temperatureSettings.json`.
If you don't see all of those files, copy one of the examples:
- `cp ../docs/examples/current.json current.json` for your current.json
- `cp ../docs/examples/settings.json settings.json` for your settings.json
- `cp ../docs/examples/temperatureSettings.json temperatureSettings.json` for your temperatureSettings.json

In this case, something is probably wrong with one of your JSON files. Try replacing your json/settings.json and your json/temperatureSettings.json with the ones from the docs/examples folder.

# Other Exception

Check and see if there's a human readable error message. Otherwise, raise an issue!
