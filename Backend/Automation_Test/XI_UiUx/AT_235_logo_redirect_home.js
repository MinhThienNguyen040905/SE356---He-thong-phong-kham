const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Start on login page
        await driver.get("http://localhost:5173/login");
        await driver.sleep(1000);

        // Find the logo link inside header or card
        const logo = await driver.wait(until.elementLocated(By.xpath("//a[.//span[contains(text(), 'HealthCare')] or contains(@class, 'logo')]")), 5000);
        await logo.click();
        await driver.sleep(1500);

        // Verify it navigated back to the landing page home ("/")
        const currentUrl = await driver.getCurrentUrl();
        if (currentUrl !== "http://localhost:5173/" && currentUrl !== "http://localhost:5173") {
            throw new Error(`Logo did not redirect to home! Current URL is: ${currentUrl}`);
        }

        console.log("AT-235 Passed: Logo always correctly redirects to the landing page home.");
    } catch (err) { 
        console.error("AT-235 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
