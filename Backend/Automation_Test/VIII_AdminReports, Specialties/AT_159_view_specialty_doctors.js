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
        await driver.wait(until.elementLocated(By.xpath("//table//tbody//tr[1]")), 10000);
        
        // Click the View Doctors button (Eye icon) of the first specialty
        const viewBtn = await driver.findElement(By.xpath("//table//tbody//tr[1]//button[@title='Xem bác sĩ']"));
        await driver.executeScript("arguments[0].click();", viewBtn);
        
        // Wait for the dialog to appear
        await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//h2[contains(text(), 'Bác sĩ chuyên khoa')]")), 5000);
        
        // It should display either doctors list or "Chưa có bác sĩ nào"
        const dialogContent = await driver.findElement(By.xpath("//div[@role='dialog']")).getText();
        if (dialogContent.includes("Chưa có bác sĩ nào") || dialogContent.includes("Bác sĩ")) {
             console.log("AT-159 Passed: View doctors in specialty success");
        } else {
             throw new Error("Could not find expected content in the dialog");
        }
    } catch (err) { 
        console.error("AT-159 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
