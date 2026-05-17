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
      
            {
              const selects = await driver.findElements(By.xpath("//button[@role='combobox']"));
              await driver.executeScript("arguments[0].click();", selects[selects.length - 2]); // Usually the second to last combobox
              await driver.sleep(500);
              const opt = await driver.wait(until.elementLocated(By.xpath("//div[@role='option' and contains(., '14 ngày')]")), 5000);
              await driver.executeScript("arguments[0].click();", opt);
              await driver.sleep(500);
            }
          
          const analyzeBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')]"));
          await driver.executeScript("arguments[0].click();", analyzeBtn);
          await driver.sleep(3000);
        
        
        console.log("AT-191 Passed: filter_medicine_expiry_days");
    } catch (err) { 
        console.error("AT-191 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
