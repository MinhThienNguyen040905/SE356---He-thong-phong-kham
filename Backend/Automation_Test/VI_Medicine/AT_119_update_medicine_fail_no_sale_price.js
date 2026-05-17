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
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/edit')]")), 10000);
        await editBtn.click();
        
        await driver.wait(until.urlContains("/edit"), 10000);
        
        let priceField = await driver.findElement(By.id("salePrice"));
        let value = await priceField.getAttribute("value");
        for (let i = 0; i < value.length; i++) {
            await priceField.sendKeys("\uE003"); 
        }
        await priceField.clear();
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')] | //button[contains(., 'Lưu')]"));
        await submitBtn.click();
        
        let errorMsg = await driver.wait(until.elementLocated(By.css("p.text-red-500")), 5000);
        console.log("AT-125 Passed: Cập nhật thất bại khi trống giá bán.");
    } catch (err) {
        console.error("AT-125 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
