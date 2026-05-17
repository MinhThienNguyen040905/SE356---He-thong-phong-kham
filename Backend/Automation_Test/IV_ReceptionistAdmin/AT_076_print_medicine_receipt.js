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
        
        // Find an invoice to view
        let invoiceRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'INV-')]")), 10000);
        let viewBtn = await invoiceRow.findElement(By.xpath(".//a[contains(@href, '/invoices/')]"));
        await viewBtn.click();
        
        // Check for medicine items section or total
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Danh sách thuốc') or contains(text(), 'Tổng tiền thuốc')]")), 10000);
        
        console.log("AT-076 Passed: Kiểm tra thông tin thanh toán thuốc thành công.");
    } catch (err) { 
        console.error("AT-076 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
