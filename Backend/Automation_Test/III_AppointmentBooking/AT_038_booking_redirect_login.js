const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Clear cookies/localStorage to ensure unauthenticated state
        await driver.get("http://localhost:5173/");
        await driver.executeScript("localStorage.clear();");
        
        // Go to booking page
        await driver.get("http://localhost:5173/patient/book-appointment");
        
        // The frontend might immediately redirect to /login or redirect when clicking a booking action
        await driver.wait(until.urlContains("/login"), 5000);

        console.log("AT-038 Passed: Redirected to login when trying to book without authentication.");
    } catch (err) { 
        console.error("AT-038 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
