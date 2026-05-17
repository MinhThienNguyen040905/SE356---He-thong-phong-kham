const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/forgot-password");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Kiểm tra email')]")), 5000);
        console.log("AT-015 Passed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
