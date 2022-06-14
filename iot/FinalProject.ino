

/*
 * MIS 482 - Alarm Sistemi
 * Umut Baran Zorlu - 2017502054
 * Salih Eryılmaz - 2017502150
 * Berke Çalış - 2017502174
 */
 
#include "Arduino.h"
#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ArduinoJson.h>
#include <FS.h>
#include <Fetch.h>

#define FIRE_PIN D6
#define MOTION_PIN D5
#define BUZZER_PIN D2
#define LIGHT_PIN D4

String API_ROOT = "https://us-central1-such-wow-92a38.cloudfunctions.net";

bool isWifiConnected = false;
bool inAPMode = false;
bool startPushing = false;

const char* id = "BWwMjjr7r0Gg37Q70G1E";

int motionVal = 0;
int fireVal = 0;

unsigned long startTime;

String ap = "";
String userId = "";
bool ringAlarm = false;


ESP8266WebServer server(80);

int sampleTime = 0;
int sendTime = 0;

void takeSample(){
    if(digitalRead(FIRE_PIN) == LOW){
      fireVal += 1;
    }
    if(digitalRead(MOTION_PIN) == HIGH){
      motionVal += 1;
    }
}

void sampleTimer () {
  int diffSeconds = floor((millis() - sampleTime)/1000);
  
  if(diffSeconds >= 1){
    sampleTime = millis();
    takeSample();
    sendTime += 1;
  }
}

void reset() {
  fireVal = 0;
  motionVal = 0;
}


void getHealth() {
      server.send(200, F("application/json"), "{\"ping\": \"pong\", \"id\": \""+ String(id) +"\"}");
      Serial.print("[INFO] pong.");
}

void writeToConfig(String ssid,String password, String user) {
  File file = SPIFFS.open("/config.json", "w");
     if (!file) {
    Serial.println("[ERROR] Error opening file for writing");
    return;
  }

    int bytesWritten = file.print("{\"ssid\": \""+ ssid + "\", \"password\" : \""+ password +"\", \"user\": \""+ user +"\" }");
 
  if (bytesWritten > 0) {
    Serial.println("[INFO] File was written");
    Serial.println(bytesWritten);
 
  } else {
    Serial.println("[ERROR] File write failed");
  }
  delay(1000);
  file.close();
}


void sendData() {
  RequestOptions options;
  options.body = "";
  options.headers["Connection"] = "keep-alive";
  options.method = "GET";
  
  Response response = fetch((API_ROOT + "/sendData?device=" + String(id) + "&user=" + userId + "&ap=" + ap + "&fireVal=" + fireVal + "&motionVal=" + motionVal).c_str(), options);
  
  String data = response.text();
  Serial.println("[ INFO ] " + data);
  
  if(data == "ok"){
    ringAlarm = false;
    reset();
  }else if(data == "clear"){
    writeToConfig("","","");
    exit(0);
  }else if(data == "zrr"){
    reset();
    ringAlarm = true;
  }
}

void postConnect() {
 if( ! server.hasArg("ssid") || ! server.hasArg("password")  || ! server.hasArg("userId") 
      || server.arg("ssid") == NULL || server.arg("password") == NULL || server.arg("userId") == NULL) {
        Serial.println("" + server.arg("ssid") + " " + server.arg("password") + " " + server.arg("userId"));
    server.send(400, "text/plain", "400: Invalid Request");         // The request is invalid, so send HTTP status 400
    return;
  }
    server.send(200, F("application/json"), "{\"success\": true}");
    Serial.print("[INFO] received ssid and password.");

    writeToConfig(server.arg("ssid"),server.arg("password"),server.arg("userId"));
  delay(5000);
  exit(0);  
}

 
// Define routing
void restServerRouting() {
    server.on("/", HTTP_GET, []() {
        server.send(200, F("text/html"),
            F("Welcome to the REST Web Server"));
    });
    server.on(F("/ping"), HTTP_GET, getHealth);
    server.on(F("/connect"), HTTP_POST, postConnect);
}
 
// Manage not found URL
void handleNotFound() {
  String message = "File Not Found\n\n";
  message += "URI: ";
  message += server.uri();
  message += "\nMethod: ";
  message += (server.method() == HTTP_GET) ? "GET" : "POST";
  message += "\nArguments: ";
  message += server.args();
  message += "\n";
  for (uint8_t i = 0; i < server.args(); i++) {
    message += " " + server.argName(i) + ": " + server.arg(i) + "\n";
  }
  server.send(404, "text/plain", message);
}

bool startAP(const char * ssid, const char * password = NULL) {
  inAPMode = true;
  WiFi.mode(WIFI_AP);
  Serial.print("[ INFO ] Configuring access point... ");
  bool success = WiFi.softAP(ssid, password);
  Serial.println(success ? "Ready" : "Failed!");
  // Access Point IP
  IPAddress myIP = WiFi.softAPIP();
  Serial.print("[ INFO ] AP IP address: ");
  Serial.println(myIP);
  Serial.printf("[ INFO ] AP SSID: %s\n", ssid);
  ap = String(ssid);
  isWifiConnected = success;
  return success;
}
 
void fallbacktoAPMode() {
  Serial.println("[ INFO ] Such Wow is running in Fallback AP Mode");
  uint8_t macAddr[6];
  WiFi.softAPmacAddress(macAddr);
  char ssid[15];
  sprintf(ssid, "Such-wow-%02x%02x%02x", macAddr[3], macAddr[4], macAddr[5]);
  isWifiConnected = startAP(ssid);
}

bool connectSTA(const char* ssid, const char* password, const char* user) {

  WiFi.disconnect(true);
  WiFi.mode(WIFI_STA);

  // First connect to a wi-fi network
  WiFi.begin(ssid, password);

  // Inform user we are trying to connect
  Serial.print(F("[ INFO ] Trying to connect WiFi: "));
  Serial.print(ssid);
  ap = String(ssid);
  // We try it for 20 seconds and give up on if we can't connect
  unsigned long now = millis();
  uint8_t timeout = 20; // define when to time out in seconds
  // Wait until we connect or 20 seconds pass
  do {
    if (WiFi.status() == WL_CONNECTED) {
      break;
    }
    delay(500);
    Serial.print(F("."));
  }
  while (millis() - now < timeout * 1000);
  // We now out of the while loop, either time is out or we connected. check what happened
  if (WiFi.status() == WL_CONNECTED) { // Assume time is out first and check
    Serial.println();
    Serial.print(F("[ INFO ] Client IP address: ")); // Great, we connected, inform
    Serial.println(WiFi.localIP());
    isWifiConnected = true;
    
RequestOptions options;
options.body = "";
options.headers["Connection"] = "keep-alive";
options.method = "GET";

Response response = fetch((API_ROOT + "/matchDevice?id=" + String(id) + "&user=" + String(user).c_str()).c_str(), options);

String data = response.text();
Serial.println("[ INFO ] " + data);

if(!data){
    Serial.println("[ ERROR ] Request could not be sent!");  
}else if(data == "ok"){
  startPushing = true;
}
    
    
    return true;
  }
  else { // We couln't connect, time is out, inform
    Serial.println();
    Serial.println(F("[ WARN ] Couldn't connect in time"));
    return false;
  }
}

bool loadConfiguration() {
  File configFile = SPIFFS.open("/config.json", "r");
  if (!configFile) {
    Serial.println("[ WARN ] Failed to open config file");
    return false;
  }
  size_t size = configFile.size();
  // Allocate a buffer to store contents of the file.
  std::unique_ptr<char[]> buf(new char[size]);
  // We don't use String here because ArduinoJson library requires the input
  // buffer to be mutable. If you don't use ArduinoJson, you may as well
  // use configFile.readString instead.
  configFile.readBytes(buf.get(), size);
  DynamicJsonBuffer jsonBuffer;
  JsonObject& json = jsonBuffer.parseObject(buf.get());
  if (!json.success()) {
    Serial.println("[ WARN ] Failed to parse config file");
    return false;
  }
  Serial.println("[ INFO ] Config file found");
  json.prettyPrintTo(Serial);
  Serial.println();

  const char * ssid = json["ssid"];
  const char * password = json["password"];
  const char * user = json["user"];
  userId = String(user);

  if (!connectSTA(ssid, password, user)) {
    return false;
  }
  return true;
}

void setup(void) {
  delay(1000);
  pinMode(FIRE_PIN, INPUT);
  pinMode(MOTION_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LIGHT_PIN, OUTPUT);
  
  delay(1000);
  digitalWrite(LIGHT_PIN, LOW);
  digitalWrite(LIGHT_PIN, HIGH);
  
  digitalWrite(BUZZER_PIN, HIGH);
  delay(100);
  startTime = millis();
  
  Serial.begin(115200);
  SPIFFS.begin();
  delay(1000);
  if (!loadConfiguration()) {
    fallbacktoAPMode();
  }
  delay(1000);
  Serial.println(WiFi.status());
 
  // Activate mDNS this is used to be able to connect to the server
  // with local DNS hostmane esp8266.local
  if (MDNS.begin("esp8266")) {
    Serial.println("[ INFO ] MDNS responder started");
  }
 
  // Set server routing
  restServerRouting();
  // Set not found response
  server.onNotFound(handleNotFound);
  // Start server
  server.begin();
}
 
void loop(void) {
  server.handleClient();
  if(startPushing){
      sampleTimer();
      if(sendTime == 10){
        sendData();
        sendTime = 0;
      }
  }
  
  if(ringAlarm){
    digitalWrite(BUZZER_PIN, HIGH);
  }
}
