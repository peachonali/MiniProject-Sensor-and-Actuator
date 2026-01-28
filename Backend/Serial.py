import serial
import time

class ArduinoSerial:
    def __init__(self, port='COM7', baudrate=115200, timeout=1):
        """
        port: COM port ของ Receiver Arduino
        baudrate: ต้องตรงกับ Serial.begin() ใน Arduino
        timeout: เวลาอ่าน Serial
        """
        self.ser = serial.Serial(port, baudrate=baudrate, timeout=timeout)
        time.sleep(2)  # รอ Arduino เริ่มต้น

    def read_data(self):
        """
        อ่านค่า SensorData จาก Arduino (CSV)
        คืนค่าเป็น dict: {temperatureC, humidity, distanceCM, waterLevel}
        """
        if self.ser.in_waiting > 0:
            try:
                line = self.ser.readline().decode('utf-8').strip()
                if line == "":
                    return None  # ข้ามบรรทัดว่าง
                parts = line.split(",")
                if len(parts) != 4:
                    return None  # ข้อมูลไม่ครบ
                return {
                    'temperatureC': float(parts[0]),
                    'humidity': float(parts[1]),
                    'distanceCM': float(parts[2]),
                    'waterLevel': int(parts[3])
                }
            except Exception as e:
                print("Error reading serial:", e)
                return None
        return None

    def close(self):
        self.ser.close()


# ตัวอย่างการใช้งาน
if __name__ == "__main__":
    arduino = ArduinoSerial(port='COM7')
    try:
        while True:
            sensor_data = arduino.read_data()
            if sensor_data:
                print(sensor_data)
            time.sleep(0.1)  # อ่านทุก 100ms
    except KeyboardInterrupt:
        arduino.close()
        print("Serial closed")