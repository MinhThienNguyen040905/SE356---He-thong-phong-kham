const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("bs.han@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/doctor"), 10000);
        
        await driver.get("http://localhost:5173/doctor/medicalList");
        
        let checkedInRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đã đến')]")), 10000);
        let startBtn = await checkedInRow.findElement(By.xpath(".//button[contains(., 'Khám bệnh')]"));
        await startBtn.click();
        
        // Wait for consultation page
        await driver.wait(until.urlContains("/visit/"), 10000);
        
        // Check if "Giờ bắt đầu" is recorded automatically or displayed
        let startTime = await driver.wait(until.elementLocated(By.xpath("//div[contains(., 'Giờ bắt đầu')]")), 10000);
        console.log(`AT-089 Passed: Ghi nhận giờ bắt đầu khám thực tế: ${await startTime.getText()}`);
    } catch (err) {
        console.error("AT-089 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
