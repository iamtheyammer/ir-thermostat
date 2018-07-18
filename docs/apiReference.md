# ir-thermostat API reference

This document outlines all of the methods available to get/change settings with the IR thermostat.

The API is JSON-based, which means you'll submit JSON in POST requests and you'll receive JSON back. JSON plugins are available in almost every language and is native to JavaScript.

## Table of contents


#### Current
- [Getting current.json](#getting-currentjson)

#### Settings
- [Getting the settings](#getting-the-settings)

#### Temperature settings
- [Getting temperature settings](#getting-temperature-settings)
- [Turning the air conditioner on/off](#turning-the-air-conditioner-onoff)
- [Making a new hold](#making-a-new-hold)
- [Cancelling a current hold](#cancelling-a-current-hold-if-one-exists)
- [Setting the temperature](#setting-the-temperature)
- [Setting the fan speed](#setting-the-fan-speed)
- [Setting the left/right swing](#setting-the-leftright-swing)
- [Setting the up/down swing](#setting-the-updown-swing)
- [Setting the light](#setting-the-light)


## Current

### Getting current.json
Make a GET request to `http://[yourServerIP]:[portYouChose]/current`.

Example request:
`http://localhost:8000/current`

Sample response:  
`{"webPort":"8000","verbose":true,"checkDelay":"60","temperature":{"tempUnit":"f","validRange":2},"dht":{"enable":true,"type":11,"pin":24},"pir":{"enable":true,"pin":27,"requireMotion":false},"ir":{"remoteName":"Trane","timesToSendCode":15}}` in `application/json`.


## Settings

### Getting the settings
Make a GET request to `http://[yourServerIP]:[portYouChose]/settings`.

Example request:
`http://localhost:8000/settings`

Sample response:  
`{"webPort":"8000","verbose":true,"checkDelay":"60","temperature":{"tempUnit":"f","validRange":2},"dht":{"enable":true,"type":11,"pin":24},"pir":{"enable":true,"pin":27,"requireMotion":false},"ir":{"remoteName":"Trane","timesToSendCode":15}}` in `application/json`.


Setting the settings is not available over API right now-- sorta. If you inspect the `/settings` page, you'll see a form that POSTs to `/settings/post`, and if you'd like, you're able to set the settings via that.

## Temperature settings

### Getting temperature settings
Make a GET request to `http://[yourServerIP]:[portYouChose]/temperatureSettings`.

Example request:
`http://localhost:8000/temperatureSettings`

Sample response:  
`{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}` in `application/json`.

### Turning the air conditioner on/off
Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/enable/true`. (air on)

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/enable/false`. (air off)

Example request:  
`http://localhost:8000/temperatureSettings/enable/true`

Sample response:  
`{"status":"OK","temperatureSettings": {"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Making a new hold
Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/hold/new`. Include:

- Hold temperature (`holdTemperature`), a 2 digit number with the temperature you'd like to hold at. Ex. `75`
- Hold fan speed (`holdFanSpeed`), a 1 digit number with the fan speed you'd like to hold at. Ex. `2`

Note: only one prop (holdTemperature or holdFanSpeed) is required with the request, but both can be submitted too.

Example request:  
`https://localhost:8000/temperatureSettings/hold/new?holdTemperature=75&holdFanSpeed=2`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":{"holdTemperature":75,"holdFanSpeed":2}}}` in `application/json`.

### Cancelling a current hold (if one exists!)

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/hold/cancel`.

Example request:  
`https://localhost:8000/temperatureSettings/hold/cancel`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Setting the temperature

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/temperature`. Include:

- Temperature (`temperature`), a 2 digit number with the temperature you'd like to set to. Ex. `75`

Example request:  
`https://localhost:8000/temperatureSettings/temperature?temperature=75`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Setting the fan speed

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/fanSpeed`. Include:

- Fan speed (`fanSpeed`), a 1 digit number with the fan speed you'd like to set to. Ex. `2`

Example request:  
`https://localhost:8000/temperatureSettings/fanSpeed?fanSpeed=2`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Setting the left/right swing

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/lrSwing`. Include:

- Left/right swing (`lrSwing`), a boolean with whether you'd like to enable left/right swing. Ex. `true`

Example request:  
`https://localhost:8000/temperatureSettings/lrSwing?lrSwing=true`  

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Setting the up/down swing

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/udSwing`. Include:

- Up/down swing (`udSwing`), a boolean with whether you'd like to enable left/right swing. Ex. `false`

Example request:  
`https://localhost:8000/temperatureSettings/udSwing?udSwing=true`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.

### Setting the light

Make a PUT request to `http://[yourServerIP]:[portYouChose]/temperatureSettings/light`. Include:

- Left/right swing (`lrSwing`), a boolean with whether you'd like to enable left/right swing. Ex. `true`

Example request:  
`https://localhost:8000/temperatureSettings/light?light=true`

Sample response:  
`{"status":"OK","temperatureSettings":{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":null}}` in `application/json`.
