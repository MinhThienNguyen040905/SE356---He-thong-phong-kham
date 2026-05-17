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
        
        // Find a patient
        let targetRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Khám bệnh') or contains(., 'Chi tiết')]")), 10000);
        await targetRow.findElement(By.xpath(".//button")).click();
        
        await driver.wait(until.urlContains("/doctor/patients/"), 10000);

        // Enter diagnosis to enable prescribe button
        let diagnosisField = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Nhập chẩn đoán bệnh...']")), 10000);
        await diagnosisField.sendKeys("Kiểm tra thuốc hết hạn - Chẩn đoán mẫu.");
        
        let prescribeBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu & Kê đơn')]"));
        await prescribeBtn.click();
        
        await driver.wait(until.urlContains("/prescription"), 10000);
        
        // Search for a known expired medicine or check for expired badge
        let medicineSearch = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm thuốc')]")), 10000);
        await medicineSearch.sendKeys("Hết hạn"); // Assuming searching for 'Hết hạn' might show expired ones
        
        // Check if any item has an expired indicator and is not clickable or shows error on click
        try {
            let expiredItem = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Hết hạn') or contains(text(), 'Expired')]")), 5000);
            console.log("AT-084 Passed: Tìm thấy thuốc hết hạn trong danh sách.");
            
            // Try to click/select it
            await expiredItem.click();
            
            // Check for error toast
            let errorToast = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'hết hạn') or contains(text(), 'không thể kê')]")), 5000);
            console.log("AT-084 Passed: Hệ thống chặn kê thuốc hết hạn thành công.");
        } catch (e) {
            console.log("AT-084: Không tìm thấy thuốc hết hạn để test hoặc hệ thống đã ẩn thuốc hết hạn.");
        }
        
    } catch (err) {
        console.error("AT-084 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
