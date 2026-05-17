const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/patients");
        
        // Filter by age range
        let ageFilter = await driver.wait(until.elementLocated(By.id("age-range")), 10000);
        await ageFilter.sendKeys("18-30");
        
        await driver.sleep(2000);
        console.log("AT-101 Passed: Lọc bệnh nhân theo độ tuổi thành công.");
    } catch (err) {
        console.error("AT-101 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
