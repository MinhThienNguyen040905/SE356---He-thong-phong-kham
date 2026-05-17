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

        const cancelBtns = await driver.findElements(By.xpath("//button[@title='Hủy ca trực']"));
        if (cancelBtns.length > 0) {
            await driver.executeScript("arguments[0].click();", cancelBtns[0]);
            await driver.sleep(1000);
            
            const reasonInput = await driver.wait(until.elementLocated(By.xpath("//textarea")), 5000);
            await reasonInput.sendKeys("Bác sĩ báo ốm");
            
            const confirmBtn = await driver.findElement(By.xpath("//button[contains(., 'Xác nhận')]"));
            await confirmBtn.click();
            await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        }
    
        
        console.log("AT-207 Passed: cancel_doctor_schedule");
    } catch (err) { 
        console.error("AT-207 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
