# WiFi error codes

If there's a WiFi error code, it will tell you to check serial, and will also
display a number in the top right of the screen. Those codes are explained in
this document.

# 0 - Can't connect during boot sequence

![error0](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/error0.png)

While it's still trying, there's a problem with your username or password.
There may also be a DHCP issue.

Try restarting the board or your WiFi router.

# 1 - Post-boot WiFi Issue

![error1](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/error1.png)

It lost its connection to your WiFi. Can other devices connect? If yes, reset
the board and try again.

# "Can't connect to Pi. Chcek Serial" - Pi not connecting

![error2-cant-connect-to-pi](https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/images/error2-cant-connect-to-pi.png)

Try going to the web portal for your thermostat. If it's not working,
ssh into your pi and restart node.
