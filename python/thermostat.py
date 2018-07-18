False# [root]/python/thermostat.md
# Written by GitHub @iamtheyammer as part of https://github.com/iamtheyammer/ir-thermostat
# Licensed under GNU GPLv3

import math, json, os, subprocess, time, sys, RPi.GPIO as GPIO, Adafruit_DHT # in python, everything you'll need's gotta be imported

class terminalColours: # this function, renamed and borrowed from Blender, allows colours in the terminal as outputs.
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def verbosePrint(string): # lets us print out a string only if verbose is on, more at docs/functions/python/verbosePrint.md
    if getSettings()['verbose'] == True:
        print(terminalColours.BOLD + 'Verbose output | ' + terminalColours.ENDC + string)

def getSettings(): # prints out json/settings.json, more at docs/functions/python/getSettings.md
    with open(os.path.abspath('../json/settings.json')) as f:
        settings = json.load(f)
        f.close();
        return settings

def getTemperatureSettings(): # prints out json/temperatureSettings.json, more at docs/functions/python/getTemperatureSettings.md
    with open(os.path.abspath('../json/temperatureSettings.json')) as f:
        settings = json.load(f)
        f.close();
        return settings

def setTemperatureSettings(settings): # sets the value of json/temperatureSettings.json, more at docs/functions/python/setTemperatureSettings.md
    with open(os.path.abspath('../json/temperatureSettings.json'), 'w') as f:
        f.write(json.dump(settings))
        f.close();
        return settings

def setCurrent(current): # sets the value of current.json, more at  docs/functions/python/setCurrent.md
    with open(os.path.abspath('../json/current.json'), 'w') as f:
        f.write(json.dump(current))
        f.close();
        return settings

def getDhtTemperature(): # gets the DHT temperature and humidity, more at docs/functions/python/getDhtTemperature.md
    settings = getSettings()
    if settings['dht']['type'] == 11: # since we can't put a class in JSON, we just replace the numbers with the full thing.
        dhtType = Adafruit_DHT.DHT11
    elif settings['dht']['type'] == 22:
        dhtType = Adafruit_DHT.DHT22
    elif settings['dht']['type'] == 2302:
        dhtType = Adafruit_DHT.AM2302
    else:
        raise Exception('Your DHT type is not valid. It must be 11, 22 or 2302 for a DHT11, DHT22 or AM2302 respectively. Change it in json/settings.json')
    humidity, temperature = Adafruit_DHT.read_retry(dhtType, settings['dht']['pin']) # get the values

    if settings['temperature']['tempUnit'] == 'f': # if the settings dictate farenheit, do the calculation to covert it.
        temperature = temperature * 9/5.0 + 32

    return {'temperature':temperature,'humidity':humidity}

def isMotion(): # returns True/False depending on motion input, more at docs/functions/python/isMotion.md
    settings = getSettings()
    GPIO.setmode(GPIO.BCM) # use BCM (pinout command) GPIO numbering, since that's what LIRC uses
    GPIO.setup(settings['pir']['pin'], GPIO.IN)
    if GPIO.input(settings['pir']['pin']) == 1:
        return True
    elif GPIO.input(settings['pir']['pin']) == 0:
        return False
    GPIO.cleanup()

def irSend(props): # compiles the 'key' and sends the ir command, more at docs/functions/python/irSend.md
    # you MUST pass in these props, AS A DICTIONARY
    # enable (bool), temperature (int), udswing (bool), lrSwing (bool), light (bool), fanSpeed (int, 0-6, where 0 = auto and 6 = 5 + turbo)
    # example: {'enable':True, 'temperature':71, 'udswing':True, 'lrswing':True, 'light':True, 'fanSpeed':2}
    #
    # PLEASE READ THE DOCS! >>> docs/functions/irSend.md <<<
    # i HIGHLY reccomend you read the documentation for this format (available at docs/functions/irSend.md) before touching anything here.
    settings = getSettings()

    # YOU MAY NEED TO EDIT THE BELOW CODE BLOCK. IF YOU DO, READ THE DOCS!!  >>> docs/functions/irSend.md <<<
    # information for how to modify this code block (called the 'key compiler') is available at docs/functions/irSend.md.
    # again, i HIGHLY reccomend you read the documentation for this format (available at docs/functions/irSend.md) before touching anything here.
    if props['enable'] == True:
        irCommand = str(props['temperature']) + '_' # example irCommand at this point: 71_ | 71 degrees
        if props['light'] == True:
            irCommand += 'LT_' # example irCommand at this point: 71_LT | 71 degrees, light on
        if props['udSwing'] == True:
            irCommand += 'UDS_' # example irCommand at this point: 71_LT_UDS | 71 degrees, light on, up/down swing,
        if props['lrSwing'] == True:
            irCommand += 'LRS_' # example irCommand at this point: 71_LT_UDS_LRS | 71 degrees, light on, up/down swing, left/right swing
        if props['fanSpeed'] == 0:
            irCommand += 'FA' # example irCommand at this point: 71_LT_UDS_LRS_FA | 71 degrees, light on, up/down swing, left/right swing, fan speed auto
        elif props['fanSpeed'] == 6:
            irCommand += 'F5T' # example irCommand at this point: 71_UDS_LRS_F5T | 71 degrees, light on, up/down swing, left/right swing, fan speed 5 + turbo on
        else:
            irCommand += 'F' + str(props['fanSpeed']) # example irCommand at this point: 71_UDS_LRS_2 | 71 degrees, light on, up/down swing, left/right swing, fan speed 2
    elif props['enable'] == False:
        irCommand = 'OFF'
    # end irCommand variable concatenation. Don't edit further.

    finalCommand = ['irsend', 'SEND_ONCE', settings['ir']['remoteName'], irCommand] # compile the final command
    verbosePrint('Sending IR command ' + str(finalCommand) + ' ' + str(settings['ir']['timesToSendCode']) + ' times...')
    for i in range(0, settings['ir']['timesToSendCode']): # run the command more than once, of course.
        subprocess.run(finalCommand)

def handleHolds(): # checks whether a hold exists, and if so, returns the hold temperature/fan speed.
    # this is a fairly complicated function, so if you'd like to modify it, read the docs first >>> docs/functions/python/handleHolds.md <<<
    temperatureSettings = getTemperatureSettings()
    final = {} # init our dictionary
    # check to see if the hold is expired
    if temperatureSettings['hold'] != None: # if a hold exists (if there is none, the JSON is "holds":null)
        if temperatureSettings['hold']['holdExpiry'] < time.time(): # time.time() pulls the unix epoch, this checks if the hold is expired.
            # if the hold is expired, we'll remove it from json/temperatureSettings.json
            temperatureSettings['hold'] = None
            verbosePrint('handleHolds: hold is expired, removing it.')
            verbosePrint('handleHolds: temperature settings: ' + str(temperatureSettings))
            setTemperatureSettings(temperatureSettings)

            final['fanSpeed'] = temperatureSettings['fanSpeed']
            final['temperature'] = temperatureSettings['temperature']
            verbosePrint('final (handleHolds): ' + str(final))
            return final
        try: # otherwise, we'll see if holds exist and set final['key'] to them...
            if temperatureSettings['hold']['holdTemperature']:
                final['temperature'] = temperatureSettings['hold']['holdTemperature']
        except KeyError: # using try/except because that's the best way to check for variable existance.
            final['fanSpeed'] = temperatureSettings['fanSpeed']
        try:
            if temperatureSettings['hold']['holdFanSpeed']:
                final['fanSpeed'] = temperatureSettings['hold']['fanSpeed']
        except KeyError:
            final['fanSpeed'] = temperatureSettings['fanSpeed']
        try:
            if temperatureSettings['hold']['holdTemperature'] != None and temperatureSettings['hold']['holdFanSpeed'] != None:
                final['temperature'] = temperatureSettings['hold']['holdTemperature']
                final['fanSpeed'] = temperatureSettings['hold']['holdFanSpeed']
        except:
            pass
    else: # if there's no hold
        final['fanSpeed'] = temperatureSettings['fanSpeed']
        final['temperature'] = temperatureSettings['temperature']
    verbosePrint('handleHolds: final output from handleHolds ' + str(final))
    return final

def testSensors():
    settings = getSettings()
    if settings['dht']['enable'] == True:
        print('Checking your DHT sensor...')
        try:
            dht = getDhtTemperature()
            if dht['humidity'] == None and dht['temperature'] == None:
                raise Exception('Seems like there\'s something wrong with your DHT sensor. Make sure the pin and type is correct.')
            else:
                print(terminalColours.OKGREEN + 'Awesome: I\'ve detected the temperature is ' + str(dht['temperature']) + ' degrees and the humidity is ' + str(dht['humidity']) + '%.' + terminalColours.ENDC)
                print('Please note that this may not be perfect, as the DHT11 is only accurate within 2c and the DHT22 is only accurate within 0.5c.')
                print('The value tends to get more accurate within the first 5 minutes of use.')
        except:
            raise Exception(terminalColours.FAIL + 'Seems like there\'s something wrong with your DHT sensor. Make sure the pin and type is correct.' + terminalColours.ENDC)
    if settings['pir']['enable'] == True:
        print('Checking your PIR sensor.')
        print('Please wave your hand in front of the sensor for a few seconds...')
        try:
            for i in range(0, 5):
                if isMotion() == True:
                    print(terminalColours.OKGREEN + 'Cool! There\'s that sweet motion input!' + terminalColours.ENDC)
                    break;
                elif i == 4 and isMotion() == False:
                    raise Exception(terminalColours.FAIL + 'Seems like there\'s something wrong with your PIR sensor. Make sure the pin is correct. Lots can go wrong with PIR sensors, google how to use a PIR sensor if you\'re not sure.' + terminalColours.ENDC)
                else:
                    print('Looking for motion...')
                    time.sleep(1)
        except:
            # print('Seems like there\'s something wrong with your PIR sensor. Make sure the pin is correct.')
            raise Exception('Seems like there\'s something wrong with your PIR sensor. Make sure the pin is correct. Lots can go wrong with PIR sensors, google how to use a PIR sensor if you\'re not sure.')
    if settings['dht']['enable'] == False and settings['pir']['enable'] == False:
        print('[WARN] Both your DHT and PIR sensors are disabled. The thermostat will be only controlled by the node.js web interface.')
    print('\n' + terminalColours.BOLD + terminalColours.OKGREEN + 'All sensors are working!' + terminalColours.ENDC)

def loop():
    # this function contains the code that will run in a loop.
    # it will handle checking your sensors and emitting
    settings = getSettings()
    temperatureSettings = getTemperatureSettings()
    verbosePrint('loop: temperatureSettings: ' + str(temperatureSettings))
    holds = handleHolds()
    verbosePrint('loop: holds: ' + str(holds))
    setTemperature = holds['temperature'] # using data from handleHolds
    fanSpeed = holds['fanSpeed']
    # apply settings from temperatureSettings.json
        # if there's a hold, apply that.
        # check if the hold time is up
        # if so, remove the hold
    # check for motion, if required

    if settings['dht']['enable'] == True: # if we're using the DHT sensor
        # this code will only run with a DHT sensor.
        dhtTemperature = int(getDhtTemperature()['temperature'])
        if dhtTemperature in range(dhtTemperature-settings['temperature']['validRange'], dhtTemperature + settings['temperature']['validRange']): # see if the current temp is within the allowed range
            # with a dhtTemperature of 70 and a validRange of 2, this range would between 68 and 72self.
            verbosePrint('loop: enable has been set to True because the temperature is within the valid range.')
            enable = True
        else:
            verbosePrint('loop: enable has been set to False because the temperature is outside of the valid range.')
            enable = False
    if settings['pir']['enable'] == True and settings['pir']['requireMotion'] == True: # if we're using the PIR sensor
        # this code will only run with a PIR sensor.
        if enable == None or enable == True: # if there's no motion, and motion is required, and enable either hasn't been set or it's True,
            if isMotion() == False: # we'll check for motion. if there's no motion, we'll set enable to False.
                enable = False
                verbosePrint('loop: enable has been set to False because there is no motion detected, and the config requires motion.')

    if temperatureSettings['enable'] == False and enable == True: # if the manual air off switch is pulled, set enable to False!
        # this code will run with no sensors.
        enable = False
        verbosePrint('loop: enable has been overriden to False because enable is False in temperatureSettings.json')
        # if the air is manually off, nothing else matters.

    if enable == None: # and finally, if nothing has set enable yet, set it to whatever it is in temperatureSettings['enable']
        # this code will run with no sensors.
        enable = temperatureSettings['enable']
        verbosePrint('loop: enable has been set to temperatureSettings[\'enable\'] because enable is still none, after DHT and PIR.')

    # send IR with props
    # example: {'enable':True, 'temperature':71, 'udswing':True, 'lrswing':True, 'light':True, 'fanSpeed':2}
    props = {'enable':enable, 'temperature':setTemperature, 'fanSpeed':fanSpeed,'udSwing':temperatureSettings['udSwing'], 'lrSwing':temperatureSettings['lrSwing'], 'light':temperatureSettings['light']}
    verbosePrint('loop: irSend Props: ' + str(props))
    irSend(props)
    verbosePrint('loop: setting current.json with the newest info. (' + str(props) + ')')
    setCurrent(props)
    # time.sleep(60)
    time.sleep(60) # wait 60 seconds between loops.

def setup():
    print('ir-thermostat by @iamtheyammer')
    print('Licensed under a GNU GPLv3 license.')
    print('https://github.com/iamtheyammer/ir-thermostat')
    if (len(sys.argv)) > 1:
        verbosePrint('setup: sys.argv: ' + str(sys.argv))
        args = sys.argv
        if '--help' in args:
            print(terminalColours.BOLD + 'ir-thermostat command line options:' + terminalColours.ENDC)
            print('  --test-only | only runs sensor tests and does not start the thermostat loop.')
            print('  -t | runs sensor tests then starts the thermostat loop.')
            print('  -p / --production | starts the thermostat in production mode.')
            print('  --help | displays this message.')
            return
        if '--test-only' in args:
            print('Stopping after testing sensors because --test-only was called.')
            testSensors()
            return print('Halting because --test-only was called.')
        if '-t' in args or '--test' in args:
            print('Running a sensor test before starting because -t was called...')
            testSensors()
        if '-p' in args or '--production' in args:
            print(terminalColours.BOLD + 'PRODUCTION MODE' + terminalColours.ENDC)
            if getSettings()['verbose'] == True:
                print('You\'re in production mode, so I recommend you turn off verbose output.')
    else:
        print(terminalColours.BOLD + 'No command line options specified, so I\'m running a sensor test. Bypass this with -p or --production.')
        testSensors()
    print('Alright, we\'re ready to go! Starting the thermostat.')
    while 1 == 1:
         loop()


setup() # the only thing we do at the bottom level is run the setup function.
