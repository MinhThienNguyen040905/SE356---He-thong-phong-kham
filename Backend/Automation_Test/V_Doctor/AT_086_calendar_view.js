const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/shift");
        
        // Check for calendar element or shift table
        let calendar = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'calendar') or contains(@class, 'rbc-calendar') or contains(., 'Lịch trực') or contains(., 'Ca trực')]")), 10000);
        
        console.log("AT-086 Passed: Bác sĩ xem lịch làm việc cá nhân thành công.");
    } catch (err) {
        console.error("AT-086 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
