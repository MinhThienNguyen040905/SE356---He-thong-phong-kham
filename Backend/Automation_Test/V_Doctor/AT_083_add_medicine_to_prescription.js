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
        
        // Find a patient and start examination
        let targetRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đang khám') or contains(., 'Đã check-in')]")), 10000);
        let startBtn = await targetRow.findElement(By.xpath(".//button[contains(., 'Khám bệnh')]"));
        await startBtn.click();
        
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);

        // Fill diagnosis first to enable prescription button
        let diagnosisField = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Nhập chẩn đoán bệnh...']")), 10000);
        await diagnosisField.clear();
        await diagnosisField.sendKeys("Bệnh nhân bị viêm họng cấp tính kèm sốt nhẹ.");

        // Click Save & Prescribe button
        let prescriptionLink = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lưu & Kê đơn')]")), 10000);
        await prescriptionLink.click();
        
        await driver.wait(until.urlContains("/prescription"), 10000);
        
        // Search medicine
        let medicineSearch = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm thuốc')]")), 10000);
        await medicineSearch.sendKeys("Para");
        
        // Wait for suggestions and click one
        let suggestion = await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Para')]")), 5000);
        await suggestion.click();
        
        // Fill dosage (Morning)
        let morningInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@name, 'dosageMorning')]")), 5000);
        await morningInput.clear();
        await morningInput.sendKeys("1");
        
        let daysInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@name, 'days')]")), 5000);
        await daysInput.clear();
        await daysInput.sendKeys("5");
        
        // Click Save Prescription
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu đơn thuốc')]"));
        await saveBtn.click();
        
        await driver.wait(until.urlContains("/medicalList"), 10000);
        console.log("AT-083 Passed: Thêm thuốc và lưu đơn thuốc thành công.");
    } catch (err) {
        console.error("AT-083 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
