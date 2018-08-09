# ESP8266 ir-thermostat controller

This document outlines how to use an ESP8266 to control your thermostat!

## Table of Contents

- [Setup](#Setup)
- [Usage](#Usage)
  - [Booting](#booting)
  - [Normal usage](#normal-usage)
  - [Using the menu](#using-the-menu)
  - [Enabling/disabling the air conditioner](#enablingdisabling-the-air-conditioner)

## Setup

1. Assemble your breadboard matching to this image.

Parts (these are the exact ones I used):
 - [1x NodeMCU ESP8266](https://www.aliexpress.com/item/V3-Wireless-module-NodeMcu-4M-bytes-Lua-WIFI-Internet-of-Things-development-board-based-ESP8266-for/32469441553.html), I got the CH340(G) version, it's cheaper and the same thing
 - [3x button](https://www.aliexpress.com/item/Free-shipping-20set-Tactile-Push-Button-Switch-Momentary-Tact-Cap-12-12-7-3MM-Micro-switch/32730484504.html)
 - [3x 100-1000ohm resistor](https://www.aliexpress.com/item/100pcs-Metal-film-resistor-1-4W-series-1R-2-2M-1-resistance-10K-22K-47K-100K/32853910663.html)
 - [1x I2C 16x2 character LCD display](https://www.aliexpress.com/item/1602-LCD-Module-Blue-Yellow-Green-Screen-with-IIC-I2C-16x2-LCD-Backlight-Module-LCD-1602/32891917063.html)
 - [8 male to male jumpers (minimum!)](https://www.aliexpress.com/item/Free-Shipping-20pcs-20cm-2-54mm-1p-1p-Pin-Male-to-Male-Color-Breadboard-Cable-Jump/32607637283.html)
 - [breadboard (technically optional)](https://www.aliexpress.com/item/Free-Shipping-Quality-mini-bread-board-breadboard-8-5CM-x-5-5CM-400-holes/32251908772.html)
 - [4 male to female jumpers (minimum!)](https://www.aliexpress.com/item/10pcs-10cm-2-54mm-1p-1p-Pin-Female-to-Male-Color-Breadboard-Cable-Jump-Wire-Jumper/32636925245.html)

![wiring diagram](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/breadboard.png)

2. Set up the Arduino IDE for ESP flashing

(Don't have the Arduino IDE? That's ok! It's [here](https://www.arduino.cc/en/Main/Software).)

These instructions are copied from [esp8266/Arduino](https://github.com/esp8266/Arduino):

> - Install the current upstream Arduino IDE at the 1.8 level or later. The current version is at the [Arduino website](http://www.arduino.cc/en/main/software).
- Start Arduino and open Preferences window.
- Enter ```http://arduino.esp8266.com/stable/package_esp8266com_index.json``` into *Additional Board Manager URLs* field. You can add multiple URLs, separating them with commas.
- Open Boards Manager from Tools > Board menu and install *esp8266* platform (and don't forget to select your ESP8266 board from Tools > Board menu after installation).

3. (Mac only) Install the CH340G driver

[Here's](http://www.wch.cn/download/CH341SER_MAC_ZIP.html) the link. Download, install and restart.

4. Install required libraries

You'll need:
- ArduinoJson (installable from Sketch -> Include Library -> Libraries Manager)
- LiquidCrystal_I2C (download [here](https://github.com/marcoschwartz/LiquidCrystal_I2C/archive/master.zip), unzip and put the file in your Arduino/libraries folder)
- ESP8266WiFi (preinstalled!)
- ESP8266HTTPClient (preinstalled!)

5. Download the sketch!

It's [here](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/ir_thermostat_controller/ir_thermostat_controller.ino). Just right click on "Raw", Save Link As... and save it. Then open the file you just downloaded in the Arduino IDE.

6. Change settings

- Under network settings, put your WiFi name and password along with your thermostat pi's IP (to the web portal, includes the port, like `10.1.1.30:8000`)
- Under delay settings, you can change the LCD update delay
- Under input settings, you *can* change the pins. However, D0, D6 and D7 are the NodeMCU 'safe pins', which means that they can be pulled high or low and still boot and flash just fine. We do not recommend changing these.
- Under other settings, you can change your temperature unit and turn off/on verbose mode. (verbose mode prints debug info to the serial monitor)

7. Flash!

Go to Tools in the menubar, and copy these options:

![wiring diagram](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/flash_menu.png)

Your port may be different.

Now, click the upload button (looks like this: `->`) and watch the magic happen.

8. Done!

## Usage

### Booting

You should see something like this as it boots:

![boot1](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/boot1.png)
![boot2](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/boot2.png)
![boot3](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/boot3.png)
![boot4](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/boot4.png)
![boot5](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/boot5.png)

### Normal Usage

This screen is the main status screen:

![statusScreen](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/main-status.png)

It's in this format:

Temperature FanSpeed UpDownSwing LeftRightSwing Light Hold  
Temperature UnusedHumidity      StatusIndicator

For the up/down swing, left/right swing, light and hold, if something is off it will disappear. For example, in this image, up/down swing and light is off. There's also no hold.

![statusScreen2](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/main-status2.png)

#### Using the menu

When you press the menu button (should be on the far right), the menu appears.

First, you see the temperature controls:

![menu-temperature](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/menu-temperature.png)

Use the left and right buttons to change the temperature, and press the menu button to continue.

Next are the fan speed controls:

![menu-fanSpeed](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/menu-fanSpeed.png)

Use the left and right buttons to change the fan speed, and press the menu button to continue.

Up/down swing controls:

![menu-udSwing](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/menu-udSwing.png)

The left button turns off up/down swing and the right (physically in the center) button turns it on. Press the menu button to continue.

Left/right swing controls:

![menu-lrSwing](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/menu-lrSwing.png)

Same controls as up/down swing.

Light controls:

![menu-fanSpeed](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/menu-fanSpeed.png)

That's the end of the menu, so pressing the menu button will exit the menu.

#### Enabling/disabling the air conditioner

To disable the air conditioner, from the main status screen, press the left button. The screen will change to this:

NOTE: If your check delay is high, the screen may be blank for a few seconds when disabling/enabling. This is **normal behavior**.

![airDisabled](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/lcd/air-disabled.png)

To re-enable, just press the right (physically in the center) button.
