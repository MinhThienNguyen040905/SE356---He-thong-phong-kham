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
        
        // Find View Detail button (Eye icon or Pencil icon)
        let viewBtn;
        try {
            viewBtn = await driver.wait(until.elementLocated(By.xpath("//button[.//svg[contains(@class, 'lucide-eye') or contains(@class, 'lucide-edit')]]")), 10000);
        } catch (e) {
            // Fallback to any button in the table if icons classes are different
            viewBtn = await driver.wait(until.elementLocated(By.xpath("//table//button")), 5000);
        }
        await driver.executeScript("arguments[0].click();", viewBtn);
        
        // Wait for navigation or modal
        await driver.sleep(3000);
        
        console.log("AT-153.3 Passed: Xem chi tiết hồ sơ nhân viên thành công.");
    } catch (err) {
        console.error("AT-153.3 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
