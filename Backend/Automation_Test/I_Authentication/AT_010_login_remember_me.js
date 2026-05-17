const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.id("remember")).click();
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.sleep(2000);
        let ls = await driver.executeScript("return window.localStorage.getItem('savedEmail');");
        if(ls === "patient1@gmail.com") console.log("AT-010 Passed");
        else console.log("AT-010 Failed: LocalStorage not set");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
