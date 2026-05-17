const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/salary");
        
        // Click calculate button
        let calcBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Tính lương ngay')]")), 10000);
        await calcBtn.click();
        
        // Confirm in dialog
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Xác nhận tính lương')]")), 5000);
        await confirmBtn.click();
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 15000);
        console.log("AT-138 Passed: Tính lương toàn bộ nhân viên thành công.");
    } catch (err) {
        console.error("AT-138 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
