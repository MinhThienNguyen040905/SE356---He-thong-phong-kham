const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.minh@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/doctor/dashboard"), 10000);

        // Attempt to access Admin employee management page
        await driver.get("http://localhost:5173/admin/employees");
        
        // Verify it redirects/blocks
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return !url.includes("/admin/employees") || url.includes("/unauthorized") || url.includes("/login");
        }, 5000);

        console.log("AT-221 Passed: Doctor cannot access Admin employee management.");
    } catch (err) { 
        console.error("AT-221 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
