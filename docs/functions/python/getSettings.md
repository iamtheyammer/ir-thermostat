# getSettings()
Provides json/settings.json as a python dictionary.

## Pass-ins
None.

## Example
`settings = getSettings()`

Example output:  
```{"webPort":"8000","verbose":true,"checkDelay":60,"temperature":{"tempUnit":"f","validRange":2},"dht":{"enable":true,"type":11,"pin":24},"pir":{ "enable":true,"pin":27,"requireMotion":true},"ir":{"remoteName":"Trane","timesToSendCode":15}}```
