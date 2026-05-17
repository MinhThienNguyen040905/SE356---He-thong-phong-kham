const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/reset-password?token=dummy_token_123");
        await driver.wait(until.elementLocated(By.id("newPassword")), 5000).sendKeys("NewPass123!");
        await driver.findElement(By.id("confirmPassword")).sendKeys("NewPass123!");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        console.log("AT-017 Executed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
