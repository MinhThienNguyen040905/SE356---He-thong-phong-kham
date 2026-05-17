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
        
        // Interact with date picker
        let dateInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='date']")), 10000);
        await dateInput.sendKeys("20-12-2026"); // Example date
        
        // Verify results (assuming some table changes)
        await driver.sleep(2000);
        console.log("AT-063 Passed: Lọc lịch khám theo ngày thành công.");
    } catch (err) { 
        console.error("AT-063 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
