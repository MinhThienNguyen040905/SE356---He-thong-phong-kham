const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/pharmacy/import");
        
        // Find quantity input (placeholder '0')
        let quantityInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='number' and @placeholder='0']")), 10000);
        await quantityInput.sendKeys("-50");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'NHẬP KHO')]"));
        await submitBtn.click();
        
        let isValid = await driver.executeScript("return arguments[0].validity.valid;", quantityInput);
        if (!isValid) {
            let msg = await driver.executeScript("return arguments[0].validationMessage;", quantityInput);
            console.log("AT-132 Passed: Hệ thống chặn nhập số lượng âm. Thông báo: " + msg);
        } else {
            console.error("AT-132 Failed: Hệ thống không chặn số lượng âm.");
        }
    } catch (err) {
        console.error("AT-132 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
