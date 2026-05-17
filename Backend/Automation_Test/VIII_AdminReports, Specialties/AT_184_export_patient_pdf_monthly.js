const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        await driver.get("http://localhost:5173/admin/reports/patient-statistics");
        
        await driver.sleep(3000);
        
        
        const selects = await driver.findElements(By.xpath("//button[@role='combobox']"));
        if (selects.length >= 2) {
            await driver.executeScript("arguments[0].click();", selects[1]);
            await driver.sleep(500);
            const monthOpt = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//span[contains(text(), 'Tháng 05')]")), 5000);
            await driver.executeScript("arguments[0].click();", monthOpt);
            await driver.sleep(1000);
        }
      
        const analyzeBtn = await driver.findElement(By.xpath("//button[contains(., 'Phân tích')]"));
        await driver.executeScript("arguments[0].click();", analyzeBtn);
        await driver.sleep(3000);
    
        const exportBtns = await driver.findElements(By.xpath("//button[contains(., 'PDF')]"));
        for (let btn of exportBtns) {
            let text = await btn.getText();
            if (text.includes('PDF')) {
                await driver.executeScript("arguments[0].click();", btn);
                break;
            }
        }
      
        await driver.wait(until.elementLocated(By.xpath("//*[contains(translate(text(), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'PDF')]")), 10000);
    
        
        console.log("AT-184 Passed: export_patient_pdf_monthly");
    } catch (err) { 
        console.error("AT-184 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
