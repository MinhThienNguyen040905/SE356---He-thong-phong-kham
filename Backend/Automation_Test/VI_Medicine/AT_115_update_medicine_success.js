const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/inventory");
        
        // Find Edit link by href
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/edit')]")), 10000);
        await editBtn.click();
        
        // Wait for page to load with 'name' field
        await driver.wait(until.elementLocated(By.id("name")), 10000);
        
        let nameField = await driver.findElement(By.id("name"));
        const updatedName = "Updated Med " + Date.now();
        await nameField.clear();
        await nameField.sendKeys(updatedName);
        
        // Button text is 'Cập nhật thuốc'
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật thuốc')]"));
        await submitBtn.click();
        
        // Success check: redirects to pharmacy detail page
        await driver.wait(until.urlContains("/pharmacy/"), 10000);
        console.log("AT-120 Passed: Cập nhật thông tin thuốc thành công.");
    } catch (err) {
        console.error("AT-120 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
