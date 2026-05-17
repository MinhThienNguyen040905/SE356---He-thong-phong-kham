const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/register");
        await driver.wait(until.elementLocated(By.name("fullName")), 5000).sendKeys("Old Patient");
        await driver.findElement(By.name("email")).sendKeys("admin@healthcare.com");
        await driver.findElement(By.name("password")).sendKeys("Password123!");
        await driver.findElement(By.name("confirmPassword")).sendKeys("Password123!");
        await driver.findElement(By.id("terms")).click();
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        console.log("AT-012 Executed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
