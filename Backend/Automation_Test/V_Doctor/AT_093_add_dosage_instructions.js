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
        
        // Add medicine with instruction
        let medicineSearch = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm thuốc')]")), 10000);
        await medicineSearch.sendKeys("Amoxicillin");
        
        let item = await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'medicine-item')]")), 5000);
        await item.click();
        
        let instructionField = await driver.wait(until.elementLocated(By.name("instruction")), 5000);
        await instructionField.sendKeys("Uống sau khi ăn, 2 lần/ngày");
        
        await driver.findElement(By.xpath("//button[contains(., 'Thêm')]")).click();
        
        console.log("AT-093 Passed: Thêm hướng dẫn sử dụng thuốc thành công.");
    } catch (err) {
        console.error("AT-093 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
