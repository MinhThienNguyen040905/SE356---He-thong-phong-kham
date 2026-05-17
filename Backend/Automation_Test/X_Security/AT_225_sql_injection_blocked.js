const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        
        // Try SQL injection payload
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com' OR '1'='1");
        await driver.findElement(By.id("password")).sendKeys("' OR '1'='1");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.sleep(2000); // Wait to check if page loads or remains on login

        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl.includes("/dashboard")) {
            throw new Error("Vulnerability! Logged in using SQL Injection.");
        }

        console.log("AT-225 Passed: SQL Injection attack blocked, login rejected.");
    } catch (err) { 
        console.error("AT-225 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
