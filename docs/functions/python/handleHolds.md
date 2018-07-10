# handleHolds()
Provides the temperature and fan speed, accounting for any holds.

This function will also remove a hold if it has expired. It will **always** return both the temperature and fan speed, whether a hold is present or not, so it's good practice to use these values any time you need the present set temperature/fan speed.

It's quite complicated, so I've done some extra commenting over there.

## Pass-ins
None.

## Example
`holds = handleHolds()`

Example output:  
```{"temperature":75,"fanSpeed":3}```
