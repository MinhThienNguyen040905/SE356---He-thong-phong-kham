const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/receptionist"), 5000);
        
        await driver.get("http://localhost:5173/receptionist/appointments");
        let resendBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Gửi lại xác nhận')]")), 10000);
        await resendBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'đã gửi')]")), 5000);
        console.log("AT-070 Passed: Gửi lại xác nhận lịch khám thành công.");
    } catch (err) { 
        console.error("AT-070 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
