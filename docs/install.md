# Installation
Here's how to get ready to go, from a fresh install of Raspbian:

Most of this guide follows the steps from [here](http://alexba.in/blog/2013/01/06/setting-up-lirc-on-the-raspberrypi/), but in case Alex's blog goes down, here's a copy.

1. Run an update and upgrade
  - `sudo apt-get update`
  - `sudo apt-get upgrade`
2. Install some packages you'll need
  - `sudo apt-get install lirc python-gpiozero python3-gpiozero git build-essential python-dev nodejs tmux python3-setuptools python3-pip`
3. Modify `/etc/modules`
  - `sudo nano /etc/modules`
  - Paste this in at the bottom (feel free to change the pins if you know what you're doing):
```
lirc_dev
lirc_rpi gpio_in_pin=23 gpio_out_pin=22
```

4. Modify your `hardware.conf`
  - `sudo nano /etc/lirc/hardware.conf`
  - Paste this in:
```
########################################################
# /etc/lirc/hardware.conf
#
# Arguments which will be used when launching lircd
LIRCD_ARGS="--uinput"

# Don't start lircmd even if there seems to be a good config file
# START_LIRCMD=false

# Don't start irexec, even if a good config file seems to exist.
# START_IREXEC=false

# Try to load appropriate kernel modules
LOAD_MODULES=true

# Run "lircd --driver=help" for a list of supported drivers.
DRIVER="default"
# usually /dev/lirc0 is the correct setting for systems using udev
DEVICE="/dev/lirc0"
MODULES="lirc_rpi"

# Default configuration files for your hardware if any
LIRCD_CONF=""
LIRCMD_CONF=""
########################################################
```
4. Modify your `/boot/config.txt`
  - Add this at the bottom:
  - `dtoverlay=lirc-rpi,gpio_in_pin=23,gpio_out_pin=22`
5. Reboot your Pi
  - `sudo reboot 0`
6. Test your IR reciever
  - `sudo service lircd stop`
  - `mode2 -d /dev/lirc0`
  - Press some buttons on your remote and see if stuff prints to your terminal.
7. Test your IR emitter
```
  # Stop lirc to free up /dev/lirc0
sudo /etc/init.d/lirc stop

# Create a new remote control configuration file (using /dev/lirc0) and save the output to ~/lircd.conf
irrecord -d /dev/lirc0 ~/lircd.conf

# Make a backup of the original lircd.conf file
sudo mv /etc/lirc/lircd.conf /etc/lirc/lircd_original.conf

# Copy over your new configuration file
sudo cp ~/lircd.conf /etc/lirc/lircd.conf

# Start up lirc again
sudo /etc/init.d/lirc start
```
```
# List all of the commands that LIRC knows for 'yamaha'
irsend LIST yamaha ""

# Send the KEY_POWER command once
irsend SEND_ONCE yamaha KEY_POWER

# Send the KEY_VOLUMEDOWN command once
irsend SEND_ONCE yamaha KEY_VOLUMEDOWN
```
### If you get the `too short gap` error from irrecord
This one is a bit of a problem and doesn't have an easy solution. The best bet is to record codes on an Arduino Uno. Instructions:
1. Upload the sketch at docs/examples/arduino_ir_record.ino to your Uno.
2. Connect your IR Reciever: VCC to 5v, GND to ground, DAT (data) to digital pin 2
3. Open the serial monitor, and after the prompt, press a button on your remote.
4. Clean the IR code with [this python script](https://github.com/iamtheyammer/ir-cleaner) (it has a LIRC output option)
5. Copy and paste docs/examples/example.lircd.conf into a text editor, and add your gap and code from the cleaner
6. `sudo nano /etc/lirc/lircd.conf.d/[choose a name].lircd.conf`
7. Paste in your lircd.conf from step 5
8. `sudo service lircd restart`
9. `irsend LIST "" ""`
10. If `Example` comes up, it's working.
11. Try sending: `irsend SEND_ONCE Example [most likely CLEANED_IR (you'll need to change that name if you want more than one code)]` You may need to send the code a few times.
12. It should have worked! Follow the first few steps for every IR code you want to capture.

### If you get the `hardware does not support sending` error from irsend
- `sudo nano /etc/lirc/lirc-options.conf`
- Change the `driver` line to `default`
- `sudo mv /etc/lirc/lircd.conf.d/devinput.lircd.conf /etc/lirc/lircd.conf.d/devinput.lircd.dist`
- `sudo service lircd restart`
-  Try again
8. Install the Adafruit_Python_DHT library
  - `git clone https://github.com/adafruit/Adafruit_Python_DHT.git`
  - `cd Adafruit_Python_DHT`
  - `sudo python3 setup.py install`
9. Install node.js
  - `uname -m`
  If this command spits out something that starts with `armv6`, use the ARMv6 instructions.
### ARMv7 instructions
  - `curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -` - the newest LTS version of node right now is 8. Replace the 8 with the newest LTS version.
  - `sudo apt-get install nodejs`
### ARMv6 instructions
  - `wget http://node-arm.herokuapp.com/node_latest_armhf.deb`
  - `sudo dpkg -i node_latest_armhf.deb`
note: I haven't tested this on ARMv6.
10. Install the ir-thermostat repository
  - `git clone https://github.com/iamtheyammer/ir-thermostat.git`
11. Open the repository
  - `cd ir-thermostat`
12. Install necessary node packages
  - `cd node`
  - `npm i express fs path body-parser mustache mu2Express`
13. Start the scripts
  - `tmux new -s "thermostat-python"`
  - `cd python`
  - `python3 thermostat.py`
  - Ctrl+B, then D
  - `tmux new -s "thermostat-node"`
  - `cd node`
  - `node app.js`
  - `tmux a` will put you back in those sessions.
14. Set your settings!
  - Navigate to [http://localhost:8000/settings](http://localhost:8000/settings) if you're doing this on the local system or go to [pi/server's IP]:8000/settings to do this from a remote machine. (tip: you can figure out your server's IP by doing `ifconfig`)
  - Fill in every box! (if you're not using a DHT or PIR sensor, feel free to leave those blank as they won't be necessary.)
15. Watch the magic
  - You should be done! Yep, that's it. Feel free to change settings as you please!  
(16. Check for errors)  
  - I would highly recommend that you check for errors from the python and node scripts before calling it a day. Just `tmux a` back in, make sure everything's working alright and you're super-duper set!
