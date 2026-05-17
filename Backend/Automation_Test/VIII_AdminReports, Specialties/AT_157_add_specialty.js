const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/specialties");
        
        const addBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm chuyên khoa')]")), 5000);
        await driver.executeScript("arguments[0].click();", addBtn);
        
        await driver.wait(until.elementLocated(By.id("create-name")), 5000).sendKeys("Khoa Răng Hàm Mặt Test");
        await driver.findElement(By.id("create-description")).sendKeys("Mô tả test automation");
        
        const saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu dữ liệu')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        await driver.wait(until.elementLocated(By.xpath("//div[contains(text(), 'Tạo chuyên khoa thành công')]")), 5000);
        console.log("AT-157 Passed: Add specialty success");
    } catch (err) { 
        console.error("AT-157 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
