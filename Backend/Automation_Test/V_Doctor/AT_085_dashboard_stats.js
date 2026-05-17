const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/dashboard");
        
        // Find stats card for appointments - Based on common dashboard UI
        let statsCard = await driver.wait(until.elementLocated(By.xpath("//div[contains(., 'Ca khám') or contains(., 'Lịch hẹn') or contains(., 'Appointments')]")), 10000);
        console.log("AT-085 Passed: Dashboard hiển thị các chỉ số thống kê thành công.");
    } catch (err) {
        console.error("AT-085 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
