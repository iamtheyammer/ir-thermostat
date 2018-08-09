#include <ArduinoJson.h>
#include <LiquidCrystal_I2C.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

/*
 * Welcome to the ir-thermostat controller for ESP8266!
 * This code is meant to run on a NodeMCU board, but it will work on almost every ESP8266.
 * I imagine it could be modified to run on any arduino board with internet connecvtivity.
 *
 * Please read the documentation, available at:
 * https://github.com/iamtheyammer/ir-thermostat/blob/master/esp8266/readme.md
 *
 * By GitHub/iamtheyammer.
 * Licensed, like the rest of the project, under a GNU GPLv3 license.
 *
 * Enjoy!
 */

/*

    NETWORK SETTINGS

*/

char* networkName = "myAwesomeNetwork";
char* networkPassword = "supersecret";

const char* piIPAddress = "10.1.1.37:8000"; // include port unless it's 80

/*

    DELAY SETTINGS

*/

long checkDelay(3000); // how often, in seconds, to check for new data?

/*

    INPUT SETTINGS
    (we recommend you use these three pins: D0, D6 and D7.)

*/

int menuPin = D0;
int leftPin = D7;
int rightPin = D6;

/*

    OTHER SETTINGS

*/

String tempUnit = "C"; // set the temperature unit. this will be overridden once it synchs with your pi.
bool verbose = false; // do you want extra logs to the serial montitor? normally for debugging. default: false

/*
 *
 * END OF SETTINGS
 *
 */

// Construct an LCD object and pass it the
// I2C address, width (in characters) and
// height (in characters). Depending on the
// Actual device, the IC2 address may change.
LiquidCrystal_I2C lcd(0x27, 16, 2);
HTTPClient http;

bool lcdRefreshPause = false; // this will be used for the menu so that the lcd refresh doesn't keep changing the screen
long previousTime = 0; // this is used for a millis() based timing system for the lcd refresh


void setup() {

  Serial.begin(115200);
  lcdInit(); // init the lcd and show welcome text
  initInputs(); // run a pinMode on the input pins

  connectToWifi(); // run the wifi connection
  lcdWrite("Fetching data...", "Please wait!"); // this will only show if it connects to wifi quickly but the pi takes time.
  lcd.clear();
}


void loop() {

  if (WiFi.status() != WL_CONNECTED) { // if the WiFi drops out somehow
    lcdWrite("WiFi Problem.  1", "Check serial!"); //visually alert the user
    Serial.println("Seems like there's a post-connection WiFi issue.");
    Serial.println("Are other devices on your WiFi working?");
    Serial.print("Try going to ");
    Serial.print(piIPAddress);
    Serial.println("/api/current in your web browser from a device connected to the same WiFi. Does JSON appear?");
    Serial.println("The ESP will continue checking for a valid connection every 3 seconds.");
    delay(3000);
    return;
  }

  if(digitalRead(menuPin) == HIGH) {
    verbosePrint("Displaying menu.");
    delay(200);
    menu();
    lcd.clear();
    verbosePrint("Done displaying menu. LCD cleared.");
    delay(500);
  }

  if(digitalRead(leftPin) == HIGH) {
    verbosePrint("Turning off the air conditioner (setting enable to false)");
    delay(200);
    apiCallPut("/api/temperatureSettings/enable/false");
    delay(500);
    lcd.clear();
    verbosePrint("Done disabling air conditioner. LCD cleared.");
  }

  if(digitalRead(rightPin) == HIGH) {
    verbosePrint("Turning off the air conditioner (setting enable to false)");
    delay(200);
    apiCallPut("/api/temperatureSettings/enable/true");
    delay(500);
    lcd.clear();
    verbosePrint("Done enabling air conditioner. LCD cleared.");
  }

  //timer script to update the LCD every 15 seconds
  unsigned long currentTime = millis();

  if (currentTime - previousTime > checkDelay && lcdRefreshPause == false) {
    previousTime = currentTime;
    verbosePrint("Updating the LCD.");
    updateLcd();
  }
}

JsonObject& getCurrent() {
  String response;
  http.begin("http://" + String(piIPAddress) + "/api/temperatureSettings");  //Specify request destination
  int httpCode = http.GET(); //Send the request
  if (httpCode > 0) { //Check the returning code
    response = http.getString();   //Get the request response payload
    //Serial.println(response);                     //Print the response payload (not anymore!)
  } else {
    errorCantConnectToPi();
    Serial.println("I'll keep checking every 30 seconds.");
    delay(300000);
    const size_t bufferSize = JSON_OBJECT_SIZE(2);
    DynamicJsonBuffer jsonBuffer(bufferSize);
    JsonObject& root = jsonBuffer.createObject();
    root["temperature"] = "00";
    root["setTemperature"] = "00";
    return root;
  }

  http.end();   //Close connection
  const size_t bufferSize = JSON_OBJECT_SIZE(7) + 100;
  DynamicJsonBuffer jsonBuffer(bufferSize);
  //const char* current = getCurrent();
  //alows you to pass in JSON, in string form, rather than getCurrent.
  JsonObject& root = jsonBuffer.parseObject(response);
  return root;
}

String getSettings() {
  String response;
  http.begin("http://" + String(piIPAddress) + "/api/current");  //Specify request destination
  int httpCode = http.GET(); //Send the request
  if (httpCode > 0) { //Check the returning code
    response = http.getString();   //Get the request response payload
    Serial.println(response);                     //Print the response payload
  }

  http.end();   //Close connection
  return response;
}

void lcdWrite(String line1, String line2) {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(line1);
  lcd.setCursor(0, 1);
  lcd.print(line2);
}

void lcdInit() {
  // The begin call takes the width and height. This
  // Should match the number provided to the constructor.
  lcd.begin(16, 2);
  lcd.init();
  lcd.backlight();

  lcd.setCursor(0, 0);
  lcd.print("Welcome to");
  lcd.setCursor(0, 1);
  lcd.print("ir-thermostat");
  delay(1000);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("by iamtheyammer.");
  lcd.setCursor(0, 1);
  lcd.print("Under GNU GPLv3.");
  delay(1000);
  lcd.clear();
}

bool connectToWifi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(networkName, networkPassword);
  lcd.setCursor(1, 0);
  lcd.print("Connecting to:");
  lcd.setCursor(0, 1);
  lcd.print(String(networkName) + "...");
  delay(750);

  while (!WiFi.localIP()) {
    delay(10000); // wait 10 seconds before declaring an issue

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Still trying for");
    lcd.setCursor(0, 1);
    lcd.print("30 more seconds.");

    delay(30000);

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WiFi Issue.    0");  // err code 0
    lcd.setCursor(0, 1);
    lcd.print("Check serial!");
    Serial.println("WiFi.status() == WL_DISCONNECTED! There's a problem with your wifi config. Check it and try again.");
    return false;
  }

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connected! IP: ");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  delay(2000);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Raspberry Pi IP:");
  lcd.setCursor(0, 1);
  lcd.print(piIPAddress);

  delay(2000);
  lcd.clear();
}

void errorCantConnectToPi() {
  lcdWrite("Can't connect to", "Pi. Check Serial.");
  Serial.println("I can\'t seem to get JSON from your Pi.");
  Serial.print("Try going to ");
  Serial.print(piIPAddress);
  Serial.println("/api/current and see if there\'s JSON.");
}

JsonObject& updateLcd() {
  const size_t bufferSize = JSON_OBJECT_SIZE(7) + 100;
  DynamicJsonBuffer jsonBuffer(bufferSize);
  //const char* current = getCurrent();
  //alows you to pass in JSON, in string form, rather than getCurrent.
  JsonObject& root = getCurrent();
  //lcd.clear();
  //lcdSetTemperature(int(root["temperature"]), "F");
  //lcdCurrentTemperature(int(root["temperature"]), "F");
  //lcdCurrentHumidity(int(root["humidity"]));

  if(root["enable"] == false) {
    lcd.setCursor(0,0);
    lcd.print("Air is disabled.");
    lcd.setCursor(0,1);
    lcd.print(" | Enable | Menu");
    return root;
  }

  lcd.setCursor(0, 0);
  lcd.print(String(int(root["temperature"])) + String(tempUnit));

  lcd.setCursor(0, 1);
  lcd.print(String(int(root["temperature"])) + String(tempUnit));

  lcd.setCursor(4, 0);
  lcd.print(String(int(root["fanSpeed"])));

  lcd.setCursor(6, 0);
  lcd.print((root["udSwing"] == true) ? "UD" : "  ");

  lcd.setCursor(9, 0);
  lcd.print((root["lrSwing"] == true) ? "LR" : "  ");

  lcd.setCursor(12, 0);
  lcd.print((root["light"] == true) ? "LT" : "  ");

  lcd.setCursor(15, 0);
  lcd.print((root["hold"] == true) ? "H" : " ");

  lcd.setCursor(4, 1);
  lcd.print("xx%");

  lcd.setCursor(14, 1);
  lcd.print("OK");
  return root;
}

String apiCallPut(String url) {
  // pass in a string like "/api/fanSpeed?fanSpeed=1"
  String response;
  http.begin("http://" + String(piIPAddress) + url);  //Specify request destination
  int httpCode = http.PUT(""); //Send the request with no payload
  if (httpCode > 0) { //Check the returning code
    response = http.getString();   //Get the request response payload
    //Serial.println(response);                     //Print the response payload
  }

  http.end();   //Close connection
  return response;
}

void initInputs() {
  pinMode(leftPin, INPUT);
  pinMode(rightPin, INPUT);
  pinMode(menuPin, INPUT);
}

void verbosePrint(String text) {
  if (verbose == true) Serial.println("Verbose output | " + text);
}

void menu() {
  lcdRefreshPause = true; // stop the LCD Refresh so we can menu-ify!
  verbosePrint("just set lcdRefreshPause to true. lcdRefreshPause:");
  verbosePrint(lcdRefreshPause ? "true" : "false");

  lcdWrite("Temperature - ", "Down | Up | Next"); // these are out of the while loop so that only the temperature changes and the display doesn't flicker.
    lcd.setCursor(14,0);
    lcd.print(int(getCurrent()["temperature"]));
  while (digitalRead(menuPin) == LOW) {
    delay(150);
    if (digitalRead(leftPin) == HIGH) {
      unsigned int currentTemp = int(getCurrent()["temperature"]); // unsigned so it can not go below 0.
      verbosePrint("current temp:");
      verbosePrint(String(int(getCurrent()["temperature"])));
      currentTemp-=1;
      apiCallPut("/api/temperatureSettings/temperature?temperature=" + String(currentTemp));
      lcd.setCursor(14,0);
      lcd.print(currentTemp);
      verbosePrint("lowering temperature");
      delay(150);
    }
    if (digitalRead(rightPin) == HIGH) {
      unsigned int currentTemp = int(getCurrent()["temperature"]);
      verbosePrint("current temp:");
      verbosePrint(getCurrent()["temperature"]);
      currentTemp+=1;
      apiCallPut("/api/temperatureSettings/temperature?temperature=" + String(currentTemp));
      lcd.setCursor(14,0);
      lcd.print(currentTemp);
      verbosePrint("upping temperature");
      delay(150);
    }
  }

  delay(150);

  lcd.clear();
  lcdWrite("Fan Speed - ", "Down | Up | Next"); // these are out of the while loop so that only the fan speed changes and the display doesn't flicker.
  lcd.setCursor(12,0);
  lcd.print(int(getCurrent()["fanSpeed"]));
  while (digitalRead(menuPin) == LOW) {
    delay(150);
    if (digitalRead(leftPin) == HIGH) {
      int currentFanSpeed = int(getCurrent()["fanSpeed"]);
      verbosePrint("current fanSpeed:");
      verbosePrint(String(int(getCurrent()["fanSpeed"])));
      if(currentFanSpeed == 0) {
        currentFanSpeed == 6;
      } else {
        currentFanSpeed -= 1;
      }
      apiCallPut("/api/temperatureSettings/fanSpeed?fanSpeed=" + String(currentFanSpeed));
      lcd.setCursor(12,0);
      lcd.print(currentFanSpeed);
      verbosePrint("lowering fanSpeed");
      delay(150);
    }
    if (digitalRead(rightPin) == HIGH) {
      int currentFanSpeed = int(getCurrent()["fanSpeed"]);
      verbosePrint("current fanSpeed:");
      verbosePrint(getCurrent()["fanSpeed"]);
      if(currentFanSpeed == 6) {
        currentFanSpeed == 0;
      } else {
        currentFanSpeed += 1;
      }
      apiCallPut("/api/temperatureSettings/fanSpeed?fanSpeed=" + String(currentFanSpeed));
      lcd.setCursor(12,0);
      lcd.print(currentFanSpeed);
      verbosePrint("upping fanSpeed");
      delay(150);
    }
  }

  delay(150);

  lcd.clear();
  lcdWrite("UD Swing - ", "Off | On | Next"); // these are out of the while loop so that only the fan speed changes and the display doesn't flicker.
  lcd.setCursor(11,0);
  lcd.print(getCurrent()["udSwing"] ? "On " : "Off");
  while (digitalRead(menuPin) == LOW) {
    delay(150);
    if (digitalRead(leftPin) == HIGH) {
      bool currentUdSwing = getCurrent()["udSwing"];
      verbosePrint("current udSwing:");
      verbosePrint(getCurrent()["udSwing"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/udSwing?udSwing=false");
      lcd.setCursor(11,0);
      lcd.print("Off");
      verbosePrint("turning off udSwing");
      delay(150);
    }
    if (digitalRead(rightPin) == HIGH) {
      bool currentUdSwing = getCurrent()["udSwing"];
      verbosePrint("current udSwing:");
      verbosePrint(getCurrent()["udSwing"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/udSwing?udSwing=true");
      lcd.setCursor(11,0);
      lcd.print("On "); // extra space to remove a floating f from off
      verbosePrint("turning on udSwing");
      delay(150);
    }
  }

  delay(150);

  lcd.clear();
  lcdWrite("LR Swing - ", "Off | On | Next"); // these are out of the while loop so that only the fan speed changes and the display doesn't flicker.
  lcd.setCursor(11,0);
  lcd.print(getCurrent()["lrSwing"] ? "On " : "Off");
  while (digitalRead(menuPin) == LOW) {
    delay(150);
    if (digitalRead(leftPin) == HIGH) {
      //bool currentLrSwing = getCurrent()["lrSwing"];
      verbosePrint("current lrSwing:");
      verbosePrint(getCurrent()["lrSwing"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/lrSwing?lrSwing=false");
      lcd.setCursor(11,0);
      lcd.print("Off");
      verbosePrint("turning off lrSwing");
      delay(150);
    }
    if (digitalRead(rightPin) == HIGH) {
      //bool currentUdSwing = getCurrent()["udSwing"];
      verbosePrint("current lrSwing:");
      verbosePrint(getCurrent()["lrSwing"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/lrSwing?lrSwing=true");
      lcd.setCursor(11,0);
      lcd.print("On "); // extra space to remove a floating f from off
      verbosePrint("turning on lrSwing");
      delay(150);
    }
  }

  delay(150);

  lcd.clear();
  lcdWrite("Light - ", "Off | On | Exit"); // these are out of the while loop so that only the fan speed changes and the display doesn't flicker.
  lcd.setCursor(8,0);
  lcd.print(getCurrent()["light"] ? "On " : "Off");
  while (digitalRead(menuPin) == LOW) {
    delay(150);
    if (digitalRead(leftPin) == HIGH) {
      //bool currentUdSwing = getCurrent()["light"];
      verbosePrint("current light:");
      verbosePrint(getCurrent()["light"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/light?light=false");
      lcd.setCursor(8,0);
      lcd.print("Off");
      verbosePrint("turning off light");
      delay(150);
    }
    if (digitalRead(rightPin) == HIGH) {
      //bool currentUdSwing = getCurrent()["udSwing"];
      verbosePrint("current light:");
      verbosePrint(getCurrent()["light"] ? "true" : "false" );
      apiCallPut("/api/temperatureSettings/light?light=true");
      lcd.setCursor(8,0);
      lcd.print("On "); // extra space to remove a floating f from off
      verbosePrint("turning on light");
      delay(150);
    }
  }
  lcdRefreshPause = false;
  return;
}
