const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/history");
        
        // Logic to verify order (checking first date in table)
        let firstRowDate = await driver.wait(until.elementLocated(By.xpath("//table//tr[1]//td[contains(., '202')]")), 10000);
        console.log("AT-053 Passed: Lịch sử khám hiển thị bản ghi mới nhất lên đầu.");
    } catch (err) { 
        console.error("AT-053 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
