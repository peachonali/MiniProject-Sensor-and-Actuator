// function ดึงข้อมูล sensor จาก Server
async function fetchSensorData() 
{
    try 
    {
        const response = await fetch('/sensor');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // อัปเดตค่าในหน้าเว็บ
        if (typeof handleSensorUpdate === "function") {
            handleSensorUpdate(data);
        }
    } 
    catch (error) 
    {
        console.error('Error fetching sensor data:', error);
    }
}
// เรียก fetch ทุก 100ms
setInterval(fetchSensorData, 100);

