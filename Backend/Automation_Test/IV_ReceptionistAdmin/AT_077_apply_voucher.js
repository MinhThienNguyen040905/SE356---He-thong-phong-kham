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
        
        // Wait for detail page
        await driver.wait(until.urlContains("/invoices/"), 10000);
        
        // Click Chỉnh sửa
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Chỉnh sửa')]")), 10000);
        await editBtn.click();
        
        // Input discount (voucher application)
        let discountInput = await driver.wait(until.elementLocated(By.id("discount")), 10000);
        await discountInput.clear();
        await discountInput.sendKeys("15000");
        
        // Click Lưu thay đổi
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu thay đổi')]"));
        await saveBtn.click();
        
        // Wait for toast success
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        
        console.log("AT-077 Passed: Áp dụng voucher giảm giá thành công.");
    } catch (err) { 
        console.error("AT-077 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
