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
        
        // Click PDF button (top right)
        let pdfBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'PDF')]")), 10000);
        await pdfBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Xuất file PDF thành công')]")), 10000);
        console.log("AT-135 Passed: Xuất PDF tổng lương tháng thành công.");
    } catch (err) {
        console.error("AT-135 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
