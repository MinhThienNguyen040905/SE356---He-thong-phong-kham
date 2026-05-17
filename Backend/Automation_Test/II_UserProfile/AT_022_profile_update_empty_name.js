const { Builder, By, until, Key } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("patient1@gmail.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        
        await driver.wait(until.urlContains("/patient"), 5000);
        await driver.get("http://localhost:5173/patient/profile");

        let fullName = await driver.wait(until.elementLocated(By.id("fullName")), 5000);
        await driver.sleep(1000);
        await fullName.sendKeys(Key.CONTROL, "a");
        await fullName.sendKeys(Key.BACK_SPACE);

        await driver.findElement(By.xpath("//button[contains(text(), 'Lưu thay đổi')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Full name')]")), 5000);
        console.log("AT-020 Passed");
    } catch (err) { console.error("AT-020 Failed", err); } finally { await driver.quit(); }
}
run();
