const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/history");
        
        // Find a completed appointment and click view details
        let viewBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Chi tiết')]")), 10000);
        await viewBtn.click();
        
        // Verify details modal or page
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Chi tiết lịch hẹn')]")), 5000);
        console.log("AT-050 Passed: Xem chi tiết lịch hẹn đã hoàn thành thành công.");
    } catch (err) { 
        console.error("AT-050 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
