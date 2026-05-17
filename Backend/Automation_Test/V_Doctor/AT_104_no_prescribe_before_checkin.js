const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.get("http://localhost:5173/doctor/medicalList");
        
        // Find an appointment with status 'Chờ checkin' (WAITING)
        let pendingRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Chờ checkin')]")), 10000);
        
        // Find the "Khám bệnh" button
        let startBtn = await pendingRow.findElements(By.xpath(".//button[contains(., 'Khám bệnh')]"));
        
        if (startBtn.length > 0) {
            await startBtn[0].click();
            
            // Wait for consultation page (Visit Detail or similar)
            await driver.wait(until.urlContains("/patients/"), 10000);
            
            // Wait for form elements
            let saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Hoàn thành') or contains(., 'Lưu')]")), 10000);
            await saveBtn.click();
            
            // Wait for "forbidden" toast in bottom right
            // The user mentioned it's a small toast at bottom right
            let forbiddenToast = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'forbidden') or contains(text(), 'Forbidden') or contains(text(), '403')]")), 10000);
            
            if (forbiddenToast) {
                console.log("AT-104 Passed: Hệ thống hiển thị lỗi 'Forbidden' khi lưu đơn cho bệnh nhân chưa Check-in.");
            } else {
                throw new Error("Hệ thống không hiển thị lỗi Forbidden khi lưu đơn cho bệnh nhân chưa Check-in!");
            }
        } else {
            console.log("AT-104 Passed: Không tìm thấy nút bắt đầu khám cho bệnh nhân chưa Check-in.");
        }
    } catch (err) {
        console.error("AT-104 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
