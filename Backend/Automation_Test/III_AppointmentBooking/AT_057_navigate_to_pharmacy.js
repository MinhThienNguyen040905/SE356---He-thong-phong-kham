const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        
        // Find link to pharmacy
        let pharmacyLink = await driver.wait(until.elementLocated(By.xpath("//a[contains(@href, '/pharmacy') or contains(., 'Nhà thuốc')]")), 10000);
        await pharmacyLink.click();
        
        await driver.wait(until.urlContains("/pharmacy"), 5000);
        console.log("AT-057 Passed: Điều hướng sang trang Nhà thuốc thành công.");
    } catch (err) { 
        console.error("AT-057 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
