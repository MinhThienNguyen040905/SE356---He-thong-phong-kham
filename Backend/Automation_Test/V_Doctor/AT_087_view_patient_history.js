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
        
        // Find 'Chi tiết' or 'Gọi khám' button
        let actionBtn = await driver.wait(until.elementLocated(By.xpath("//table//button[contains(., 'Chi tiết') or contains(., 'Gọi khám')]")), 10000);
        await actionBtn.click();
        
        // Wait for ANY doctor sub-page (patients or visits)
        await driver.wait(until.urlMatches(/\/doctor\/(patients|visits)\//), 10000);
        
        // Look for 'Lịch sử khám' button. In VisitDetailPage it might be different, let's look for any history indicator
        let historyBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Lịch sử khám')]")), 10000);
        await historyBtn.click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'Lịch sử các lần khám')]")), 10000);
        console.log("AT-087 Passed: Xem hồ sơ lịch sử bệnh nhân thành công.");
    } catch (err) {
        console.error("AT-087 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
