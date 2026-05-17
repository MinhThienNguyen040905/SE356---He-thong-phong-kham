const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/invoices");
        
        let viewInvoiceBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Xem hóa đơn') or contains(., 'In')]")), 10000);
        await viewInvoiceBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//h2[contains(text(), 'Hóa đơn')]")), 5000);
        console.log("AT-059 Passed: Xem hóa đơn thanh toán sau khám thành công.");
    } catch (err) { 
        console.error("AT-059 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
