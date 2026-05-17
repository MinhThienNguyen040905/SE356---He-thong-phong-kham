const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/leave-request");
        
        await driver.findElement(By.name("reason")).sendKeys("Nghỉ phép năm");
        await driver.findElement(By.name("startDate")).sendKeys("2026-06-01");
        await driver.findElement(By.name("endDate")).sendKeys("2026-06-05");
        
        await driver.findElement(By.xpath("//button[contains(., 'Gửi')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-98 Passed: Gửi yêu cầu nghỉ phép thành công.");
    } catch (err) {
        console.error("AT-98 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
