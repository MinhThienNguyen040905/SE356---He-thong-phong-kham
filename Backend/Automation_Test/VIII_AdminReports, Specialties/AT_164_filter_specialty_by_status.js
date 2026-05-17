const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 5000);
        await driver.get("http://localhost:5173/admin/specialties");
        
        // Wait for table to load
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr")), 10000);
        
        // Click the status filter dropdown trigger
        const filterTrigger = await driver.wait(until.elementLocated(By.xpath("//button[@role='combobox']//span[text()='Trạng thái' or text()='Tất cả trạng thái']")), 5000);
        await driver.executeScript("arguments[0].click();", filterTrigger);
        
        // Wait for options and select "Ngưng hoạt động"
        const inactiveOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//span[contains(text(), 'Ngưng hoạt động')]")), 5000);
        await driver.executeScript("arguments[0].click();", inactiveOption);
        
        await driver.sleep(1500); // wait for api to reload table
        
        console.log("AT-164 Passed: Filter specialty by status success");
    } catch (err) { 
        console.error("AT-164 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
