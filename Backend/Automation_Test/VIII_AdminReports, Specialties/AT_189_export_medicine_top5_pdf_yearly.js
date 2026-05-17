const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        await driver.get("http://localhost:5173/admin/reports/medicines");
        
        await driver.sleep(3000);
        
        
          {
            const selects = await driver.findElements(By.xpath("//button[@role='combobox']"));
            await driver.executeScript("arguments[0].click();", selects[2]); // Limit
            await driver.sleep(500);
            const limitOpt = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//span[contains(text(), 'Top 5')]")), 5000);
            await driver.executeScript("arguments[0].click();", limitOpt);
            await driver.sleep(500);
          }
        
        const analyzeBtn = await driver.findElement(By.xpath("//button[contains(., 'Phân tích')]"));
        await driver.executeScript("arguments[0].click();", analyzeBtn);
        await driver.sleep(3000);
        
        const exportBtn = await driver.findElement(By.xpath("//button[contains(., 'Xuất Báo cáo PDF')]"));
        await driver.executeScript("arguments[0].click();", exportBtn);
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'báo cáo thành công')]")), 10000);
      
        
        console.log("AT-189 Passed: export_medicine_top5_pdf_yearly");
    } catch (err) { 
        console.error("AT-189 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
