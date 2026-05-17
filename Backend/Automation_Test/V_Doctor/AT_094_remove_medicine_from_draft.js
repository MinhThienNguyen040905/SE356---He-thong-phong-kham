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
        
        // Add a medicine first
        let medicineSearch = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Tìm thuốc')]")), 10000);
        await medicineSearch.sendKeys("Hapacol");
        await driver.wait(until.elementLocated(By.xpath("//div[contains(@class, 'medicine-item')]")), 5000).click();
        await driver.findElement(By.xpath("//button[contains(., 'Thêm')]")).click();
        
        // Now delete it
        let deleteBtn = await driver.wait(until.elementLocated(By.xpath("//table//button[contains(@class, 'delete') or contains(@class, 'remove')]")), 5000);
        await deleteBtn.click();
        
        // Verify it's gone
        let isPresent = await driver.findElements(By.xpath("//table//td[contains(., 'Hapacol')]"));
        if (isPresent.length === 0) {
            console.log("AT-094 Passed: Xóa thuốc khỏi đơn trước khi lưu thành công.");
        } else {
            throw new Error("Thuốc chưa bị xóa khỏi danh sách.");
        }
    } catch (err) {
        console.error("AT-094 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
