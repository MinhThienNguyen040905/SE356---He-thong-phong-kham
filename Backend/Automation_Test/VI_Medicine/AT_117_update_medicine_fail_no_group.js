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
        
        let groupField = await driver.findElement(By.id("group"));
        let value = await groupField.getAttribute("value");
        for (let i = 0; i < value.length; i++) {
            await groupField.sendKeys("\uE003"); 
        }
        await groupField.clear();
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')] | //button[contains(., 'Lưu')]"));
        await submitBtn.click();
        
        let errorMsg = await driver.wait(until.elementLocated(By.css("p.text-red-500")), 5000);
        console.log("AT-122 Passed: Cập nhật thất bại khi trống nhóm thuốc.");
    } catch (err) {
        console.error("AT-122 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
