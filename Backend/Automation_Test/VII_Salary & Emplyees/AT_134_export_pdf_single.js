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
        
        // Find any payroll to view detail
        let detailBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/admin/salary/')]")), 10000);
        await detailBtn.click();
        
        await driver.wait(until.urlContains("/admin/salary/"), 10000);
        
        // Click Export PDF
        let exportBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Xuất PDF')]")), 10000);
        await exportBtn.click();
        
        // Check for toast success
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Xuất PDF thành công')]")), 10000);
        console.log("AT-134 Passed: Xuất PDF lương nhân viên thành công.");
    } catch (err) {
        console.error("AT-134 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
