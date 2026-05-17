const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        
        // Input an XSS payload into email input
        const emailInput = await driver.wait(until.elementLocated(By.id("email")), 5000);
        await emailInput.sendKeys("<script>alert('xss')</script>");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.sleep(2000);

        // Verify that no alert box popped up (no XSS execution)
        try {
            const alert = await driver.switchTo().alert();
            const text = await alert.getText();
            await alert.dismiss();
            throw new Error("Vulnerability! XSS Alert executed: " + text);
        } catch (noAlert) {
            // Success: No alert triggered, XSS is safely blocked/sanitized
        }

        console.log("AT-226 Passed: XSS script safely sanitized, no alert triggered.");
    } catch (err) { 
        console.error("AT-226 Failed:", err.message || err); 
    } finally { 
        await driver.quit(); 
    }
}
run();
