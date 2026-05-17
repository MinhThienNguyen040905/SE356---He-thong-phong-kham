const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // 1. Login as Admin to lock a user
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/users");
        
        // Find an active user to lock
        let row = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Hoạt động')]/ancestor::tr")), 10000);
        let email = await row.findElement(By.xpath("./td[2]")).getText(); // Get email from 2nd column
        let deactivateBtn = await row.findElement(By.xpath(".//button[.//*[name()='svg' and contains(@class, 'lucide-user-x')]]"));
        await deactivateBtn.click();
        
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Vô hiệu') or contains(., 'Xác nhận')]")), 5000);
        await confirmBtn.click();
        await driver.sleep(2000); // Wait for update
        
        // 2. Logout
        await driver.get("http://localhost:5173/login"); // Simplified logout by going to login page (assuming session is cleared or just use logout button)
        await driver.executeScript("localStorage.clear(); sessionStorage.clear();"); // Clear session
        await driver.navigate().refresh();
        
        // 3. Try to login with locked user
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys(email);
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        // Check for error message
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'vô hiệu hóa')]")), 10000);
        console.log("AT-146 Passed: Hiển thị lỗi chính xác khi tài khoản bị khóa.");
    } catch (err) {
        console.error("AT-146 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
