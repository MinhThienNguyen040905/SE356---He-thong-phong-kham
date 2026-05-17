const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/users/add");
        
        // Leave Name empty, fill others
        await driver.wait(until.elementLocated(By.id("email")), 10000).sendKeys("fail" + Date.now() + "@test.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu người dùng')]"));
        await submitBtn.click();
        
        // Check for HTML5 validation or Toast error
        let nameInput = await driver.findElement(By.id("fullName"));
        let isValid = await driver.executeScript("return arguments[0].validity.valid;", nameInput);
        
        if (!isValid) {
            console.log("AT-141.1 Passed: Hệ thống chặn khi trống Họ tên (HTML5).");
        } else {
            // Check for toast
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'đầy đủ')]")), 5000);
            console.log("AT-141.1 Passed: Hệ thống chặn khi trống Họ tên (Toast).");
        }
    } catch (err) {
        console.error("AT-141.1 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
