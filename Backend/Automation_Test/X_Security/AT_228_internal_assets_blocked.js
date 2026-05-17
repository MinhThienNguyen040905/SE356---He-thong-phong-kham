const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Access a secure API endpoint directly without credentials/headers
        await driver.get("http://localhost:3000/api/doctors");
        await driver.sleep(1000);
        
        const bodyText = await driver.findElement(By.tagName("body")).getText();
        
        // Assert that direct access is blocked
        if (bodyText.includes('"success":true') || bodyText.includes('fullName')) {
            throw new Error("Vulnerability! Accessed secure API data directly without credentials.");
        }
        
        console.log("AT-228 Passed: Direct access to secure internal backend assets blocked.");
    } catch (err) { 
        console.error("AT-228 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
