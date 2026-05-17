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
        
        let row = await driver.wait(until.elementLocated(By.xpath("//tr")), 10000);
        let transferBtn = await row.findElement(By.xpath(".//button[contains(., 'Chuyển ca')]"));
        await transferBtn.click();
        
        let doctorSelect = await driver.wait(until.elementLocated(By.id("doctor-select")), 5000);
        await doctorSelect.sendKeys("Doctor B");
        await driver.findElement(By.xpath("//button[contains(., 'Xác nhận')]")).click();
        
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 5000);
        console.log("AT-102 Passed: Chuyển ca khám cho bác sĩ khác thành công.");
    } catch (err) {
        console.error("AT-102 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
