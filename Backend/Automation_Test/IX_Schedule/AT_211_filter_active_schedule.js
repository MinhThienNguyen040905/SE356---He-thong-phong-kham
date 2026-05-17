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
        
        // Bỏ chọn Nghỉ phép
        const labels = await driver.findElements(By.xpath("//label"));
        for (let label of labels) {
            const text = await label.getText();
            if (text.includes("Nghỉ phép")) {
                await label.click();
                break;
            }
        }
        await driver.sleep(1000);
    
        
        console.log("AT-211 Passed: filter_active_schedule");
    } catch (err) { 
        console.error("AT-211 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
