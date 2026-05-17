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
        
        // Find an unpaid invoice (Chờ thanh toán)
        let unpaidRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Chờ thanh toán')]")), 10000);
        let viewBtn = await unpaidRow.findElement(By.xpath(".//a[contains(@href, '/invoices/')]"));
        await viewBtn.click();
        
        // Click Add Payment
        let addPaymentBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm thanh toán')]")), 10000);
        await addPaymentBtn.click();
        
        // Fill amount and pay
        let payAllBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thanh toán hết')]")), 5000);
        await payAllBtn.click();
        
        // Select Cash method (default is CASH, but let's be explicit if needed)
        // For cash, we just confirm
        let confirmBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Xác nhận thanh toán')]")); 
        await confirmBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-073 Passed: Thanh toán tiền mặt thành công.");
    } catch (err) { 
        console.error("AT-073 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
