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
        
        // Assume patient has allergy recorded
        let medicineSearch = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm thuốc')]")), 10000);
        await medicineSearch.sendKeys("Penicillin"); // Common allergy drug
        
        let allergyWarning = await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'dị ứng') or contains(text(), 'Allergy Warning')]")), 10000);
        console.log("AT-092 Passed: Hệ thống hiển thị cảnh báo thuốc dị ứng chính xác.");
    } catch (err) {
        console.error("AT-092 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
