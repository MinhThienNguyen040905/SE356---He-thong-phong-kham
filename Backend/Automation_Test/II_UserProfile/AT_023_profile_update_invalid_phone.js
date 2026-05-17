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

        let phone = await driver.wait(until.elementLocated(By.id("phone")), 5000);
        await driver.sleep(1000);
        await phone.sendKeys(Key.CONTROL, "a");
        await phone.sendKeys(Key.BACK_SPACE);
        await phone.sendKeys("abcxyz");

        await driver.findElement(By.xpath("//button[contains(text(), 'Lưu thay đổi')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'không hợp lệ')]")), 5000);
        console.log("AT-021 Passed");
    } catch (err) { console.error("AT-021 Failed", err); } finally { await driver.quit(); }
}
run();
