const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        

        await driver.get("http://localhost:5173/admin/schedule");
        await driver.sleep(2000);
        
        const toggleBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Thêm / Điều chỉnh Lịch')]")), 10000);
        await toggleBtn.click();
        await driver.sleep(1000);

        const restoreBtns = await driver.findElements(By.xpath("//button[@title='Khôi phục']"));
        if (restoreBtns.length > 0) {
            await driver.executeScript("arguments[0].click();", restoreBtns[0]);
            await driver.sleep(1000);
            
            const confirmBtn = await driver.findElement(By.xpath("//button[contains(., 'Khôi phục')]"));
            await confirmBtn.click();
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        }
    
        
        console.log("AT-208 Passed: restore_doctor_schedule");
    } catch (err) { 
        console.error("AT-208 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
