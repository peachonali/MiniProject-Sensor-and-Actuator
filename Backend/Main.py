from Serial import ArduinoSerial
import time

class Main:
    def __init__(self):
        # สร้าง instance ของ Serial.py
        self.arduino = ArduinoSerial(port='COM7')

    def get_sensor_data(self):
        """
        ดึงค่า sensor ล่าสุดจาก Arduino
        คืนค่าเป็น dict หรือ None ถ้าไม่มีค่า
        """
        return self.arduino.read_data()

    def close(self):
        self.arduino.close()


# ตัวอย่างการใช้งาน
if __name__ == "__main__":
    main = Main()
    try:
        while True:
            data = main.get_sensor_data()
            if data:
                # แสดงผลใน Terminal
                print(data)
            time.sleep(0.1)  # อ่านทุก 100ms
    except KeyboardInterrupt:
        main.close()
        print("Main.py closed")