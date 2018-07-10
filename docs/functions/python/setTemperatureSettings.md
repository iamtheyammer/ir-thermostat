# setTemperatureSettings()
Sets the value of json/temperatureSettings.json

## Pass-ins
- A dictionary, containing:
  - `enable` (type boolean): whether the air conditoner should be on or not
  - `temperature` (type int): the non-hold temperature
  - `fanSpeed` (type int): the non-hold fan fan speed
  - `lrSwing` (type boolean): whether the left/right swing should be on
  - `udSwing` (type boolean): whether the up/down swing should be on
  - `light` (type boolean): whether the light should be on
  - `hold` (type object/null): whether a hold is on or not. (object if there's a hold, null if not [note: null = None in python])
    - `holdTemperature` (type int) (optional): the hold temperature to set to for the duration of the hold
    - `holdFanSpeed` (type int) (optional): the fan speed to set to for the duration of the hold
    - `holdExpiry` (type int) (required if a hold is active): the time, in unix epoch when the hold expires. the code expects this to be 2 hours (7200 seconds). when setting this, it should `Math.round(time.time()+7200)` [in UTC, of course]


## Example
`setTemperatureSettings({"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":{'holdTemperature':72,"holdExpiry":1531196729}})`

Example output:  
```{"enable":false,"temperature":"75","fanSpeed":"1","lrSwing":true,"udSwing":false,"light":true,"hold":{'holdTemperature':72,"holdExpiry":1531196729}}```
