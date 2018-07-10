# Using/modifying irSend(props)

irSend expects a dictionary of props, and it will use those props to assemble the 'key' name for LIRC.

irSend will most likely need to be modified to make your air conditioner work.

## Modifying this function to work with your air conditioner

By default, the 'key compiler' looks like this:
```
if props[enable] == True:
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
elif props[enable] == False:
    irCommand = 'OFF'
```

If you're making your own lircd.conf (few air conditioners have ones premade), I recommend you use this format (every line ends with an underscore except for the last line):
- Temperature first, as a number.
- If the light is on, add 'LT'.
- If up/down swing is on, add 'UDS' (for Up/Down Swing)
- If left/right swing is on, add 'LRS' (for Left/Right Swing)
- Finally, add the fan speed. I used 0 = auto and 6 = 5+turbo. Make sure you change the if statements if you plan to change this format.

If you have a working function of this and a working lircd.conf, please make a pull request with your customised irSend key compiler and lircd.conf so that others can benefit from your work!

## Running this function from somewhere else in the code

One dictionary should be passed into this function.
enable (bool), temperature (int), udswing (bool), lrswing (bool), light (bool), fanSpeed (int, 0-6, where 0 = auto and 6 = 5 + turbo)
  # example: {'enable':True, 'temperature':71, 'udswing':True, 'lrswing':True, 'light':True, 'fanSpeed':2}

- `enable` (type boolean): This t/f value tells whether the air conditioner should be on or not. You may send the dictionary with only this object, example: `{'enable':False}`
-  `temperature` (type int): The temperature to set the air conditioner to.
- `udswing` (type boolean): Whether to turn on up/down swing.
- `lrswing` (type boolean): Whether to turn on left/right swing.
- `light` (type boolean): Whether to turn on the light.
- `fanSpeed` (type int): The fan speed to set the air conditioner to. 0 = auto, 6 = 5+turbo.

Example:  
`{'enable':True, 'temperature':71, 'udswing':True, 'lrswing':True, 'light':True, 'fanSpeed':2}`  
In this example, the air conditioner is on, the temperature is set to 71 degrees, the up/down swing is on, left/right swing is on, the light is on and the fan speed is set to 2.
