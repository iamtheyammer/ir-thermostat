# Python Troubleshooting
This is the file you might need to troubleshoot errors in the python script.

I've done my best to answer most common questions, but open an issue if there's a problem.

# ModuleNotFoundError
This error will look something like this:
```
File "thermostat.py", line 5, in <module>
  import math, json, os, subprocess, time, sys, RPi.GPIO as GPIO, Adafruit_DHT # in python, everything you'll need's gotta be imported
ModuleNotFoundError: No module named 'RPi'
```
This means you're missing a module that must be installed prior to starting the script.

## Raspberry Pi
If you're running this on a raspberry pi, check [docs/install.md](https://github.com/iamtheyammer/ir-thermostat/blob/master/docs/install.md) #8 for instructions on how to install Adafruit_DHT. This module is needed, even if you will not use the DHT sensor.

## Non-pi linux systems
This is going to be a tough one... it probably says you're missing the 'RPi' module, which you should, you're not using a Pi. You can remove all of the GPIO requiring stuff (that would be function isMotion(), replace everything inside with `return false`).

However, it will take a lot of tinkering to make it work with something else. If you're a developer, jump in!

# KeyError
This error will look something like this:
```
Traceback (most recent call last):
  File "thermostat.py", line 265, in <module>
    setup() # the only thing we do at the bottom level is run the setup function.
  File "thermostat.py", line 262, in setup
    loop()
  File "thermostat.py", line 185, in loop
    verbosePrint('loop: temperatureSettings: ' + str(temperatureSettings))
  File "thermostat.py", line 18, in verbosePrint
    if getSettings()['verbose'] == True:
KeyError: 'verbose'
```

In this case, something is probably wrong with one of your JSON files. Try replacing your json/settings.json and your json/temperatureSettings.json with the ones from the docs/examples folder.

(make sure you set all of the settings at http://[yourServersIP]:[portYouChoose]/settings (ex. http://localhost:8000/settings), that's a common problem)

# Other Exception

Check and see if there's a human readable error message. Otherwise, raise an issue!
