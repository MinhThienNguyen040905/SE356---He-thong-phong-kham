const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        // At Dashboard
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(., 'Dashboard')] | //h2[contains(., 'Dashboard')]")), 10000);
        
        // Check for chart (usually canvas or a div containing 'Biểu đồ' or 'Doanh thu')
        let chart = await driver.wait(until.elementLocated(By.xpath("//canvas | //*[contains(text(), 'Doanh thu')]")), 10000);
        
        if (chart) {
            console.log("AT-150 Passed: Xem biểu đồ doanh thu hệ thống thành công.");
        }
    } catch (err) {
        console.error("AT-150 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
