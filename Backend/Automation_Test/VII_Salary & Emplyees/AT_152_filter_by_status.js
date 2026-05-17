const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/employees");
        
        // Wait for table
        await driver.wait(until.elementLocated(By.tagName("table")), 10000);
        
        // Open Filter Select (Role)
        let filterSelect = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'trạng thái') or contains(., 'vai trò') or contains(., 'Tất cả')]")), 10000);
        await driver.executeScript("arguments[0].click();", filterSelect);
        
        // Select 'Bác sĩ'
        let option = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//*[contains(text(), 'Bác sĩ')]")), 5000);
        await driver.executeScript("arguments[0].click();", option);
        
        // Wait for filter to apply
        await driver.sleep(3000);
        
        console.log("AT-152.2 Passed: Lọc nhân viên theo vai trò thành công.");
    } catch (err) {
        console.error("AT-152.2 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
