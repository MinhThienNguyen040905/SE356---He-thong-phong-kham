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
        
        // Handle stale element or data not loaded yet
        let targetRow;
        try {
            targetRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đang khám') or contains(., 'Đã check-in')]")), 10000);
            let startBtn = await targetRow.findElement(By.xpath(".//button[contains(., 'Khám bệnh')]"));
            await startBtn.click();
        } catch (e) {
            throw new Error("Không tìm thấy ca khám nào ở trạng thái 'Đang khám' hoặc 'Đã check-in'.");
        }
        
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);
        
        // Fill diagnosis - Must be >= 10 characters
        let diagnosisField = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Nhập chẩn đoán bệnh...']")), 10000);
        await diagnosisField.clear();
        await diagnosisField.sendKeys("Bệnh nhân bị viêm họng cấp tính kèm sốt nhẹ.");
        
        // Save/Complete - Exact text from FormMedicalPage.tsx
        let completeBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu & Kê đơn')]"));
        await completeBtn.click();
        
        // Wait for redirection to prescription page
        await driver.wait(until.urlContains("/prescription"), 10000);
        console.log("AT-082 Passed: Đã lưu chẩn đoán và chuyển sang trang kê đơn.");
    } catch (err) {
        console.error("AT-082 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
