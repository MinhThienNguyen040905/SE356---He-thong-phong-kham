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
        
        // Find a DRAFT payroll
        let draftBadge = await driver.wait(until.elementLocated(By.xpath("//span[contains(., 'BẢN NHÁP')]/ancestor::tr")), 10000);
        let detailBtn = await draftBadge.findElement(By.xpath(".//a[contains(@href, '/admin/salary/')]"));
        await detailBtn.click();
        
        await driver.wait(until.urlContains("/admin/salary/"), 10000);
        
        // Click Approve
        let approveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Phê duyệt lương')]")), 10000);
        await approveBtn.click();
        
        // Confirm Dialog
        let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Phê duyệt ngay')]")), 5000);
        await confirmBtn.click();
        
        // Check success
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-132 Passed: Duyệt bảng lương thành công.");
    } catch (err) {
        console.error("AT-132 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
