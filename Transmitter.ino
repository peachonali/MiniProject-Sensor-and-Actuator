#include <SPI.h> // SPI สำหรับสื่อสารกับ nRF24L01
#include <nRF24L01.h> // สำหรับควบคุมโมดูล nRF24L01
#include <RF24.h> // RF24 ที่ช่วยให้ใช้งาน nRF24L01 ง่ายขึ้น
#include "DHT.h" // สำหรับอ่านค่า DHT11 / DHT22 (Temperature + Humidity)

#define DHTPIN 5          // กำหนดขา DATA ของ DHT11
#define DHTTYPE DHT11  // กำหนดชนิด sensor DHT11

DHT dht(DHTPIN, DHTTYPE); // สร้าง object dht เรียกใช้ฟังก์ชันอ่านค่า(Temperature + Humidity)

// CE = 9, CSN = 10 ของ nRF24L01
RF24 radio(9, 10);
const byte address[6] = "00001"; // address ของข้อมูล Transmitter และ Receiver ติดต่อกันได้

// Sensor pins
const int waterPin = A1;      // Water Sensor
const int trigPin = 3;        // HC-SR04
const int echoPin = 4;        // HC-SR04

// Structure ส่งข้อมูล sensor 3 ตัว ผ่าน nRF24L01 ได้ในครั้งเดียว
struct SensorData 
{
  float temperatureC;
  float humidity;
  float distanceCM;
  int waterLevel;
};

void setup() 
{
  Serial.begin(115200);
  Serial.println("Transmitter ready...");
  dht.begin(); // เริ่มการสื่อสารกับ DHT11
  radio.begin(); //เริ่ม nRF24L01
  radio.openWritingPipe(address);  // ตั้ง address ปลายทาง
  radio.setPALevel(RF24_PA_LOW);   // กำลังส่ง (LOW/MIN/HIGH/MAX)
  radio.stopListening();           // หยุดฟังเพื่อเข้าสู่โหมดส่ง

  pinMode(trigPin, OUTPUT); // HC-SR04 pins 3
  pinMode(echoPin, INPUT); // HC-SR04 pins 4
}

// HC-SR04 คำนวณ calculate distance
float readDistanceCM()
{
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);  // pulse 2 µs จาก trigPin
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10); // pulse 10 µs จาก trigPin
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH); //  วัดเวลาที่ echo กลับ
  float distance = duration * 0.034 / 2; // แปลงเป็น cm
  return distance;
}

void loop() 
{
  SensorData data;
  
  // อ่าน DHT22
  data.temperatureC = dht.readTemperature(); // °C
  data.humidity = dht.readHumidity();        // % RH

  if (isnan(data.temperatureC) || isnan(data.humidity))  //ไม่ให้เกิดค่า NaN 
  {
    Serial.println("DHT read error!");
    delay(2000);
    return;
  }

  // อ่าน HC-SR04
  data.distanceCM = readDistanceCM();

  int total = 0;  // “ตัด noise” ของ Water Sensor
  for (int i = 0; i < 5; i++) 
  {
    total += analogRead(waterPin);
    delay(10);
  }
  data.waterLevel = total / 5;

  // อ่าน Water Sensor
  //ata.waterLevel = analogRead(waterPin); // 0–1023

  // ส่งข้อมูล
  bool YES = radio.write(&data, sizeof(data)); // ส่งข้อมูลทั้งหมดใน data ผ่าน nRF24L01
  if(YES) // ส่งสำเร็จ
  {
    Serial.print("Sent Temp: ");
    Serial.print(data.temperatureC);
    Serial.println(" °C");

    Serial.print("Sent Humidity: ");
    Serial.print(data.humidity);
    Serial.println(" %");

    Serial.print("Sent Distance: ");
    Serial.print(data.distanceCM);
    Serial.println(" cm");

    Serial.print("Sent Water: ");
    Serial.print(data.waterLevel);
    Serial.println(" Level");

    Serial.println(" ");
  } 
  else 
  {
    Serial.println("Send failed!");  // ไม่สำเร็จ แสดง 
  }
  delay(1000);
}