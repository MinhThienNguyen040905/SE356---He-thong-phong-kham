const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/profile");
        
        let signatureBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Chữ ký')]")), 10000);
        await signatureBtn.click();
        
        // Mock uploading or drawing signature
        await driver.wait(until.elementLocated(By.xpath("//canvas[contains(@class, 'signature')]")), 5000);
        await driver.findElement(By.xpath("//button[contains(., 'Lưu')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-100 Passed: Cập nhật chữ ký điện tử thành công.");
    } catch (err) {
        console.error("AT-100 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
