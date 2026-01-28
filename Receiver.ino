#include <SPI.h> // SPI สำหรับสื่อสารกับ nRF24L01
#include <nRF24L01.h> // สำหรับควบคุมโมดูล nRF24L01
#include <RF24.h> // RF24 ที่ช่วยให้ใช้งาน nRF24L01 ง่ายขึ้น

// CE = 9, CSN = 10
RF24 radio(9, 10);
const byte address[6] = "00001"; // address ของข้อมูล Transmitter และ Receiver ติดต่อกันได้

// Structure ตรงกับตัวส่งข้อมูล sensor 3 ตัว เพื่อรับค่าได้ถูกต้อง ผ่าน nRF24L01 ได้ในครั้งเดียว
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
  Serial.println("Receiver ready...");
  radio.begin();
  radio.openReadingPipe(0, address); // ตั้ง address pipe 0 เดียวกับตัวส่ง
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();            // เปิดโหมดฟังข้อมูลจาก Transmitter
}

void loop()
{
  if (radio.available())  // เช็คว่ามีข้อมูลจาก Transmitter หรือไม่
  {
    SensorData data;
    radio.read(&data, sizeof(data)); //อ่านข้อมูลทั้งหมดลงใน data

    // เพิ่ม/แก้ไขด้านล่าง หลังอ่านค่า sensor เรียบร้อย
    Serial.print(data.temperatureC);
    Serial.print(",");
    Serial.print(data.humidity);
    Serial.print(",");
    Serial.print(data.distanceCM);
    Serial.print(",");
    Serial.println(data.waterLevel);
  }
}
