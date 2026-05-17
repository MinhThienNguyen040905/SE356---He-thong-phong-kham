const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/pharmacy/import"); 
        
        // Fill form
        let nameInput = await driver.wait(until.elementLocated(By.xpath("//input[@placeholder='Vd: Paracetamol 500mg']")), 10000);
        await nameInput.sendKeys("Med Test " + Date.now());
        
        let groupSelect = await driver.findElement(By.xpath("//select[contains(., 'Chọn nhóm thuốc')]"));
        await groupSelect.sendKeys("Kháng sinh");
        
        let quantityInput = await driver.findElement(By.xpath("//input[@type='number' and @placeholder='0']"));
        await quantityInput.sendKeys("100");
        
        let costPriceInput = await driver.findElement(By.xpath("//input[@type='number' and @placeholder='0']")); // It's the same placeholder, might need better selector
        // Let's use index if multiple
        let inputs = await driver.findElements(By.xpath("//input[@type='number' and @placeholder='0']"));
        await inputs[1].sendKeys("5000"); // Assuming 2nd is costPrice
        
        let batchInput = await driver.findElement(By.xpath("//input[@placeholder='Vd: LOT2024001']"));
        await batchInput.sendKeys("BATCH-001");
        
        let expiryInput = await driver.findElement(By.xpath("//input[@type='date']"));
        await expiryInput.sendKeys("20-12-2026");
        
        let supplierInput = await driver.findElement(By.xpath("//input[@placeholder='Vd: Dược Hậu Giang']"));
        await supplierInput.sendKeys("Supplier Test");
        
        let submitBtn = await driver.findElement(By.xpath("//button[contains(., 'NHẬP KHO')]"));
        await submitBtn.click();
        
        // Check alert
        await driver.wait(until.alertIsPresent(), 10000);
        let alert = await driver.switchTo().alert();
        await alert.accept();
        
        await driver.wait(until.urlContains("/pharmacy"), 10000);
        console.log("AT-131 Passed: Nhập kho thuốc thành công.");
    } catch (err) {
        console.error("AT-131 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
