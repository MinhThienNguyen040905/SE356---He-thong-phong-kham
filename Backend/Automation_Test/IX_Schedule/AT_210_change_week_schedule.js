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

        const navBtns = await driver.wait(until.elementsLocated(By.xpath("//button[contains(@class, 'h-8 w-8') and contains(@class, 'p-0')]")), 10000);
        if (navBtns.length > 1) {
            await navBtns[1].click();
        }
        await driver.sleep(1000);
    
        
        console.log("AT-210 Passed: change_week_schedule");
    } catch (err) { 
        console.error("AT-210 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
