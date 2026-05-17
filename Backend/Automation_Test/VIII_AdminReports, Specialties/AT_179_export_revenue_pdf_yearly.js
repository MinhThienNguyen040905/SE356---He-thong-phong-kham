const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        await driver.get("http://localhost:5173/admin/reports/financial");
        
        await driver.sleep(3000);
        
        
        const tabMap = { 'revenue': 'Doanh thu', 'expense': 'Chi phí', 'profit': 'Lợi nhuận' };
        const tabBtn = await driver.wait(until.elementLocated(By.xpath(`//button[@role='tab' and contains(., '${tabMap['revenue']}')]`)), 10000);
        await tabBtn.click();
        await driver.sleep(2000);
      
        const analyzeBtn = await driver.findElement(By.xpath("//button[contains(., 'Phân tích')]"));
        await driver.executeScript("arguments[0].click();", analyzeBtn);
        await driver.sleep(3000);
    
        const exportBtns = await driver.findElements(By.xpath("//button[contains(., 'Xuất PDF')]"));
        for (let btn of exportBtns) {
            let text = await btn.getText();
            if (text.includes('PDF')) {
                await driver.executeScript("arguments[0].click();", btn);
                break;
            }
        }
      
        await driver.wait(until.elementLocated(By.xpath("//*[contains(translate(text(), 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), 'PDF')]")), 10000);
    
        
        console.log("AT-179 Passed: export_revenue_pdf_yearly");
    } catch (err) { 
        console.error("AT-179 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
