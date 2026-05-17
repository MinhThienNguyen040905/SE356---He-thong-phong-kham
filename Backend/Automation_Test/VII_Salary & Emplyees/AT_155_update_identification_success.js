const { Builder, By, until } = require("selenium-webdriver");

async function run() {
    let driver = await new Builder().forBrowser("chrome").build();
    try {
        await driver.get("http://localhost:5173/login");
        await driver.wait(until.elementLocated(By.id("email")), 5000).sendKeys("admin@healthcare.com");
        await driver.findElement(By.id("password")).sendKeys("123456");
        await driver.findElement(By.xpath("//button[@type='submit']")).click();
        await driver.wait(until.urlContains("/admin"), 10000);
        
        await driver.get("http://localhost:5173/admin/employees");
        
        // 1. Click Eye icon in the table (Action column is 5th)
        await driver.sleep(5000);
        let viewBtn = await driver.wait(until.elementLocated(By.xpath("//table//tbody/tr[1]/td[5]//button[1]")), 10000);
        await driver.executeScript("arguments[0].click();", viewBtn);
        
        // 2. Click 'Edit Profile' button in the Detail Page
        // Based on the screenshot, the text is "Edit Profile"
        let editBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(., 'Edit Profile')]")), 15000);
        await driver.executeScript("arguments[0].click();", editBtn);
        
        // 3. Fill Date of Birth
        // Try to find the input by ID or position
        let dobInput = await driver.wait(until.elementLocated(By.xpath("//input[@type='date'] | //input[contains(@placeholder, 'dd/mm/yyyy')]")), 10000);
        await dobInput.sendKeys("01011990");
        
        // 4. Fill CCCD / ID Card
        let cccdInput = await driver.findElement(By.xpath("//div[contains(., 'CCCD') or contains(., 'ID Card')]//input | //label[contains(., 'CCCD')]/following-sibling::input"));
        await cccdInput.clear();
        await cccdInput.sendKeys("123456789012");
        
        // 5. Click 'Save' or 'Lưu' button (Check if it changes after clicking Edit Profile)
        let saveBtn = await driver.findElement(By.xpath("//button[contains(., 'Save') or contains(., 'Lưu')]"));
        await driver.executeScript("arguments[0].click();", saveBtn);
        
        // Success check
        await driver.wait(until.elementLocated(By.xpath("//*[contains(text(), 'success') or contains(text(), 'thành công')]")), 10000);
        console.log("AT-155.5 Passed: Cập nhật CCCD và Ngày sinh (Edit Profile) thành công.");
    } catch (err) {
        console.error("AT-155.5 Failed:", err.message);
    } finally {
        await driver.quit();
    }
}
run();
