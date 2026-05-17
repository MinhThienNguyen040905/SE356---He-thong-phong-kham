const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'Vui lòng nhập')]")), 3000);
        console.log("AT-006 Passed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
