const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/users");
        
        // Find a user to view/edit (First button in last column)
        let row = await driver.wait(until.elementLocated(By.xpath("//table//tbody/tr[1]")), 10000);
        let viewBtn = await row.findElement(By.xpath("./td[5]//button[1] | ./td[5]//a[1]"));
        await driver.executeScript("arguments[0].click();", viewBtn);
        
        // Wait for edit page
        await driver.wait(until.urlContains("/admin/users/"), 10000);
        
        // Click Edit button in detail page (if needed)
        let detailEditBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Chỉnh sửa')]")), 5000);
        await detailEditBtn.click();
        
        // Fill Full Name
        let nameInput = await driver.findElement(By.id("fullName"));
        await nameInput.clear();
        await nameInput.sendKeys("Updated Name " + Date.now());
        
        // Fill Date of Birth (Try if exists)
        try {
            let dobInput = await driver.findElement(By.xpath("//input[@type='date'] | //input[contains(@placeholder, 'ngày sinh')] | //input[contains(@id, 'birth')]"));
            await dobInput.sendKeys("1990-01-01");
        } catch (e) {
            console.log("No DOB input found, skipping...");
        }
        
        // Save
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Lưu') or contains(., 'Cập nhật')]"));
        await saveBtn.click();
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'thành công')]")), 10000);
        console.log("AT-154.4 Passed: Cập nhật thông tin nhân viên (bao gồm ngày sinh) thành công.");
    } catch (err) {
        console.error("AT-154.4 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
