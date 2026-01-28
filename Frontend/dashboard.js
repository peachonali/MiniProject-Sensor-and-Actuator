// ดึง element รูปโลกจาก HTML
const earth = document.getElementById("earthImage");
// เก็บสถานะว่ากำลังลากหรือไม่
let isDragging = false;
// เก็บตำแหน่งแกน X ก่อนหน้าเวลาเริ่มลาก
let previousX = 0;
// เก็บมุมการหมุนปัจจุบันของโลก
let currentRotation = 0;
// เมื่อกดเมาส์ลงบนโลก เริ่มต้นการลาก
earth.addEventListener("mousedown", (e) => {
    isDragging = true;                  // ตั้งสถานะเป็นกำลังลาก
    previousX = e.clientX;             // บันทึกตำแหน่งเมาส์แกน X ปัจจุบัน
    earth.style.cursor = "grabbing";   // เปลี่ยน cursor ให้เหมือนกำลังจับ
});
// เมื่อเมาส์เคลื่อนที่
document.addEventListener("mousemove", (e) => {
    if(!isDragging) return;            // ถ้าไม่ได้ลาก ให้หยุดทำงาน
    // คำนวณระยะที่ลากในแนวนอน
    const deltaX = e.clientX - previousX;
    // บวกมุมหมุนตามระยะลาก ปรับ 0.5 เพื่อให้หมุนไม่เร็วเกินไป
    currentRotation += deltaX * 0.5;
    // อัปเดต transform ของโลก: อยู่กึ่งกลาง + หมุนตามมุม
    earth.style.transform = `translate(-50%, -50%) rotate(${currentRotation}deg)`;
    // อัปเดตตำแหน่ง X ก่อนหน้า
    previousX = e.clientX;
});
// เมื่อปล่อยเมาส์ จบการลาก
document.addEventListener("mouseup", () => {
    isDragging = false;               // ปรับสถานะเป็นไม่ได้ลาก
    earth.style.cursor = "grab";      // เปลี่ยน cursor กลับเป็น grab
});

function handleSensorUpdate(data) // ฟังก์ชันอัปเดตค่าจากเซ็นเซอร์
{
    document.getElementById('temperature').textContent = data.temperatureC.toFixed(2);
    document.getElementById('humidity').textContent = data.humidity.toFixed(2);
    document.getElementById('distance').textContent = data.distanceCM.toFixed(2);
    document.getElementById('waterLevel').textContent = data.waterLevel;

    // --- ส่วนของ Temperature ---
    const tempC = data.temperatureC;
    const maxTemp = 50; // ค่าสูงสุดของสเกล (จาก 0 ถึง 50)
    const thermoFill = document.getElementById('thermoFill');
    const thermoCallout = document.getElementById('thermoCallout');
    const thermoCalloutValue = document.getElementById('thermoCalloutValue');
    // 2. คำนวณเปอร์เซ็นต์ความสูง (0-100%)
    let tempPercent = Math.min(Math.max((tempC / maxTemp) * 100, 0), 100);
    // 3. อัปเดตความสูงของแถบสี
    thermoFill.style.height = tempPercent + "%";
    // 4. อัปเดตข้อความในป้ายชี้
    thermoCalloutValue.textContent = tempC.toFixed(2);
    // 5. อัปเดตตำแหน่งของป้ายชี้ (ให้ 'bottom' เท่ากับ 'height' ของแถบสี)
    thermoCallout.style.bottom = tempPercent + "%";
    // 6. ทำให้ป้ายชี้มองเห็นได้ (หลังจากมีค่าครั้งแรก)
    thermoCallout.style.opacity = 1;
    // 7. (Optional) อัปเดตค่าเดิมที่ซ่อนไว้ด้วย
    document.getElementById('temperature').textContent = tempC.toFixed(2);


    // --- ส่วนของ Humidity ---
    const humidity = Math.min(Math.max(data.humidity, 0), 100); // จำกัดค่าความชื้นให้อยู่ในช่วง 0-100%
    const humVal = document.getElementById('humidityValue');
    if(humVal) humVal.textContent = humidity.toFixed(2);
    // 3. คำนวณระดับน้ำ (สำคัญ!)
    // เราใช้ translateY ในการเลื่อนน้ำ
    // 100% = น้ำอยู่ล่างสุด (แห้ง)
    // 0% หรือ -X% = น้ำเลื่อนขึ้นไปข้างบน (เต็ม)
    // สูตร: เริ่มที่ 100 (แห้ง) ลบด้วยค่าความชื้น
    // ถ้าความชื้น 0 -> translate 100% (อยู่ก้นแก้ว)
    // ถ้าความชื้น 100 -> translate 0% (เต็มแก้ว)
    // แต่เพื่อให้สวยงามและเผื่อพื้นที่หัวหยดน้ำ เราใช้สูตรเชิงเส้นนิดหน่อย
    // ลองสูตรนี้ครับ: ยิ่งความชื้นมาก ค่า translate ยิ่งน้อย (เลื่อนขึ้น)
    const translateVal = 100 - humidity; 
    const waterFill = document.getElementById('waterFill');
    if(waterFill) // หมุน -45 เพื่อรักษาระนาบ แล้วเลื่อนแกน Y
    {
        waterFill.style.transform = `rotate(-45deg) translateY(${translateVal}%)`;
    }
    const humHidden = document.getElementById('humidity');
    if(humHidden) humHidden.textContent = humidity.toFixed(2);


    // --- ส่วนของ Distance ---
    const dist = data.distanceCM;
    const distElement = document.getElementById('distance');// อัปเดตตัวเลข
    if(distElement) distElement.textContent = dist.toFixed(2);
    const radarScreen = document.getElementById('radarScreen');     // ดึง Element มาเปลี่ยนสี
    const radarDot = document.querySelector('.radar-dot');

    let mainColor = '#33ff00'; 
    let glowColor = 'rgba(51, 255, 0, 0.3)';
    // ถ้าใกล้กว่า 20cm ให้เปลี่ยนเป็นสีแดง (Red Alert)
    if (dist < 20)
    {
        mainColor = '#ff0000';
        glowColor = 'rgba(255, 0, 0, 0.5)';
        // สั่งให้จุดกระพริบเร็วขึ้น
        if(radarDot) radarDot.style.animationDuration = '0.1s';
    } else 
    {
        if(radarDot) radarDot.style.animationDuration = '1s';// กลับเป็นปกติ
    }
    if(radarScreen) // เปลี่ยนสีขอบ
    {
        radarScreen.style.borderColor = mainColor;
        radarScreen.style.boxShadow = `0 0 15px ${glowColor}, inset 0 0 20px ${glowColor}`;
        const valText = radarScreen.querySelector('.value');// เปลี่ยนสีตัวเลข
        const unitText = radarScreen.querySelector('.unit');
        if(valText)
        {
            valText.style.color = mainColor;
            valText.style.textShadow = `0 0 5px ${mainColor}`;
        }
        if(unitText) unitText.style.color = mainColor;
    }


    // --- ส่วนของ Water Level ---
    const waterLevel = data.waterLevel; // รับค่า 0 - 1000
    
    // 1. แสดงตัวเลข
    const waterValElement = document.getElementById('waterLevel');
    if(waterValElement) waterValElement.textContent = waterLevel;

    // 2. คำนวณความสูงน้ำ
    const liquidFill = document.getElementById('liquidFill');
    if(liquidFill) {
        // กำหนดค่าสูงสุดของถัง = 1000
        const maxVal = 1000; 
        
        // คำนวณ % ความสูง
        let percentage = (waterLevel / maxVal) * 100;
        
        // บังคับค่าไม่ให้เกิน 0-100%
        percentage = Math.min(Math.max(percentage, 0), 100);
        
        // สั่งปรับความสูง
        liquidFill.style.height = percentage + "%";
    }
}