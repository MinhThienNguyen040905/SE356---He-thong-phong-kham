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
        
        // Find an appointment with results and click view
        let viewResultBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Kết quả')]")), 10000);
        await viewResultBtn.click();
        
        // Verify diagnosis and prescription
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Chẩn đoán')]")), 5000);
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Đơn thuốc')]")), 5000);
        console.log("AT-051 Passed: Xem kết quả chẩn đoán và đơn thuốc thành công.");
    } catch (err) { 
        console.error("AT-051 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
