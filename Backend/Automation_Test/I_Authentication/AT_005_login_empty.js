const { Builder, By, until } = require("selenium-webdriver");
async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        let submitBtn = await driver.wait(until.elementLocated(By.xpath("//button[@type='submit']")), 5000);
        await submitBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//p[contains(text(), 'bắt buộc')]")), 3000);
        console.log("AT-005 Passed");
    } catch (err) { console.error(err); } finally { await driver.quit(); }
}
run();
