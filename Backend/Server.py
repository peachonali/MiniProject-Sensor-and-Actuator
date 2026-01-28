from flask import Flask, jsonify, send_from_directory
from Main import Main
import threading
import time
import os

app = Flask(__name__, static_folder="../Frontend", static_url_path="/")

main_instance = Main()
latest_data = {}

# background thread อ่านค่าจาก Arduino
def update_sensor_data():
    global latest_data
    while True:
        data = main_instance.get_sensor_data()
        if data:
            latest_data = data
        time.sleep(0.1)

thread = threading.Thread(target=update_sensor_data, daemon=True)
thread.start()

# route สำหรับส่งไฟล์หน้าเว็บ
@app.route('/')
def index():
    return send_from_directory("../Frontend", "Structure.html")

# route สำหรับส่งไฟล์ static (css, js)
@app.route('/<path:path>')
def static_files(path):
    return send_from_directory("../Frontend", path)

# API ดึงข้อมูล sensor
@app.route('/sensor', methods=['GET'])
def get_sensor():
    return jsonify(latest_data)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000)