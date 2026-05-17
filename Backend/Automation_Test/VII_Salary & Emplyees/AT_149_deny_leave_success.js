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
        
        // Find an entry with LEAVE status and edit it
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//button[./*[@class and contains(., 'Edit') or name()='svg']]")), 10000);
        await editBtn.click();
        
        // Select Status: ABSENT (Vắng mặt)
        let statusSelect = await driver.wait(until.elementLocated(By.xpath("//button[./span[contains(text(), 'Trạng thái')]]")), 5000);
        await statusSelect.click();
        let absentOption = await driver.wait(until.elementLocated(By.xpath("//div[@role='option']//span[contains(text(), 'Vắng mặt')]")), 5000);
        await absentOption.click();
        
        // Save
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Cập nhật')]"));
        await saveBtn.click();
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-149 Passed: Từ chối nghỉ phép thành công.");
    } catch (err) {
        console.error("AT-149 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
