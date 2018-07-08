# [root]/python/thermostat.md
# Written by GitHub @iamtheyammer as part of https://github.com/iamtheyammer/ir-thermostat
# Licensed under GNU GPLv3

import math, json, os, subprocess, time, RPi.GPIO as GPIO, Adafruit_DHT

def verbosePrint(string):
    if getSettings()[verbose] == True:
        print(string)

def getSettings():
    with open(os.path.abspath('../json/settings.json')) as f:
        settings = json.load(f)
        f.close();
        return settings

def getTemperature():
    settings = getSettings()
    humidity, temperature = Adafruit_DHT.read_retry(settings[dht][dhtType], settings[dht][pin])

    if settings[tempUnit] == 'f':
        temperature = temperature * 9/5.0 + 32

    return {'temperature':temperature,'humidity':humidity}

def isMotion():
    settings = getSettings()
    GPIO.setMode(GPIO.BCM)
    GPIO.setup(settings[pir][pin], GPIO.IN)
    if GPIO.input(settings[pir][pin]) == 1:
        return True
    elif GPIO.input(settings[pir][pin]) == 0:
        return False
    GPIO.cleanup()

def irSend(props):
    # you MUST pass in these props, AS A DICTIONARY
    # temperature (int), udswing (bool), lrswing (bool), light (bool), fanSpeed (int, 0-6, where 0 = auto and 6 = 5 + turbo)
    # example: {'temperature':71, 'udswing':True, 'lrswing':True, 'light':True, 'fanSpeed':2}
    settings = getSettings()

    # YOU MAY NEED TO EDIT THE BELOW CODE BLOCK.
    # the irCommand variable is the name of the 'key' in your lircd conf. You may need to change this concatenation formula based on how the keys in your lircd conf are formatted.
    # if you edit this sucessfully, please make a pull request with this modified function so it's available for everyone. the github link is at the top of this document.
    irCommand = str(props[temperature]) + '_' # example irCommand at this point: 71_ | 71 degrees
    irCommand += 'LT_' if props[light] == True # example irCommand at this point: 71_LT | 71 degrees, light on
    irCommand += 'UDS_' if props[udswing] == True # example irCommand at this point: 71_LT_UDS | 71 degrees, light on, up/down swing,
    irCommand += 'LRS_' if props[lrswing] == True # example irCommand at this point: 71_LT_UDS_LRS | 71 degrees, light on, up/down swing, left/right swing
    if props[fanSpeed] == 0:
        irCommand += 'FA' # example irCommand at this point: 71_LT_UDS_LRS_FA | 71 degrees, light on, up/down swing, left/right swing, fan speed auto
    elif props[fanSpeed] == 6:
        irCommand += 'F5T' # example irCommand at this point: 71_UDS_LRS_F5T | 71 degrees, light on, up/down swing, left/right swing, fan speed 5 + turbo on
    else:
        irCommand += 'F' + str(props[fanSpeed]) # example irCommand at this point: 71_UDS_LRS_2 | 71 degrees, light on, up/down swing, left/right swing, fan speed 2
    # end irCommand variable concatenation. Don't edit further.

    finalCommand = ['irsend', 'SEND_ONCE', settings[ir][remoteName], irCommand]
    verbosePrint('Sending IR command ' + finalCommand + ' ' + str(settings[ir][timesToSendCode]) + 'times...')
    for i in range(0, settings[ir][timesToSendCode]):
        subprocess.run(finalCommand)

def loop():
    # this function contains the code that will run in a loop.
    # it will handle checking your sensors and emitting
    settings = getSettings()

    if settings[dht][enable] == False and settings[pir][enable] == False:
        print('[WARN] Both your DHT and PIR sensors are disabled. The thermostat will be only controlled by the node.js web interface.')

    dht = getTemperature() if settings[dht][enable] == True
    pir = isMotion() if settings[pir][enable] == True

    
