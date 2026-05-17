const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/register");
        await driver.wait(until.elementLocated(By.name("fullName")), 5000).sendKeys("New Patient");
        await driver.findElement(By.name("email")).sendKeys("newpatient" + Date.now() + "@test.com");
        await driver.wait(until.elementLocated(By.name("password")), 5000).sendKeys("Password123!");
        await driver.findElement(By.name("confirmPassword")).sendKeys("Password123");
        await driver.findElement(By.id("terms")).click();
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        //await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Mật khẩu không khớp')]")), 3000);
        await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'text-red-600')]")), 5000);

        console.log("AT-014 Passed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
