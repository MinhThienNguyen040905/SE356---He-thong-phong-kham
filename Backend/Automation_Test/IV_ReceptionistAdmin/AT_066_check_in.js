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
        
        // Find a confirmed appointment and click check-in
        let checkinBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Checkin')]")), 10000);
        await checkinBtn.click();
        
        // Handle dialog confirm if it appears
        try {
            let confirmBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Vào khám ngay')]")), 3000);
            await confirmBtn.click();
        } catch (e) {}

        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-066 Passed: Check-in bệnh nhân thành công.");
    } catch (err) { 
        console.error("AT-066 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
