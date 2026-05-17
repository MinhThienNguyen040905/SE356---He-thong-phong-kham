const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        
        // Input an extremely long, continuous unbroken word into the login email field to test UI layout overflow
        const longUnbrokenWord = "A".repeat(300);
        const emailInput = await driver.wait(until.elementLocated(By.id("email")), 5000);
        await emailInput.sendKeys(longUnbrokenWord);
        await driver.sleep(1000);

        // Verify that no horizontal scroll is introduced to the login card layout
        const hasHorizontalScroll = await driver.executeScript(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
            throw new Error("UI Broken: Horizontal scrollbar detected due to long text overflow!");
        }

        console.log("AT-234 Passed: UI elements wrap long text properly without introducing horizontal layout break.");
    } catch (err) { 
        console.error("AT-234 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
