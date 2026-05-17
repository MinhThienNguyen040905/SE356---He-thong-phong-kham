const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/medicalList");
        
        // Find a patient row that is IN_PROGRESS or CHECKED_IN to allow editing
        let actionBtn = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đang khám') or contains(., 'Đã check-in')]//button[contains(., 'Gọi khám') or contains(., 'Khám bệnh')]")), 10000);
        await actionBtn.click();
        
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);
        
        let diagnosisField = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Nhập chẩn đoán bệnh...']")), 10000);
        
        const longDiagnosis = "Bệnh nhân bị viêm họng cấp tính (Acute Pharyngitis) kèm theo các triệu chứng phụ như sốt nhẹ (>37.5°C), ho khan & đau rát cổ họng @#%^&*()_+. Cần theo dõi thêm trong 24-48h tới!!!";
        
        await diagnosisField.clear();
        await diagnosisField.sendKeys(longDiagnosis);
        
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu & Kê đơn')]"));
        await saveBtn.click();
        
        await driver.wait(until.urlContains("/prescription"), 10000);
        console.log("AT-090 Passed: Nhập chẩn đoán dài và ký tự đặc biệt thành công.");
    } catch (err) {
        console.error("AT-090 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
