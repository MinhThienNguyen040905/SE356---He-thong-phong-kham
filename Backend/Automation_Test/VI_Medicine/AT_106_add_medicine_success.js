const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // Navigate to Create Medicine page
        await driver.get("http://localhost:5173/admin/medicines/create");
        
        // Fill form
        const medicineName = "Medicine Test " + Date.now();
        await driver.wait(until.elementLocated(By.id("name")), 10000).sendKeys(medicineName);
        await driver.findElement(By.id("group")).sendKeys("Kháng sinh");
        
        // Handle Select unit
        let selectTrigger = await driver.findElement(By.xpath("//button[span[contains(text(), 'Chọn đơn vị')]]"));
        await selectTrigger.click();
        let option = await driver.wait(until.elementLocated(By.xpath("//div[@role='option' and contains(., 'Viên')]")), 5000);
        await option.click();
        
        await driver.findElement(By.id("importPrice")).sendKeys("10000");
        await driver.findElement(By.id("salePrice")).sendKeys("15000");
        await driver.findElement(By.id("quantity")).sendKeys("100");
        
        await driver.findElement(By.id("expiryDate")).sendKeys("31-12-2026");
        
        await driver.findElement(By.id("activeIngredient")).sendKeys("Paracetamol");
        await driver.findElement(By.id("manufacturer")).sendKeys("Pharma Corp");
        await driver.findElement(By.id("description")).sendKeys("Test medicine description");
        
        // Submit
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Tạo thuốc')]"));
        await submitBtn.click();
        
        // Redirection check: Should go to inventory
        await driver.wait(until.urlContains("/admin/inventory"), 10000);
        console.log(`AT-111 Passed: Thêm thuốc '${medicineName}' thành công.`);
    } catch (err) {
        console.error("AT-111 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
