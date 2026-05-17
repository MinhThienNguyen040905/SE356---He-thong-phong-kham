const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Go to User Add page with role receptionist
        await driver.get("http://localhost:5173/admin/users/add?role=receptionist");
        
        // Fill form
        let name = "Receptionist Test " + Date.now();
        let email = "recep" + Date.now() + "@healthcare.com";
        
        await driver.wait(until.elementLocated(By.id("fullName")), 10000).sendKeys(name);
        await driver.findElement(By.id("email")).sendKeys(email);
        await driver.findElement(By.id("password")).sendKeys("123456");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu người dùng')]"));
        await submitBtn.click();
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-140 Passed: Admin thêm tài khoản lễ tân thành công.");
    } catch (err) {
        console.error("AT-140 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
