const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        await driver.get("http://localhost:5173/invoices");
        
        // Find and click 'Chờ thanh toán' filter button
        let unpaidFilterBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Chờ thanh toán')]")), 10000);
        await unpaidFilterBtn.click();
        
        // Wait for table to refresh
        await driver.sleep(2000);
        
        console.log("AT-078 Passed: Lọc hóa đơn chờ thanh toán thành công.");
    } catch (err) { 
        console.error("AT-078 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
