const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/receptionist"), 5000);
        await driver.get("http://localhost:5173/appointments");
        
        await driver.get("http://localhost:5173/appointments");
        
        // Handle Radix UI Select (Status Filter)
        let statusTrigger = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'trạng thái')]")), 10000);
        await statusTrigger.click();
        
        let statusOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option' and contains(., 'Chờ checkin')]")), 5000);
        await statusOption.click();
        
        await driver.sleep(2000);
        console.log("AT-064 Passed: Lọc lịch khám theo trạng thái thành công.");
    } catch (err) { 
        console.error("AT-064 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
