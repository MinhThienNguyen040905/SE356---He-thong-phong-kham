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
        
        // Fill Name, leave Email empty
        await driver.wait(until.elementLocated(By.id("fullName")), 10000).sendKeys("No Email Test");
        await driver.findElement(By.id("password")).sendKeys("123456");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu người dùng')]"));
        await submitBtn.click();
        
        let emailInput = await driver.findElement(By.id("email"));
        let isValid = await driver.executeScript("return arguments[0].validity.valid;", emailInput);
        
        if (!isValid) {
            console.log("AT-142.2 Passed: Hệ thống chặn khi trống Email (HTML5).");
        } else {
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'đầy đủ')]")), 5000);
            console.log("AT-142.2 Passed: Hệ thống chặn khi trống Email (Toast).");
        }
    } catch (err) {
        console.error("AT-142.2 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
