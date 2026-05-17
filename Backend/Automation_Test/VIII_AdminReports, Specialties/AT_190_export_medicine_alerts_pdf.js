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
        
        
        const alertTab = await driver.wait(until.elementLocated(By.xpath("//button[@role='tab' and contains(., 'Cảnh báo thuốc')]")), 10000);
        await alertTab.click();
        await driver.sleep(2000);
      
          const exportBtn = await driver.findElement(By.xpath("//button[contains(., 'Xuất Báo cáo PDF')]"));
          await driver.executeScript("arguments[0].click();", exportBtn);
          await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'báo cáo thành công')]")), 10000);
        
        
        console.log("AT-190 Passed: export_medicine_alerts_pdf");
    } catch (err) { 
        console.error("AT-190 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
