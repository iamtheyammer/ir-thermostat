# getDhtTemperature()
Provides the humidity and temperature as a python dictionary.

## Pass-ins
None.

## Note
The temperature, according to json/settings.json will be in either farenheit or celsius, depending on `settings.temperature.tempUnit`. (where settings = json/settings.json)

## Example
`dht = getDhtTemperature()`

Example output:  
```{"temperature":70.1,"humidity":55.0}```
