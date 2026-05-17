const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/dashboard"), 10000);

        // Attempt to access someone else's specific resource (e.g. employee id 1 detail)
        await driver.get("http://localhost:5173/admin/employees/1");
        
        // Verify it redirects/blocks
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return !url.includes("/admin/employees/1") || url.includes("/unauthorized") || url.includes("/login");
        }, 10000);

        console.log("AT-227 Passed: URL ID manipulation blocked successfully.");
    } catch (err) { 
        console.error("AT-227 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
