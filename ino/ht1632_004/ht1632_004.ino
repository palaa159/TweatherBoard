#include <font_5x4.h>
#include <ht1632.h>
#include <images.h>
 
int irReader = 1;    // the analog input pin for the ir reader
int irVal = 0;       // stores value from Ir reader 
 
int i = 0;
int wd;
boolean isDisplaying = false;
char myChar[200] = "TweatherBoard V1.0 ----- Tweet #TweatherBoard say ...";
int ledPin = 13;
void setup () {
  Serial.begin(115200);
  // Setup and begin the matrix
  // HT1632.begin(CS1,WR,DATA)
  HT1632.begin( 9, 8, 7, 6, 10, 11);
  pinMode(ledPin, OUTPUT);
  // Give the width, in columns, of the assigned string
  // FONT_5x4_WIDTH and FONT_5x4_HEIGHT are parameter specified in the "font_5x4.h" file
  digitalWrite(ledPin, 1);
}

boolean isReading = false;
String inputString = "";

void loop () {
  irVal = analogRead(irReader);    // read the value from the ir sensor
  if(Serial.available() > 0) {
    char inChar = (char)Serial.read();
    if(inChar == '`') {
     // Stops reading
     isReading = false;
     inputString.toCharArray(myChar, 200);
     i = 0;
//     isDisplaying = false;
//     isDisplaying == false;
//     Serial.println(inputString);
     inputString = "";
    }
    if(isReading) {
      inputString += inChar;
//      Serial.println(inputString);
    }
    if(inChar == '|') {
      // start reading
      isReading = true;
    }
  }
  if(isDisplaying == false) {
  displayOnPanel(myChar);
  }
  
  if(irVal > 80) {
  Serial.print('@');
  Serial.print('w');
  Serial.print('#');
  }
    
  
  delay(1);
}

void displayOnPanel(char myChar[]) {
//  isDisplaying = true;
  wd = HT1632.getTextWidth(myChar, FONT_5X4_WIDTH, FONT_5X4_HEIGHT);
  // Font rendering example
  HT1632.drawTarget(BUFFER_BOARD(1));
  HT1632.clear();
  HT1632.drawText(myChar, 4*OUT_SIZE - i, 2, FONT_5X4, FONT_5X4_WIDTH, FONT_5X4_HEIGHT, FONT_5X4_STEP_GLYPH);
  HT1632.render();  
  
  HT1632.drawTarget(BUFFER_BOARD(2));
  HT1632.clear();
  HT1632.drawText(myChar, 3*OUT_SIZE - i, 2, FONT_5X4, FONT_5X4_WIDTH, FONT_5X4_HEIGHT, FONT_5X4_STEP_GLYPH);
  HT1632.render(); 

  HT1632.drawTarget(BUFFER_BOARD(3));
  HT1632.clear();
  HT1632.drawText(myChar, 2*OUT_SIZE - i, 2, FONT_5X4, FONT_5X4_WIDTH, FONT_5X4_HEIGHT, FONT_5X4_STEP_GLYPH);
  HT1632.render(); 
  
  HT1632.drawTarget(BUFFER_BOARD(4));
  HT1632.clear();
  HT1632.drawText(myChar, 1*OUT_SIZE - i, 2, FONT_5X4, FONT_5X4_WIDTH, FONT_5X4_HEIGHT, FONT_5X4_STEP_GLYPH);
  HT1632.render(); 
   
  i = (i+1)%(wd + OUT_SIZE * 5); 
  // set ready signal to node
  if(i == (wd + OUT_SIZE * 5) - 25) {
    Serial.print('@');
    Serial.print('^');
    Serial.print('#');
//    isDisplaying = true;
  }
}

