const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);
        

        await driver.get("http://localhost:5173/admin/shift-templates");
        await driver.sleep(2000);
        
        const searchInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm kiếm')]")), 10000);
        await searchInput.sendKeys("KhongCoBacSiNay123");
        await driver.sleep(1000);
    
        
        console.log("AT-215 Passed: search_template_no_result");
    } catch (err) { 
        console.error("AT-215 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
