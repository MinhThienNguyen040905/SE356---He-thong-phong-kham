const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        // Set window to Desktop size
        await driver.manage().window().setSize({ width: 1440, height: 900 });
        
        await driver.get("http://localhost:5173/");
        await driver.sleep(2000);

        // Verify key landing page components exist
        const logoText = await driver.wait(until.elementLocated(By.xpath("//span[contains(text(), 'HealthCare')]")), 5000);
        const heroTitle = await driver.wait(until.elementLocated(By.xpath("//h1")), 5000);
        const loginBtn = await driver.wait(until.elementLocated(By.xpath("//a[contains(., 'Đăng nhập') or contains(., 'Đăng nhập')]")), 5000);

        // Verify that no horizontal scroll is introduced (layout stays within bounds)
        const hasHorizontalScroll = await driver.executeScript(() => {
            return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        if (hasHorizontalScroll) {
            throw new Error("UI Broken: Horizontal scrollbar detected on Desktop layout!");
        }

        console.log("AT-229 Passed: Landing page displays correctly on Desktop without horizontal scrolling.");
    } catch (err) { 
        console.error("AT-229 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
