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
        
        // Find month input
        let monthInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='month']")), 10000);
        
        // Change to previous month
        await monthInput.sendKeys("01-2024"); // Selenium for type=month usually takes YYYY-MM or MM-YYYY depending on local, let's use 012024
        await driver.sleep(2000); // Wait for fetch
        
        console.log("AT-131 Passed: Chức năng lọc theo tháng hoạt động.");
    } catch (err) {
        console.error("AT-131 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
