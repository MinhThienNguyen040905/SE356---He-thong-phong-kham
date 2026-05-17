const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        // Wait for realtime notification toast
        let notification = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'toast') and contains(., 'lịch mới')]")), 15000);
        console.log(`AT-103 Passed: Nhận thông báo realtime có lịch mới: ${await notification.getText()}`);
    } catch (err) {
        console.error("AT-103 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
