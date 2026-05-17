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
        
        // Fill Name, Email, leave Password empty
        await driver.wait(until.elementLocated(By.id("fullName")), 10000).sendKeys("No Password Test");
        await driver.findElement(By.id("email")).sendKeys("nopass" + Date.now() + "@test.com");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu người dùng')]"));
        await submitBtn.click();
        
        let passInput = await driver.findElement(By.id("password"));
        let isValid = await driver.executeScript("return arguments[0].validity.valid;", passInput);
        
        if (!isValid) {
            console.log("AT-143.3 Passed: Hệ thống chặn khi trống Mật khẩu (HTML5).");
        } else {
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'đầy đủ')]")), 5000);
            console.log("AT-143.3 Passed: Hệ thống chặn khi trống Mật khẩu (Toast).");
        }
    } catch (err) {
        console.error("AT-143.3 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
