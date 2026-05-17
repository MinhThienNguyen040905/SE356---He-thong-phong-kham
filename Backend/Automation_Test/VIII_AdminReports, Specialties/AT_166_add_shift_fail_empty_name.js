const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/shifts");
        
        const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm ca trực')]")), 5000);
        await driver.executeScript("arguments[0].click();", addBtn);
        
        await driver.wait(until.elementLocated(By.id("create-name")), 5000); // leave empty
        await driver.findElement(By.id("create-start-time")).sendKeys("08:00");
        await driver.findElement(By.id("create-end-time")).sendKeys("12:00");
        
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu ca trực')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Vui lòng nhập tên ca trực')]")), 5000);
        console.log("AT-166 Passed: Add shift fail empty name");
    } catch (err) { 
        console.error("AT-166 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
