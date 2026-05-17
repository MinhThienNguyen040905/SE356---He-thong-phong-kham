const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        // Navigate to appointments management
        await driver.get("http://localhost:5173/appointments");
        
        // Find a pending appointment or a check-in button
        let actionBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Checkin') or contains(., 'Xác nhận')]")), 10000);
        await driver.executeScript("arguments[0].scrollIntoView(true);", actionBtn);
        await driver.sleep(1000);
        await actionBtn.click();
        
        // If a dialog opens, click the final confirm button
        try {
            let confirmDialogBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Vào khám ngay') or contains(., 'Xác nhận')]")), 3000);
            await confirmDialogBtn.click();
        } catch (e) {
            // No dialog, maybe it was a direct action
        }
        
        // Check for success message
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-061 Passed: Lễ tân xác nhận/check-in lịch khám thành công.");
    } catch (err) { 
        console.error("AT-061 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
