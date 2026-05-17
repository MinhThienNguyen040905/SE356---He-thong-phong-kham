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
        
        let inProgressRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đang khám')]")), 10000);
        await inProgressRow.findElement(By.xpath(".//button")).click();
        
        // Finalize visit
        let completeBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Hoàn thành')]")), 10000);
        await completeBtn.click();
        
        // Verify status in list
        await driver.get("http://localhost:5173/doctor/medicalList");
        await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đã khám')]")), 10000);
        
        console.log("AT-96 Passed: Chuyển trạng thái Hoàn thành sau khám thành công.");
    } catch (err) {
        console.error("AT-96 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
