const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Go to shift-templates and click save on add template to trigger a validation toast
        await driver.get("http://localhost:5173/admin/shift-templates");
        await driver.sleep(2000);

        const btn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm mẫu ca')]")), 5000);
        await driver.executeScript("arguments[0].click();", btn);
        await driver.sleep(1000);

        // Click save button in Dialog to trigger a real Sonner toast
        const saveBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lưu mẫu ca')]")), 5000);
        await saveBtn.click();

        // Locate the Sonner toast element
        const toast = await driver.wait(until.elementLocated(By.xpath("//li[@data-sonner-toast]")), 5000);
        const startTime = Date.now();
        
        // Wait for the toast to automatically close/disappear
        await driver.wait(until.stalenessOf(toast), 8000);
        const elapsed = Date.now() - startTime;
        
        console.log(`AT-230 Passed: Toast notification automatically closed in ${elapsed}ms.`);
    } catch (err) { 
        console.error("AT-230 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
