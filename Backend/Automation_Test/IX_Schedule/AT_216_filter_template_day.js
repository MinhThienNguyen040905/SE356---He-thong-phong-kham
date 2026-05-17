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
        
        const filters = await driver.wait(until.elementsLocated(By.xpath("//button[@role='combobox']")), 10000);
        if (filters.length > 0) {
            await filters[0].click(); // Open "Thứ" select
            await driver.sleep(500);
            const options = await driver.findElements(By.xpath("//div[@role='option']"));
            if (options.length > 1) {
                await options[1].click(); // Select the first day option
            }
            await driver.sleep(1000);
        }
    
        
        console.log("AT-216 Passed: filter_template_day");
    } catch (err) { 
        console.error("AT-216 Failed:", err.message); 
    } finally { 
        await driver.quit(); 
    }
}
run();
