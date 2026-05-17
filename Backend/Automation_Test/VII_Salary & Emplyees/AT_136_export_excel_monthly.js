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
        
        // Click Excel button (top right)
        let excelBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Excel')]")), 10000);
        await excelBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Xuất file Excel thành công')]")), 10000);
        console.log("AT-136 Passed: Xuất Excel tổng lương tháng thành công.");
    } catch (err) {
        console.error("AT-136 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
