const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/audit-logs");
        
        // Check for table or log entries
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Nhật ký')] | //h2[contains(., 'Nhật ký')]")), 10000);
        
        console.log("AT-149 Passed: Xem nhật ký hoạt động hệ thống thành công.");
    } catch (err) {
        console.error("AT-149 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
