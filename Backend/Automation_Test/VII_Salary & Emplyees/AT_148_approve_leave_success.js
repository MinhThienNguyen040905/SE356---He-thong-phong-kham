const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/attendance");
        
        // Wait for table rows - increased sleep for data loading
        await driver.sleep(5000);
        
        // Find any button in the last column (Action column)
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//table//tr/td[6]//button")), 10000);
        await driver.executeScript("arguments[0].click();", editBtn);
        
        // Wait for Dialog
        await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']")), 5000);
        
        // Find Select trigger for status
        let statusSelect = await driver.wait(until.elementLocated(By.xpath("//div[@role='dialog']//button[contains(., 'Trạng thái') or .//span]")), 5000);
        await driver.executeScript("arguments[0].click();", statusSelect);
        
        // Find 'Nghỉ phép' option
        let leaveOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//*[contains(text(), 'Nghỉ phép')]")), 5000);
        await driver.executeScript("arguments[0].click();", leaveOption);
        
        // Save
        let saveBtn = await driver.findElement(By.xpath("//div[@role='dialog']//button[contains(., 'Cập nhật')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-148 Passed: Phê duyệt nghỉ phép thành công.");
    } catch (err) {
        console.error("AT-148 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
