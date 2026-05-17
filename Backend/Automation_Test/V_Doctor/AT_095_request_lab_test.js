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
        
        let inProgressRow = await driver.wait(until.elementLocated(By.xpath("//tr[contains(., 'Đang khám')]")), 10000);
        await inProgressRow.findElement(By.xpath(".//button")).click();
        
        // Find Lab Request / Test button
        let labBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Yêu cầu xét nghiệm')]")), 10000);
        await labBtn.click();
        
        // Select a test
        let testOption = await driver.wait(until.elementLocated(By.xpath("//div[contains(., 'Xét nghiệm máu') or contains(@role, 'option')]")), 5000);
        await testOption.click();
        
        await driver.findElement(By.xpath("//button[contains(., 'Gửi yêu cầu')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-095 Passed: Yêu cầu xét nghiệm thêm thành công.");
    } catch (err) {
        console.error("AT-095 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
