const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/users");
        
        // Find an active user and click Deactivate (UserX icon or button with orange text)
        let row = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Hoạt động')]/ancestor::tr")), 10000);
        let deactivateBtn = await row.findElement(By.xpath(".//button[.//svg[contains(@class, 'lucide-user-x')] or contains(@class, 'text-orange-600')]"));
        await deactivateBtn.click();
        
        // Confirm Dialog - Based on code it might be 'Vô hiệu hóa' or 'Xác nhận'
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Vô hiệu hóa') or contains(., 'Xác nhận')]")), 5000);
        await confirmBtn.click();
        
        // Check success
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-145 Passed: Khóa tài khoản người dùng thành công.");
    } catch (err) {
        console.error("AT-145 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
