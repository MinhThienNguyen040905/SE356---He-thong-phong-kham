const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/medicines/create");
        
        await driver.wait(until.elementLocated(By.id("name")), 5000).sendKeys("Medicine Test");
        // Skip salePrice
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Tạo thuốc')]"));
        await submitBtn.click();
        
        let errorMsg = await driver.wait(until.elementLocated(By.css("p.text-red-500")), 10000);
        console.log("AT-116 Passed: Hệ thống báo lỗi khi trống giá bán.");
    } catch (err) {
        console.error("AT-116 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
