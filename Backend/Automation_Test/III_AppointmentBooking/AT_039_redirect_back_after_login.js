const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Clear cookies/localStorage to ensure unauthenticated state
        await driver.get("http://localhost:5173/");
        await driver.executeScript("localStorage.clear();");
        
        // Go to booking page
        await driver.get("http://localhost:5173/patient/book-appointment");
        
        // Wait for redirect to login page
        await driver.wait(until.urlContains("/login"), 5000);
        
        // Perform login
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("Mi123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        // Verify it redirects back to the booking page instead of the general dashboard
        await driver.wait(until.urlContains("/book"), 5000);

        console.log("AT-039 Passed: Redirected back to booking page after login.");
    } catch (err) { 
        console.error("AT-039 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
