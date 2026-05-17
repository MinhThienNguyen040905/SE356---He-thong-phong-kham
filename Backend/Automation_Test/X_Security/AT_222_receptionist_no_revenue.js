const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("reception@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/receptionist/dashboard"), 10000);

        // Attempt to access Admin dashboard/revenue reports page
        await driver.get("http://localhost:5173/admin/dashboard");
        
        // Verify it redirects/blocks
        await driver.wait(async () => {
            const url = await driver.getCurrentUrl();
            return !url.includes("/admin/dashboard") || url.includes("/unauthorized") || url.includes("/login");
        }, 5000);

        console.log("AT-222 Passed: Receptionist cannot access Admin revenue report dashboard.");
    } catch (err) { 
        console.error("AT-222 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
