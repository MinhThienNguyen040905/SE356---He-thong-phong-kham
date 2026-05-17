const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/salary");
        
        // Find an APPROVED payroll
        let approvedBadge = await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'ĐÃ DUYỆT')]/ancestor::tr")), 10000);
        let detailBtn = await approvedBadge.findElement(By.xpath(".//a[contains(@href, '/admin/salary/')]"));
        await detailBtn.click();
        
        await driver.wait(until.urlContains("/admin/salary/"), 10000);
        
        // Click Pay
        let payBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Xác nhận thanh toán')]")), 10000);
        await payBtn.click();
        
        // Confirm Dialog
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Xác nhận đã trả')]")), 5000);
        await confirmBtn.click();
        
        // Check success
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-133 Passed: Xác nhận trả lương thành công.");
    } catch (err) {
        console.error("AT-133 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
