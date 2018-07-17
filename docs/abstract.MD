# Thermostat Outline

This is the document that I used for planning out how this code would function. If you find it interesting, here it is. Otherwise, just ignore it.

## What does a thermostat do?
- Controls temperature in the room, based on
  - **Current Temperature**
  - Time of day
  - Day of week
  - Motion (maybe)
- Sends commands to HVAC unit to turn on air conditioning/heat
  - (in this script) IR will send these commands
- Also, manual interjection (hold function)
  - Allows user to set the temperature to any one they want, and it goes away after normally 2 hours (configurable)
  - Allow user to turn HVAC completely off, if they so choose

## Our functions

### Getting room temperature (done)
We'll use a DHT22 sensor attached to the pi, along with a few ESPs w/ MQTT connecting to the pi that will add datapoints for temperature.

All temperature inputs will then be averaged to make a final temp.

return final temperature

### Getting motion
We'll use some PIR sensors attached to the pis and ESPs w/ MQTT.

2 or more sensors must detect motion to get a true from this funcion

if motion[pi] + motion[esp1] + motion[esp2] + motion[esp3] => 2:
  return true
else:
  return false

### Settings/hold retrieval
We'll use a `settings.json` file to hold user settings, a `current.json` to hold the information for the web interface and a `hold.json` for setting the temperature/onOff setting.

The node.js server will be able to access this, and it will manage manual overrides.
