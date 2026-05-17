const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/");
        await driver.sleep(2000);

        // Verify the header position before scroll
        const header = await driver.findElement(By.xpath("//header"));
        let initialRect = await header.getRect();

        // Scroll the landing page down by 1000px
        await driver.executeScript("window.scrollTo(0, 1000);");
        await driver.sleep(1000);

        // Get the header top coordinate in viewport space
        const headerTop = await driver.executeScript((el) => el.getBoundingClientRect().top, header);
        
        // In a sticky top-0 header, the element's top inside viewport remains at 0 even after scrolling
        if (Math.abs(headerTop) > 5) {
            throw new Error(`Header is not sticky! Viewport relative top coordinate is: ${headerTop}`);
        }

        console.log("AT-233 Passed: Sticky Header is verified to remain anchored at the top when scrolling.");
    } catch (err) { 
        console.error("AT-233 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
